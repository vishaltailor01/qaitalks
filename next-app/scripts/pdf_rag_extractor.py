#!/usr/bin/env python3
"""
PDF RAG Extractor

Usage:
  python pdf_rag_extractor.py <file1.pdf> [file2.pdf ...]

What it does:
  - Extracts text per page using PyMuPDF (fitz)
  - Cleans text, splits into overlapping chunks (configurable)
  - Writes a <pdf>.chunks.json file containing chunks and metadata to public/syllabi
  - Optionally generates embeddings using OpenAI if OPENAI_API_KEY is set

Best-practices implemented:
  - Page-aware extraction (keeps page ranges for each chunk)
  - Overlapping chunks (helps retrieval continuity)
  - Configurable chunk size and overlap
  - Optional embedding generation and output to sidecar JSON

Notes:
  - Install requirements with: pip install -r requirements-pdf.txt
  - Set OPENAI_API_KEY env var to generate embeddings (optional)
"""

import sys
import os
import json
import math
from pathlib import Path
from typing import List, Dict

try:
    import fitz  # PyMuPDF
except Exception as e:
    print("PyMuPDF (fitz) is required. Install with: pip install PyMuPDF")
    raise

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
use_openai = bool(OPENAI_KEY)
if use_openai:
    try:
        import openai
        openai.api_key = OPENAI_KEY
    except Exception as e:
        print("OpenAI package is required to generate embeddings. Install with: pip install openai")
        use_openai = False


def extract_text_by_page(pdf_path: Path) -> List[str]:
    doc = fitz.open(pdf_path)
    pages = []
    for i in range(len(doc)):
        page = doc.load_page(i)
        text = page.get_text("text")
        pages.append(text)
    return pages


def clean_text(s: str) -> str:
    # Basic cleanup: normalise whitespace
    return "\n".join([line.strip() for line in s.splitlines() if line.strip()])


def chunk_pages(pages: List[str], chunk_chars=1500, overlap_chars=300) -> List[Dict]:
    """Create overlapping chunks from a list of page texts. Returns list of dicts with text and page range."""
    chunks = []
    current = ""
    current_start = 0
    page_idx = 0

    while page_idx < len(pages):
        page_text = clean_text(pages[page_idx])
        if not page_text:
            page_idx += 1
            continue

        if not current:
            current = page_text
            current_start = page_idx
        else:
            current += "\n\n" + page_text

        # when current exceeds chunk size, flush a chunk
        if len(current) >= chunk_chars:
            # determine end page index for this chunk
            end_page = page_idx
            chunks.append({
                "text": current,
                "start_page": current_start + 1,
                "end_page": end_page + 1,
            })

            # build overlap: take last overlap_chars from current
            overlap_text = current[-overlap_chars:]
            # find nearest sentence boundary to avoid cutting words (simple approach)
            # keep overlap as start for next chunk
            current = overlap_text
            current_start = end_page  # overlap starts roughly at this page

        page_idx += 1

    if current:
        # flush remainder
        chunks.append({
            "text": current,
            "start_page": current_start + 1,
            "end_page": len(pages),
        })

    # post-process: trim whitespace
    for c in chunks:
        c["text"] = c["text"].strip()

    return chunks


def generate_embeddings_for_chunks(chunks: List[Dict], model: str = "text-embedding-3-small") -> List[Dict]:
    if not use_openai:
        raise RuntimeError("OpenAI API key not configured")

    texts = [c["text"] for c in chunks]
    embeddings = []
    # OpenAI embeddings API supports batching; we'll do small batches to be safe
    batch_size = 10
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = openai.Embedding.create(input=batch, model=model)
        for j, item in enumerate(response.data):
            embeddings.append(item.embedding)

    # attach embeddings to chunks
    for c, e in zip(chunks, embeddings):
        c["embedding"] = e

    return chunks


def write_chunks(out_path: Path, pdf_name: str, chunks: List[Dict]):
    payload = {
        "source": pdf_name,
        "num_chunks": len(chunks),
        "chunks": [],
    }
    for idx, c in enumerate(chunks):
        payload["chunks"].append({
            "id": f"{pdf_name}-chunk-{idx+1}",
            "text": c["text"],
            "start_page": c["start_page"],
            "end_page": c["end_page"],
            **({"embedding": c["embedding"]} if "embedding" in c else {}),
        })

    out_file = out_path / f"{pdf_name}.chunks.json"
    out_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"Wrote {out_file}")


def main(argv):
    if len(argv) < 2:
        print("Usage: pdf_rag_extractor.py <file1.pdf> [file2.pdf ...]")
        return 1

    files = argv[1:]
    out_dir = Path(__file__).parent.parent / "public" / "syllabi"
    out_dir.mkdir(parents=True, exist_ok=True)

    for f in files:
        p = Path(f)
        if not p.exists():
            print("File not found:", f)
            continue

        print("Processing:", f)
        pages = extract_text_by_page(p)
        chunks = chunk_pages(pages, chunk_chars=1500, overlap_chars=300)

        # optionally generate embeddings
        if use_openai:
            try:
                chunks = generate_embeddings_for_chunks(chunks)
                print("Generated embeddings for chunks")
            except Exception as e:
                print("Embedding generation failed:", str(e))

        pdf_name = p.stem
        write_chunks(out_dir, pdf_name, chunks)

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
