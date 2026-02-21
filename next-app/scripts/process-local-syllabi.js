#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const pdfLib = require('pdf-parse');
const pdf = pdfLib.default || pdfLib;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function basenameToId(name) {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase();
}

async function processFile(filePath) {
  const abs = path.resolve(filePath);
  const data = await fs.readFile(abs);
  const outDir = path.join(__dirname, '..', 'public', 'syllabi');
  await ensureDir(outDir);

  const filename = path.basename(filePath);
  const targetPdf = path.join(outDir, filename);
  await fs.writeFile(targetPdf, data);

  let text = '';
  try {
    const parsed = await pdf(data);
    text = parsed.text || '';
  } catch (e) {
    console.error('Failed to parse', filePath, e.message);
    text = '';
  }

  const txtName = filename.replace(/\.pdf$/i, '.txt');
  const txtPath = path.join(outDir, txtName);
  await fs.writeFile(txtPath, text, 'utf8');

  return {
    id: basenameToId(filename),
    title: filename,
    source: abs,
    pdfPath: `/syllabi/${filename}`,
    rawTextPath: `/syllabi/${txtName}`,
    extractedAt: new Date().toISOString()
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: node process-local-syllabi.js <file1.pdf> <file2.pdf> ...');
    process.exit(1);
  }

  const kpPath = path.join(__dirname, '..', 'public', 'knowledge-pool.json');
  let kp = { courses: [] };
  try {
    const existing = await fs.readFile(kpPath, 'utf8');
    kp = JSON.parse(existing);
  } catch (e) {
    kp = { courses: [] };
  }

  for (const p of args) {
    try {
      console.log('Processing', p);
      const entry = await processFile(p);
      // avoid duplicates by id
      kp.courses = kp.courses.filter((c) => c.id !== entry.id);
      kp.courses.push(entry);
      console.log('Added', entry.id);
    } catch (e) {
      console.error('Error processing', p, e.message);
    }
  }

  await fs.writeFile(kpPath, JSON.stringify(kp, null, 2), 'utf8');
  console.log('Updated knowledge pool at', kpPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
