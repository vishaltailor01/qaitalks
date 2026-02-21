// Streaming API Route for CV Review Generation
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { streamGeminiGeneration, parseStreamedResponse } from '@/lib/ai/gemini-stream';
import { runValidationPipeline, defaultValidators } from '@/lib/ai/validationPipeline';
import { CVGenerationRequest } from '@/lib/ai/types';
import { checkRateLimit } from '@/lib/rateLimit';
import { isRetryableError, logRetryAttempt } from '@/lib/retryLogic';
import { Config } from '@/lib/config';
import { auth } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cv-review/stream
 * 
 * Streaming endpoint that returns Server-Sent Events (SSE) for progressive CV review generation
 * 
 * Query params:
 * - none (streaming is default behavior)
 * 
 * Response format (SSE):
 * - event: section | progress | complete | error
 * - data: JSON with { type, sectionNumber?, sectionName?, content?, progress? }
 */
export async function POST(request: NextRequest) {
  try {
    // Basic CSRF protection: enforce same-origin POSTs
    const origin = request.headers.get('origin');
    const hostOrigin = request.nextUrl.origin;
    if (origin && origin !== hostOrigin) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum 10 requests per 24 hours. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const BodySchema = z.object({
      resume: z.string().min(Config.cvReview.validation.minResumeLength, 'Resume must be at least 100 characters'),
      jobDescription: z.string().min(Config.cvReview.validation.minJobDescriptionLength, 'Job description must be at least 30 characters'),
      targetRole: z.string().optional(),
      industry: z.string().optional(),
      optimizationMode: z.enum(['minimal', 'balanced', 'aggressive']).optional(),
      userInstructions: z.string().max(500).optional(),
      bypassCache: z.boolean().optional(),
    });

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { resume, jobDescription, targetRole, industry, optimizationMode, userInstructions } = parsed.data;

    const cvRequest: CVGenerationRequest = {
      resume,
      jobDescription,
      targetRole,
      industry,
      optimizationMode: optimizationMode || 'minimal',
      userInstructions,
    };

    // Create a ReadableStream for SSE with smart retry support (Phase 2.5)
    const encoder = new TextEncoder();
    let attempt = 0;
    const maxAttempts = 3;

    const stream = new ReadableStream({
      async start(controller) {
        let lastError: Error | null = null;

        // Retry loop for initial connection
        while (attempt < maxAttempts) {
          attempt++;

          try {
            // Stream from Gemini
            for await (const chunk of streamGeminiGeneration(cvRequest)) {
              // Format as SSE
              const eventType = chunk.type;
              const data = JSON.stringify(chunk);
              const sseMessage = `event: ${eventType}\ndata: ${data}\n\n`;

              controller.enqueue(encoder.encode(sseMessage));

              // Complete stream on error or completion
              if (chunk.type === 'error' || chunk.type === 'complete') {
                // Parse final response if complete
                if (chunk.type === 'complete' && chunk.fullText) {
                  console.log('[DEBUG Backend] Complete stream received, length:', chunk.fullText.length);
                  const parsed = parseStreamedResponse(chunk.fullText);
                  // Run modular validation pipeline
                  // Build a full CVGenerationResponse object for validation and output
                  const cvResponse = {
                    atsResume: parsed.atsResume || '',
                    interviewGuide: parsed.interviewGuide || '',
                    domainQuestions: parsed.domainQuestions || '',
                    gapAnalysis: parsed.gapAnalysis || '',
                    optimizedCV: parsed.optimizedCV || '',
                    coverLetter: parsed.coverLetter || '',
                    sixSecondTest: parsed.sixSecondTest || '',
                    matchedKeywords: [],
                    provider: 'gemini' as const,
                    generationTimeMs: 0, // Could be set to actual time if tracked
                    sections: parsed,
                  };
                  const validationResults = runValidationPipeline(cvRequest, cvResponse, defaultValidators);
                  console.log('[DEBUG Backend] Validation results:', validationResults);

                  // Save to database (Phase 2)
                  let dbId = undefined;
                  try {
                    const session = await auth();
                    const prisma = getPrisma();

                    const review = await prisma.cVReview.create({
                      data: {
                        userId: session?.user?.id || null,
                        resume: cvRequest.resume,
                        jobDescription: cvRequest.jobDescription,
                        targetRole: cvRequest.targetRole || null,
                        industry: cvRequest.industry || null,
                        result: JSON.stringify(cvResponse),
                        provider: cvResponse.provider,
                        generationTimeMs: 0, // Placeholder
                        isPaid: false,
                      }
                    });
                    dbId = review.id;
                    console.log('[DEBUG Backend] Saved review to DB:', dbId);
                  } catch (dbError) {
                    console.error('[DATABASE ERROR] Failed to save review:', dbError);
                  }

                  const finalData = JSON.stringify({
                    type: 'parsed',
                    ...cvResponse,
                    ...validationResults,
                    id: dbId,
                  });
                  controller.enqueue(
                    encoder.encode(`event: parsed\ndata: ${finalData}\n\n`)
                  );
                }

                controller.close();
                return; // Success!
              }
            }

            return; // Success!
          } catch (error) {
            lastError = error as Error;
            logRetryAttempt(attempt, maxAttempts, lastError, 'Gemini');

            // Check if error is retryable
            if (!isRetryableError(error)) {
              // Not retryable, fail immediately
              break;
            }

            if (attempt < maxAttempts) {
              // Calculate backoff delay
              const baseDelay = 1000;
              const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);

              // Send retry notification
              const retryMessage = JSON.stringify({
                type: 'retry',
                attempt,
                maxAttempts,
                delay,
                message: `Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})...`,
              });
              controller.enqueue(
                encoder.encode(`event: retry\ndata: ${retryMessage}\n\n`)
              );

              // Wait before retry
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // All retries failed, send error and close
        const errorMessage = JSON.stringify({
          type: 'error',
          error: lastError?.message || 'Stream failed after retries',
          retryable: isRetryableError(lastError),
          attempts: attempt,
        });
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${errorMessage}\n\n`)
        );
        controller.close();
      },
    });

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    });
  } catch (error) {
    console.error('Streaming API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
