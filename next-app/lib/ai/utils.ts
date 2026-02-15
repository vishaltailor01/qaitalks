/**
 * Shared utility functions for AI providers
 */

import type { InterviewQuestion } from './types';

/**
 * Format an interview question for display in prompts
 * Consolidates duplicate code from gemini.ts, huggingface.ts, and gemini-stream.ts
 */
export function formatInterviewQuestion(q: InterviewQuestion): string {
    return `- ${q.focus || q.competency}: ${q.question}\n  - Guide: ${q.answer_outline || q.star_guide}`;
}
