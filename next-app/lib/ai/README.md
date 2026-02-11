# CV Review Tool - AI Provider Setup Guide

## Overview

The CV Review & Interview Preparation Tool uses two AI providers with automatic fallback:

1. **Primary**: Google Gemini 2.0 Flash (fast, cost-effective)
2. **Fallback**: HuggingFace Llama 3.1 70B (high quality backup)

## Setup Instructions

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

**Pricing**: 
- Gemini 2.0 Flash: Free tier available (15 RPM)
- Pay-as-you-go: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### 2. Get HuggingFace API Token (Optional but Recommended)

1. Visit [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Sign in or create account
3. Click "New token"
4. Name it "QaiTalk CV Review"
5. Select "Read" access
6. Copy the token

**Pricing**:
- Llama 3.1 70B: ~$0.65 per 1M input tokens, ~$0.80 per 1M output tokens
- HuggingFace Pro: $9/month for higher rate limits

### 3. Configure Environment Variables

Create a `.env.local` file in the `next-app` directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Google Gemini API Key (Required)
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# HuggingFace API Token (Fallback - Recommended)
HUGGINGFACE_API_TOKEN="your_actual_huggingface_token_here"
```

### 4. Test the Integration

```bash
# Restart the dev server to load new env variables
npm run dev
```

Then visit `http://localhost:3000/cv-review` and test with:
- Sample resume text (100+ characters)
- Sample job description (30+ characters)

## Architecture

```
Client Request
    ↓
API Route (/api/cv-review/generate)
    ↓
AI Orchestrator (lib/ai/index.ts)
    ↓
Try Gemini → If fails, try HuggingFace
    ↓
Parse Response → Return structured data
```

## Provider Comparison

| Feature | Gemini 2.0 Flash | Llama 3.1 70B |
|---------|------------------|---------------|
| Speed | ~10-20s | ~30-50s |
| Quality | Excellent | Excellent |
| Cost | Lower | Higher |
| Rate Limits | 15 RPM (free) | 10 RPM (free) |
| Context Window | 1M tokens | 128K tokens |

## Error Handling

The system automatically:
1. Tries Gemini first
2. If Gemini fails → Falls back to HuggingFace
3. If both fail → Returns user-friendly error message

## Security Notes

- ✅ API keys are server-side only (not exposed to client)
- ✅ No user data is stored on our servers
- ✅ All requests are server-side rendered
- ✅ Environment variables are not committed to git
- ✅ .env.local is in .gitignore

## Rate Limiting Recommendations

For production:
- Implement IP-based rate limiting (10 requests/24h per IP)
- Use Cloudflare KV for distributed rate limit storage
- Monitor API usage with analytics
- Set up alerts for high usage

## Monitoring

Track these metrics:
- Average generation time
- Provider success/failure rates
- API cost per request
- User satisfaction ratings

## Troubleshooting

### "Gemini API key not configured"
- Ensure `.env.local` exists in `next-app` directory
- Verify `GEMINI_API_KEY` is set correctly
- Restart dev server after adding env variables

### "Failed to generate CV review"
- Check API key validity
- Verify network connectivity
- Check API quota/rate limits
- Review server logs for detailed errors

### Slow Generation (~60s timeout)
- Expected for first request (cold start)
- Gemini is faster than HuggingFace
- Consider upgrading to paid tier for better performance

## Production Deployment

For Cloudflare Pages deployment:

1. Add secrets via Wrangler CLI:
```bash
wrangler pages secret put GEMINI_API_KEY
wrangler pages secret put HUGGINGFACE_API_TOKEN
```

2. Or via Cloudflare Dashboard:
- Settings → Environment Variables
- Add `GEMINI_API_KEY` and `HUGGINGFACE_API_TOKEN`

## Cost Estimation

Assuming average CV review uses ~2000 tokens input, ~1500 tokens output:

**Gemini 2.0 Flash**:
- Input: 2000 tokens × $0.075/1M = $0.00015
- Output: 1500 tokens × $0.30/1M = $0.00045
- **Total per request: ~$0.0006**

**HuggingFace Llama 3.1** (fallback):
- Input: 2000 tokens × $0.65/1M = $0.0013
- Output: 1500 tokens × $0.80/1M = $0.0012
- **Total per request: ~$0.0025**

For 1000 reviews/month: ~$0.60 - $2.50 depending on provider mix.

## Next Steps

1. ✅ API providers connected
2. ⬜ Add rate limiting (IP-based)
3. ⬜ Add input sanitization (XSS/prompt injection)
4. ⬜ Implement PDF export
5. ⬜ Add localStorage history
6. ⬜ Write E2E tests

---

**Last Updated**: February 11, 2026
**Maintained by**: QaiTalk Engineering Team
