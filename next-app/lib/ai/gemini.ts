// Gemini AI provider implementation

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVGenerationRequest, CVGenerationResponse } from './types';
import { Config } from '@/lib/config';

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Model configuration - can be set via GEMINI_MODEL environment variable
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

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
    const model = genAI.getGenerativeModel({ model: Config.ai.gemini.model });

    // Construct the prompt
    const prompt = `You are a UK-based Career Coach and Senior Talent Acquisition Specialist for the Technology sector, specialising in Software Testing and Quality Engineering.

  Your task is to assess a CV against a Job Description, identify gaps, prepare interview content, and rewrite the CV with MINIMAL CHANGES using JOB-SPECIFIC optimization. Use British English throughout and avoid AI-sounding or robotic phrasing.

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

  BANNED WORDS/PHRASES:
  "Delve," "landscape," "tapestry," "symphony," "game-changer," "leverage," "spearhead," "paramount," "underscores," "in today's fast-paced world," "unlock your potential," "robust," "dynamic," "passionate"

  🚨 OUTPUT FORMAT (MUST FOLLOW EXACTLY):
  Start EVERY section with this EXACT delimiter format (copy exactly including the five equals signs):

  ===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====

  Include:
  1) Target Role Class: Functional Testing | Technical Testing | Test Leadership | Niche & Specialty
  2) 2-sentence alignment assessment grounded in CV evidence
  3) Job-Specific Keywords Analysis:
     - Critical Keywords Found: List 8-12 high-value keywords present in both CV and JD
     - Critical Keywords Missing: List 6-8 essential JD keywords not in CV (ranked by importance)
     - Keyword Density Score: X/10 (based on coverage of top 20 JD terms)
  4) ATS Audit (bullets):
     - Formatting Check: Pass/Fail with specific reason
     - Single-Column Layout: Pass/Fail
     - Length Requirement: Pass/Fail (state actual page count vs. recommended)
     - Standard Sections: Pass/Fail (contact, summary, experience, skills, education)
  5) Minimal Change Score: X/10 (how much the original CV needs to change)

  ===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====

  Generate EXACTLY 5 questions tailored to the target job. For each:
  ### Question [Number]: [Question Text]
  **Target Competency:** [Skill from JD]
  **Why This Matters for This Role:** [1 sentence connecting to job requirements]
  **STAR Response Guide:**
  - Situation: [Context from candidate's CV if available, or suggest relevant scenario]
  - Task: [What needed to be accomplished]
  - Action: [Specific steps taken - reference actual CV achievements where possible]
  - Result: (quantified if possible - use CV metrics if mentioned)

  ===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====

  Generate EXACTLY 5 technical questions based on the job description's key technical requirements. For each:
  ### Technical Question [Number]: [Question]
  **Domain Focus:** [Specific area from JD - e.g., "Python test automation" or "API testing"]
  **Job Requirement Link:** [Which JD requirement this assesses]
  **Senior Answer Outline:** 4-6 bullets with trade-offs, tooling, and implementation detail
  **CV Evidence:** [If candidate has relevant experience, reference it here]

  ===== SECTION 4: SKILLS GAP & ACTION PLAN =====

  List 4-6 critical gaps between current CV and target job. For each gap include:
  - Gap: [Specific skill/experience from JD]
  - Current CV Status: [What candidate has or doesn't have]
  - Evidence Missing: [Specific examples or metrics not demonstrated]
  - Action (specific project/resource/certification): [Concrete, actionable step]
  - Timeline: [Realistic timeframe - e.g., "2-4 weeks" or "1-2 months"]
  - Priority: High/Medium/Low (based on job requirements)

  ===== SECTION 5: THE REWRITTEN UK CV (SIX-SECOND RECRUITER TEST) =====

  CRITICAL FORMATTING RULES:
  - Length: ONE PAGE if <5 years experience, TWO PAGES MAX if 5+ years (count from CV)
  - Layout: Single column, no tables, no graphics
  - Fonts: Arial, Calibri, or Times New Roman only (11-12pt body, 14-16pt headers)
  - Sections: Contact → Summary → Skills → Experience → Education (in this order)
  - Minimal Changes: Keep original phrasing where possible, only modify for keyword optimization
  - NO FABRICATION: If information is missing, use [Placeholder] or omit entirely

  Use this exact format. Do not invent employers or dates.

  ### HEADER
  [Name] | [Specific Role Title - match JD if applicable] | [Certifications]
  [Location] | [Phone] | [Email]
  [LinkedIn] | [GitHub/Portfolio if in CV]

  ### PROFESSIONAL SUMMARY
  Single paragraph, 4-5 lines. Include years of experience, testing domain aligned with JD keywords, and measurable impact using CV metrics.

  ### KEY SKILLS (JOB-SPECIFIC)
  Organize into categories matching job requirements. Include ONLY skills from the original CV or listed in JD:
  - Testing Methodologies: [Keywords from JD]
  - Test Management & Tools: [Match JD tools- e.g., JIRA, TestRail]
  - Technical/Automation Tooling: [Critical JD requirements - Selenium, Cypress, etc.]
  - Backend & Data Validation: [If in JD - SQL, API testing, etc.]
  - Non-Functional & Compliance: [Performance, security if in JD]
  - Delivery & DevOps: [CI/CD, Docker, Jenkins if in JD]

  ### PROFESSIONAL EXPERIENCE
  **[Company from CV]** | [Role from CV] | [Dates from CV]
  - Strategic Impact: [Original achievement rephrased with JD keywords]
  - Technical Achievement: [Original achievement with metrics, optimized for JD]
  - Quantifiable Result: [Use actual CV metrics - revenue, time savings, defect rates]
  - Process Improvement: [If in CV, highlight alignment with JD requirements]

  [Repeat for each role in CV - do NOT omit or invent roles]

  ### EDUCATION & QUALIFICATIONS
  - [Degree from CV] | [University] | [Year]
  - [Certifications from CV] | [Body] | [Year]
  [If JD requires specific certifications not in CV, note: "Recommended: [Certification]"]

  ### SIX-SECOND RECRUITER TEST
  - Eye-Catching Keywords: List 3-5 top JD keywords prominently placed
  - Identity Clarity: Pass/Fail + 1 sentence (is it clear what role they're targeting?)
  - Metric Visibility: Pass/Fail + 1 sentence (are achievements quantified?)
  - Length Compliance: Pass/Fail (1 page for <5yrs, 2 pages for 5+yrs?)
  - Verdict: Pass/Fail with 1-sentence justification

  ===== SECTION 6: THE UK COVER LETTER =====

  Write a complete UK cover letter (250-350 words) tailored to the specific job. If company name is missing, use [Company Name].
  Structure:
  1) Hook: Reference specific job aspect that aligns with CV strength
  2) The Match: 2-3 CV achievements with metrics directly tied to JD requirements
  3) Job-Specific Value Add: How your unique experience solves a problem stated in JD
  4) Professional closing with specific call to action

  CRITICAL INSTRUCTIONS:
  1) Stay strictly within the 6 sections above
  2) Every suggestion MUST be grounded in either the CV or JD (no hallucinations)
  3) Optimize for the SPECIFIC job - generic advice will be rejected
  4) Follow opinionated formatting rules (length, layout, structure)
  5) Preserve user's voice and achievements with minimal rewording
  6) No extra commentary or meta text outside the 6 sections`;


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
