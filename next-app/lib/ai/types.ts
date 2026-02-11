// Types for CV Review Tool AI service

export interface CVGenerationRequest {
  resume: string;
  jobDescription: string;
}

export interface CVGenerationResponse {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  provider: 'gemini' | 'huggingface';
  generationTimeMs: number;
}

export interface CVGenerationError {
  error: string;
  code: string;
  retryable: boolean;
  retryAfter?: number;
}
