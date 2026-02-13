// CV Review Output Versioning Utilities
// Enables versioned history, comparison, and restore

import { CVGenerationRequest, CVGenerationResponse } from './ai/types';

export interface CVReviewVersion {
  id: string; // UUID
  timestamp: number;
  request: CVGenerationRequest;
  response: CVGenerationResponse;
  meta: {
    optimizationMode?: string;
    jobHash: string;
    resumeHash: string;
    version: number;
  };
}

// Simple hash function for job/resume (can use SHA256 in production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Generate a new version entry
export function createCVReviewVersion(
  req: CVGenerationRequest,
  res: CVGenerationResponse,
  version: number = 1
): CVReviewVersion {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    request: req,
    response: res,
    meta: {
      optimizationMode: req.optimizationMode,
      jobHash: simpleHash(req.jobDescription),
      resumeHash: simpleHash(req.resume),
      version,
    },
  };
}

// Local storage management (browser)
const STORAGE_KEY = 'cvReviewVersions';

export function saveCVReviewVersion(version: CVReviewVersion) {
  const history = getCVReviewHistory();
  history.unshift(version);
  // Limit to 10 versions
  while (history.length > 10) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getCVReviewHistory(): CVReviewVersion[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CVReviewVersion[];
  } catch {
    return [];
  }
}

export function deleteCVReviewVersion(id: string) {
  const history = getCVReviewHistory().filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function restoreCVReviewVersion(id: string): CVReviewVersion | undefined {
  return getCVReviewHistory().find(v => v.id === id);
}
