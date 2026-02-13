// localStorage utilities for CV Review history
// Saves last 5 reviews for user convenience

interface CVReviewResult {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string;
  coverLetter: string;
  provider: 'gemini' | 'huggingface';
  generationTimeMs: number;
}

export interface CVReviewHistoryItem {
  id: string;
  timestamp: number;
  result: CVReviewResult;
  resumePreview: string; // First 100 chars of resume
  jobPreview: string; // First 50 chars of job description
}

const STORAGE_KEY = 'qaitalks_cv_review_history';
const MAX_HISTORY_ITEMS = 5;

/**
 * Save CV review to localStorage
 */
export function saveToHistory(
  result: CVReviewResult,
  resumeText: string,
  jobDescriptionText: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    // Create history item
    const historyItem: CVReviewHistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      result,
      resumePreview: resumeText.substring(0, 100).trim(),
      jobPreview: jobDescriptionText.substring(0, 50).trim(),
    };

    // Get existing history
    const history = getHistory();

    // Add new item to beginning
    history.unshift(historyItem);

    // Keep only last MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch {
    // Silently fail - not critical functionality
  }
}

/**
 * Get all history items from localStorage
 */
export function getHistory(): CVReviewHistoryItem[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const history = JSON.parse(stored) as CVReviewHistoryItem[];
    
    // Validate structure
    if (!Array.isArray(history)) {
      return [];
    }

    return history;
  } catch {
    // Silently fail - localStorage might be unavailable
    return [];
  }
}

/**
 * Get a specific history item by ID
 */
export function getHistoryItem(id: string): CVReviewHistoryItem | null {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Silently fail
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Format timestamp for display
 */
export function formatHistoryDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  itemCount: number;
  canSaveMore: boolean;
} {
  const history = getHistory();
  return {
    itemCount: history.length,
    canSaveMore: history.length < MAX_HISTORY_ITEMS,
  };
}

// ============================================
// DRAFT AUTO-SAVE FUNCTIONALITY (Phase 1)
// ============================================

const DRAFT_STORAGE_KEY = 'qaitalks_cv_review_draft';

export interface CVReviewDraft {
  resume: string;
  jobDescription: string;
  timestamp: number;
}

/**
 * Save form input as draft to localStorage
 */
export function saveDraft(resume: string, jobDescription: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const draft: CVReviewDraft = {
      resume,
      jobDescription,
      timestamp: Date.now(),
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): CVReviewDraft | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const draft = JSON.parse(stored) as CVReviewDraft;
    
    // Validate structure
    if (!draft.resume || !draft.jobDescription || !draft.timestamp) {
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
  return loadDraft() !== null;
}
