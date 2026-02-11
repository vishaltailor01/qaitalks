# Quick Start: Testing CV Review Tool Locally

## Prerequisites

You need API keys from AI providers. Follow these steps:

### Step 1: Get Google Gemini API Key (Required)

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Copy the key (starts with `AIza...`)

**Note**: Free tier includes 15 requests per minute - perfect for testing!

### Step 2: Get HuggingFace Token (Optional - Fallback)

1. Go to **[HuggingFace Tokens](https://huggingface.co/settings/tokens)**
2. Sign in or create free account
3. Click **"New token"**
4. Name: `QaiTalk-CV-Review`
5. Permission: **Read**
6. Copy the token (starts with `hf_...`)

---

## Setup Instructions

### 1. Create Environment File

In the `next-app` directory, create a `.env.local` file:

```bash
# Navigate to next-app directory
cd next-app

# Copy example file
cp .env.example .env.local
```

### 2. Add Your API Keys

Edit `.env.local` and add your keys:

```env
# Required: Google Gemini
GEMINI_API_KEY="AIzaSyC_your_actual_key_here"

# Optional: HuggingFace fallback
HUGGINGFACE_API_TOKEN="hf_your_actual_token_here"

# Keep existing database config
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**⚠️ Important**: 
- Replace the placeholder values with your actual keys
- Never commit `.env.local` to git (it's already in .gitignore)
- Keep your API keys secret

### 3. Start Development Server

```bash
# From next-app directory
npm run dev
```

You should see:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Environments: .env.local, .env
```

### 4. Test the CV Review Tool

1. Open browser: **http://localhost:3000/cv-review**

2. Use this **sample resume** (paste in left textarea):

```
Senior QA Engineer with 5 years of experience in test automation.

TECHNICAL SKILLS:
- Selenium WebDriver, Java, TestNG, Cucumber
- CI/CD: Jenkins, GitHub Actions
- API Testing: Postman, Rest Assured
- Version Control: Git

EXPERIENCE:
Senior QA Engineer | Tech Corp | 2021-Present
- Built test automation framework using Selenium and Java
- Implemented CI/CD pipeline with Jenkins
- Reduced regression testing time by 60%
- Mentored 3 junior QA engineers

QA Engineer | StartupXYZ | 2019-2021
- Performed manual and automated testing
- Created test plans and test cases
- Collaborated with developers on bug fixes
```

3. Use this **sample job description** (paste in right textarea):

```
SDET / Senior QA Automation Engineer

Requirements:
- 5+ years in test automation
- Expert in Selenium, Java, TestNG, Maven
- Strong CI/CD experience (Jenkins, Docker, Kubernetes)
- API testing with Rest Assured
- Performance testing experience (JMeter)
- Cloud platforms (AWS/Azure)
- Strong communication and leadership skills

Responsibilities:
- Design and maintain automation framework
- Build CI/CD pipelines
- Mentor junior team members
- Collaborate with development teams
```

4. Click **"🚀 Generate AI Review"**

5. Wait ~15-30 seconds for results

---

## Expected Output

You should see 4 sections:

### 1. 📄 ATS-Optimized Resume Suggestions
- Keyword matches (Selenium, Java, CI/CD)
- Missing keywords (Docker, Kubernetes, JMeter, AWS/Azure)
- Formatting tips
- Action verb suggestions

### 2. 🎤 Interview Preparation Guide
- 3-5 behavioral questions with STAR+ method answers
- Examples based on your experience

### 3. 💡 Technical Domain Questions
- 5-7 scenario-based technical questions
- Framework and testing methodology questions

### 4. 📊 Skills Gap Analysis
- Missing: Docker, Kubernetes, Performance Testing (JMeter), Cloud (AWS/Azure)
- Recommendations for each skill
- Learning resources
- Priority ranking

---

## Troubleshooting

### ❌ "Gemini API key not configured"

**Solution**:
1. Check `.env.local` exists in `next-app` folder
2. Verify `GEMINI_API_KEY="AIza..."` is set correctly (no spaces)
3. Restart dev server: `Ctrl+C` then `npm run dev`

### ❌ "All AI providers failed"

**Possible causes**:
1. Invalid API key → Double-check key from Google AI Studio
2. Rate limit exceeded → Wait 1 minute and try again (free tier: 15 RPM)
3. Network issue → Check internet connection
4. API quotanexceeded → Check [Google AI Studio quotas](https://aistudio.google.com/)

**Solution**: Check browser console (F12) and terminal for error details

### ⏱️ "Generation taking too long (>60s)"

**Expected**:
- First request: ~15-30 seconds (Gemini)
- Fallback (HuggingFace): ~30-50 seconds

**Improvements**:
- Upgrade to paid tier for faster processing
- Optimize prompt length
- Use shorter resume/job description for testing

### 🔧 Server Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

---

## Verification Checklist

- [ ] `.env.local` file created in `next-app` directory
- [ ] `GEMINI_API_KEY` added and valid
- [ ] Dev server running on `http://localhost:3000`
- [ ] CV Review page loads at `/cv-review`
- [ ] Sample resume and job description pasted (100+ and 30+ chars)
- [ ] "Generate AI Review" button enabled
- [ ] Results display within 60 seconds
- [ ] All 4 sections visible (ATS, Interview, Domain, Gap Analysis)

---

## Cost Awareness

**Free Tier Limits**:
- Gemini 2.0 Flash: 15 requests/minute, 1500 requests/day
- HuggingFace: Variable (typically 10-30 requests/hour)

**Estimated Cost per Request** (if exceeding free tier):
- Gemini: ~$0.0006 per review (~$0.60 per 1000 reviews)
- HuggingFace: ~$0.0025 per review (~$2.50 per 1000 reviews)

For 10-20 test requests: **$0.00** (within free tier)

---

## Next Steps After Testing

Once confirmed working:

1. **Add Rate Limiting** → Prevent abuse (10 requests/24h per IP)
2. **Input Sanitization** → Prevent prompt injection attacks
3. **PDF Export** → Allow users to download results
4. **localStorage** → Save last 5 reviews
5. **Analytics** → Track usage and costs
6. **E2E Tests** → Automate testing flow

---

## Production Deployment

For Cloudflare Pages:

```bash
# Set secrets via Wrangler
npx wrangler pages secret put GEMINI_API_KEY
npx wrangler pages secret put HUGGINGFACE_API_TOKEN

# Or via Cloudflare Dashboard
# → Pages → Your Project → Settings → Environment Variables
```

---

**Need Help?**

1. Check [lib/ai/README.md](./README.md) for detailed docs
2. Review browser console (F12 → Console tab)
3. Check terminal output for server errors
4. Review [Google AI Studio docs](https://ai.google.dev/docs)

---

**Last Updated**: February 11, 2026  
**Status**: ✅ Ready for local testing
