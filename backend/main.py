import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import voice, vision, image, compound, vision_voice, otari

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

app = FastAPI(
    title="Aetheris OmniSense API",
    description="Multimodal AI: Voice Assistant, Vision Mode & Open-Weight Router Workbench powered strictly by Mozilla.ai Otari Gateway",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router)
app.include_router(vision.router)
app.include_router(image.router)
app.include_router(compound.router)
app.include_router(vision_voice.router)
app.include_router(otari.router)


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "Aetheris OmniSense API",
        "gateway": "Mozilla.ai Otari (https://otari.ai/api/v1)",
        "branch": "mozilla-devs-wilding",
        "version": "2.0.0",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Aetheris OmniSense API is running on Mozilla.ai Otari",
        "docs": "/docs",
        "otari_status": "/api/otari/status",
        "open_weight_models": [
            "alibaba/qwen-3.5-35b-a3b",
            "alibaba/qwen3-32b",
            "alibaba/qwen3-vl-30b-a3b-instruct",
            "alibaba/qwen3-coder-30b-a3b-instruct",
            "alibaba/qwen3guard-gen-8b",
            "alibaba/qwen-image",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
