from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .ingest import router as ingest_router
from fastapi import APIRouter
from pydantic import BaseModel
import hashlib
import struct
import logging


logging.basicConfig(level=logging.INFO)


app = FastAPI(title="QaiTAlk Ingest Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(ingest_router, prefix="/ingest")


# Mock Gemini proxy for local testing
mock_router = APIRouter()


class _MockEmbRequest(BaseModel):
    texts: list[str]


@mock_router.post("/mock/gemini")
async def mock_gemini(req: _MockEmbRequest):
    # Deterministic pseudo-embeddings: hash each text into a fixed-length float vector
    def text_to_vector(t: str, dim: int = 8):
        h = hashlib.sha256(t.encode("utf-8")).digest()
        vec = []
        for i in range(dim):
            # take 4 bytes per float
            segment = h[(i * 4) % len(h): (i * 4) % len(h) + 4]
            # interpret as unsigned int, normalize
            val = struct.unpack("I", segment)[0]
            vec.append((val % 10000) / 10000.0)
        return vec

    embeddings = [text_to_vector(t) for t in req.texts]
    return {"embeddings": embeddings}


# Note: mock Gemini proxy removed to simplify the codebase.
