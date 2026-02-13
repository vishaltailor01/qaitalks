// File processing utilities for CV Review (Phase 2)
// Client-side PDF and DOCX text extraction

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = {
  pdf: ['application/pdf'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  text: ['text/plain'],
  markdown: ['text/markdown', 'text/x-markdown'],
  html: ['text/html'],
};

export interface FileProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'text' | 'markdown' | 'html' | 'unknown';
  fileSizeKB: number;
}

/**
 * Validate file before processing
 */
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }

  // Check file type
  const isPDF = ALLOWED_TYPES.pdf.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
  const isDOCX = ALLOWED_TYPES.docx.includes(file.type) || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
  const isText = ALLOWED_TYPES.text.includes(file.type) || file.name.toLowerCase().endsWith('.txt');
  const isMarkdown = ALLOWED_TYPES.markdown.includes(file.type) || file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown');
  const isHTML = ALLOWED_TYPES.html.includes(file.type) || file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');

  if (!isPDF && !isDOCX && !isText && !isMarkdown && !isHTML) {
    return {
      valid: false,
      error: 'Invalid file type. Supported formats: PDF, DOCX, TXT, Markdown (.md), HTML',
    };
  }

  return { valid: true };
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textParts: string[] = [];
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          // TextItem has str property, TextMarkedContent does not
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ')
        .trim();
      
      if (pageText) {
        textParts.push(pageText);
      }
    }
    
    const fullText = textParts.join('\n\n').trim();
    
    if (!fullText) {
      throw new Error('No text could be extracted from the PDF. The file might be an image-based PDF or empty.');
    }
    
    return fullText;
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromPlainText(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      throw new Error('The text file is empty.');
    }
    
    return text.trim();
  } catch (error) {
    throw new Error(
      `Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from Markdown file
 */
export async function extractTextFromMarkdown(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      throw new Error('The markdown file is empty.');
    }
    
    // Keep markdown as-is for now (AI can handle markdown)
    // Optional: strip markdown formatting if needed
    return text.trim();
  } catch (error) {
    throw new Error(
      `Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from HTML file
 */
export async function extractTextFromHTML(file: File): Promise<string> {
  try {
    const html = await file.text();
    
    if (!html.trim()) {
      throw new Error('The HTML file is empty.');
    }
    
    // Parse HTML and extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content
    const text = doc.body.textContent || doc.body.innerText || '';
    
    if (!text.trim()) {
      throw new Error('No text content found in HTML file.');
    }
    
    // Clean up excessive whitespace
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return cleanedText;
  } catch (error) {
    throw new Error(
      `Failed to extract text from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Dynamically import mammoth (only when needed)
    const mammoth = await import('mammoth');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const text = result.value.trim();
    
    if (!text) {
      throw new Error('No text could be extracted from the DOCX file. The file might be empty.');
    }
    
    // Clean up excessive whitespace
    const cleanedText = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]{2,}/g, ' ') // Collapse multiple spaces
      .trim();
    
    return cleanedText;
  } catch (error) {

    throw new Error(
      `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Process uploaded file and extract text
 */
export async function processFile(file: File): Promise<FileProcessingResult> {
  const fileName = file.name;
  const fileSizeKB = Math.round(file.size / 1024);
  
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      fileName,
      fileType: 'unknown',
      fileSizeKB,
    };
  }
  
  // Determine file type
  const isPDF = ALLOWED_TYPES.pdf.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
  const isDOCX = ALLOWED_TYPES.docx.includes(file.type) || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
  const isText = ALLOWED_TYPES.text.includes(file.type) || file.name.toLowerCase().endsWith('.txt');
  const isMarkdown = ALLOWED_TYPES.markdown.includes(file.type) || file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown');
  const isHTML = ALLOWED_TYPES.html.includes(file.type) || file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
  
  let fileType: 'pdf' | 'docx' | 'text' | 'markdown' | 'html' | 'unknown' = 'unknown';
  if (isPDF) fileType = 'pdf';
  else if (isDOCX) fileType = 'docx';
  else if (isText) fileType = 'text';
  else if (isMarkdown) fileType = 'markdown';
  else if (isHTML) fileType = 'html';
  
  try {
    let text: string;
    
    if (fileType === 'pdf') {
      text = await extractTextFromPDF(file);
    } else if (fileType === 'docx') {
      text = await extractTextFromDOCX(file);
    } else if (fileType === 'text') {
      text = await extractTextFromPlainText(file);
    } else if (fileType === 'markdown') {
      text = await extractTextFromMarkdown(file);
    } else if (fileType === 'html') {
      text = await extractTextFromHTML(file);
    } else {
      throw new Error('Unsupported file type');
    }
    
    return {
      success: true,
      text,
      fileName,
      fileType,
      fileSizeKB,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fileName,
      fileType,
      fileSizeKB,
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}

/**
 * Get file type icon
 */
export function getFileTypeIcon(fileType: 'pdf' | 'docx' | 'text' | 'markdown' | 'html' | 'unknown'): string {
  switch (fileType) {
    case 'pdf':
      return '📄';
    case 'docx':
      return '📝';
    case 'text':
      return '📋';
    case 'markdown':
      return '📝';
    case 'html':
      return '🌐';
    default:
      return '📁';
  }
}
