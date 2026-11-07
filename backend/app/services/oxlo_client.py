from openai import AsyncOpenAI
from app.config import (
    OTARI_API_KEY,
    OTARI_BASE_URL,
    OXLO_API_KEY,
    OXLO_BASE_URL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
)

# 1. Primary Mozilla.ai Otari Gateway Client (Open-Weight LLM & Vision Control Plane)
otari = AsyncOpenAI(
    api_key=OTARI_API_KEY or "otari-unconfigured",
    base_url=OTARI_BASE_URL,
    max_retries=0,
    default_headers={
        "Otari-Key": OTARI_API_KEY or "",
        "X-Otari-Client": "Aetheris-VoxVision/2.0 (mozilla-devs-wilding)",
    },
)

# 2. Multimodal Media & Secondary Failover Client (TTS Kokoro-82M, YOLOv11, FLUX Image Gen & LLM Failover)
oxlo = AsyncOpenAI(
    api_key=OXLO_API_KEY or OTARI_API_KEY or "oxlo-unconfigured",
    base_url=OXLO_BASE_URL,
)

oxlo_fast = AsyncOpenAI(
    api_key=OXLO_API_KEY or OTARI_API_KEY or "oxlo-unconfigured",
    base_url=OXLO_BASE_URL,
    max_retries=0,
)

# 3. Groq Client (Ultra-fast Whisper STT & Llama 3.3 70B Failover)
groq = AsyncOpenAI(
    api_key=GROQ_API_KEY or "groq-unconfigured",
    base_url=GROQ_BASE_URL,
    max_retries=0,
)
