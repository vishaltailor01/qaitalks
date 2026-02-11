// Input/output sanitization utilities for CV Review Tool
// Prevents XSS attacks and prompt injection

/**
 * Sanitize user input to prevent prompt injection attacks
 * Removes/escapes patterns commonly used in prompt injection
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape common prompt injection patterns
  const dangerousPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /ignore\s+all\s+previous/gi,
    /disregard\s+previous/gi,
    /forget\s+previous/gi,
    /new\s+instructions:/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove excessive newlines (potential prompt breaking)
  sanitized = sanitized.replace(/\n{5,}/g, '\n\n\n\n');

  // Limit length to prevent token exhaustion
  const MAX_INPUT_LENGTH = 10000; // ~2500 tokens
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }

  return sanitized.trim();
}

/**
 * Validate input meets minimum requirements
 */
export function validateInput(text: string, minLength: number, fieldName: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const sanitized = sanitizeInput(text);
  
  if (sanitized.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  // Check if sanitization removed too much content
  const removalRatio = (text.length - sanitized.length) / text.length;
  if (removalRatio > 0.5) {
    return {
      valid: false,
      error: `${fieldName} contains suspicious patterns. Please remove any system commands or special instructions.`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize AI output to prevent XSS attacks
 * Escapes HTML and removes potentially dangerous content
 */
export function sanitizeOutput(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (except for images which we don't have)
  sanitized = sanitized.replace(/data:[^,]*,/gi, '');

  // Escape HTML special characters (but preserve newlines and basic formatting)
  // We keep the output as text, not HTML, so this is a safety measure
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * Comprehensive sanitization for CV review request
 */
export interface CVReviewInput {
  resume: string;
  jobDescription: string;
}

export function sanitizeCVReviewInput(input: CVReviewInput): {
  sanitized?: CVReviewInput;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate resume
  const resumeValidation = validateInput(input.resume, 100, 'Resume');
  if (!resumeValidation.valid) {
    errors.push(resumeValidation.error!);
  }

  // Validate job description
  const jobDescValidation = validateInput(input.jobDescription, 30, 'Job description');
  if (!jobDescValidation.valid) {
    errors.push(jobDescValidation.error!);
  }

  if (errors.length > 0) {
    return { errors };
  }

  // Sanitize both inputs
  return {
    sanitized: {
      resume: sanitizeInput(input.resume),
      jobDescription: sanitizeInput(input.jobDescription),
    },
  };
}

/**
 * Detect potential PII (Personally Identifiable Information)
 * Returns warnings but doesn't block - user privacy is their choice
 */
export function detectPII(text: string): string[] {
  const warnings: string[] = [];

  // Email pattern
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
    warnings.push('Email address detected');
  }

  // Phone pattern (various formats)
  if (/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text)) {
    warnings.push('Phone number detected');
  }

  // SSN pattern (US)
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
    warnings.push('Potential SSN detected');
  }

  // Physical address pattern (basic)
  if (/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct)\b/i.test(text)) {
    warnings.push('Physical address detected');
  }

  return warnings;
}
