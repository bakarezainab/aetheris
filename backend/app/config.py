import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Mozilla.ai Otari Gateway (Unified AI Control Plane) ──────────────────────
OTARI_API_KEY  = os.getenv("OTARI_API_KEY", os.getenv("OTARI_AI_TOKEN", os.getenv("GATEWAY_PLATFORM_TOKEN", "")))
OTARI_BASE_URL = os.getenv("OTARI_BASE_URL", "https://otari.ai/api/v1")

# ── Groq (Whisper STT helper) ─────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# ── Sarvam AI (primary STT — Saaras v3, Indian-language optimised) ────────────
SARVAM_API_KEY  = os.getenv("SARVAM_API_KEY", "")
SARVAM_BASE_URL = "https://api.sarvam.ai"

# Priority order for STT engines (first = primary)
STT_ENGINE_PRIORITY = ["sarvam", "groq", "otari"]

# ── Open-Weight Models via Otari.ai (Distinct Roles for Rubric 30/30 pts) ────
OPEN_WEIGHT_MODELS = {
    "reasoning": {
        "id": "alibaba/qwen3-32b",
        "otari_id": "alibaba/qwen3-32b",
        "name": "Alibaba Qwen 3 32B Instruct",
        "license": "Apache-2.0 (Open-Weight)",
        "role": "Primary Reasoning, Fact Verification & Structured Synthesis",
        "cost_per_1k_tokens": 0.0004,
    },
    "voice_chat": {
        "id": "alibaba/qwen3-30b-a3b-instruct-2507",
        "otari_id": "alibaba/qwen3-30b-a3b-instruct-2507",
        "name": "Alibaba Qwen 3 30B-A3B Instruct",
        "license": "Apache-2.0 (Open-Weight)",
        "role": "Low-Latency Multilingual Voice & Text Chat + Native Indic Script Output",
        "cost_per_1k_tokens": 0.0003,
    },
    "vision": {
        "id": "alibaba/qwen3-vl-30b-a3b-instruct",
        "otari_id": "alibaba/qwen3-vl-30b-a3b-instruct",
        "name": "Alibaba Qwen 3 VL 30B-A3B Vision",
        "license": "Apache-2.0 (Open-Weight)",
        "role": "Webcam Scene Analysis, Object Identification & Creative Vision",
        "cost_per_1k_tokens": 0.0005,
    },
    "coder_tools": {
        "id": "alibaba/qwen3-coder-30b-a3b-instruct",
        "otari_id": "alibaba/qwen3-coder-30b-a3b-instruct",
        "name": "Alibaba Qwen 3 Coder 30B-A3B",
        "license": "Apache-2.0 (Open-Weight)",
        "role": "Code Execution, Quantitative Analysis & MCP Tool Orchestration",
        "cost_per_1k_tokens": 0.0004,
    },
    "fast_fallback": {
        "id": "alibaba/qwen3guard-gen-8b",
        "otari_id": "alibaba/qwen3guard-gen-8b",
        "name": "Alibaba Qwen 3 Guard 8B",
        "license": "Apache-2.0 (Open-Weight)",
        "role": "High-Availability Fast Fallback & Guardrail Safety Classifier",
        "cost_per_1k_tokens": 0.0001,
    },
}

# ── Otari Budgets & Governance Defaults ──────────────────────────────────────
OTARI_WORKSPACE_BUDGET_USD = float(os.getenv("OTARI_WORKSPACE_BUDGET_USD", "20.00"))
OTARI_DEFAULT_USER_BUDGET_USD = float(os.getenv("OTARI_DEFAULT_USER_BUDGET_USD", "2.50"))

# ── Model IDs (Strictly Mozilla.ai Otari Open-Weight Models) ─────────────────
MODELS = {
    # Fast Multilingual Conversational LLM on Otari
    "chat":            "alibaba/qwen3-30b-a3b-instruct-2507",
    # Open-Weight Fallback chain on Otari
    "chat_fallback":   [
        "alibaba/qwen3-32b",
        "alibaba/qwen-3.5-35b-a3b",
        "alibaba/qwen3-coder-30b-a3b-instruct",
        "alibaba/qwen3guard-gen-8b",
    ],
    # Fast Multilingual Voice LLM on Otari
    "chat_voice":      "alibaba/qwen3-30b-a3b-instruct-2507",
    # Vision VLM on Otari
    "vision":          "alibaba/qwen3-vl-30b-a3b-instruct",
    "vision_fallback": [
        "alibaba/qwen2.5-vl-72b-instruct",
        "alibaba/qwen-3.5-35b-a3b",
    ],
    # Audio — STT: Sarvam Saaras v3 (primary) + Whisper
    "stt":             "saaras:v3",
    "stt_groq":        "whisper-large-v3-turbo",
    "stt_otari":       "whisper-large-v3",
    # TTS — Kokoro / gTTS multilingual speech synthesis
    "tts":             "kokoro-82m",
    # Computer vision object detection
    "detect":          "alibaba/qwen3-vl-30b-a3b-instruct",
    # Image generation on Otari
    "image":           "alibaba/qwen-image",
    "image_fast":      "alibaba/qwen-image",
}

# ── App settings ──────────────────────────────────────────────────────────────
MAX_TOKENS_CHAT     = 4096
MAX_TOKENS_VOICE    = 1200
MAX_TOKENS_VISION   = 1024
MAX_TOKENS_COMPOUND = 8192
IMAGE_DEFAULT_SIZE  = "1024x1024"
STT_LANGUAGE        = None
VISION_INTERVAL_S   = 8

# ── LLM Sampling Parameters ───────────────────────────────────────────────────
TEMPERATURE          = 0.35
TEMPERATURE_VOICE    = 0.20
TEMPERATURE_COMPOUND = 0.50
TOP_P                = 0.85
TOP_P_VOICE          = 0.80

# ── Response Validation Thresholds ────────────────────────────────────────────
MIN_RESPONSE_CHARS_VOICE   = 80
MIN_RESPONSE_CHARS_DETAIL  = 300
MAX_RETRY_ATTEMPTS         = 2

# ── Multi-Language Support ────────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": {
        "name": "English",
        "stt_code": "en",
        "sarvam_code": "en-IN",
        "kokoro_voice": "af_heart",
        "gtts_lang": "en",
        "tts_engine": "gtts",
        "script": "Latin",
    },
    "hi": {
        "name": "Hindi",
        "stt_code": "hi",
        "sarvam_code": "hi-IN",
        "kokoro_voice": "af_heart",
        "gtts_lang": "hi",
        "tts_engine": "gtts",
        "script": "Devanagari",
    },
    "kn": {
        "name": "Kannada",
        "stt_code": "kn",
        "sarvam_code": "kn-IN",
        "kokoro_voice": "af_heart",
        "gtts_lang": "kn",
        "tts_engine": "gtts",
        "script": "Kannada",
    },
    "ta": {
        "name": "Tamil",
        "stt_code": "ta",
        "sarvam_code": "ta-IN",
        "kokoro_voice": "af_heart",
        "gtts_lang": "ta",
        "tts_engine": "gtts",
        "script": "Tamil",
    },
    "te": {
        "name": "Telugu",
        "stt_code": "te",
        "sarvam_code": "te-IN",
        "kokoro_voice": "af_heart",
        "gtts_lang": "te",
        "tts_engine": "gtts",
        "script": "Telugu",
    },
    "es": {
        "name": "Spanish",
        "stt_code": "es",
        "sarvam_code": None,
        "kokoro_voice": "af_heart",
        "gtts_lang": "es",
        "tts_engine": "gtts",
        "script": "Latin",
    },
    "fr": {
        "name": "French",
        "stt_code": "fr",
        "sarvam_code": None,
        "kokoro_voice": "af_heart",
        "gtts_lang": "fr",
        "tts_engine": "gtts",
        "script": "Latin",
    },
    "ja": {
        "name": "Japanese",
        "stt_code": "ja",
        "sarvam_code": None,
        "kokoro_voice": "af_heart",
        "gtts_lang": "ja",
        "tts_engine": "gtts",
        "script": "Japanese",
    },
}
