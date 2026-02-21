# Ingest Service

FastAPI-based ingestion service for document parsing and chunking.

Endpoints:
- `GET /health` - healthcheck
- `POST /ingest/url` - JSON {"url": "https://.../file.pdf"} downloads file, parses text, returns chunks

This is a scaffold: it uses PyMuPDF (fitz) as a reliable fallback parser. Replace or extend the `parse_document` function in `app/ingest.py` to call Docling when available.

Run locally (virtualenv):

```bash
python -m venv .venv
. .venv/Scripts/activate   # on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docker (dev):

```bash
docker compose -f docker-compose.ingest.yml up --build
```
