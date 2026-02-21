// LangGraph adapter for CV review AI orchestration (POC)
// This file defines a minimal LangGraph for streaming, fallback, and safety integration.

import { getGeminiResponseStream } from './gemini';
import { getHuggingFaceResponse } from './huggingface';
import { sanitizeCVReviewInput, detectPII } from '../sanitize';
import { logger } from '../monitoring';
import { hashInput, getCachedResult, cacheResult } from '../resultCache';
import { createCVReviewVersion, saveCVReviewVersion } from '../cvVersioning';
import { retrieveRAGContextD1 } from './rag-d1';

// Placeholder: Replace with actual LangGraph import when available
// import { Graph, Node, Edge } from 'langgraph';


/**
 * LangGraph POC: CV Review Orchestration with safety hooks
 * @param { resume: string, jobDescription: string, userParams?: any }
 */
// Accepts optional db instance for RAG
export async function* runCVReviewLangGraph({ resume, jobDescription, userParams, db }) {
  // 1. Input Node: Accepts user CV and params
  const input = { resume, jobDescription };
  logger.info('security', 'LangGraph input received', { inputLength: { resume: resume?.length, jobDescription: jobDescription?.length } });

  // 2. Sanitization & Validation Node
  const { sanitized, errors } = sanitizeCVReviewInput(input);
  if (errors && errors.length > 0) {
    logger.trackSecurityEvent('input_validation_failed', { errors });
    yield { error: 'Input validation failed', details: errors };
    return;
  }

  // 3. PII Detection Node (warn only)
  const piiWarnings = [
    ...detectPII(sanitized!.resume),
    ...detectPII(sanitized!.jobDescription)
  ];
  if (piiWarnings.length > 0) {
    logger.trackSecurityEvent('pii_detected', { warnings: piiWarnings });
  }

  // 3.5. RAG Node: Retrieve top-K context from D1
  let ragContext = [];
  if (db) {
    try {
      ragContext = await retrieveRAGContextD1(
        sanitized!.jobDescription + '\n' + sanitized!.resume,
        3,
        db
      );
      logger.info('ai_provider', 'RAG context retrieved', { count: ragContext.length });
    } catch (err) {
      logger.warn('ai_provider', 'RAG context retrieval failed', { error: err?.message });
    }
  }

  // 4. Caching Node: Check for cached result
  const cacheHash = hashInput(sanitized!.resume, sanitized!.jobDescription);
  const cached = getCachedResult(sanitized!.resume, sanitized!.jobDescription);
  if (cached) {
    logger.info('ai_provider', 'Cache hit', { cacheHash });
    yield { source: 'cache', ...cached.result };
    // Save version for history
    const version = createCVReviewVersion(
      { resume: sanitized!.resume, jobDescription: sanitized!.jobDescription, ...userParams },
      { ...cached.result },
      1
    );
    saveCVReviewVersion(version);
    return;
  }

  // 5. AI Node: Gemini (streaming)
  try {
    let aiResult: any = null;
    let lastChunk: any = null;
    // Inject RAG context into userParams for prompt augmentation
    const ragText = ragContext.length > 0 ? ragContext.map(d => d.content).join('\n\n') : '';
    const stream = getGeminiResponseStream({
      cvContent: sanitized!.resume,
      jobDescription: sanitized!.jobDescription,
      userParams: { ...userParams, ragContext: ragText },
    });
    for await (const chunk of stream) {
      lastChunk = chunk;
      yield { source: 'gemini', ...chunk };
    }
    logger.info('ai_provider', 'Gemini streaming completed');
    aiResult = lastChunk;
    if (aiResult) {
      cacheResult(sanitized!.resume, sanitized!.jobDescription, aiResult);
      const version = createCVReviewVersion(
        { resume: sanitized!.resume, jobDescription: sanitized!.jobDescription, ...userParams },
        { ...aiResult },
        1
      );
      saveCVReviewVersion(version);
    }
    return;
  } catch (err) {
    logger.error('ai_provider', 'Gemini streaming error', err);
    // 6. Fallback Node: HuggingFace
    try {
      const hfResult = await getHuggingFaceResponse({
        cvContent: sanitized!.resume,
        jobDescription: sanitized!.jobDescription,
        userParams: { ...userParams, ragContext: ragContext.length > 0 ? ragContext.map(d => d.content).join('\n\n') : '' },
      });
      yield { source: 'huggingface', ...hfResult };
      logger.info('ai_provider', 'HuggingFace fallback completed');
      if (hfResult) {
        cacheResult(sanitized!.resume, sanitized!.jobDescription, hfResult);
        const version = createCVReviewVersion(
          { resume: sanitized!.resume, jobDescription: sanitized!.jobDescription, ...userParams },
          { ...hfResult },
          1
        );
        saveCVReviewVersion(version);
      }
      return;
    } catch (err2) {
      logger.error('ai_provider', 'HuggingFace fallback error', err2);
      yield { error: 'AI analysis failed. Please try again later.' };
    }
  }
}

// Usage: for await (const chunk of runCVReviewLangGraph({cvContent, userParams})) { ... }
