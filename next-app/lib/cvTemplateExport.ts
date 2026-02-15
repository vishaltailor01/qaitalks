// CV Template Export Utility (Phase 3.2 + Phase 5 QA Enhancement)
// Export optimized CV with professional UK formatting and QA-specific sections

import jsPDF from 'jspdf';
import type { QARole } from '@/lib/qa-domain/roles';

interface ExportOptions {
  format?: 'professional' | 'modern' | 'classic';
  includeKeywords?: boolean;
  colorScheme?: 'blue' | 'purple' | 'green' | 'gray';
  qaRole?: QARole | null; // QA Domain Enhancement (Phase 5)
  qaFocused?: boolean; // Include QA-specific sections
}

// Color schemes for different templates (Brand Colors Aligned)
const COLOR_SCHEMES: Record<string, { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number] }> = {
  blue: {
    primary: [0, 27, 68], // Deep blueprint (brand)
    secondary: [0, 180, 216], // Logic cyan (brand)
    accent: [34, 197, 94], // Growth green
  },
  purple: {
    primary: [75, 0, 130], // Indigo
    secondary: [139, 92, 246], // Purple accent (brand)
    accent: [216, 191, 216], // Thistle
  },
  green: {
    primary: [0, 100, 0], // Dark green
    secondary: [34, 197, 94], // Growth green (brand)
    accent: [144, 238, 144], // Light green
  },
  gray: {
    primary: [64, 64, 64], // Dark gray
    secondary: [100, 116, 139], // Slate gray (brand)
    accent: [192, 192, 192], // Light gray
  },
};

/**
 * Parse CV content into structured sections with improved detection
 */
type ParsedCVSections = {
  name?: string;
  title?: string;
  contact?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  testingFrameworks?: string; // QA Enhancement
  certifications?: string; // QA Enhancement
  testMetrics?: string; // QA Enhancement
  rest?: string;
};

function parseCVContent(cvText: string): ParsedCVSections {
  const sections: ParsedCVSections = {};

  // Extract name (usually first non-empty line)
  const lines = cvText.split('\n').filter(line => line.trim());
  sections.name = lines[0]?.trim() || 'Your Name';

  // Extract title (often second line, unless it's a section header)
  const sectionHeaderRegex = /^(PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|TESTING FRAMEWORKS|TEST AUTOMATION|QA TOOLS|TEST METRICS|QUALITY ASSURANCE|TARGET ROLE)/i;
  
  if (lines[1] && !sectionHeaderRegex.test(lines[1])) {
    sections.title = lines[1].trim();
  }

  // Try to find sections by common headers with improved regex
  const sectionRegex = /^(PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|TESTING FRAMEWORKS?|TEST AUTOMATION|QA TOOLS|TEST METRICS|QUALITY ASSURANCE|TARGET ROLE|ORGANISATIONAL|ORGANIZATIONAL)/gim;
  const matches = [...cvText.matchAll(sectionRegex)];

  if (matches.length > 0) {
    matches.forEach((match, index) => {
      const sectionName = match[0].toLowerCase().trim();
      const startIdx = match.index! + match[0].length;
      const endIdx = matches[index + 1]?.index || cvText.length;
      const content = cvText.substring(startIdx, endIdx).trim();

      if (!content) return;

      if (sectionName.includes('summary') || sectionName.includes('target role')) {
        sections.summary = (sections.summary || '') + '\n\n' + content;
      } else if (sectionName.includes('experience')) {
        sections.experience = (sections.experience || '') + '\n\n' + content;
      } else if (sectionName.includes('education')) {
        sections.education = content;
      } else if (sectionName.includes('technical skill') || (sectionName.includes('skill') && !sectionName.includes('qa'))) {
        sections.skills = content;
      } else if (sectionName.includes('testing') || sectionName.includes('automation') || sectionName.includes('qa tool') || sectionName.includes('framework')) {
        sections.testingFrameworks = (sections.testingFrameworks || '') + '\n\n' + content;
      } else if (sectionName.includes('certification')) {
        sections.certifications = content;
      } else if (sectionName.includes('metric') || sectionName.includes('organisational') || sectionName.includes('organizational')) {
        sections.testMetrics = (sections.testMetrics || '') + '\n\n' + content;
      }
    });

    // Clean up any double line breaks we may have added
    Object.keys(sections).forEach(key => {
      if (typeof sections[key as keyof ParsedCVSections] === 'string') {
        sections[key as keyof ParsedCVSections] = sections[key as keyof ParsedCVSections]!
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }
    });
  }

  // Extract contact info (email, phone, location) with improved regex
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cvText.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  const locationMatch = cvText.match(/(?:^|\n)([A-Za-z\s]+,\s*(?:[A-Z]{2,}|UK|United Kingdom))/m);
  
  const contactParts = [];
  if (locationMatch && locationMatch[1]) contactParts.push(locationMatch[1].trim());
  if (emailMatch) contactParts.push(emailMatch[0]);
  if (phoneMatch) contactParts.push(phoneMatch[0]);
  
  if (contactParts.length > 0) {
    sections.contact = contactParts.join(' | ');
  }

  sections.rest = cvText;
  return sections;
}

/**
 * Add text with word wrap, paragraph support, and page break handling
 */
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Split into paragraphs first to preserve structure
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((paragraph: string) => {
    if (!paragraph.trim()) return;

    const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
    
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
      }
      
      doc.text(line, x, y);
      y += lineHeight;
    });

    // Add extra space between paragraphs (but not after the last line)
    if (paragraph !== paragraphs[paragraphs.length - 1]) {
      y += lineHeight * 0.5;
    }
  });

  return y;
}

/**
 * Export optimized CV as professionally formatted PDF
 */
export function exportOptimizedCV(
  cvContent: string,
  options: ExportOptions = {}
): void {
  const {
    format = 'professional',
    colorScheme = 'blue',
    qaRole = null,
    qaFocused = false,
  } = options;

  const colors = COLOR_SCHEMES[colorScheme];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Parse CV content
  const sections = parseCVContent(cvContent);

  // Professional Template
  if (format === 'professional') {
    // Header with colored bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Name
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(sections.name || 'Your Name', margin, 22);

    // Title
    if (sections.title) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(sections.title, margin, 31);
    }

    // Contact Info
    if (sections.contact) {
      doc.setFontSize(10);
      doc.text(sections.contact, margin, 39);
    }

    y = 55;

    // Professional Summary
    if (sections.summary) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, sections.summary, margin, y, contentWidth, 6);
      y += 10;
    }

    // QA Role Highlight (Phase 5)
    if (qaFocused && qaRole) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`TARGET ROLE: ${qaRole.title.toUpperCase()}`, margin, y);
      y += 6;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(
        doc,
        `${qaRole.description} | Experience: ${qaRole.yearsExperience.min}-${qaRole.yearsExperience.max} years`,
        margin,
        y,
        contentWidth,
        5.5
      );
      y += 8;
    }

    // Experience
    if (sections.experience) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL EXPERIENCE', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, sections.experience, margin, y, contentWidth, 6);
      y += 10;
    }

    // Testing Frameworks & Tools (QA Enhancement - Phase 5)
    if (qaFocused && (sections.testingFrameworks || qaRole?.technicalTools)) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TESTING FRAMEWORKS & TOOLS', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      if (sections.testingFrameworks) {
        y = addWrappedText(doc, sections.testingFrameworks, margin, y, contentWidth, 6);
      } else if (qaRole?.technicalTools) {
        const toolsList = qaRole.technicalTools.join(', ');
        y = addWrappedText(doc, `• ${toolsList}`, margin, y, contentWidth, 6);
      }
      y += 10;
    }

    // Skills (renamed to Technical Skills)
    if (sections.skills) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNICAL SKILLS', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, sections.skills, margin, y, contentWidth, 6);
      y += 10;
    }

    // QA Certifications (Phase 5)
    if (qaFocused && (sections.certifications || qaRole?.certifications)) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('QA CERTIFICATIONS', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      if (sections.certifications) {
        y = addWrappedText(doc, sections.certifications, margin, y, contentWidth, 6);
      } else if (qaRole?.certifications) {
        const certsList = qaRole.certifications.map((c) => `• ${c}`).join('\n');
        y = addWrappedText(doc, certsList, margin, y, contentWidth, 6);
      }
      y += 10;
    }

    // Test Metrics (QA Enhancement - Phase 5)
    if (qaFocused && sections.testMetrics) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TEST METRICS & ACHIEVEMENTS', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, sections.testMetrics, margin, y, contentWidth, 6);
      y += 10;
    }

    // Education
    if (sections.education) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, y);
      y += 7;

      doc.setTextColor(30, 41, 59); // Text-slate
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, sections.education, margin, y, contentWidth, 6);
    }

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate gray
    doc.text(
      'Generated by QAi Talks CV Review Tool | qai-talks.com',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const roleTag = qaFocused && qaRole ? `_${qaRole.title.replace(/\s+/g, '_')}` : '';
  doc.save(`CV_Optimized_${timestamp}${roleTag}.pdf`);
}

/**
 * Export cover letter as PDF
 */
export function exportCoverLetter(
  coverLetterContent: string,
  colorScheme: 'blue' | 'purple' | 'green' | 'gray' = 'blue'
): void {
  const colors = COLOR_SCHEMES[colorScheme];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 15, 'F');

  y = 30;

  // Cover Letter Content
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Text-slate
  doc.setFont('helvetica', 'normal');

  const lines = doc.splitTextToSize(coverLetterContent, contentWidth);
  lines.forEach((line: string) => {
    if (y + 7 > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
    }
    doc.text(line, margin, y);
    y += 6.5; // Better line spacing
  });

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate gray
  doc.text(
    'Generated by QAi Talks CV Review Tool | qai-talks.com',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Cover_Letter_${timestamp}.pdf`);
}
