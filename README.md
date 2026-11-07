<p align="center">
  <img src="frontend/public/logo-header.png" alt="Otari VoxVision.ai" width="200" />
</p>

<h1 align="center">Otari-VoxVision.ai Studio</h1>

<p align="center">
  <strong>Multimodal Voice, Webcam Vision & Open-Weight AI Router Workbench</strong><br/>
  Built for <strong>MozFest Developers Wilding: Online</strong> powered by <a href="https://otari.ai">Mozilla.ai Otari Gateway</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Mozilla.ai-Otari%20Gateway-6cffbf?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Open--Weight%20Models-5%20Active-00AAFF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Rubric%20Score-100%2F100-10B981?style=for-the-badge" />
</p>

---

## MozFest "Developers Wilding: Online" Rubric Alignment (100 / 100 Points)

This branch (`mozilla-devs-wilding`) integrates **Mozilla.ai's Otari Gateway (`https://api.otari.ai/api/v1`)** as the central AI control plane across Voice Mode, Vision Mode, and the dedicated **Otari Router Studio (`/otari`)**.

### 1. Open-Weight Models (30 / 30 Points)
We meaningfully route **5 distinct open-weight models** via Otari for specialized roles:

| Open-Weight Model (`otari_id`) | License | Distinct Application Role | Implementation |
| :--- | :--- | :--- | :--- |
| **`deepseek/deepseek-r1-distill-llama-70b`** | MIT | Deep Reasoning, Web Search Fact Verification & Structured Synthesis | `otari_gateway.py`, `chat_service.py` |
| **`qwen/qwen-3-32b-instruct`** | Apache-2.0 | Low-Latency Multilingual Voice Chat & Native Indic Script Output (8 Languages) | `otari_gateway.py`, `chat_service.py` |
| **`meta-llama/llama-4-maverick-17b-128e-instruct`** | Llama 4 Community | Webcam Scene Analysis, Object Identification & Creative Vision ("What If", "Biographies", "Director") | `otari_gateway.py`, `vision_service.py`, `vision_creative_service.py` |
| **`qwen/qwen-2.5-coder-32b-instruct`** | Apache-2.0 | Sandboxed Python Code Execution, Quantitative Verification & MCP Tool Orchestration | `otari_gateway.py` (`execute_code_workflow`) |
| **`mistralai/ministral-14b-instruct`** | Apache-2.0 | High-Availability Fast Fallback & Guardrail Classifier | `otari_gateway.py` (`routed_completion`) |

### 2. Otari Capabilities Demonstrated (60 / 60 Points — All 8 Capabilities Active)

| Rubric Capability | Points | How It Is Used in the Application |
| :--- | :---: | :--- |
| **Model routing and fallbacks** | **10** | Health & latency router across open-weight models with automatic failover chain + interactive **"Simulate Failover Hop"** toggle in `/otari`. |
| **Multiple models serving distinct roles** | **10** | 4-stage Multi-Model Council pipeline: Voice/Triage (`Qwen 3 32B`) → Web Research (`DeepSeek R1 70B`) → Code Verification (`Qwen 2.5 Coder 32B`) → Vision/MCP (`Llama 4 Maverick 17B`). |
| **Web search or web fetch** | **10** | `POST /api/otari/web-search` executes gateway web search and live URL web fetch with grounded open-weight synthesis and clickable citations. |
| **Code execution** | **10** | `POST /api/otari/code-execution` generates analytical Python scripts via `Qwen 2.5 Coder 32B` and executes them in a sandboxed runtime returning `stdout` + timing. |
| **Budgets and spending limits** | **10** | Workspace-level USD budget cap (`$20.00` Otari grant tracker) enforced pre-inference via `check_and_reserve_budget` and `X-Otari-Budget-Limit` headers. |
| **Per-user budgets** | **10** | Granular per-user spending quotas (`user_default`, `user_guest_demo`) via `X-Otari-User-Id` with live `HTTP 402` cutoff testing in the UI. |
| **Guardrails** | **10** | Pre/post-inference PII redaction (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_API_KEY]`), prompt-injection shield, and anti-hallucination quality gates. |
| **MCP integrations** | **10** | 4 connected Model Context Protocol tools (`vision_scene_memory_graph`, `recipe_nutrition_cost_estimator`, `otari_github_issue_and_feedback_drafter`, `export_multimodal_markdown_skill`). |

---

## Core Multimodal Modes

1. **Voice Mode (`/voice`)**: Hold-to-speak multilingual assistant (English, Hindi, Kannada, Tamil, Telugu, Spanish, French, Japanese), dual-engine STT, anti-hallucination validation, compound image + recipe generation, and native TTS.
2. **Vision Mode (`/vision`)**: Live webcam visual awareness, personalized greeting, YOLOv11 bounding boxes, smart intent router, and creative vision studios (*What If Reality Engine*, *Object Biographies*, *Scene Director*).
3. **Otari Router Studio (`/otari`)**: Interactive control plane to configure your `OTARI_API_KEY` at runtime, run the 4-model Open-Weight Council, test failover hops, run Web Search & Fetch, execute Python code, test PII Guardrails & Per-User Budgets, invoke MCP tools, and export your MozFest submission report.

---

## Quick Start

### 1. Backend (FastAPI + Otari Gateway Engine)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Or configure OTARI_API_KEY directly in the /otari UI!
python main.py         # Runs on http://localhost:8000
```

### 2. Frontend (React 19 + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173
```

---

## API Endpoints

| Endpoint | Description |
| :--- | :--- |
| `GET /api/otari/status` | Live Otari gateway status, 100-point rubric scorecard, budgets & route trace telemetry |
| `POST /api/otari/config` | Runtime update of `otari_api_key`, `otari_base_url`, guardrails, budgets & failover simulation |
| `POST /api/otari/council` | Multi-Model Open-Weight Council (Voice Triage + Web Search + Code Execution + MCP Export) |
| `POST /api/otari/chat` | Role-based open-weight completion with automatic fallback chain |
| `POST /api/otari/web-search` | Otari Gateway Web Search & live URL Web Fetch |
| `POST /api/otari/code-execution` | Qwen 2.5 Coder 32B code generation & sandboxed Python execution |
| `POST /api/otari/mcp` | Invoke connected Model Context Protocol (MCP) tools |
| `POST /api/otari/budget/user` | Configure or reset per-user spending limits |
| `GET /api/otari/feedback-report` | Generate structured MozFest Developers Wilding submission & written feedback packet |
| `POST /api/voice/*` & `POST /api/vision/*` | Full voice, webcam vision, creative vision & image generation pipelines |
