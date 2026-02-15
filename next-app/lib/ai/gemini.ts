import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVGenerationRequest, CVGenerationResponse } from './types';
import { Config } from '@/lib/config';
import { getRoleContext, UK_RECRUITMENT_STANDARDS } from './knowledge-pool';
import { formatInterviewQuestion } from './utils';

// Initialize Gemini AI
const genAI = Config.ai.gemini.apiKey
  ? new GoogleGenerativeAI(Config.ai.gemini.apiKey)
  : null;

export async function generateWithGemini(
  req: CVGenerationRequest
): Promise<CVGenerationResponse> {
  const startTime = Date.now();

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY || !genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Model can be configured via GEMINI_MODEL environment variable
    // Fetch role-specific context
    const selectedRole = req.targetRole || 'Manual';
    const context = getRoleContext(selectedRole);

    // Construct the prompt
    const prompt = `You are a UK-based Career Coach and Senior Talent Acquisition Specialist for the Technology sector, specialising in Software Testing and Quality Engineering.

UK RECRUITMENT STANDARDS (MANDATORY):
${UK_RECRUITMENT_STANDARDS}

ROLE-SPECIFIC DOMAIN KNOWLEDGE (QA - ${selectedRole}):
${context.domainKnowledge}

FEW-SHOT GOLDEN SAMPLE (ROLE-SPECIFIC):
Before: ${context.resumeSample.before}
After: ${context.resumeSample.after}

CURATED INTERVIEW KNOWLEDGE:
${(context.interviewPrep.technical || []).slice(0, 3).map(formatInterviewQuestion).join('\n')}
${(context.interviewPrep.behavioural || []).slice(0, 2).map(formatInterviewQuestion).join('\n')}

  Your task is to assess a CV against a Job Description, identify gaps, prepare interview content, and rewrite the CV with JOB-SPECIFIC optimization. Use British English throughout and avoid AI-sounding or robotic phrasing.

  RESUME/CV:
  ${req.resume}

  TARGET JOB DESCRIPTION:
  ${req.jobDescription}

  QUALITY RULES (NON-NEGOTIABLE):
  - British English only (specialise, programme, organisation, whilst)
  - Avoid AI-style filler, generic platitudes, or vague praise
  - Do not invent experience, employers, or tools. Use [Bracketed Placeholders] when missing
  - Keep statements grounded in the CV/JD with concrete evidence
  - Medium length: ~300-450 words per section unless otherwise specified
  - MINIMAL CHANGES ONLY: Preserve user's original voice, style, and phrasing wherever possible
  - Only restructure or rephrase when necessary for ATS optimization or keyword matching

  HR-BREAKER OPTIMIZATION PRINCIPLES:
  - Job-Specific Tailoring: Every suggestion must be directly tied to the target job description
  - Keyword Density: Match 80%+ of critical keywords from the job description
  - ATS-Friendly Formatting: Single-column, clear headers, no tables/graphics, standard fonts
  - Opinionated Length: One page for <5 years experience, two pages for 5+ years (STRICT)
  - No Fluff: Remove generic statements, focus on quantifiable achievements with metrics
  - Hallucination Prevention: Never add skills, tools, or experiences not in the original CV

  🚨 OUTPUT FORMAT (MUST FOLLOW EXACTLY):
  Start EVERY section with this EXACT delimiter format (copy exactly including the five equals signs):

  ===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====
  create a table comparing the CV against the JD requirements.
  | JD Requirement | Match Status | Evidence in CV | Gaps / Recommendation |
  |----------------|--------------|----------------|-----------------------|
  | [Requirement]  | [High/Med/Low]| [Quote/None]   | [Actionable Advice]   |

  Then summarize:
  **Core Strengths:** [List 3 key matches]
  **Critical Gaps:** [List 3 major missing elements]

  ===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS (STAR METHOD) =====
  Create 3 behavioural interview questions based on the candidate's gaps.
   STRICTLY follow this format for EACH question:

  **Question 1:** [Question Text]
  **Competency:** [Competency Name]
  
  **STAR Framework Answer Guide:**
  - **Situation:** [Context description relevant to the role]
  - **Task:** [Specific responsibility or challenge]
  - **Action:** [Steps taken - focus on 'I' not 'We']
  - **Result:** [Outcome with metrics/impact]

  ===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====
  Create 5 technical questions based on the JD's specific tech stack.
  Format each question exactly like this:

  **Question 1:** [Question Text]
  **Focus Area:** [Technical Domain]
  **Expected Answer:** [Key technical points to cover]
  **Follow-up:** [A deeper probe question]

  ===== SECTION 4: SKILLS GAP & ACTION PLAN =====

  ===== SECTION 5: THE REWRITTEN UK CV =====

  ===== SECTION 6: THE UK COVER LETTER =====

  ===== SECTION 7: SIX-SECOND RECRUITER TEST =====

  🚨 CRITICAL RULES:
  - DO NOT include meta-talk, preambles, or "formatting notes".
  - Use British English exclusively.
  - No Fabriction. Stop exactly when the document is finished.`;

    const model = genAI.getGenerativeModel({ model: Config.ai.gemini.model });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the response into sections
    const sections = parseGeminiResponse(text);
    const keywords = extractKeywords(text);

    return {
      atsResume: sections.atsResume,
      interviewGuide: sections.interviewGuide,
      domainQuestions: sections.domainQuestions,
      gapAnalysis: sections.gapAnalysis,
      optimizedCV: sections.optimizedCV,
      coverLetter: sections.coverLetter,
      sixSecondTest: sections.sixSecondTest,
      matchedKeywords: keywords,
      provider: 'gemini',
      generationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Gemini API error:', error);

    // Check if quota exceeded - fallback to HuggingFace
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded'))) {
      console.log('Gemini quota exceeded, falling back to HuggingFace...');
      const { generateWithHuggingFace } = await import('./huggingface');
      return generateWithHuggingFace(req);
    }

    throw new Error('Failed to generate CV review with Gemini');
  }
}

// Parse Gemini response into structured sections
function parseGeminiResponse(text: string): {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string;
  coverLetter: string;
  sixSecondTest: string;
} {
  console.log('🔍 PARSING GEMINI RESPONSE');
  console.log('Response length:', text.length, 'characters');
  console.log('First 300 chars:', text.substring(0, 300));
  console.log('\n--- Checking for ===== delimiters ---');

  const sections = {
    atsResume: '',
    interviewGuide: '',
    domainQuestions: '',
    gapAnalysis: '',
    optimizedCV: '',
    coverLetter: '',
    sixSecondTest: '',
  };

  // Method 1: Split by ===== SECTION N: =====
  const delimiterPattern = /={5,}\s*SECTION\s+(\d+):/gi;
  const hasDelimiters = delimiterPattern.test(text);

  console.log('Has ===== delimiters:', hasDelimiters);

  if (hasDelimiters) {
    // Reset regex
    delimiterPattern.lastIndex = 0;

    // Extract each section using regex
    const section1Match = text.match(/={5,}\s*SECTION\s+1:[^=]*={5,}([\s\S]*?)(?=={5,}\s*SECTION\s+2:|$)/i);
    const section2Match = text.match(/={5,}\s*SECTION\s+2:[^=]*={5,}([\s\S]*?)(?=={5,}\s*SECTION\s+3:|$)/i);
    const section3Match = text.match(/={5,}\s*SECTION\s+3:[^=]*={5,}([\s\S]*?)(?=={5,}\s*SECTION\s+4:|$)/i);
    const section4Match = text.match(/={5,}\s*SECTION\s+4:[^=]*={5,}([\s\S]*?)(?=={5,}\s*SECTION\s+5:|$)/i);
    const section5Match = text.match(/={5,}\s*SECTION\s+5:[^=]*={5,}([\s\S]*?)(?=={5,}\s*SECTION\s+6:|$)/i);
    const section6Match = text.match(/={5,}\s*SECTION\s+6:[^=]*={5,}([\s\S]*?)(?=={5,}\s*END|$)/i);

    if (section1Match || section2Match || section3Match || section4Match || section5Match || section6Match) {
      sections.atsResume = section1Match ? section1Match[1].trim() : '';
      sections.interviewGuide = section2Match ? section2Match[1].trim() : '';
      sections.domainQuestions = section3Match ? section3Match[1].trim() : '';
      sections.gapAnalysis = section4Match ? section4Match[1].trim() : '';
      sections.optimizedCV = section5Match ? section5Match[1].trim() : '';
      sections.coverLetter = section6Match ? section6Match[1].trim() : '';
      sections.sixSecondTest = text.match(/={5,}\s*SECTION\s+7:[^=]*={5,}([\s\S]*?)(?=={5,}\s*END|$)/i)?.[1].trim() || '';

      console.log('✅ Successfully parsed using ===== delimiters');
      console.log('Section lengths:', {
        atsResume: sections.atsResume.length,
        interviewGuide: sections.interviewGuide.length,
        domainQuestions: sections.domainQuestions.length,
        gapAnalysis: sections.gapAnalysis.length,
        optimizedCV: sections.optimizedCV.length,
        coverLetter: sections.coverLetter.length
      });

      return sections;
    }
  }

  // Fallback: Try ## headers
  console.log('⚠️ Delimiter parsing failed, trying ## header fallback');

  const atsMatch = text.match(/##\s*1\.\s*STRATEGIC[\s\S]*?(?=###\s*Question 1:|##\s*SKILLS GAP|$)/i);
  const interviewMatch = text.match(/###\s*Question 1:[\s\S]*?(?=###\s*Technical Question 1:|##\s*SKILLS GAP|$)/i);
  const domainMatch = text.match(/###\s*Technical Question 1:[\s\S]*?(?=##\s*SKILLS GAP|$)/i);
  const gapMatch = text.match(/##\s*SKILLS GAP & ACTION PLAN[\s\S]*?(?=##\s*THE REWRITTEN UK CV|$)/i);
  const cvMatch = text.match(/##\s*THE REWRITTEN UK CV[\s\S]*?(?=##\s*THE UK COVER LETTER|##\s*6\.|$)/i);
  const coverMatch = text.match(/##\s*THE UK COVER LETTER[\s\S]*$/i);

  sections.atsResume = atsMatch ? atsMatch[0].trim() : '';
  sections.interviewGuide = interviewMatch ? interviewMatch[0].trim() : '';
  sections.domainQuestions = domainMatch ? domainMatch[0].trim() : '';
  sections.gapAnalysis = gapMatch ? gapMatch[0].trim() : '';
  sections.optimizedCV = cvMatch ? cvMatch[0].trim() : '';
  sections.coverLetter = coverMatch ? coverMatch[0].trim() : '';

  console.log('## header parsing results:', {
    atsResume: !!sections.atsResume,
    interviewGuide: !!sections.interviewGuide,
    domainQuestions: !!sections.domainQuestions,
    gapAnalysis: !!sections.gapAnalysis,
    optimizedCV: !!sections.optimizedCV,
    coverLetter: !!sections.coverLetter
  });

  // Validate: Check if critical sections are missing
  const missingSections = [];
  if (!sections.atsResume) missingSections.push('Section 1 (ATS Resume)');
  if (!sections.interviewGuide) missingSections.push('Section 2 (Interview Guide)');
  if (!sections.domainQuestions) missingSections.push('Section 3 (Domain Questions)');
  if (!sections.gapAnalysis) missingSections.push('Section 4 (Gap Analysis)');
  if (!sections.optimizedCV) missingSections.push('Section 5 (Optimized CV)');
  if (!sections.coverLetter) missingSections.push('Section 6 (Cover Letter)');

  if (missingSections.length > 0) {
    console.error('❌ PARSING FAILED - Missing sections:', missingSections);
    console.error('AI response did not follow the required format.');
    console.error('Sample of response:', text.substring(0, 1000));
  } else {
    console.log('✅ All sections parsed successfully');
  }

  return sections;
}

// Extract keywords from the response
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];

  // Look for keywords in "Keyword Matches Found" and "Critical Keywords Missing" sections
  const keywordSection = text.match(/###\s*(?:Keyword Matches Found|Critical Keywords Missing)[\s\S]*?(?=###|---SECTION|$)/gi);

  if (keywordSection) {
    keywordSection.forEach(section => {
      // Extract words that look like technical keywords (capitalized or common tech terms)
      const matches = section.match(/\b(?:[A-Z][a-z]+(?:[A-Z][a-z]+)*|API|CI\/CD|REST|SQL|AWS|Azure|Git|Docker|Kubernetes|Jenkins|Python|Java|JavaScript|TypeScript|Selenium|Cypress|JUnit|TestNG|Agile|Scrum|JIRA)\b/g);
      if (matches) {
        keywords.push(...matches);
      }

      // Also extract quoted words
      const quoted = section.match(/["']([^"']+)["']/g);
      if (quoted) {
        keywords.push(...quoted.map(q => q.replace(/["']/g, '')));
      }
    });
  }

  // Return unique keywords, limit to top 10
  return [...new Set(keywords)].slice(0, 10);
}
