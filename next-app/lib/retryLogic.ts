// Smart Retry Logic with Exponential Backoff (Phase 2.5)

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a promise with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('fetch failed')
    ) {
      return true;
    }

    // Rate limiting (429)
    if (message.includes('rate limit') || message.includes('429')) {
      return true;
    }

    // Server errors (5xx)
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return true;
    }

    // API quota errors
    if (message.includes('quota') || message.includes('capacity')) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if we should fallback to alternative provider
 */
export function shouldFallbackToAlternative(error: unknown, attempt: number): boolean {
  if (attempt >= 2) {
    // After 2 failed attempts, consider fallback
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Immediate fallback for quota/capacity issues
    if (message.includes('quota') || message.includes('capacity') || message.includes('overloaded')) {
      return true;
    }

    // Immediate fallback for authentication issues
    if (message.includes('auth') || message.includes('api key') || message.includes('unauthorized')) {
      return true;
    }
  }

  return false;
}

/**
 * Extract retry-after value from error message
 */
export function extractRetryAfter(error: unknown): number | null {
  if (error instanceof Error) {
    const match = error.message.match(/retry after (\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

/**
 * Log retry attempt
 */
export function logRetryAttempt(
  attempt: number,
  maxAttempts: number,
  error: Error,
  provider: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[Retry ${attempt}/${maxAttempts}] ${provider} failed:`,
      error.message
    );
  }
}
