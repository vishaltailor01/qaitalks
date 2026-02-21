PDF RAG Extractor
==================

This script extracts text from PDFs, splits into overlapping chunks suitable for RAG, and optionally generates embeddings using OpenAI.

Prerequisites
-------------
- Python 3.9+
- Install required packages (in the `next-app` folder):

```bash
python -m pip install -r scripts/requirements-pdf.txt
```

Usage
-----

Place your PDFs locally and run:

```bash
python scripts/pdf_rag_extractor.py \
  "c:/Users/tailo/OneDrive/Desktop/istqb/ISTQB_CTFL_Syllabus_v4.0.1.pdf" \
  "c:/Users/tailo/OneDrive/Desktop/istqb/ISTQB-CTAL-TA-Syllabus-v4.0-EN-4.pdf"
```

Output
------
- Writes chunk files to `public/syllabi/<pdf_stem>.chunks.json` containing chunk text, page ranges and (if enabled) embeddings.

Embedding
---------
Set `OPENAI_API_KEY` in your environment to enable embedding generation. The script uses OpenAI's embeddings API and attaches vectors to each chunk in the JSON.

Best practices implemented
--------------------------
- Page-aware extraction
- Overlapping chunks for context continuity
- Configurable chunk size/overlap
- Optional embeddings for RAG
