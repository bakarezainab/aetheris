"""
otari.py — FastAPI Routes for Mozilla.ai Otari Gateway & Rubric Workbench
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.otari_gateway import (
    BudgetExceededError,
    GuardrailBlockedError,
    otari_gateway,
)

router = APIRouter(prefix="/api/otari", tags=["Otari Gateway"])


class OtariConfigUpdate(BaseModel):
    otari_api_key: Optional[str] = None
    otari_base_url: Optional[str] = None
    workspace_budget_usd: Optional[float] = None
    default_user_budget_usd: Optional[float] = None
    guardrails_enabled: Optional[bool] = None
    redact_pii: Optional[bool] = None
    simulate_primary_failure: Optional[bool] = None


class OtariChatRequest(BaseModel):
    prompt: str
    role: str = Field(default="reasoning", description="reasoning | voice_chat | vision | coder_tools | fast_fallback")
    user_id: str = Field(default="user_default")
    force_fallback_demo: bool = False
    history: List[Dict[str, str]] = Field(default_factory=list)


class OtariWebSearchRequest(BaseModel):
    query: str
    url_to_fetch: Optional[str] = None
    user_id: str = "user_default"


class OtariCodeExecRequest(BaseModel):
    task_prompt: str
    python_code: Optional[str] = None
    user_id: str = "user_default"


class OtariMCPRequest(BaseModel):
    tool_id: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    user_id: str = "user_default"


class OtariCouncilRequest(BaseModel):
    prompt: str
    user_id: str = "user_default"
    include_web_search: bool = True
    include_code_exec: bool = True
    include_mcp: bool = True


class UserBudgetUpdate(BaseModel):
    user_id: str
    limit_usd: Optional[float] = None
    reset_spend: bool = False


@router.get("/status")
async def get_otari_status():
    """Return full Otari gateway state, live 100-point rubric scorecard, budgets, and telemetry."""
    return otari_gateway.get_status()


@router.post("/config")
async def update_otari_config(body: OtariConfigUpdate):
    """Update Otari API key, gateway base URL, budget caps, guardrails, or fallback simulation."""
    return otari_gateway.update_config(
        otari_api_key=body.otari_api_key,
        otari_base_url=body.otari_base_url,
        workspace_budget_usd=body.workspace_budget_usd,
        default_user_budget_usd=body.default_user_budget_usd,
        guardrails_enabled=body.guardrails_enabled,
        redact_pii=body.redact_pii,
        simulate_primary_failure=body.simulate_primary_failure,
    )


@router.post("/chat")
async def otari_routed_chat(body: OtariChatRequest):
    """Run an open-weight model completion through Otari with guardrails, budgets, and fallback routing."""
    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are Aetheris OmniSense AI powered strictly by Mozilla.ai's Otari Gateway and open-weight models. "
                    "Provide clear, structured, and accurate responses."
                ),
            },
            *body.history[-6:],
            {"role": "user", "content": body.prompt},
        ]
        result = await otari_gateway.routed_completion(
            messages=messages,
            role=body.role,
            user_id=body.user_id,
            force_fallback_demo=body.force_fallback_demo,
        )
        return {**result, "status": otari_gateway.get_status()}
    except BudgetExceededError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc
    except GuardrailBlockedError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/web-search")
async def otari_web_search(body: OtariWebSearchRequest):
    """Run Otari Gateway Web Search & Web Fetch with open-weight synthesis."""
    try:
        result = await otari_gateway.web_search_and_fetch(
            query=body.query,
            url_to_fetch=body.url_to_fetch,
            user_id=body.user_id,
        )
        return {**result, "status": otari_gateway.get_status()}
    except BudgetExceededError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc
    except GuardrailBlockedError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/code-execution")
async def otari_code_execution(body: OtariCodeExecRequest):
    """Run Otari Gateway Code Execution using Qwen 2.5 Coder 32B + Python sandbox."""
    try:
        result = await otari_gateway.execute_code_workflow(
            task_prompt=body.task_prompt,
            python_code=body.python_code,
            user_id=body.user_id,
        )
        return {**result, "status": otari_gateway.get_status()}
    except BudgetExceededError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc
    except GuardrailBlockedError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/mcp")
async def otari_mcp_invoke(body: OtariMCPRequest):
    """Invoke a connected Model Context Protocol (MCP) tool via Otari Gateway."""
    try:
        result = await otari_gateway.execute_mcp_tool(
            tool_id=body.tool_id,
            payload=body.payload,
            user_id=body.user_id,
        )
        return {**result, "status": otari_gateway.get_status()}
    except BudgetExceededError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc


@router.post("/council")
async def otari_multi_model_council(body: OtariCouncilRequest):
    """Execute the full Multi-Model Open-Weight Council pipeline across 4 distinct roles and gateway tools."""
    try:
        result = await otari_gateway.run_multi_model_council(
            prompt=body.prompt,
            user_id=body.user_id,
            include_web_search=body.include_web_search,
            include_code_exec=body.include_code_exec,
            include_mcp=body.include_mcp,
        )
        return {**result, "status": otari_gateway.get_status()}
    except BudgetExceededError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc
    except GuardrailBlockedError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/budget/user")
async def update_user_budget(body: UserBudgetUpdate):
    """Create, update, or reset a per-user spending limit in Otari Gateway."""
    entry = otari_gateway.user_budgets.setdefault(
        body.user_id,
        {
            "user_id": body.user_id,
            "label": f"User ({body.user_id})",
            "limit_usd": otari_gateway.default_user_budget_usd,
            "spent_usd": 0.0,
            "requests": 0,
            "tokens": 0,
        },
    )
    if body.limit_usd is not None and body.limit_usd >= 0:
        entry["limit_usd"] = float(body.limit_usd)
    if body.reset_spend:
        entry["spent_usd"] = 0.0
        entry["requests"] = 0
        entry["tokens"] = 0
    otari_gateway._mark_feature("per_user_budgets")
    return otari_gateway.get_status()


@router.get("/feedback-report")
async def get_feedback_report():
    """Return the structured MozFest Developers Wilding submission & feedback report."""
    return otari_gateway.generate_submission_feedback_report()
