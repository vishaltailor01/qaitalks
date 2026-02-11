# CV Review Tool - Monitoring & Logging

Comprehensive monitoring and logging system for the CV Review & Interview Preparation Tool.

## Overview

The monitoring system tracks:
- **API requests** - Response times, success rates, errors
- **AI provider performance** - Generation times, success rates per provider
- **Rate limiting** - Rate limit hits and patterns
- **Security events** - Input validation failures, suspicious patterns
- **System health** - Memory usage, uptime

## Architecture

```
┌─────────────────┐
│   API Request   │
└────────┬────────┘
         │
         ├─── Generate Request ID
         ├─── Log incoming request
         ├─── Track rate limits
         ├─── Monitor AI generation
         ├─── Track errors
         └─── Calculate metrics
```

## Components

### 1. Logger (`lib/monitoring.ts`)

Structured logging with levels: `debug`, `info`, `warn`, `error`

**Usage:**
```typescript
import { logger } from '@/lib/monitoring';

// Simple logging
logger.info('api', 'User action completed', { userId: '123' });
logger.error('api', 'Database error', error, { query: 'SELECT *' });

// Track API requests
logger.trackAPIRequest({
  requestId: 'req_123',
  endpoint: '/api/cv-review/generate',
  method: 'POST',
  statusCode: 200,
  responseTimeMs: 2500,
  aiProvider: 'gemini',
  success: true,
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// Track rate limit events
logger.trackRateLimit({
  ip: '192.168.1.1',
  endpoint: '/api/cv-review/generate',
  requestCount: 11,
  limitExceeded: true,
  timestamp: new Date().toISOString(),
});

// Track AI provider performance
logger.trackAIProvider({
  provider: 'gemini',
  success: true,
  generationTimeMs: 45000,
  promptLength: 2000,
  responseLength: 5000,
  timestamp: new Date().toISOString(),
});

// Track security events
logger.trackSecurityEvent('PROMPT_INJECTION_DETECTED', {
  pattern: 'Ignore previous instructions',
  ip: '192.168.1.1',
});
```

### 2. Metrics Store (`lib/monitoring.ts`)

In-memory metrics aggregation for development and testing.

**Tracked Metrics:**
- Total API requests
- Error count and rate
- Response time percentiles (P50, P95, P99)
- Rate limit hits
- AI provider usage distribution

**Usage:**
```typescript
import { metricsStore } from '@/lib/monitoring';

// Add metrics (done automatically in API route)
metricsStore.addAPIMetrics({...});
metricsStore.incrementRateLimitHits();

// Get current stats
const stats = metricsStore.getStats();
console.log(stats);
/*
{
  totalRequests: 150,
  totalErrors: 5,
  errorRate: 3.33,
  rateLimitHits: 8,
  avgResponseTimeMs: 35000,
  p50ResponseTimeMs: 32000,
  p95ResponseTimeMs: 58000,
  p99ResponseTimeMs: 62000,
  aiProviderUsage: { gemini: 135, huggingface: 15 }
}
*/

// Reset metrics (for testing)
metricsStore.reset();
```

### 3. Metrics API Endpoint

**GET /api/cv-review/metrics** (Development only)

Returns real-time metrics and system health.

```bash
curl http://localhost:3000/api/cv-review/metrics
```

Response:
```json
{
  "success": true,
  "data": {
    "totalRequests": 150,
    "totalErrors": 5,
    "errorRate": 3.33,
    "rateLimitHits": 8,
    "avgResponseTimeMs": 35000,
    "p50ResponseTimeMs": 32000,
    "p95ResponseTimeMs": 58000,
    "p99ResponseTimeMs": 62000,
    "aiProviderUsage": {
      "gemini": 135,
      "huggingface": 15
    },
    "timestamp": "2024-02-11T10:30:00.000Z",
    "uptime": 3600,
    "memoryUsage": {
      "rss": 50331648,
      "heapTotal": 16777216,
      "heapUsed": 10485760,
      "external": 1048576
    }
  }
}
```

**DELETE /api/cv-review/metrics** (Development only)

Reset all metrics:
```bash
curl -X DELETE http://localhost:3000/api/cv-review/metrics
```

## Request Tracking

Every API request is tracked with:

### Request ID
Unique identifier for each request:
```
req_1707649800000_x9k3m2p1q
```

Returned in `X-Request-Id` response header for correlation.

### Metrics Tracked

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Response Time | Total API response time | > 60s (slow) |
| Error Rate | % of failed requests | > 5% |
| Rate Limit Hits | # of rate-limited requests | - |
| AI Generation Time | Time for AI to generate | > 60s |
| P95 Response Time | 95th percentile latency | > 70s |

## Log Categories

| Category | Use Case | Example |
|----------|----------|---------|
| `api` | API requests, responses | Request received, completed |
| `ai_provider` | AI generation events | Gemini success, HF fallback |
| `rate_limit` | Rate limiting events | Rate limit exceeded |
| `security` | Security-related events | Input validation failed, prompt injection |
| `performance` | Performance issues | Slow response time |

## Production Integration

### CloudWatch Logs (AWS)

```typescript
// lib/monitoring.ts - Update sendToLogService()
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

private async sendToLogService(entry: LogEntry): Promise<void> {
  const client = new CloudWatchLogsClient({ region: 'us-east-1' });
  
  await client.send(new PutLogEventsCommand({
    logGroupName: '/qaitalk/cv-review',
    logStreamName: '2024-02-11',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify(entry),
    }],
  }));
}
```

### Datadog

```typescript
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN!,
  site: 'datadoghq.com',
  service: 'cv-review-api',
  env: 'production',
});

private async sendToLogService(entry: LogEntry): Promise<void> {
  datadogLogs.logger.log(entry.message, entry, entry.level);
}
```

### Sentry (Error Tracking)

```typescript
import * as Sentry from '@sentry/nextjs';

// In error() method
if (entry.level === 'error' && entry.error) {
  Sentry.captureException(new Error(entry.message), {
    extra: entry.metadata,
  });
}
```

## Alerts & Dashboards

### Recommended Alerts

1. **High Error Rate** - Alert when error rate > 5% over 5 minutes
2. **Slow Response Time** - Alert when P95 > 70s
3. **Rate Limit Spike** - Alert when rate limit hits > 50/hour
4. **AI Provider Failures** - Alert when AI errors > 10% over 10 minutes

### Dashboard Metrics

**API Health:**
- Request rate (requests/min)
- Error rate (%)
- P50, P95, P99 response times
- Success vs. error distribution

**AI Provider:**
- Provider usage distribution (Gemini vs. HuggingFace)
- Generation times by provider
- Failure rates by provider

**Rate Limiting:**
- Rate limit hits over time
- Top blocked IPs
- Rate limit effectiveness

**Security:**
- Input validation failures
- Suspicious pattern detections
- XSS attempt blocks

## Environment Variables

```bash
# Optional: External log service endpoint
LOG_ENDPOINT=https://logs.example.com/ingest

# Sentry DSN (for error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Datadog (for metrics)
DATADOG_CLIENT_TOKEN=pub...

# CloudWatch (AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

## Testing Monitoring

### 1. Generate Test Traffic

```bash
# Run load test
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/cv-review/generate \
    -H "Content-Type: application/json" \
    -d '{"resume":"...","jobDescription":"..."}' &
done
wait
```

### 2. Check Metrics

```bash
# View metrics
curl http://localhost:3000/api/cv-review/metrics | jq

# Expected output shows aggregated stats
```

### 3. Verify Logs

Check console for structured logs:
```
[2024-02-11T10:30:00.000Z] [INFO] [api] CV Review request received
[2024-02-11T10:30:45.123Z] [INFO] [ai_provider] AI generation: gemini
[2024-02-11T10:30:45.456Z] [INFO] [api] CV Review request completed successfully
```

### 4. Test Error Scenarios

```bash
# Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/cv-review/generate \
    -H "Content-Type: application/json" \
    -d '{"resume":"...","jobDescription":"..."}'
done

# Test invalid input
curl -X POST http://localhost:3000/api/cv-review/generate \
  -H "Content-Type: application/json" \
  -d '{"resume":"short","jobDescription":"x"}'
```

## Best Practices

1. **Never log PII** - IP addresses are masked automatically
2. **Include request IDs** - Critical for debugging multi-step requests
3. **Use appropriate log levels** - Don't spam with debug logs in production
4. **Monitor error rates** - Set up alerts for unexpected spikes
5. **Track percentiles** - P95/P99 more useful than averages
6. **Set retention policies** - Don't keep logs forever (GDPR compliance)

## Troubleshooting

### High Response Times

1. Check metrics endpoint for P95/P99 times
2. Review logs for slow AI provider calls
3. Check if rate limiting is affecting performance

### Missing Logs

1. Verify `LOG_ENDPOINT` is set (production)
2. Check console output (development)
3. Ensure logger is instantiated correctly

### Metrics Not Updating

1. Verify `metricsStore.addAPIMetrics()` is called
2. Check if metrics were reset accidentally
3. Restart Next.js dev server

---

**Documentation Last Updated:** February 11, 2024  
**Monitoring System Version:** 1.0.0
