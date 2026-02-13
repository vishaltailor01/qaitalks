// File export utilities for multi-format CV/Review download
// Supports: PDF, DOCX, TXT, Markdown, HTML

import { CVGenerationResponse } from './ai/types';

// --- TXT Export ---
export function exportAsTxt(cv: CVGenerationResponse): string {
  return cv.optimizedCV;
}

// --- Markdown Export ---
export function exportAsMarkdown(cv: CVGenerationResponse): string {
  // Simple: treat each section as a markdown header
  return [
    '# Optimized CV',
    '---',
    cv.optimizedCV,
    '',
    '## ATS Resume',
    cv.atsResume,
    '',
    '## Interview Guide',
    cv.interviewGuide,
    '',
    '## Domain Questions',
    cv.domainQuestions,
    '',
    '## Gap Analysis',
    cv.gapAnalysis,
    '',
    '## Cover Letter',
    cv.coverLetter,
  ].join('\n\n');
}

// --- HTML Export ---
export function exportAsHtml(cv: CVGenerationResponse): string {
  // Basic HTML structure
  return `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\" />\n<title>Optimized CV</title>\n</head>\n<body>\n<main>\n<h1>Optimized CV</h1>\n<pre>${cv.optimizedCV}</pre>\n<h2>ATS Resume</h2>\n<pre>${cv.atsResume}</pre>\n<h2>Interview Guide</h2>\n<pre>${cv.interviewGuide}</pre>\n<h2>Domain Questions</h2>\n<pre>${cv.domainQuestions}</pre>\n<h2>Gap Analysis</h2>\n<pre>${cv.gapAnalysis}</pre>\n<h2>Cover Letter</h2>\n<pre>${cv.coverLetter}</pre>\n</main>\n</body>\n</html>`;
}

// --- DOCX Export (using docx library) ---
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export async function exportAsDocx(cv: CVGenerationResponse): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: 'Optimized CV', heading: HeadingLevel.HEADING_1 }),
          new Paragraph(cv.optimizedCV),
          new Paragraph({ text: 'ATS Resume', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cv.atsResume),
          new Paragraph({ text: 'Interview Guide', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cv.interviewGuide),
          new Paragraph({ text: 'Domain Questions', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cv.domainQuestions),
          new Paragraph({ text: 'Gap Analysis', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cv.gapAnalysis),
          new Paragraph({ text: 'Cover Letter', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(cv.coverLetter),
        ],
      },
    ],
  });
  const buffer = await Packer.toBlob(doc);
  return buffer;
}

// --- PDF Export (using pdf-lib) ---
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function exportAsPdf(cv: CVGenerationResponse): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  let y = height - 40;
  const lineHeight = 16;
  const maxWidth = width - 80;
  function drawTextBlock(text: string, title: string) {
    page.drawText(title, { x: 40, y, size: 14, font, color: undefined });
    y -= lineHeight;
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      page.drawText(line, { x: 40, y, size: 11, font, color: undefined, maxWidth });
      y -= lineHeight;
      if (y < 40) break;
    }
    y -= lineHeight;
  }
  drawTextBlock(cv.optimizedCV, 'Optimized CV');
  drawTextBlock(cv.atsResume, 'ATS Resume');
  drawTextBlock(cv.interviewGuide, 'Interview Guide');
  drawTextBlock(cv.domainQuestions, 'Domain Questions');
  drawTextBlock(cv.gapAnalysis, 'Gap Analysis');
  drawTextBlock(cv.coverLetter, 'Cover Letter');
  return await pdfDoc.save();
}
