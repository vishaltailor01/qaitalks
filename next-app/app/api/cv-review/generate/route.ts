import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';
import { runCVReviewLangGraph } from '../../../../lib/ai/langgraph-adapter';
import { env } from 'process';
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit';
import { sanitizeCVReviewInput, sanitizeOutput } from '../../../../lib/sanitize';
import { logger, metricsStore, generateRequestId } from '../../../../lib/monitoring';
import { hashInput } from '../../../../lib/resultCache';

  const startTime = Date.now();
  const requestId = generateRequestId();
  const clientIp = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Log incoming request
  logger.info('api', `CV Review request received`, {
    requestId,
    ip: clientIp,
    userAgent,
  });

  try {
    // 1. Rate limiting check
    const rateLimitResult = await checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      const responseTimeMs = Date.now() - startTime;
      
      // Track rate limit hit
      logger.trackRateLimit({
        ip: clientIp,
        endpoint: '/api/cv-review/generate',
        requestCount: rateLimitResult.remaining + 1,
        limitExceeded: true,
        timestamp: new Date().toISOString(),
      });

      metricsStore.incrementRateLimitHits();
      metricsStore.addAPIMetrics({
        requestId,
        endpoint: '/api/cv-review/generate',
        method: 'POST',
        statusCode: 429,
        responseTimeMs,
        success: false,
        ip: clientIp,
        userAgent,
        error: 'RATE_LIMIT_EXCEEDED',
      });

      return NextResponse.json(
        {
          error: rateLimitResult.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryable: true,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60), // minutes
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'X-Request-Id': requestId,
          },
        }
      );
    }


    // 2. Parse and validate input with Zod
    const body = await req.json();
    const BodySchema = z.object({
      resume: z.string().min(100, 'Resume must be at least 100 characters'),
      jobDescription: z.string().min(30, 'Job description must be at least 30 characters'),
      bypassCache: z.boolean().optional(),
    });
    const parseResult = BodySchema.safeParse(body);
    if (!parseResult.success) {
      const responseTimeMs = Date.now() - startTime;
      const errors = parseResult.error.issues.map((e: { message: string }) => e.message);
      logger.warn('security', 'Input validation failed (zod)', {
        requestId,
        errors,
      });
      metricsStore.addAPIMetrics({
        requestId,
        endpoint: '/api/cv-review/generate',
        method: 'POST',
        statusCode: 400,
        responseTimeMs,
        success: false,
        ip: clientIp,
        userAgent,
        error: 'INVALID_INPUT',
      });
      return NextResponse.json(
        {
          error: errors.join('. '),
          code: 'INVALID_INPUT',
          retryable: false,
        },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      );
    }

    // 3. Sanitize input (prevents prompt injection and XSS)
    const sanitizationResult = sanitizeCVReviewInput({
      resume: parseResult.data.resume,
      jobDescription: parseResult.data.jobDescription,
    });
    if (sanitizationResult.errors) {
      const responseTimeMs = Date.now() - startTime;
      logger.warn('security', 'Input validation failed (sanitize)', {
        requestId,
        errors: sanitizationResult.errors,
      });
      metricsStore.addAPIMetrics({
        requestId,
        endpoint: '/api/cv-review/generate',
        method: 'POST',
        statusCode: 400,
        responseTimeMs,
        success: false,
        ip: clientIp,
        userAgent,
        error: 'INVALID_INPUT',
      });
      return NextResponse.json(
        {
          error: sanitizationResult.errors.join('. '),
          code: 'INVALID_INPUT',
          retryable: false,
        },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      );
    }

    // 4. Check for bypass cache flag (user clicked "Regenerate")
    const bypassCache = body.bypassCache === true;
    
    // 5. Generate content hash for caching (Phase 2)
    const contentHash = hashInput(
      sanitizationResult.sanitized!.resume,
      sanitizationResult.sanitized!.jobDescription
    );

    // 6. Generate CV review with AI
    logger.debug('api', 'Starting AI generation', {
      requestId,
      resumeLength: sanitizationResult.sanitized!.resume.length,
      jobDescLength: sanitizationResult.sanitized!.jobDescription.length,
      contentHash,
      bypassCache,
    });

    // 6. Use LangGraph adapter for streaming AI orchestration
    const aiStartTime = Date.now();
    let provider = 'unknown';
    let cacheStatus = 'MISS';
    let lastResult = null;
    let errorResult = null;
    // Cloudflare D1 DB instance (assume available as env.D1 or globalThis.D1)
    // Replace with actual D1 binding as per your deployment (e.g., from context, global, or request)
    const db = globalThis.D1 || (env.D1 ? env.D1 : undefined);
    const stream = runCVReviewLangGraph({
      resume: sanitizationResult.sanitized!.resume,
      jobDescription: sanitizationResult.sanitized!.jobDescription,
      userParams: {},
      db,
    });

    // Stream response chunks as NDJSON (newline-delimited JSON)
    const encoder = new TextEncoder();
    const streamBody = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.error) {
              errorResult = chunk;
              controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
              break;
            }
            lastResult = chunk;
            if (chunk.source === 'cache') cacheStatus = 'HIT';
            if (chunk.source === 'gemini' || chunk.source === 'huggingface') provider = chunk.source;
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
          }
        } catch (err) {
          errorResult = { error: 'Streaming error', details: err?.message };
          controller.enqueue(encoder.encode(JSON.stringify(errorResult) + '\n'));
        } finally {
          controller.close();
        }
      },
    });

    // Track metrics after streaming
    const aiGenerationTimeMs = Date.now() - aiStartTime;
    const responseTimeMs = Date.now() - startTime;
    if (lastResult && !lastResult.error) {
      logger.trackAIProvider({
        provider: provider as any,
        success: true,
        generationTimeMs: aiGenerationTimeMs,
        promptLength: sanitizationResult.sanitized!.resume.length + sanitizationResult.sanitized!.jobDescription.length,
        responseLength: JSON.stringify(lastResult).length,
        timestamp: new Date().toISOString(),
      });
      metricsStore.addAPIMetrics({
        requestId,
        endpoint: '/api/cv-review/generate',
        method: 'POST',
        statusCode: 200,
        responseTimeMs,
        aiProvider: provider,
        success: true,
        ip: clientIp,
        userAgent,
      });
      logger.info('api', 'CV Review request completed successfully', {
        requestId,
        responseTimeMs,
        aiProvider: provider,
        aiGenerationTimeMs,
        cacheStatus,
      });
    } else if (errorResult) {
      logger.error('ai_provider', 'AI generation failed', new Error(errorResult.error), {
        requestId,
        generationTimeMs: aiGenerationTimeMs,
      });
      metricsStore.addAPIMetrics({
        requestId,
        endpoint: '/api/cv-review/generate',
        method: 'POST',
        statusCode: 503,
        responseTimeMs,
        success: false,
        ip: clientIp,
        userAgent,
        error: errorResult.error,
      });
    }

    // Return streaming response with headers
    return new Response(streamBody, {
      status: lastResult && !lastResult.error ? 200 : 503,
      headers: {
        'Content-Type': 'application/x-ndjson',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'X-Request-Id': requestId,
        'X-Cache-Status': cacheStatus,
        'X-AI-Provider': provider,
      },
    });
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    
    logger.error('api', 'Unexpected error in CV Review API', error as Error, {
      requestId,
      responseTimeMs,
    });

    metricsStore.addAPIMetrics({
      requestId,
      endpoint: '/api/cv-review/generate',
      method: 'POST',
      statusCode: 500,
      responseTimeMs,
      success: false,
      ip: clientIp,
      userAgent,
      error: 'INTERNAL_ERROR',
    });

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        retryable: true,
      },
      { 
        status: 500,
        headers: { 'X-Request-Id': requestId },
      }
    );
  }
}
