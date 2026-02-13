// HuggingFace AI provider implementation (fallback)
import { HfInference } from '@huggingface/inference';
import { CVGenerationRequest, CVGenerationResponse } from './types';
import { Config } from '@/lib/config';

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

    // Construct the messages for chat completion
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a UK-based Career Coach and Senior Talent Acquisition Specialist for the Technology sector, specialising in Software Testing and Quality Engineering. Use British English and avoid AI-sounding or robotic phrasing.'
      },
      {
        role: 'user' as const,
        content: `Act as a UK Career Coach specialising in Software Testing and Quality Engineering.

RESUME/CV:
${req.resume}

TARGET JOB DESCRIPTION:
${req.jobDescription}

      QUALITY RULES:
      - British English only (specialise, programme, organisation, whilst)
      - Avoid generic praise, filler, or AI-style tone
      - Do not invent experience or employers; use [Bracketed Placeholders] when missing
      - Medium length: ~300-450 words per section
      - MINIMAL CHANGES ONLY: Preserve user's original voice, style, and phrasing
      - Only restructure or rephrase when necessary for ATS optimization or keyword matching

      HR-BREAKER OPTIMIZATION PRINCIPLES:
      - Job-Specific Tailoring: Every suggestion must be tied directly to the target job description
      - Keyword Density: Match 80%+ of critical keywords from the job description
      - ATS-Friendly Formatting: Single-column, clear headers, no tables/graphics
      - Opinionated Length: One page for <5 years experience, two pages for 5+ years (STRICT)
      - No Fluff: Remove generic statements, focus on quantifiable achievements with metrics
      - Hallucination Prevention: Never add skills, tools, or experiences not in the original CV

      BANNED WORDS/PHRASES:
      "Delve," "landscape," "tapestry," "leverage," "spearhead," "paramount," "unlock your potential," "robust," "dynamic," "passionate"

🚨 CRITICAL FORMATTING REQUIREMENT - YOU MUST FOLLOW THIS EXACTLY:
Start EVERY section with this EXACT delimiter format (copy exactly including the five equals signs):

===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====

(your content here)

===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====

(your content here)

...and so on for ALL 6 sections. DO NOT omit these delimiters.

===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====

Include:
- Target Role Class: Functional Testing | Technical Testing | Test Leadership | Niche & Specialty
- 2-sentence alignment assessment grounded in CV evidence
- Job-Specific Keywords Analysis:
  * Critical Keywords Found: List 8-12 high-value keywords present in both CV and JD
  * Critical Keywords Missing: List 6-8 essential JD keywords not in CV (ranked by importance)
  * Keyword Density Score: X/10 (based on coverage of top 20 JD terms)
- ATS Audit (bullets):
  * Formatting Check: Pass/Fail with specific reason
  * Single-Column Layout: Pass/Fail
  * Length Requirement: Pass/Fail (state actual page count vs. recommended)
  * Standard Sections: Pass/Fail (contact, summary, experience, skills, education)
- Minimal Change Score: X/10 (how much the original CV needs to change)

===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====

Generate EXACTLY 5 questions tailored to the target job. For each:
### Question [Number]: [Question Text]
**Target Competency:** [Skill from JD]
**Why This Matters for This Role:** [1 sentence connecting to job requirements]
**STAR Response Guide:**
- Situation: [Context from candidate's CV if available, or suggest relevant scenario]
- Task: [What needed to be accomplished]
- Action: [Specific steps taken - reference actual CV achievements]
- Result: [Quantifiable outcome with metrics]

===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====

Generate EXACTLY 5 technical questions based on the job description's key technical requirements. For each:
### Technical Question [Number]: [Question]
**Domain Focus:** [Specific area from JD]
**Job Requirement Link:** [Which JD requirement this assesses]
**Senior Answer Outline:** 4-6 bullets with trade-offs, tooling, and implementation detail
**CV Evidence:** [If candidate has relevant experience, reference it here]

===== SECTION 4: SKILLS GAP & ACTION PLAN =====

List 4-6 critical gaps between current CV and target job. For each gap include:
- Gap: [Specific skill/experience from JD]
- Current CV Status: [What candidate has or doesn't have]
- Evidence Missing: [Specific examples or metrics not demonstrated]
- Action (specific project/resource/certification): [Concrete, actionable step]
- Timeline: [Realistic timeframe]
- Priority: High/Medium/Low

===== SECTION 5: THE REWRITTEN UK CV =====

CRITICAL FORMATTING RULES:
- Length: ONE PAGE if <5 years experience, TWO PAGES MAX if 5+ years
- Layout: Single column, no tables, no graphics
- Fonts: Arial, Calibri, or Times New Roman only
- Sections: Contact → Summary → Skills → Experience → Education (in this order)
- Minimal Changes: Keep original phrasing where possible
- NO FABRICATION: If information is missing, use [Placeholder]

### HEADER
[Name] | [Specific Role Title - match JD if applicable] | [Certifications]
[Location] | [Phone] | [Email]
[LinkedIn] | [GitHub/Portfolio if in CV]

### PROFESSIONAL SUMMARY
Single paragraph, 4-5 lines. Include years of experience, testing domain aligned with JD keywords, and measurable impact from CV.

### KEY SKILLS (JOB-SPECIFIC)
Organize into categories matching job requirements. Include ONLY skills from original CV or JD:
- **Testing Methodologies:** [Keywords from JD]
- **Test Management & Tools:** [Match JD tools]
- **Technical/Automation Tooling:** [Critical JD requirements]
- **Backend & Data Validation:** [If in JD]
- **Non-Functional & Compliance:** [Performance, security if in JD]
- **Delivery & DevOps:** [CI/CD tools if in JD]

### PROFESSIONAL EXPERIENCE
**[Company from CV]** | [Role from CV] | [Dates from CV]
- **Strategic Impact:** [Original achievement with JD keywords]
- **Technical Achievement:** [Original achievement with metrics, optimized for JD]
- **Quantifiable Result:** [Use actual CV metrics]
- **Process Improvement:** [If in CV, align with JD requirements]

[Repeat for each role - do NOT omit or invent roles]

### EDUCATION & QUALIFICATIONS
- [Degree from CV] | [University] | [Year]
- [Certifications from CV] | [Body] | [Year]

### SIX-SECOND RECRUITER TEST
- Eye-Catching Keywords: List 3-5 top JD keywords
- Identity Clarity: Pass/Fail + 1 sentence
- Metric Visibility: Pass/Fail + 1 sentence
- Length Compliance: Pass/Fail
- Verdict: Pass/Fail with justification

===== SECTION 6: TAILORED UK COVER LETTER =====

Write a complete UK cover letter (250-350 words) tailored to the specific job. If company name is missing, use [Company Name].
Structure:
1) Hook: Reference specific job aspect that aligns with CV strength
2) The Match: 2-3 CV achievements with metrics tied to JD requirements
3) Job-Specific Value Add: How your unique experience solves a problem stated in JD
4) Professional closing with specific call to action

===== END OF RESPONSE =====

CRITICAL INSTRUCTIONS:
1. Every suggestion MUST be grounded in either the CV or JD (no hallucinations)
2. Optimize for the SPECIFIC job - generic advice will be rejected
3. Follow opinionated formatting rules (length, layout, structure)
4. Preserve user's voice and achievements with minimal rewording
5. Stay strictly within the 6 sections above
6. No extra commentary or meta text`
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
      
      debug('✅ Successfully parsed using ===== delimiters');
      debug('Section lengths:', {
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
