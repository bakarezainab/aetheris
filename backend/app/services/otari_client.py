"""
otari_client.py — OpenAI-Compatible Clients for Mozilla.ai Otari Gateway
────────────────────────────────────────────────────────────────────────
Routes all chat, vision, image, and audio requests strictly through Mozilla.ai's
Otari API (`https://otari.ai/api/v1`) with the `Otari-Key` header.
"""

from openai import AsyncOpenAI
from app.config import (
    OTARI_API_KEY,
    OTARI_BASE_URL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
)

_OTARI_HEADERS = {
    "Otari-Key": OTARI_API_KEY or "otari_unconfigured",
    "X-Otari-Client": "Aetheris-OmniSense/2.0 (mozilla-devs-wilding)",
}

# Primary Otari client (chat, compound, image, TTS)
otari = AsyncOpenAI(
    api_key=OTARI_API_KEY or "otari_unconfigured",
    base_url=OTARI_BASE_URL,
    default_headers=_OTARI_HEADERS,
)

# Zero-retry fast Otari client for real-time webcam vision & low-latency voice
otari_fast = AsyncOpenAI(
    api_key=OTARI_API_KEY or "otari_unconfigured",
    base_url=OTARI_BASE_URL,
    max_retries=0,
    default_headers=_OTARI_HEADERS,
)

# Optional Groq Whisper helper for STT audio transcription
groq = AsyncOpenAI(
    api_key=GROQ_API_KEY or "groq_unconfigured",
    base_url=GROQ_BASE_URL,
    max_retries=0,
)
