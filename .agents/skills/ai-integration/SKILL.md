# AI Integration Skill

## Overview
Integrate and use AI APIs (e.g., Google Gemini, Hugging Face) for computer vision, NLP, and generative features in QaiTalk.

## When to Use
- Adding AI-powered features (CV analysis, text generation, image analysis)
- Integrating external AI APIs (Gemini, Hugging Face, OpenAI)
- Building AI-driven workflows or tools
- Debugging or optimizing AI inference

## Key Files
- **Guide:** `ai-integration.md` (in this directory)
- **API Clients:** `lib/ai/` (API wrappers, helpers)
- **Config:** `lib/config/`

## Key Patterns
- Use environment variables for API keys
- Abstract API calls in `lib/ai/` for reusability
- Handle API errors and fallbacks (retry logic)
- Cache results to reduce costs (see `resultCache.ts`)
- Validate and sanitize AI outputs before use

## Output
When generating AI integration code:
1. Use async/await for API calls
2. Add error handling and retries
3. Store API keys securely (never in code)
4. Document API usage and limitations
5. Provide fallback or user-friendly error messages
