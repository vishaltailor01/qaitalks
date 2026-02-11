// AI Orchestrator: tries Gemini, falls back to HuggingFace
import { CVGenerationRequest, CVGenerationResponse, CVGenerationError } from './types';
import { generateWithGemini } from './gemini';
import { generateWithHuggingFace } from './huggingface';

export async function generateCVReview(
  req: CVGenerationRequest
): Promise<CVGenerationResponse | CVGenerationError> {
  try {
    return await generateWithGemini(req);
  } catch {
    // Fallback to HuggingFace
    try {
      return await generateWithHuggingFace(req);
    } catch {
      return {
        error: 'All AI providers failed. Please try again later.',
        code: 'ERROR_AI_UNAVAILABLE',
        retryable: true,
      };
    }
  }
}
