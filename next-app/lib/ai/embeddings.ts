// Embedding utility for RAG (Gemini API)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config } from '@/lib/config';

const genAI = Config.ai.gemini.apiKey
  ? new GoogleGenerativeAI(Config.ai.gemini.apiKey)
  : null;

/**
 * Generate embedding for a given text using Gemini API
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!genAI) throw new Error('Gemini API key not configured');
  // Truncate to model limits (2048 tokens for Gemini)
  const truncated = text.slice(0, 8000); // ~2k tokens
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await embeddingModel.embedContent(truncated);
  return result.embedding.values;
}
