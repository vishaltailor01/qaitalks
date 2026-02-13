// Types for CV Review Tool AI service

export type OptimizationMode = 'minimal' | 'balanced' | 'aggressive';

export interface CVGenerationRequest {
  resume: string;
  jobDescription: string;
  targetRole?: string;
  industry?: string;
  optimizationMode?: OptimizationMode; // minimal = preserve voice, balanced = moderate changes, aggressive = extensive rewrite
  userInstructions?: string; // Custom instructions from user (e.g., "Focus on Python skills")
}

export interface CVGenerationResponse {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string; // New: fully optimized CV with JD keywords
  coverLetter: string; // UK-formatted cover letter
  matchedKeywords?: string[];
  provider: 'gemini' | 'huggingface';
  generationTimeMs: number;

  /**
   * Section mapping for hallucination detection
   * Key: section name, Value: section text
   */
  sections?: { [section: string]: string };
}

export interface CVGenerationError {
  error: string;
  code: string;
  retryable: boolean;
  retryAfter?: number;
}
