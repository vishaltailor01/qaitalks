import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test streaming specifically
 */
export async function GET() {
  try {
    if (Config.env !== 'development') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const apiKey = Config.ai.gemini.apiKey;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = Config.ai.gemini.model;
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`[TEST STREAM] Testing streaming with model: ${modelName}`);

    // Try streaming
    const result = await model.generateContentStream('Count to 5, one number per line.');
    
    let chunks: string[] = [];
    for await (const chunk of result.stream) {
      const text = chunk.text();
      chunks.push(text);
      console.log('[TEST STREAM] Received chunk:', text.substring(0, 50));
    }

    return NextResponse.json({
      success: true,
      model: modelName,
      chunksReceived: chunks.length,
      fullText: chunks.join(''),
      message: 'Streaming works!',
    });
  } catch (error) {
    console.error('[TEST STREAM] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Streaming test failed',
    }, { status: 500 });
  }
}
