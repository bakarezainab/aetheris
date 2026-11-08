"""
tts_service.py — Multilingual Text-to-Speech Service for Aetheris OmniSense

Routes TTS across supported languages:
  - gTTS (Google Translate TTS) for native Indic & global script pronunciation
  - Mozilla.ai Otari speech synthesis endpoint (`kokoro-82m`) when requested
"""

import asyncio
import io
import logging
from gtts import gTTS
from app.services.otari_client import otari
from app.config import MODELS, SUPPORTED_LANGUAGES

logger = logging.getLogger("Aetheris.OmniSense.tts")


def _gtts_blocking(text: str, lang_code: str) -> bytes:
    """Synchronous gTTS call — run in thread pool via asyncio.to_thread."""
    tts = gTTS(text=text, lang=lang_code, slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf.read()


async def _synthesize_gtts(text: str, lang_code: str) -> bytes:
    """Synthesize speech using Google Translate TTS."""
    logger.info("gTTS synthesize: lang=%s chars=%d text='%s'", lang_code, len(text), text[:60])
    audio_bytes = await asyncio.to_thread(_gtts_blocking, text, lang_code)
    logger.info("gTTS done: %d bytes (lang=%s)", len(audio_bytes), lang_code)
    return audio_bytes


async def _synthesize_kokoro(text: str, voice: str = "af_heart") -> bytes:
    """Synthesize using Kokoro 82M via Mozilla.ai Otari Gateway."""
    logger.info("Kokoro TTS via Otari: voice=%s chars=%d text='%s'", voice, len(text), text[:60])
    response = await otari.audio.speech.create(
        model=MODELS["tts"],
        input=text,
        voice=voice,
        response_format="mp3",
    )
    content = response.content
    logger.info("Kokoro TTS done: %d bytes", len(content))
    return content


async def synthesize(text: str, language: str = "en") -> bytes:
    """
    Convert text to MP3 audio bytes with language-appropriate TTS engine.
    """
    if not text or not text.strip():
        raise ValueError("Cannot synthesize empty text")

    text = text.strip()[:600]

    lang_info = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en"])
    engine = lang_info.get("tts_engine", "gtts")
    gtts_lang = lang_info.get("gtts_lang", language)
    voice = lang_info.get("kokoro_voice", "af_heart")

    if engine == "gtts":
        try:
            return await _synthesize_gtts(text, gtts_lang)
        except Exception as e:
            logger.error("gTTS failed for lang=%s: %s — falling back to Kokoro", gtts_lang, e)
            return await _synthesize_kokoro(text, voice)

    try:
        return await _synthesize_kokoro(text, voice)
    except Exception as e:
        logger.warning("Otari Kokoro failed (%s), falling back to gTTS for lang=%s", e, gtts_lang)
        return await _synthesize_gtts(text, gtts_lang)
