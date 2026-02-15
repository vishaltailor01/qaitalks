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
  sixSecondTest: string; // New: Six-Second Recruiter Test analysis
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

/**
 * Interview question structure from knowledge pool
 */
export interface InterviewQuestion {
  focus?: string;
  competency?: string;
  question: string;
  answer_outline?: string;
  star_guide?: string;
}

/**
 * Interview preparation data structure
 */
export interface InterviewPrep {
  technical: InterviewQuestion[];
  behavioural: InterviewQuestion[];
}

/**
 * Job description data structure
 */
export interface JobDescription {
  [key: string]: unknown;
}

