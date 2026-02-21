import os
from typing import List
from .db import init_db, get_session
from .models import Document, Chunk
from sqlalchemy import select, update
from .embeddings import get_embeddings, GEMINI_PROXY_URL


async def store_chunks(document_name: str, chunks: List[dict], source_url: str | None = None, checksum: str | None = None, original_name: str | None = None):
    """Store document and chunks into Postgres using async SQLAlchemy.

    If `GEMINI_PROXY_URL` is configured, this function will also request
    embeddings for stored chunks and update them in-place.
    """
    if not os.getenv("DATABASE_URL"):
        return

    init_db()
    async with get_session() as session:
        # check for duplicate by checksum
        if checksum:
            qdoc = select(Document).where(Document.checksum == checksum)
            existing = (await session.execute(qdoc)).scalars().first()
            if existing:
                return existing.id

        # preserve original filename when available, otherwise use provided document_name
        display_name = original_name or document_name
        doc = Document(name=display_name, source_url=source_url, checksum=checksum)
        session.add(doc)
        await session.flush()
        for c in chunks:
            ch = Chunk(document_id=doc.id, content=c.get("chunk", ""), length=c.get("length", 0))
            session.add(ch)
        await session.commit()

        # Optionally compute embeddings and update rows
        if GEMINI_PROXY_URL:
            # fetch fresh chunk rows
            q = select(Chunk).where(Chunk.document_id == doc.id).order_by(Chunk.id)
            result = await session.execute(q)
            rows = result.scalars().all()
            texts = [r.content for r in rows]
            if texts:
                try:
                    import logging
                    logging.getLogger("ingest").info("requesting embeddings for %d texts", len(texts))
                    embs = await get_embeddings(texts)
                    logging.getLogger("ingest").info("received embeddings: %s", str([len(e) for e in embs]))
                    # update each chunk
                    for r, emb in zip(rows, embs):
                        r.embedding = emb
                        session.add(r)
                    await session.commit()
                except Exception as e:
                    # embedding failures shouldn't break ingestion; log for debugging
                    import logging
                    logging.getLogger("ingest").exception("embedding update failed: %s", e)
                    # As a fallback (local/dev), synthesize deterministic embeddings so rows have vectors
                    try:
                        import hashlib
                        logging.getLogger("ingest").warning("using local fallback embeddings for %d texts", len(texts))
                        def _fallback(t):
                            h = hashlib.sha256(t.encode("utf-8")).digest()
                            return [((b / 255.0) * 2.0 - 1.0) for b in h[:8]]
                        for r in rows:
                            r.embedding = _fallback(r.content)
                            session.add(r)
                        await session.commit()
                    except Exception:
                        logging.getLogger("ingest").exception("fallback embedding generation failed")

        return doc.id
