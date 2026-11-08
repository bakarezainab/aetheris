"""
stt_service.py — Multi-Engine Speech-to-Text for Aetheris OmniSense

Engine priority (configurable in config.STT_ENGINE_PRIORITY):
  1. Sarvam AI  — Saaras v3 (primary, Indian-language optimised, 22 languages)
  2. Groq       — whisper-large-v3-turbo (fast fallback)
  3. Otari      — whisper-large-v3 via Mozilla.ai Otari Gateway
"""

import io
import math
import logging
import httpx
from app.services.otari_client import otari, groq
from app.config import (
    MODELS, STT_LANGUAGE, SUPPORTED_LANGUAGES,
    SARVAM_API_KEY, SARVAM_BASE_URL, STT_ENGINE_PRIORITY,
)

logger = logging.getLogger("Aetheris.OmniSense.stt")

_SARVAM_TO_ISO: dict[str, str] = {
    "en-IN": "en", "hi-IN": "hi", "kn-IN": "kn", "ta-IN": "ta", "te-IN": "te",
    "ml-IN": "ml", "mr-IN": "mr", "bn-IN": "bn", "gu-IN": "gu", "pa-IN": "pa",
    "od-IN": "or", "ur-IN": "ur",
    "en": "en", "hi": "hi", "kn": "kn", "ta": "ta", "te": "te",
}

_ISO_TO_SARVAM: dict[str, str] = {
    code: info["sarvam_code"]
    for code, info in SUPPORTED_LANGUAGES.items()
    if info.get("sarvam_code")
}

_WHISPER_LANG_TO_ISO: dict[str, str] = {
    "english": "en", "en": "en",
    "hindi": "hi",   "hi": "hi",
    "kannada": "kn", "kn": "kn",
    "tamil": "ta",   "ta": "ta",
    "telugu": "te",  "te": "te",
    "spanish": "es", "es": "es",
    "french": "fr",  "fr": "fr",
    "japanese": "ja", "ja": "ja",
    "urdu": "hi",    "ur": "hi",
}


def _normalise_whisper_lang(raw_lang: str | None) -> str:
    if not raw_lang:
        return "en"
    key = raw_lang.strip().lower()
    if key in _WHISPER_LANG_TO_ISO:
        return _WHISPER_LANG_TO_ISO[key]
    if len(key) == 2 and key in SUPPORTED_LANGUAGES:
        return key
    return "en"


def _ext_from_mime(mime_type: str) -> str:
    clean_mime = mime_type.split(";")[0].strip().lower()
    ext_map = {
        "audio/webm": "webm", "audio/wav": "wav", "audio/wave": "wav",
        "audio/x-wav": "wav", "audio/mp4": "mp4", "audio/mpeg": "mp3",
        "audio/mp3": "mp3", "audio/ogg": "ogg", "audio/flac": "flac",
    }
    return ext_map.get(clean_mime, "webm")


def _compute_whisper_confidence(result) -> float:
    segments = getattr(result, "segments", None)
    if not segments:
        text = getattr(result, "text", "") or ""
        return 0.75 if len(text.strip()) > 3 else 0.3

    logprobs, no_speech_probs = [], []
    for seg in segments:
        avg_lp = getattr(seg, "avg_logprob", None)
        nsp = getattr(seg, "no_speech_prob", None)
        if avg_lp is None and isinstance(seg, dict):
            avg_lp = seg.get("avg_logprob")
            nsp = seg.get("no_speech_prob")
        if avg_lp is not None:
            logprobs.append(avg_lp)
        if nsp is not None:
            no_speech_probs.append(nsp)

    if not logprobs:
        return 0.75

    mean_lp = sum(logprobs) / len(logprobs)
    prob = math.exp(max(mean_lp, -5.0))
    if no_speech_probs:
        mean_nsp = sum(no_speech_probs) / len(no_speech_probs)
        if mean_nsp > 0.6:
            prob *= (1.0 - mean_nsp)

    return round(min(max(prob, 0.0), 1.0), 3)


async def _transcribe_sarvam(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    language: str | None = None,
) -> dict:
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY not configured")

    clean_mime = mime_type.split(";")[0].strip().lower()
    ext = _ext_from_mime(mime_type)
    filename = f"audio.{ext}"

    sarvam_lang = "unknown"
    if language and language in _ISO_TO_SARVAM:
        sarvam_lang = _ISO_TO_SARVAM[language]

    url = f"{SARVAM_BASE_URL}/speech-to-text"
    headers = {"api-subscription-key": SARVAM_API_KEY}
    files = {"file": (filename, audio_bytes, clean_mime)}
    data = {
        "model": MODELS["stt"],
        "mode": "transcribe",
        "language_code": sarvam_lang,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, files=files, data=data)

    if response.status_code != 200:
        raise RuntimeError(f"Sarvam STT failed (HTTP {response.status_code}): {response.text[:300]}")

    res_json = response.json()
    transcript = (res_json.get("transcript") or "").strip()
    detected_bcp47 = res_json.get("language_code") or "en-IN"
    detected_iso = _SARVAM_TO_ISO.get(detected_bcp47, language or "en")
    confidence = 0.90 if len(transcript) > 2 else (0.40 if transcript else 0.10)

    return {
        "text": transcript,
        "confidence": confidence,
        "language": detected_iso,
        "stt_detected_language": detected_iso,
        "engine": "sarvam",
        "stt_mode": "transcribe",
    }


async def _transcribe_whisper(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    language: str | None = None,
) -> dict:
    ext = _ext_from_mime(mime_type)
    clean_mime = mime_type.split(";")[0].strip().lower()

    lang_param = None
    if language and language in SUPPORTED_LANGUAGES:
        lang_param = SUPPORTED_LANGUAGES[language]["stt_code"]
    elif STT_LANGUAGE:
        lang_param = STT_LANGUAGE

    # 1. Groq Whisper (fast)
    try:
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = f"audio.{ext}"
        kwargs: dict = {
            "model": MODELS["stt_groq"],
            "file": (f"audio.{ext}", audio_file, clean_mime),
            "response_format": "verbose_json",
        }
        if lang_param:
            kwargs["language"] = lang_param

        result = await groq.audio.transcriptions.create(**kwargs)
        text = result.text.strip()
        confidence = _compute_whisper_confidence(result)
        raw_whisper_lang = getattr(result, "language", None)
        whisper_iso = _normalise_whisper_lang(raw_whisper_lang)
        effective_lang = lang_param or whisper_iso

        return {
            "text": text,
            "confidence": confidence,
            "language": effective_lang,
            "stt_detected_language": whisper_iso,
            "engine": "groq",
            "stt_mode": "transcribe",
        }
    except Exception as groq_err:
        logger.warning("Groq Whisper skipped: %s — trying Otari Whisper", groq_err)

    # 2. Otari Whisper
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = f"audio.{ext}"
    kwargs = {
        "model": MODELS["stt_otari"],
        "file": (f"audio.{ext}", audio_file, clean_mime),
    }
    if lang_param:
        kwargs["language"] = lang_param

    result = await otari.audio.transcriptions.create(**kwargs)
    text = result.text.strip()
    confidence = 0.75 if len(text) > 3 else 0.3
    raw_otari_lang = getattr(result, "language", None)
    otari_iso = _normalise_whisper_lang(raw_otari_lang)
    effective_lang = lang_param or otari_iso

    return {
        "text": text,
        "confidence": confidence,
        "language": effective_lang,
        "stt_detected_language": otari_iso,
        "engine": "otari",
        "stt_mode": "transcribe",
    }


async def transcribe(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    language: str | None = None,
) -> dict:
    """
    Transcribe audio bytes using the configured engine priority.
    """
    last_error = None
    for engine in STT_ENGINE_PRIORITY:
        try:
            if engine == "sarvam":
                if language and language not in _ISO_TO_SARVAM:
                    continue
                return await _transcribe_sarvam(audio_bytes, mime_type, language)
            elif engine in ("groq", "otari"):
                return await _transcribe_whisper(audio_bytes, mime_type, language)
        except Exception as err:
            last_error = err
            logger.warning("STT engine '%s' failed: %s — trying next", engine, err)

    raise RuntimeError(f"All STT engines failed. Last error: {last_error}")
