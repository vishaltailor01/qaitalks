#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const pdfLib = require('pdf-parse');
const pdf = pdfLib.default || pdfLib;

async function downloadToBuffer(url) {
  console.log('Downloading', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function extractTextFromPdfBuffer(buffer) {
  const data = await pdf(buffer);
  return data.text || '';
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const urls = [
    // add URLs here or pass them via environment / edit this file
    'https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf',
    'https://istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN-4.pdf'
  ];

  const outDir = path.join(__dirname, '..', 'public', 'syllabi');
  await ensureDir(outDir);

  const kpPath = path.join(__dirname, '..', 'public', 'knowledge-pool.json');
  let knowledgePool = {};
  try {
    const existing = await fs.readFile(kpPath, 'utf8');
    knowledgePool = JSON.parse(existing);
  } catch (e) {
    knowledgePool = { courses: [] };
  }

  for (const url of urls) {
    try {
      const buffer = await downloadToBuffer(url);
      const fileName = path.basename(url).replace(/[^a-zA-Z0-9.-]/g, '_');
      const pdfPath = path.join(outDir, fileName);
      await fs.writeFile(pdfPath, buffer);
      console.log('Saved PDF to', pdfPath);

      const text = await extractTextFromPdfBuffer(buffer);
      const txtPath = pdfPath.replace(/\.pdf$/i, '.txt');
      await fs.writeFile(txtPath, text, 'utf8');
      console.log('Extracted text to', txtPath);

      knowledgePool.courses.push({
        id: fileName.replace(/\.pdf$/i, ''),
        title: fileName,
        source: url,
        rawTextPath: `/syllabi/${path.basename(txtPath)}`,
        extractedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed for', url, err.message);
    }
  }

  // write knowledge pool
  await fs.writeFile(kpPath, JSON.stringify(knowledgePool, null, 2), 'utf8');
  console.log('Wrote knowledge pool to', kpPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
