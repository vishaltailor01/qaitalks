// Rate limiting utilities for CV Review Tool
// Uses Cloudflare KV for production, in-memory for development

import type { KVNamespace } from '@/types/cloudflare';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for local development (cleared on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 10, // Maximum requests per window
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  message: 'Rate limit exceeded. Please try again in 24 hours.',
};

/**
 * Check if IP address has exceeded rate limit
 * Supports both Cloudflare KV (production) and in-memory (development)
 * @param ip - Client IP address
 * @param kvNamespace - Optional Cloudflare KV namespace binding
 * @returns Object with allowed status and remaining requests
 */
export async function checkRateLimit(
  ip: string,
  kvNamespace?: KVNamespace
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}> {
  const now = Date.now();
  
  // Use KV if available (production), otherwise in-memory (development)
  if (kvNamespace) {
    return await checkRateLimitKV(ip, kvNamespace, now);
  } else {
    return checkRateLimitMemory(ip, now);
  }
}

/**
 * Cloudflare KV-based rate limiting (production)
 */
async function checkRateLimitKV(
  ip: string,
  kvNamespace: KVNamespace,
  now: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}> {
  const key = `ratelimit:${ip}`;
  const entryJson = await kvNamespace.get(key);
  const entry: RateLimitEntry | null = entryJson ? JSON.parse(entryJson) : null;

  // First request or expired window
  if (!entry || now >= entry.resetTime) {
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;
    const newEntry: RateLimitEntry = { count: 1, resetTime };
    
    // Store in KV with TTL (expires after window + 1 hour buffer)
    const ttlSeconds = Math.ceil((resetTime - now) / 1000) + 3600;
    await kvNamespace.put(key, JSON.stringify(newEntry), {
      expirationTtl: ttlSeconds,
    });
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime,
    };
  }

  // Within window, check if limit exceeded
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: RATE_LIMIT_CONFIG.message,
    };
  }

  // Increment count
  entry.count++;
  const ttlSeconds = Math.ceil((entry.resetTime - now) / 1000) + 3600;
  await kvNamespace.put(key, JSON.stringify(entry), {
    expirationTtl: ttlSeconds,
  });

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * In-memory rate limiting (development)
 */
function checkRateLimitMemory(
  ip: string,
  now: number
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
} {
  const entry = rateLimitStore.get(ip);

  // First request or expired window
  if (!entry || now >= entry.resetTime) {
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime,
    };
  }

  // Within window, check if limit exceeded
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: RATE_LIMIT_CONFIG.message,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 * Handles various proxy headers
 */
export function getClientIp(request: Request): string {
  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Try X-Forwarded-For
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if multiple
    return forwardedFor.split(',')[0].trim();
  }

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback to 'unknown' (should not happen in production)
  return 'unknown';
}

/**
 * Clean up expired rate limit entries (in-memory only)
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// Run cleanup every hour (in-memory only)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 60 * 60 * 1000);
}

/**
 * Get rate limit info for display
 */
export function getRateLimitInfo() {
  return {
    maxRequests: RATE_LIMIT_CONFIG.maxRequests,
    windowHours: RATE_LIMIT_CONFIG.windowMs / (60 * 60 * 1000),
  };
}
