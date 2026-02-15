import { HfInference } from '@huggingface/inference';
import { CVGenerationRequest, CVGenerationResponse } from './types';
import { Config } from '@/lib/config';
import { getRoleContext, UK_RECRUITMENT_STANDARDS } from './knowledge-pool';
import { formatInterviewQuestion } from './utils';

// Initialize HuggingFace client
const hf = process.env.HUGGINGFACE_API_TOKEN
  ? new HfInference(process.env.HUGGINGFACE_API_TOKEN)
  : null;

const isDev = process.env.NODE_ENV === 'development';
const debug = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export async function generateWithHuggingFace(
  req: CVGenerationRequest
): Promise<CVGenerationResponse> {
  const startTime = Date.now();

  // Check if API token is configured
  if (!process.env.HUGGINGFACE_API_TOKEN || !hf) {
    throw new Error('HuggingFace API token not configured');
  }

  try {
    // Use Mistral 7B Instruct model with chat completion API
    const model = Config.ai.huggingface.model;

    // Fetch role-specific context
    const selectedRole = req.targetRole || 'Manual';
    const context = getRoleContext(selectedRole);

    // Construct the messages for chat completion
    const messages = [
      {
        role: 'system' as const,
        content: `You are a UK-based Career Coach and Senior Talent Acquisition Specialist. Use British English.
        
UK RECRUITMENT STANDARDS:
${UK_RECRUITMENT_STANDARDS}

ROLE-SPECIFIC KNOWLEDGE:
${context.domainKnowledge}

FEW-SHOT SAMPLE:
Before: ${context.resumeSample.before}
After: ${context.resumeSample.after}

INTERVIEW PREP:
${(context.interviewPrep.technical || []).slice(0, 2).map(formatInterviewQuestion).join('\n')}
${(context.interviewPrep.behavioural || []).slice(0, 1).map(formatInterviewQuestion).join('\n')}`
      },
      {
        role: 'user' as const,
        content: `Act as a UK Career Coach.Assess this CV against the JD.

          RESUME / CV:
        ${req.resume}

TARGET JD:
      ${req.jobDescription}

🚨 OUTPUT FORMAT(MANDATORY):
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
===== SECTION 7: SIX - SECOND RECRUITER TEST =====
===== END OF RESPONSE =====

      CRITICAL RULES:
    - British English only.
- No meta - talk.
- Stop exactly when the document is finished.`
      }
    ];

    // Generate text using HuggingFace Chat Completion API
    const response = await hf.chatCompletion({
      model,
      messages,
      max_tokens: 8000,
      temperature: 0.7,
    });

    const fullResponse = response.choices[0]?.message?.content || '';

    // Parse the response into sections
    const sections = parseHuggingFaceResponse(fullResponse);
    const keywords = extractKeywords(fullResponse);

    return {
      atsResume: sections.atsResume,
      interviewGuide: sections.interviewGuide,
      domainQuestions: sections.domainQuestions,
      gapAnalysis: sections.gapAnalysis,
      optimizedCV: sections.optimizedCV,
      coverLetter: sections.coverLetter,
      sixSecondTest: sections.sixSecondTest,
      matchedKeywords: keywords,
      provider: 'huggingface',
      generationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw new Error('Failed to generate CV review with HuggingFace');
  }
}

// Parse HuggingFace response into structured sections
function parseHuggingFaceResponse(text: string): {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string;
  coverLetter: string;
  sixSecondTest: string;
} {
  debug('🔍 PARSING HUGGINGFACE RESPONSE');
  debug('Response length:', text.length, 'characters');
  debug('First 300 chars:', text.substring(0, 300));
  debug('\n--- Checking for ===== delimiters ---');

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

  debug('Has ===== delimiters:', hasDelimiters);

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

      debug('✅ Successfully parsed using ===== delimiters');
      debug('Section lengths:', {
        atsResume: sections.atsResume.length,
        interviewGuide: sections.interviewGuide.length,
        domainQuestions: sections.domainQuestions.length,
        gapAnalysis: sections.gapAnalysis.length,
        optimizedCV: sections.optimizedCV.length,
        coverLetter: sections.coverLetter.length,
        sixSecondTest: sections.sixSecondTest.length
      });

      return sections;
    }
  }

  // Fallback: Try ## headers and question patterns
  debug('⚠️ Delimiter parsing failed, trying ## header fallback');

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

  debug('## header parsing results:', {
    atsResume: !!sections.atsResume,
    interviewGuide: !!sections.interviewGuide,
    domainQuestions: !!sections.domainQuestions,
    gapAnalysis: !!sections.gapAnalysis,
    optimizedCV: !!sections.optimizedCV,
    coverLetter: !!sections.coverLetter
  });

  // Validate
  const missingSections = [];
  if (!sections.atsResume) missingSections.push('Section 1 (ATS Resume)');
  if (!sections.interviewGuide) missingSections.push('Section 2 (Interview Guide)');
  if (!sections.domainQuestions) missingSections.push('Section 3 (Domain Questions)');
  if (!sections.gapAnalysis) missingSections.push('Section 4 (Gap Analysis)');
  if (!sections.optimizedCV) missingSections.push('Section 5 (Optimized CV)');
  if (!sections.coverLetter) missingSections.push('Section 6 (Cover Letter)');

  if (missingSections.length > 0) {
    console.error('❌ PARSING FAILED - Missing sections:', missingSections);
    console.error('Sample of response:', text.substring(0, 1000));
  } else {
    debug('✅ All sections parsed successfully');
  }

  return sections;
}

// Extract keywords from the response
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];

  // Extract technical terms and common keywords
  const matches = text.match(/\b(?:[A-Z][a-z]+(?:[A-Z][a-z]+)*|API|CI\/CD|REST|SQL|AWS|Azure|Git|Docker|Kubernetes|Jenkins|Python|Java|JavaScript|TypeScript|Selenium|Cypress|JUnit|TestNG|Agile|Scrum|JIRA)\b/g);
  if (matches) {
    keywords.push(...matches);
  }

  // Return unique keywords, limit to top 10
  return [...new Set(keywords)].slice(0, 10);
}
