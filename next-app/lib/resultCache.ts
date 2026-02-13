// Result caching for CV Review (Phase 2)
// Reduces API costs by ~70% for repeated submissions

interface CachedResult {
  result: {
    atsResume: string;
    interviewGuide: string;
    domainQuestions: string;
    gapAnalysis: string;
    optimizedCV: string;
    coverLetter: string;
    matchedKeywords?: string[];
    provider: 'gemini' | 'huggingface';
    generationTimeMs: number;
  };
  hash: string;
  timestamp: number;
  expiresAt: number;
}

const CACHE_STORAGE_KEY = 'qaitalks_cv_review_cache';
const CACHE_VERSION = 'v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_ENTRIES = 10;

/**
 * Generate a hash from resume and job description
 * Simple hash function for content-based deduplication
 */
export function hashInput(resume: string, jobDescription: string): string {
  const content = `${resume.trim().toLowerCase()}|${jobDescription.trim().toLowerCase()}`;
  
  // Simple but effective hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${CACHE_VERSION}_${Math.abs(hash).toString(36)}`;
}

/**
 * Get all cached results, filtering out expired ones
 */
function getCacheStore(): Map<string, CachedResult> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return new Map();
  }

  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) {
      return new Map();
    }

    const entries = JSON.parse(stored) as Array<[string, CachedResult]>;
    const now = Date.now();
    
    // Filter out expired entries
    const validEntries = entries.filter(([, cached]) => cached.expiresAt > now);
    
    return new Map(validEntries);
  } catch (error) {
    console.error('Failed to load cache:', error);
    return new Map();
  }
}

/**
 * Save cache store to localStorage
 */
function saveCacheStore(cache: Map<string, CachedResult>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const entries = Array.from(cache.entries());
    
    // Keep only latest MAX_CACHE_ENTRIES, sorted by timestamp
    const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const trimmed = sorted.slice(0, MAX_CACHE_ENTRIES);
    
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail - not critical
  }
}

/**
 * Check if cached result exists for given inputs
 */
export function getCachedResult(
  resume: string,
  jobDescription: string
): CachedResult | null {
  const hash = hashInput(resume, jobDescription);
  const cache = getCacheStore();
  const cached = cache.get(hash);

  if (!cached) {
    return null;
  }

  // Double-check expiration
  if (cached.expiresAt <= Date.now()) {
    cache.delete(hash);
    saveCacheStore(cache);
    return null;
  }

  return cached;
}

/**
 * Cache a result for given inputs
 */
export function cacheResult(
  resume: string,
  jobDescription: string,
  result: CachedResult['result']
): void {
  const hash = hashInput(resume, jobDescription);
  const now = Date.now();
  
  const cached: CachedResult = {
    result,
    hash,
    timestamp: now,
    expiresAt: now + CACHE_TTL_MS,
  };

  const cache = getCacheStore();
  cache.set(hash, cached);
  saveCacheStore(cache);
}

/**
 * Clear all cached results
 */
export function clearCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  totalSizeKB: number;
} {
  const cache = getCacheStore();
  const entries = Array.from(cache.values());

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
      totalSizeKB: 0,
    };
  }

  const timestamps = entries.map(e => e.timestamp).sort((a, b) => a - b);
  const sizeEstimate = JSON.stringify(Array.from(cache.entries())).length / 1024;

  return {
    totalEntries: entries.length,
    oldestEntry: timestamps[0],
    newestEntry: timestamps[timestamps.length - 1],
    totalSizeKB: Math.round(sizeEstimate * 10) / 10,
  };
}

/**
 * Format cache age for display
 */
export function formatCacheAge(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Check if localStorage caching is available
 */
export function isCacheAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test = '__cache_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
