/**
 * Monitoring and Logging for CV Review Tool
 * 
 * Tracks API usage, performance metrics, errors, and rate limit events.
 * Logs are structured for easy parsing and analysis.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'api' | 'ai_provider' | 'rate_limit' | 'security' | 'performance';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface APIMetrics {
  requestId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  aiProvider?: string;
  success: boolean;
  userId?: string;
  ip?: string;
  userAgent?: string;
  error?: string;
}

export interface RateLimitMetrics {
  ip: string;
  endpoint: string;
  requestCount: number;
  limitExceeded: boolean;
  timestamp: string;
}

export interface AIProviderMetrics {
  provider: 'gemini' | 'huggingface';
  success: boolean;
  generationTimeMs: number;
  promptLength: number;
  responseLength: number;
  error?: string;
  timestamp: string;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private isDevelopment: boolean;
  private enableConsole: boolean;

  constructor(options?: { enableConsole?: boolean }) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enableConsole = options?.enableConsole ?? this.isDevelopment;
  }

  /**
   * Log a message with structured data
   */
  log(level: LogLevel, category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
    };

    // Log to console in development or if enabled
    if (this.enableConsole) {
      const color = this.getLogColor(level);
      console.log(
        `%c[${entry.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`,
        `color: ${color}`,
        metadata || ''
      );
    }

    // In production, you would send logs to a service like:
    // - CloudWatch Logs
    // - Datadog
    // - New Relic
    // - Sentry
    // - Custom logging endpoint
    if (!this.isDevelopment) {
      this.sendToLogService(entry);
    }
  }

  debug(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', category, message, metadata);
  }

  info(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('info', category, message, metadata);
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', category, message, metadata);
  }

  error(category: LogCategory, message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      metadata,
    };

    if (this.enableConsole) {
      console.error(`[${entry.timestamp}] [ERROR] [${category}] ${message}`, error, metadata || '');
    }

    if (!this.isDevelopment) {
      this.sendToLogService(entry);
    }
  }

  /**
   * Track API request metrics
   */
  trackAPIRequest(metrics: APIMetrics): void {
    this.info('api', `API Request: ${metrics.method} ${metrics.endpoint}`, {
      requestId: metrics.requestId,
      statusCode: metrics.statusCode,
      responseTimeMs: metrics.responseTimeMs,
      aiProvider: metrics.aiProvider,
      success: metrics.success,
      ip: this.maskIP(metrics.ip),
      error: metrics.error,
    });

    // Track performance issues
    if (metrics.responseTimeMs > 60000) {
      this.warn('performance', 'Slow API response', {
        requestId: metrics.requestId,
        responseTimeMs: metrics.responseTimeMs,
      });
    }

    // Track errors
    if (!metrics.success) {
      this.error('api', `API request failed: ${metrics.error}`, undefined, {
        requestId: metrics.requestId,
        endpoint: metrics.endpoint,
        statusCode: metrics.statusCode,
      });
    }
  }

  /**
   * Track rate limit events
   */
  trackRateLimit(metrics: RateLimitMetrics): void {
    if (metrics.limitExceeded) {
      this.warn('rate_limit', 'Rate limit exceeded', {
        ip: this.maskIP(metrics.ip),
        endpoint: metrics.endpoint,
        requestCount: metrics.requestCount,
      });
    }
  }

  /**
   * Track AI provider usage and performance
   */
  trackAIProvider(metrics: AIProviderMetrics): void {
    this.info('ai_provider', `AI generation: ${metrics.provider}`, {
      provider: metrics.provider,
      success: metrics.success,
      generationTimeMs: metrics.generationTimeMs,
      promptLength: metrics.promptLength,
      responseLength: metrics.responseLength,
      error: metrics.error,
    });

    // Track AI provider failures
    if (!metrics.success) {
      this.error('ai_provider', `AI provider failed: ${metrics.provider}`, undefined, {
        provider: metrics.provider,
        error: metrics.error,
      });
    }
  }

  /**
   * Track security events (sanitization detections, suspicious patterns)
   */
  trackSecurityEvent(eventType: string, details: Record<string, unknown>): void {
    this.warn('security', `Security event: ${eventType}`, details);
  }

  /**
   * Mask IP address for privacy (keep first 3 octets only)
   */
  private maskIP(ip?: string): string {
    if (!ip) return 'unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return ip.substring(0, Math.min(ip.length, 12)) + '...';
  }

  /**
   * Get console color based on log level
   */
  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '#888';
      case 'info': return '#0088ff';
      case 'warn': return '#ff8800';
      case 'error': return '#ff0000';
    }
  }

  /**
   * Send logs to external service (placeholder for production)
   */
  private sendToLogService(entry: LogEntry): void {
    // TODO: Implement actual log service integration
    // Examples:
    // - CloudWatch Logs: await cloudwatch.putLogEvents(...)
    // - Datadog: await datadog.log(...)
    // - Custom endpoint: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    
    // For now, just stub
    if (process.env.LOG_ENDPOINT) {
      fetch(process.env.LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Fail silently - don't let logging break the app
      });
    }
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate percentile from array of numbers
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * In-memory metrics store (for simple analytics)
 * In production, use a proper metrics service
 */
class MetricsStore {
  private apiResponseTimes: number[] = [];
  private apiRequestCount = 0;
  private apiErrorCount = 0;
  private rateLimitHits = 0;
  private aiProviderUsage: Record<string, number> = {};

  addAPIMetrics(metrics: APIMetrics): void {
    this.apiRequestCount++;
    this.apiResponseTimes.push(metrics.responseTimeMs);
    
    if (!metrics.success) {
      this.apiErrorCount++;
    }
    
    if (metrics.aiProvider) {
      this.aiProviderUsage[metrics.aiProvider] = (this.aiProviderUsage[metrics.aiProvider] || 0) + 1;
    }

    // Keep only last 1000 response times to avoid memory issues
    if (this.apiResponseTimes.length > 1000) {
      this.apiResponseTimes.shift();
    }
  }

  incrementRateLimitHits(): void {
    this.rateLimitHits++;
  }

  getStats() {
    return {
      totalRequests: this.apiRequestCount,
      totalErrors: this.apiErrorCount,
      errorRate: this.apiRequestCount > 0 ? (this.apiErrorCount / this.apiRequestCount) * 100 : 0,
      rateLimitHits: this.rateLimitHits,
      avgResponseTimeMs: this.apiResponseTimes.length > 0 
        ? this.apiResponseTimes.reduce((a, b) => a + b, 0) / this.apiResponseTimes.length 
        : 0,
      p50ResponseTimeMs: calculatePercentile(this.apiResponseTimes, 50),
      p95ResponseTimeMs: calculatePercentile(this.apiResponseTimes, 95),
      p99ResponseTimeMs: calculatePercentile(this.apiResponseTimes, 99),
      aiProviderUsage: this.aiProviderUsage,
    };
  }

  reset(): void {
    this.apiResponseTimes = [];
    this.apiRequestCount = 0;
    this.apiErrorCount = 0;
    this.rateLimitHits = 0;
    this.aiProviderUsage = {};
  }
}

export const metricsStore = new MetricsStore();
