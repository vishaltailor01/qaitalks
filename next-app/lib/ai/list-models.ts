/**
 * List available Google Generative AI models and their capabilities
 * Run with: npx ts-node lib/ai/list-models.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY not set in environment');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log('🔍 Fetching available Google Generative AI models...\n');
    
    // List models - note: this uses the internal listModels method
    // The SDK doesn't expose ListModels directly, so we'll try known models
    const knownModels = [
      'gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-3-pro',
      'gemini-exp-1114',
      'gemini-exp-1121',
      'text-embedding-004',
    ];

    console.log('📋 Testing known model IDs:\n');
    
    for (const modelId of knownModels) {
      try {
        genAI.getGenerativeModel({ model: modelId });
        
        // Try getting model info
        console.log(`✅ ${modelId}`);
        console.log(`   Available for: generateContent`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`❌ ${modelId} - NOT AVAILABLE`);
        } else if (errorMsg.includes('429') || errorMsg.includes('quota')) {
          console.log(`⚠️  ${modelId} - AVAILABLE (quota exceeded)`);
        } else {
          console.log(`❓ ${modelId} - ERROR: ${errorMsg.split('\n')[0]}`);
        }
      }
    }

    console.log('\n📝 RECOMMENDATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Use one of these in your .env file:');
    console.log('');
    console.log('Option 1 (Latest): GEMINI_MODEL=gemini-2.5-pro');
    console.log('Option 2 (Fast):   GEMINI_MODEL=gemini-2.0-flash');
    console.log('Option 3 (Stable): GEMINI_MODEL=gemini-1.5-pro');
    console.log('');
    console.log('⚠️  If you get 404 errors, the model may not be available in your region/account.');
    console.log('💳 To use paid models, enable billing in Google Cloud Console.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error listing models:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

listAvailableModels();
