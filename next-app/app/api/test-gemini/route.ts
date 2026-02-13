import { NextResponse } from 'next/server';
import { Config } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to test Gemini API connectivity
 * Hit this endpoint to verify the API key is working
 */
export async function GET() {
  if (Config.env !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const diagnostics = {
    timestamp: new Date().toISOString(),
    geminiApiKeyConfigured: Config.ai.gemini.enabled,
    geminiApiKeyLength: Config.ai.gemini.apiKey.length,
    geminiApiKeyPrefix: Config.ai.gemini.apiKey.substring(0, 10) || 'NOT_SET',
    geminiModel: Config.ai.gemini.model,
    huggingfaceTokenConfigured: Config.ai.huggingface.enabled,
    nodeEnv: Config.env,
  };

  // Try a simple Gemini API call
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(Config.ai.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: Config.ai.gemini.model });
    
    console.log(`[TEST] Testing Gemini API with model: ${Config.ai.gemini.model}...`);
    const result = await model.generateContent('Say "Hello from Gemini!" in exactly 5 words.');
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      diagnostics,
      testResponse: text,
      message: 'Gemini API is working correctly!',
    });
  } catch (error) {
    console.error('[TEST] Gemini API test failed:', error);
    return NextResponse.json({
      success: false,
      diagnostics,
      error: error instanceof Error ? error.message : String(error),
      message: 'Gemini API test failed - check error details',
    }, { status: 500 });
  }
}
