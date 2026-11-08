import httpx
from typing import List
from app.config import OTARI_API_KEY, OTARI_BASE_URL, MODELS
from app.models.schemas import DetectionBox


async def detect_objects(image_base64: str) -> List[DetectionBox]:
    """
    Send a base64 JPEG frame to Mozilla.ai Otari vision detection endpoint.
    Returns a list of DetectionBox(label, confidence, bbox=[x, y, w, h]).
    Non-fatal: returns [] on any error so vision analysis still works.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{OTARI_BASE_URL.rstrip('/')}/images/detect",
                headers={
                    "Authorization": f"Bearer {OTARI_API_KEY}",
                    "Otari-Key": OTARI_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODELS["detect"],
                    "image": f"data:image/jpeg;base64,{image_base64}",
                },
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            raw = data.get("detections") or data.get("predictions") or []
            return [
                DetectionBox(
                    label=d.get("label") or d.get("class", "object"),
                    confidence=round(float(d.get("confidence") or d.get("score", 0.0)), 2),
                    bbox=d.get("bbox") or d.get("box", [0, 0, 0, 0]),
                )
                for d in raw
            ]
    except Exception:
        return []
