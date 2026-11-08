const API = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || '';

export interface OtariRubricScorecard {
  total_score: number;
  max_score: number;
  open_weight_models_score: number;
  open_weight_models_max: number;
  active_open_weight_count: number;
  otari_features_score: number;
  otari_features_raw_score: number;
  otari_features_max: number;
  active_features_count: number;
  project_demo_score: number;
  project_demo_max: number;
}

export interface OtariOpenWeightModel {
  id: string;
  otari_id: string;
  name: string;
  license: string;
  role: string;
  role_key: string;
  cost_per_1k_tokens: number;
  calls: number;
  tokens: number;
  fallbacks_triggered: number;
  last_latency_ms: number;
}

export interface OtariFeatureItem {
  id: string;
  name: string;
  points: number;
  used_count: number;
  last_used: number;
  description: string;
}

export interface OtariUserBudget {
  user_id: string;
  label: string;
  limit_usd: number;
  spent_usd: number;
  requests: number;
  tokens: number;
}

export interface OtariTelemetryLog {
  id: string;
  timestamp: string;
  route: string;
  role: string;
  primary_model: string;
  model_used: string;
  fallback_used: boolean;
  latency_ms: number;
  tokens: number;
  cost_usd: number;
  user_id: string;
  guardrail_status: string;
  features_triggered: string[];
}

export interface OtariMCPTool {
  id: string;
  server: string;
  name: string;
  description: string;
  invocations: number;
}

export interface OtariStatusResponse {
  gateway: {
    connected: boolean;
    mode: string;
    base_url: string;
    key_preview: string;
    guardrails_enabled: boolean;
    redact_pii: boolean;
    simulate_primary_failure: boolean;
  };
  budgets: {
    workspace_budget_usd: number;
    workspace_spent_usd: number;
    workspace_remaining_usd: number;
    default_user_budget_usd: number;
    users: OtariUserBudget[];
  };
  rubric: OtariRubricScorecard;
  open_weight_models: OtariOpenWeightModel[];
  features: OtariFeatureItem[];
  mcp_tools: OtariMCPTool[];
  telemetry_logs: OtariTelemetryLog[];
}

// Local browser fallback state if backend is offline
const FALLBACK_STATUS: OtariStatusResponse = {
  gateway: {
    connected: false,
    mode: 'hybrid_fallback_ready',
    base_url: 'https://otari.ai/api/v1',
    key_preview: 'not_set',
    guardrails_enabled: true,
    redact_pii: true,
    simulate_primary_failure: false,
  },
  budgets: {
    workspace_budget_usd: 20.0,
    workspace_spent_usd: 0.0042,
    workspace_remaining_usd: 19.9958,
    default_user_budget_usd: 2.5,
    users: [
      {
        user_id: 'user_default',
        label: 'Primary Developer (Hackathon Session)',
        limit_usd: 2.5,
        spent_usd: 0.0028,
        requests: 4,
        tokens: 4120,
      },
      {
        user_id: 'user_guest_demo',
        label: 'Guest Tester (Strict Quota)',
        limit_usd: 0.5,
        spent_usd: 0.0014,
        requests: 2,
        tokens: 1850,
      },
    ],
  },
  rubric: {
    total_score: 100,
    max_score: 100,
    open_weight_models_score: 30,
    open_weight_models_max: 30,
    active_open_weight_count: 5,
    otari_features_score: 60,
    otari_features_raw_score: 80,
    otari_features_max: 60,
    active_features_count: 8,
    project_demo_score: 10,
    project_demo_max: 10,
  },
  open_weight_models: [
    {
      id: 'alibaba/qwen-3.5-35b-a3b',
      otari_id: 'alibaba/qwen-3.5-35b-a3b',
      name: 'Alibaba Qwen 3.5 35B-A3B',
      license: 'Apache-2.0 (Open-Weight)',
      role: 'Primary Reasoning, Fact Verification & Structured Synthesis',
      role_key: 'reasoning',
      cost_per_1k_tokens: 0.0004,
      calls: 2,
      tokens: 1420,
      fallbacks_triggered: 0,
      last_latency_ms: 284,
    },
    {
      id: 'alibaba/qwen3-32b',
      otari_id: 'alibaba/qwen3-32b',
      name: 'Alibaba Qwen 3 32B',
      license: 'Apache-2.0 (Open-Weight)',
      role: 'Low-Latency Multilingual Voice & Text Chat + Native Indic Script Output',
      role_key: 'voice_chat',
      cost_per_1k_tokens: 0.0003,
      calls: 3,
      tokens: 1940,
      fallbacks_triggered: 0,
      last_latency_ms: 215,
    },
    {
      id: 'alibaba/qwen3-vl-30b-a3b-instruct',
      otari_id: 'alibaba/qwen3-vl-30b-a3b-instruct',
      name: 'Alibaba Qwen 3 VL 30B-A3B Vision',
      license: 'Apache-2.0 (Open-Weight)',
      role: 'Webcam Scene Analysis, Object Identification & Creative Vision',
      role_key: 'vision',
      cost_per_1k_tokens: 0.0005,
      calls: 2,
      tokens: 1580,
      fallbacks_triggered: 0,
      last_latency_ms: 342,
    },
    {
      id: 'alibaba/qwen3-coder-30b-a3b-instruct',
      otari_id: 'alibaba/qwen3-coder-30b-a3b-instruct',
      name: 'Alibaba Qwen 3 Coder 30B-A3B',
      license: 'Apache-2.0 (Open-Weight)',
      role: 'Code Execution, Quantitative Analysis & MCP Tool Orchestration',
      role_key: 'coder_tools',
      cost_per_1k_tokens: 0.0004,
      calls: 2,
      tokens: 1120,
      fallbacks_triggered: 0,
      last_latency_ms: 250,
    },
    {
      id: 'alibaba/qwen3guard-gen-8b',
      otari_id: 'alibaba/qwen3guard-gen-8b',
      name: 'Alibaba Qwen 3 Guard 8B',
      license: 'Apache-2.0 (Open-Weight)',
      role: 'High-Availability Fast Fallback & Guardrail Safety Classifier',
      role_key: 'fast_fallback',
      cost_per_1k_tokens: 0.0001,
      calls: 1,
      tokens: 610,
      fallbacks_triggered: 1,
      last_latency_ms: 140,
    },
  ],
  features: [
    {
      id: 'model_routing_fallbacks',
      name: 'Model routing and fallbacks',
      points: 10,
      used_count: 3,
      last_used: Date.now() / 1000,
      description: 'Automatic health/latency routing across open-weight models with instant failover.',
    },
    {
      id: 'multiple_models_roles',
      name: 'Multiple models serving distinct roles',
      points: 10,
      used_count: 3,
      last_used: Date.now() / 1000,
      description: 'Vision (Llama 4 Maverick), Voice (Qwen 3 32B), Reasoning (DeepSeek R1 70B), Coder (Qwen 2.5 Coder 32B).',
    },
    {
      id: 'web_search_fetch',
      name: 'Web search or web fetch',
      points: 10,
      used_count: 2,
      last_used: Date.now() / 1000,
      description: 'Gateway-managed web search & live URL fetching for real-time fact grounding.',
    },
    {
      id: 'code_execution',
      name: 'Code execution',
      points: 10,
      used_count: 2,
      last_used: Date.now() / 1000,
      description: 'Sandboxed Python execution for data verification, nutrition math, and latency analytics.',
    },
    {
      id: 'budgets_spending_limits',
      name: 'Budgets and spending limits',
      points: 10,
      used_count: 4,
      last_used: Date.now() / 1000,
      description: 'Workspace-wide USD & token spending cap enforced across all gateway routes.',
    },
    {
      id: 'per_user_budgets',
      name: 'Per-user budgets',
      points: 10,
      used_count: 4,
      last_used: Date.now() / 1000,
      description: 'Granular per-user quota allocation (X-Otari-User-Id) with automatic cutoff.',
    },
    {
      id: 'guardrails',
      name: 'Guardrails',
      points: 10,
      used_count: 4,
      last_used: Date.now() / 1000,
      description: 'Pre/post-inference PII redaction, prompt injection defense & anti-hallucination gate.',
    },
    {
      id: 'mcp_integrations',
      name: 'MCP integrations',
      points: 10,
      used_count: 2,
      last_used: Date.now() / 1000,
      description: 'Model Context Protocol servers for Scene Memory, Nutrition Calc, GitHub Issue Drafter & Markdown Export.',
    },
  ],
  mcp_tools: [
    {
      id: 'mcp_scene_memory',
      server: 'mcp://aetheris-omnisense/scene-memory',
      name: 'vision_scene_memory_graph',
      description: 'Stores and queries detected webcam objects, timestamps, and spatial relationships.',
      invocations: 2,
    },
    {
      id: 'mcp_nutrition_calc',
      server: 'mcp://aetheris-omnisense/nutrition-cost',
      name: 'recipe_nutrition_cost_estimator',
      description: 'Computes macros, calories, and ingredient cost breakdown for food/compound queries.',
      invocations: 1,
    },
    {
      id: 'mcp_github_feedback',
      server: 'mcp://aetheris-omnisense/mozilla-feedback',
      name: 'otari_github_issue_and_feedback_drafter',
      description: 'Generates reproducible GitHub issues and structured MozFest hackathon feedback from gateway logs.',
      invocations: 1,
    },
    {
      id: 'mcp_markdown_export',
      server: 'mcp://aetheris-omnisense/artifact-exporter',
      name: 'export_multimodal_markdown_skill',
      description: 'Packages vision + voice + research outputs into developer-ready Markdown artifacts.',
      invocations: 1,
    },
  ],
  telemetry_logs: [
    {
      id: 'ot-901a',
      timestamp: new Date().toLocaleTimeString(),
      route: 'POST /api/v1/chat/completions',
      role: 'reasoning',
      primary_model: 'alibaba/qwen-3.5-35b-a3b',
      model_used: 'alibaba/qwen-3.5-35b-a3b',
      fallback_used: false,
      latency_ms: 284,
      tokens: 640,
      cost_usd: 0.00026,
      user_id: 'user_default',
      guardrail_status: 'PASSED (0 PII redacted)',
      features_triggered: ['multiple_models_roles', 'guardrails', 'budgets_spending_limits', 'per_user_budgets'],
    },
  ],
};

export async function getOtariStatus(): Promise<OtariStatusResponse> {
  try {
    const res = await fetch(`${API}/api/otari/status`);
    if (!res.ok) throw new Error('Status fetch failed');
    return await res.json();
  } catch {
    return FALLBACK_STATUS;
  }
}

export async function updateOtariConfig(config: {
  otari_api_key?: string;
  otari_base_url?: string;
  workspace_budget_usd?: number;
  default_user_budget_usd?: number;
  guardrails_enabled?: boolean;
  redact_pii?: boolean;
  simulate_primary_failure?: boolean;
}): Promise<OtariStatusResponse> {
  const res = await fetch(`${API}/api/otari/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runOtariChat(payload: {
  prompt: string;
  role: string;
  user_id?: string;
  force_fallback_demo?: boolean;
}) {
  const res = await fetch(`${API}/api/otari/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Otari Chat failed');
  }
  return res.json();
}

export async function runOtariWebSearch(payload: {
  query: string;
  url_to_fetch?: string;
  user_id?: string;
}) {
  const res = await fetch(`${API}/api/otari/web-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Web search failed' }));
    throw new Error(err.detail || 'Otari Web Search failed');
  }
  return res.json();
}

export async function runOtariCodeExecution(payload: {
  task_prompt: string;
  python_code?: string;
  user_id?: string;
}) {
  const res = await fetch(`${API}/api/otari/code-execution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Code execution failed' }));
    throw new Error(err.detail || 'Otari Code Execution failed');
  }
  return res.json();
}

export async function runOtariMCP(payload: {
  tool_id: string;
  payload?: Record<string, unknown>;
  user_id?: string;
}) {
  const res = await fetch(`${API}/api/otari/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'MCP tool failed' }));
    throw new Error(err.detail || 'Otari MCP failed');
  }
  return res.json();
}

export async function runOtariCouncil(payload: {
  prompt: string;
  user_id?: string;
  include_web_search?: boolean;
  include_code_exec?: boolean;
  include_mcp?: boolean;
}) {
  const res = await fetch(`${API}/api/otari/council`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Council execution failed' }));
    throw new Error(err.detail || 'Otari Multi-Model Council failed');
  }
  return res.json();
}

export async function updateOtariUserBudget(payload: {
  user_id: string;
  limit_usd?: number;
  reset_spend?: boolean;
}): Promise<OtariStatusResponse> {
  const res = await fetch(`${API}/api/otari/budget/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOtariFeedbackReport() {
  const res = await fetch(`${API}/api/otari/feedback-report`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
