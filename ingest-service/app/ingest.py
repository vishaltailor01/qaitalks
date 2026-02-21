import os
import tempfile
from typing import List

import httpx
import hashlib
import fitz
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File
from sqlalchemy import select
from .embeddings import get_embeddings
from pathlib import Path
from pydantic import BaseModel

from .store import store_chunks
from .db import init_db

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "2000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

router = APIRouter()


class IngestURL(BaseModel):
    url: str


@router.post("/url")
async def ingest_url(payload: IngestURL, background: BackgroundTasks):
    url = payload.url
    try:
        local_path = await download_file(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"download failed: {e}")

    # compute checksum to detect duplicates
    try:
        with open(local_path, "rb") as fh:
            file_bytes = fh.read()
        checksum = hashlib.sha256(file_bytes).hexdigest()
    except Exception:
        checksum = None

    chunks = parse_document(local_path, CHUNK_SIZE, CHUNK_OVERLAP)

    # If DATABASE_URL is configured, initialize DB and store chunks in background
    if os.getenv("DATABASE_URL"):
        init_db()
        # try to infer original filename from URL
        try:
            orig = os.path.basename(url.split("?", 1)[0]) or None
        except Exception:
            orig = None
        background.add_task(store_chunks, os.path.basename(local_path), chunks, url, checksum, orig)

    return {"source": os.path.basename(local_path), "num_chunks": len(chunks), "chunks": chunks}


@router.post("/file")
async def ingest_file(background: BackgroundTasks, file: UploadFile = File(...)):
    """Accept a single uploaded file (PDF) and ingest it.

    Use multipart/form-data to POST files from your machine.
    """
    # save uploaded file to a temp path
    suffix = Path(file.filename).suffix or ".pdf"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(tmp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    chunks = parse_document(tmp_path, CHUNK_SIZE, CHUNK_OVERLAP)

    # compute checksum for uploaded file
    try:
        with open(tmp_path, "rb") as fh:
            checksum = hashlib.sha256(fh.read()).hexdigest()
    except Exception:
        checksum = None

    if os.getenv("DATABASE_URL"):
        init_db()
        # pass the uploaded filename so we preserve original name
        background.add_task(store_chunks, os.path.basename(tmp_path), chunks, None, checksum, file.filename)

    return {"source": file.filename, "num_chunks": len(chunks), "chunks": chunks}


async def download_file(url: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        suffix = os.path.splitext(url.split("?", 1)[0])[1] or ".pdf"
        fd, tmp_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)
        with open(tmp_path, "wb") as f:
            f.write(r.content)
        return tmp_path


def parse_document(path: str, chunk_size: int = 2000, overlap: int = 200) -> List[dict]:
    """
    Simple PyMuPDF-based parser and chunker.

    Returns list of {"chunk": str, "length": int}
    """
    try:
        doc = fitz.open(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to open document: {e}")

    pages_text = []
    for i, page in enumerate(doc):
        text = page.get_text("text") or ""
        pages_text.append({"page": i + 1, "text": text})

    full = "\n\n".join(p["text"] for p in pages_text)
    if not full.strip():
        # Try extracting by blocks as fallback
        blocks = []
        for page in doc:
            for b in page.get_text("blocks"):
                blocks.append(b[4])
        full = "\n\n".join(blocks)

    if not full:
        return []

    chunks = []
    idx = 0
    L = len(full)
    while idx < L:
        piece = full[idx: idx + chunk_size]
        chunks.append({"chunk": piece, "length": len(piece)})
        idx += chunk_size - overlap

    return chunks


class SearchRequest(BaseModel):
    query: str
    k: int = 5


@router.post("/search")
async def search(request: SearchRequest):
    """Embed `query` and return top-k similar chunks (in-Python ranking).

    This simple implementation fetches stored embeddings and ranks them
    in-process. It's intended for dev/testing; for production use pgvector
    nearest-neighbour queries.
    """
    from .db import get_session
    from .models import Chunk
    import math

    # get query embedding
    try:
        q_emb_raw = (await get_embeddings([request.query]))[0]
        q_emb = [float(x) for x in q_emb_raw]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"embedding failed: {e}")

    def cosine(a, b):
        # both are lists of floats
        sa = sum(x * x for x in a) ** 0.5
        sb = sum(x * x for x in b) ** 0.5
        if sa == 0 or sb == 0:
            return 0.0
        return sum(x * y for x, y in zip(a, b)) / (sa * sb)

    if not os.getenv("DATABASE_URL"):
        raise HTTPException(status_code=400, detail="DATABASE_URL not configured; search requires the database")

    init_db()
    async with get_session() as session:
        q = await session.execute(select(Chunk))
        rows = q.scalars().all()

    scored = []
    for r in rows:
        if r.embedding is None:
            continue
        try:
            emb = [float(x) for x in r.embedding]
        except Exception:
            # fallback: try to coerce to list
            emb = [float(x) for x in list(r.embedding)]
        score = float(cosine(q_emb, emb))
        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, r in scored[: request.k]:
        results.append({"id": r.id, "content": r.content, "score": float(score)})

    return {"query": request.query, "k": request.k, "results": results}


class CVReviewRequest(BaseModel):
    cv_text: str
    k: int = 5


@router.post("/cv/review")
async def cv_review(request: CVReviewRequest):
    """Simple CV review RAG scaffold.

    - embeds the `cv_text`
    - ranks stored chunks by cosine similarity
    - returns top-k chunks and a short mocked "recommendations" summary
    """
    from .db import get_session
    from .models import Chunk

    # get query embedding
    try:
        q_emb_raw = (await get_embeddings([request.cv_text]))[0]
        q_emb = [float(x) for x in q_emb_raw]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"embedding failed: {e}")

    def cosine(a, b):
        sa = sum(x * x for x in a) ** 0.5
        sb = sum(x * x for x in b) ** 0.5
        if sa == 0 or sb == 0:
            return 0.0
        return sum(x * y for x, y in zip(a, b)) / (sa * sb)

    if not os.getenv("DATABASE_URL"):
        raise HTTPException(status_code=400, detail="DATABASE_URL not configured; cv review requires the database")

    init_db()
    async with get_session() as session:
        q = await session.execute(select(Chunk))
        rows = q.scalars().all()

    scored = []
    for r in rows:
        if r.embedding is None:
            continue
        try:
            emb = [float(x) for x in r.embedding]
        except Exception:
            emb = [float(x) for x in list(r.embedding)]
        score = float(cosine(q_emb, emb))
        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = []
    for score, r in scored[: request.k]:
        top.append({"id": r.id, "content": r.content, "score": float(score)})

    # Synthesize recommendations via LLM helper (falls back to heuristic)
    from .cv_review import synthesize_recommendations

    recommendations = await synthesize_recommendations(request.cv_text, top)

    # Persist review result if DB configured
    if os.getenv("DATABASE_URL"):
        from .db import get_session
        from .models import CVReview
        import json

        init_db()
        async with get_session() as session:
            review = CVReview(
                cv_text=request.cv_text,
                recommendations="\n".join(recommendations),
                top_chunks_json=json.dumps(top),
            )
            session.add(review)
            await session.commit()

    return {
        "cv_summary": (request.cv_text[:400] + "...") if len(request.cv_text) > 400 else request.cv_text,
        "recommendations": recommendations,
        "top_chunks": top,
    }
