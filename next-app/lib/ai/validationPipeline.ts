// --- Opinionated Formatting Enforcement Validator ---
export interface OpinionatedFormattingResult {
  compliant: boolean;
  errors: string[];
  warnings: string[];
}

export function opinionatedFormattingValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { opinionatedFormatting?: OpinionatedFormattingResult } {
  const cv = res.optimizedCV || '';
  const errors: string[] = [];
  const warnings: string[] = [];
  // Section order and presence
  const required = ['Contact', 'Summary', 'Skills', 'Experience', 'Education'];
  const lines = cv.split(/\n|\r/);
  const found: string[] = [];
  for (const line of lines) {
    for (const h of required) {
      if (line.trim().toLowerCase().startsWith(h.toLowerCase())) {
        found.push(h);
      }
    }
  }
  if (!required.every(h => found.includes(h))) {
    errors.push('Missing one or more required sections (Contact, Summary, Skills, Experience, Education)');
  }
  // Order
  let lastIdx = -1;
  for (const h of required) {
    const idx = found.indexOf(h);
    if (idx === -1 || idx < lastIdx) {
      errors.push('Section order is incorrect');
      break;
    }
    lastIdx = idx;
  }
  // Single-column layout
  if (/table|column|\|\s*\|/i.test(cv)) {
    errors.push('Tables or columns detected (must be single-column layout)');
  }
  // No graphics/images
  if (/image|graphic|photo|diagram|chart|\.(jpg|png|svg|gif)/i.test(cv)) {
    errors.push('Graphics/images detected (not allowed)');
  }
  // Standard fonts
  if (!/Arial|Calibri|Times New Roman/i.test(cv)) {
    warnings.push('Non-standard font detected (should use Arial, Calibri, or Times New Roman)');
  }
  // Banned phrases/fluff
  const banned = [
    'delve', 'landscape', 'tapestry', 'symphony', 'game-changer', 'leverage', 'spearhead', 'paramount', 'underscores',
    'in today\'s fast-paced world', 'unlock your potential', 'robust', 'dynamic', 'passionate',
    'I am writing to', 'I am excited to', 'I am passionate about',
    'demonstrates a strong ability', 'proven track record', 'results-driven', 'synergy', 'cutting-edge',
    'seasoned professional', 'forward-thinking', 'mission-critical', 'paradigm shift', 'best-in-class',
  ];
  const foundBanned = banned.filter(p => new RegExp(p, 'i').test(cv));
  if (foundBanned.length > 0) {
    errors.push('Banned phrases detected: ' + foundBanned.join(', '));
  }
  // Page length (heuristic: 1 page ~700 words, 2 pages ~1400 words)
  const wordCount = cv.split(/\s+/).length;
  if (req.resume) {
    const yearsExpMatch = req.resume.match(/(\d+)\+? years?/i);
    const yearsExp = yearsExpMatch ? parseInt(yearsExpMatch[1], 10) : undefined;
    if (yearsExp !== undefined) {
      if (yearsExp < 5 && wordCount > 700) {
        errors.push('CV exceeds 1 page for <5 years experience');
      } else if (yearsExp >= 5 && wordCount > 1400) {
        errors.push('CV exceeds 2 pages for 5+ years experience');
      }
    }
  }
  // Concise/professional language (warn if avg sentence > 30 words)
  const sentences = cv.split(/[.!?]/);
  const avgLen = sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / (sentences.length || 1);
  if (avgLen > 30) warnings.push('Sentences are too long; revise for conciseness');
  return {
    opinionatedFormatting: {
      compliant: errors.length === 0,
      errors,
      warnings,
    },
  };
}
// --- AI-Generated Text Detection Validator ---
export interface AIGeneratedTextDetectionResult {
  aiScore: number; // 0-1, higher means more likely AI-generated
  flaggedPhrases: string[];
  warnings: string[];
}

export function aiGeneratedTextDetectionValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { aiGeneratedTextDetection?: AIGeneratedTextDetectionResult } {
  const cv = res.optimizedCV || '';
  // List of banned/AI-sounding phrases (expand as needed)
  const banned = [
    'delve', 'landscape', 'tapestry', 'symphony', 'game-changer', 'leverage', 'spearhead', 'paramount', 'underscores',
    'in today\'s fast-paced world', 'unlock your potential', 'robust', 'dynamic', 'passionate',
    'I am writing to', 'I am excited to', 'I am passionate about',
    'demonstrates a strong ability', 'proven track record', 'results-driven', 'synergy', 'cutting-edge',
    'seasoned professional', 'forward-thinking', 'mission-critical', 'paradigm shift', 'best-in-class',
  ];
  const flaggedPhrases = banned.filter(p => new RegExp(p, 'i').test(cv));
  // Heuristic: high ratio of long sentences, excessive use of certain words, or too many banned phrases
  const sentences = cv.split(/[.!?]/);
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 25);
  const aiScore = Math.min(1, (flaggedPhrases.length * 0.2) + (longSentences.length / (sentences.length || 1)));
  const warnings = [];
  if (aiScore > 0.5) warnings.push('CV contains language patterns typical of AI-generated text. Consider revising for a more personal tone.');
  if (flaggedPhrases.length > 0) warnings.push('Flagged phrases: ' + flaggedPhrases.join(', '));
  return {
    aiGeneratedTextDetection: {
      aiScore,
      flaggedPhrases,
      warnings,
    },
  };
}
// --- TF-IDF Keyword Matching Validator ---
import natural from 'natural';

export interface KeywordMatchResult {
  topKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordDensity: number; // 0-1
}

export function tfidfKeywordMatchValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { keywordMatch?: KeywordMatchResult } {
  const jd = req.jobDescription || '';
  const cv = res.optimizedCV || '';
  // Tokenize and compute TF-IDF for job description
  const tokenizer = new natural.WordTokenizer();
  const jdTokens = tokenizer.tokenize(jd.toLowerCase());
  const cvTokens = tokenizer.tokenize(cv.toLowerCase());
  // Remove stopwords and short tokens
  const stopwords = new Set(natural.stopwords);
  const filter = (w: string) => w.length > 2 && !stopwords.has(w);
  const jdFiltered = jdTokens.filter(filter);
  // Count frequencies
  const freq: Record<string, number> = {};
  jdFiltered.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  // Top 20 keywords by frequency
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
  // Check which are present in CV
  const cvSet = new Set(cvTokens);
  const matchedKeywords = topKeywords.filter(w => cvSet.has(w));
  const missingKeywords = topKeywords.filter(w => !cvSet.has(w));
  const keywordDensity = matchedKeywords.length / (topKeywords.length || 1);
  return {
    keywordMatch: {
      topKeywords,
      matchedKeywords,
      missingKeywords,
      keywordDensity,
    },
  };
}

// --- Structure/Formatting Validator ---
export interface StructureValidationResult {
  correctOrder: boolean;
  allHeadersPresent: boolean;
  headerIssues: string[];
  sectionOrder: string[];
}

export function structureValidationValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { structureValidation?: StructureValidationResult } {
  const cv = res.optimizedCV || '';
  // Required order
  const required = [
    'Contact',
    'Summary',
    'Skills',
    'Experience',
    'Education',
  ];
  // Find headers in CV (simple: look for lines starting with header)
  const lines = cv.split(/\n|\r/);
  const found: string[] = [];
  for (const line of lines) {
    for (const h of required) {
      if (line.trim().toLowerCase().startsWith(h.toLowerCase())) {
        found.push(h);
      }
    }
  }
  // Check order
  let lastIdx = -1;
  let correctOrder = true;
  for (const h of required) {
    const idx = found.indexOf(h);
    if (idx === -1 || idx < lastIdx) {
      correctOrder = false;
      break;
    }
    lastIdx = idx;
  }
  // All headers present
  const allHeadersPresent = required.every(h => found.includes(h));
  const headerIssues = [];
  if (!allHeadersPresent) headerIssues.push('Missing one or more required headers');
  if (!correctOrder) headerIssues.push('Section order is incorrect');
  return {
    structureValidation: {
      correctOrder,
      allHeadersPresent,
      headerIssues,
      sectionOrder: found,
    },
  };
}

// --- Semantic Similarity Validator ---
export interface SemanticSimilarityResult {
  similarityScore: number; // 0-1
  warning?: string;
}

// Simple Jaccard similarity for now (can upgrade to embedding-based)
export function semanticSimilarityValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { semanticSimilarity?: SemanticSimilarityResult } {
  const orig = req.resume || '';
  const cv = res.optimizedCV || '';
  const setA = new Set(orig.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const setB = new Set(cv.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  const similarityScore = union.size ? intersection.size / union.size : 0;
  const warning = similarityScore < 0.5 ? 'Optimized CV is semantically very different from original' : undefined;
  return {
    semanticSimilarity: {
      similarityScore,
      warning,
    },
  };
}
// Modular Validation Pipeline for CV Review Tool
// Allows chaining of multiple validators (hallucination, ATS, keyword, structure, etc.)

import { CVGenerationRequest, CVGenerationResponse } from './types';
import { HallucinationIssue, detectHallucinations } from './validation';

// ATS Simulation Result Type
export interface ATSSimulationResult {
  singleColumn: boolean;
  hasStandardSections: boolean;
  hasNoTables: boolean;
  hasNoGraphics: boolean;
  usesStandardFonts: boolean;
  usesBullets: boolean;
  lengthCompliant: boolean;
  issues: string[];
}

/**
 * ATS Simulation Validator
 * Checks for common ATS compliance issues in the optimized CV section
 */
export function atsSimulationValidator(
  req: CVGenerationRequest,
  res: CVGenerationResponse
): { atsSimulation?: ATSSimulationResult } {
  const cv = res.optimizedCV || '';
  const issues: string[] = [];

  // Check for tables/columns (simple: look for 'table', 'column', or excessive whitespace)
  const hasNoTables = !/table|column|\|\s*\|/i.test(cv);
  if (!hasNoTables) issues.push('Tables or columns detected (not ATS-friendly)');

  // Check for graphics/images
  const hasNoGraphics = !/image|graphic|photo|diagram|chart|\.(jpg|png|svg|gif)/i.test(cv);
  if (!hasNoGraphics) issues.push('Graphics/images detected (not ATS-friendly)');

  // Check for standard fonts (mention of Arial, Calibri, Times New Roman)
  const usesStandardFonts = /Arial|Calibri|Times New Roman/i.test(cv);
  if (!usesStandardFonts) issues.push('Non-standard font detected (should use Arial, Calibri, or Times New Roman)');

  // Check for bullet points
  const usesBullets = /\u2022|\* |- /.test(cv);
  if (!usesBullets) issues.push('No bullet points detected (ATS prefers clear bullets)');

  // Check for standard sections
  const hasStandardSections =
    /Contact/i.test(cv) &&
    /Summary/i.test(cv) &&
    /Skills/i.test(cv) &&
    /Experience/i.test(cv) &&
    /Education/i.test(cv);
  if (!hasStandardSections) issues.push('Missing one or more standard sections (Contact, Summary, Skills, Experience, Education)');

  // Check for single-column layout (no evidence of columns/tables)
  const singleColumn = hasNoTables;
  if (!singleColumn) issues.push('Not single-column layout');

  // Length compliance (1 page for <5 years, 2 pages for 5+ years)
  // Heuristic: count lines or words
  const wordCount = cv.split(/\s+/).length;
  let lengthCompliant = true;
  if (req.resume) {
    const yearsExpMatch = req.resume.match(/(\d+)\+? years?/i);
    const yearsExp = yearsExpMatch ? parseInt(yearsExpMatch[1], 10) : undefined;
    if (yearsExp !== undefined) {
      if (yearsExp < 5 && wordCount > 700) {
        lengthCompliant = false;
        issues.push('CV exceeds 1 page for <5 years experience');
      } else if (yearsExp >= 5 && wordCount > 1400) {
        lengthCompliant = false;
        issues.push('CV exceeds 2 pages for 5+ years experience');
      }
    }
  }

  return {
    atsSimulation: {
      singleColumn,
      hasStandardSections,
      hasNoTables,
      hasNoGraphics,
      usesStandardFonts,
      usesBullets,
      lengthCompliant,
      issues,
    },
  };
}

export interface ValidationResult {
  hallucinationIssues?: HallucinationIssue[];
  // Add more result types as new validators are added
  [key: string]: unknown;
}

export type Validator = (
  req: CVGenerationRequest,
  res: CVGenerationResponse
) => Partial<ValidationResult>;

/**
 * Runs all validators in sequence and merges their results
 */
export function runValidationPipeline(
  req: CVGenerationRequest,
  res: CVGenerationResponse,
  validators: Validator[]
): ValidationResult {
  return validators.reduce((acc, validator) => {
    return { ...acc, ...validator(req, res) };
  }, {});
}

// Default pipeline (can be extended)
export const defaultValidators: Validator[] = [
  (req, res) => ({ hallucinationIssues: detectHallucinations(req, res) }),
  atsSimulationValidator,
  tfidfKeywordMatchValidator,
  structureValidationValidator,
  semanticSimilarityValidator,
  aiGeneratedTextDetectionValidator,
  opinionatedFormattingValidator,
];
