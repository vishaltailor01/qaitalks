import os
import logging
import asyncio
from typing import List, Optional, Any

import httpx

logger = logging.getLogger(__name__)

GEMINI_PROXY_URL = os.getenv("GEMINI_PROXY_URL")
HUGGINGFACE_API_URL = os.getenv("HUGGINGFACE_API_URL")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
EMBED_BATCH = int(os.getenv("EMBED_BATCH", "16"))
EMBED_RETRIES = int(os.getenv("EMBED_RETRIES", "2"))
EMBED_BACKOFF = float(os.getenv("EMBED_BACKOFF", "0.5"))
FALLBACK_DIM = int(os.getenv("FALLBACK_EMBED_DIM", "8"))


async def _call_gemini(client: httpx.AsyncClient, batch: List[str]) -> Optional[List[List[float]]]:
    if not GEMINI_PROXY_URL:
        return None
    last_err: Optional[Exception] = None
    for attempt in range(EMBED_RETRIES + 1):
        try:
            r = await client.post(GEMINI_PROXY_URL, json={"texts": batch})
            r.raise_for_status()
            data = r.json()
            embs = data.get("embeddings") or data.get("embs")
            return _normalize_embeddings(embs)
        except Exception as e:
            last_err = e
            logger.warning("Gemini proxy attempt %s failed: %s", attempt + 1, e)
            if attempt < EMBED_RETRIES:
                await asyncio.sleep(EMBED_BACKOFF * (2 ** attempt))
    raise last_err


async def _call_huggingface(client: httpx.AsyncClient, batch: List[str]) -> Optional[List[List[float]]]:
    if not HUGGINGFACE_API_URL or not HUGGINGFACE_API_KEY:
        return None
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    last_err: Optional[Exception] = None
    for attempt in range(EMBED_RETRIES + 1):
        try:
            r = await client.post(HUGGINGFACE_API_URL, headers=headers, json={"inputs": batch}, timeout=60.0)
            r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and all(isinstance(x, list) for x in data):
                return _normalize_embeddings(data)
            if isinstance(data, dict) and "data" in data:
                items = data["data"]
                embs = []
                for it in items:
                    if isinstance(it, dict) and "embedding" in it:
                        embs.append(it["embedding"])
                    elif isinstance(it, list):
                        embs.append(it)
                return _normalize_embeddings(embs)
            if isinstance(data, dict) and "embeddings" in data:
                return _normalize_embeddings(data["embeddings"])
            if isinstance(data, dict) and "embedding" in data:
                return _normalize_embeddings([data["embedding"]])
            return None
        except Exception as e:
            last_err = e
            logger.warning("Hugging Face attempt %s failed: %s", attempt + 1, e)
            if attempt < EMBED_RETRIES:
                await asyncio.sleep(EMBED_BACKOFF * (2 ** attempt))
    raise last_err


def _normalize_embeddings(raw: Any) -> List[List[float]]:
    """Coerce embedding responses into List[List[float]] with native floats."""
    if raw is None:
        raise ValueError("No embeddings in response")
    # flat list -> single embedding
    if isinstance(raw, (list, tuple)) and raw and not any(isinstance(i, (list, tuple)) for i in raw):
        try:
            return [[float(x) for x in raw]]
        except Exception as e:
            raise ValueError(f"Failed to coerce embedding values: {e}")
    if isinstance(raw, list):
        out: List[List[float]] = []
        for item in raw:
            if isinstance(item, (list, tuple)):
                try:
                    out.append([float(x) for x in item])
                except Exception as e:
                    raise ValueError(f"Failed to coerce embedding item to floats: {e}")
            elif isinstance(item, dict) and "embedding" in item:
                try:
                    out.append([float(x) for x in item["embedding"]])
                except Exception as e:
                    raise ValueError(f"Failed to coerce dict embedding values: {e}")
            else:
                raise ValueError("Unexpected embedding item type")
        return out
    raise ValueError("Unsupported embedding response shape")


def _local_fallback_embedding(text: str, dim: int) -> List[float]:
    """Create a deterministic fallback embedding from text using SHA256.

    Produces `dim` floats in [0,1) derived from the hash. Useful for local dev.
    """
    import hashlib

    h = hashlib.sha256(text.encode("utf-8")).digest()
    out: List[float] = []
    # use chunks of the hash to produce floats
    for i in range(dim):
        b = h[i % len(h)]
        # simple deterministic transform
        out.append((b / 255.0) * 2.0 - 1.0)
    return out


async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings for a list of texts using Gemini proxy, falling back to Hugging Face.

    Behaviour:
    - Try Gemini first when configured; fall back to Hugging Face if available.
    - Raises RuntimeError if no provider is configured or both fail for a batch.
    """
    if not (GEMINI_PROXY_URL or (HUGGINGFACE_API_URL and HUGGINGFACE_API_KEY)):
        raise RuntimeError("No embedding provider configured: set GEMINI_PROXY_URL or HUGGINGFACE_API_URL and HUGGINGFACE_API_KEY")

    embeddings: List[List[float]] = []
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i in range(0, len(texts), EMBED_BATCH):
            batch = texts[i : i + EMBED_BATCH]
            emb_batch = None
            if GEMINI_PROXY_URL:
                try:
                    emb_batch = await _call_gemini(client, batch)
                except Exception as e:
                    logger.warning("Gemini proxy failed: %s", e)
                    emb_batch = None
            if (emb_batch is None) and HUGGINGFACE_API_URL and HUGGINGFACE_API_KEY:
                try:
                    emb_batch = await _call_huggingface(client, batch)
                except Exception as e:
                    logger.warning("Hugging Face embeddings failed: %s", e)
                    emb_batch = None
            if not emb_batch:
                # As a last-resort fallback for local/dev, synthesize deterministic embeddings
                logger.warning("No embeddings returned for batch; using local fallback embeddings")
                emb_batch = [_local_fallback_embedding(t, FALLBACK_DIM) for t in batch]
            # validate lengths
            if len(emb_batch) != len(batch):
                logger.warning("embedding batch size mismatch: texts=%s embeddings=%s", len(batch), len(emb_batch))
            embeddings.extend(emb_batch)
    return embeddings
