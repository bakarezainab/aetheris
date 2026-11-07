from openai import AsyncOpenAI
from app.config import (
    OTARI_API_KEY,
    OTARI_BASE_URL,
    OXLO_API_KEY,
    OXLO_BASE_URL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
)

# Primary gateway key & URL: prefers Mozilla.ai Otari Gateway when configured
_PRIMARY_KEY = OTARI_API_KEY or OXLO_API_KEY or "otari-demo-key"
_PRIMARY_URL = OTARI_BASE_URL if OTARI_API_KEY else OXLO_BASE_URL

# Standard shared client — routes via Otari Gateway (or Oxlo fallback)
otari = AsyncOpenAI(
    api_key=_PRIMARY_KEY,
    base_url=_PRIMARY_URL,
)

oxlo = AsyncOpenAI(
    api_key=_PRIMARY_KEY,
    base_url=_PRIMARY_URL,
)

# Zero-retry fast client — used in vision where we handle fallback chains ourselves
oxlo_fast = AsyncOpenAI(
    api_key=_PRIMARY_KEY,
    base_url=_PRIMARY_URL,
    max_retries=0,
)

# Groq client — ultra-fast inference for STT + voice LLM + vision narration fallback
groq = AsyncOpenAI(
    api_key=GROQ_API_KEY or "groq-demo-key",
    base_url=GROQ_BASE_URL,
    max_retries=0,
)
