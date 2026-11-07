import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import voice, vision, image, compound, vision_voice, otari

# ── Logging — see actual errors in terminal ───────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

app = FastAPI(
    title="Otari VoxVision.ai Studio API",
    description="Multimodal AI: Voice Assistant, Vision Mode & Open-Weight Router Workbench powered by Mozilla.ai Otari Gateway",
    version="2.0.0",
)

# ── CORS — allow React dev server ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(voice.router)
app.include_router(vision.router)
app.include_router(image.router)
app.include_router(compound.router)
app.include_router(vision_voice.router)
app.include_router(otari.router)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "Otari VoxVision.ai Studio API",
        "gateway": "Mozilla.ai Otari (https://api.otari.ai/api/v1)",
        "branch": "mozilla-devs-wilding",
        "version": "2.0.0",
    }

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Otari VoxVision.ai Studio API is running",
        "docs": "/docs",
        "otari_status": "/api/otari/status",
        "open_weight_models": [
            "deepseek/deepseek-r1-distill-llama-70b",
            "qwen/qwen-3-32b-instruct",
            "meta-llama/llama-4-maverick-17b-128e-instruct",
            "qwen/qwen-2.5-coder-32b-instruct",
            "mistralai/ministral-14b-instruct",
        ],
    }

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
