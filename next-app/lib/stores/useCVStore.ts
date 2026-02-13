// CV Review state management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CVReviewResult {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string;
  coverLetter: string;
  matchedKeywords?: string[];
  provider: 'gemini' | 'huggingface';
  generationTimeMs: number;
  cached?: boolean;
  contentHash?: string;
  cachedAt?: number;
}

interface CVState {
  // Form inputs
  resume: string;
  jobDescription: string;
  targetRole: string;
  industry: string;
  
  // Results
  result: CVReviewResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Progress tracking
  progress: number;
  progressMessage: string;
  
  // Actions
  setResume: (resume: string) => void;
  setJobDescription: (jobDescription: string) => void;
  setTargetRole: (role: string) => void;
  setIndustry: (industry: string) => void;
  setResult: (result: CVReviewResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setProgressMessage: (message: string) => void;
  reset: () => void;
}

const initialState = {
  resume: '',
  jobDescription: '',
  targetRole: 'qa_engineer',
  industry: 'Technology',
  result: null,
  isLoading: false,
  error: null,
  progress: 0,
  progressMessage: '',
};

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setResume: (resume) => set({ resume }),
      setJobDescription: (jobDescription) => set({ jobDescription }),
      setTargetRole: (targetRole) => set({ targetRole }),
      setIndustry: (industry) => set({ industry }),
      setResult: (result) => set({ result }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setProgress: (progress) => set({ progress }),
      setProgressMessage: (progressMessage) => set({ progressMessage }),
      reset: () => set(initialState),
    }),
    {
      name: 'cv-review-storage', // localStorage key
      partialize: (state) => ({
        // Only persist form inputs, not results
        resume: state.resume,
        jobDescription: state.jobDescription,
        targetRole: state.targetRole,
        industry: state.industry,
      }),
    }
  )
);
