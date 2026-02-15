// Gemini AI Streaming Implementation (Phase 1 - Completion)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HfInference } from '@huggingface/inference';
import { CVGenerationRequest } from './types';
import { Config, OptimizationModes, SectionMarkers } from '../config';
import { UK_RECRUITMENT_STANDARDS, getRoleContext } from './knowledge-pool';
import { formatInterviewQuestion } from './utils';

const genAI = Config.ai.gemini.enabled
  ? new GoogleGenerativeAI(Config.ai.gemini.apiKey)
  : null;

const hf = Config.ai.huggingface.enabled
  ? new HfInference(Config.ai.huggingface.apiToken)
  : null;

const isDev = process.env.NODE_ENV === 'development';
const debug = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

/**
 * Check if error is quota exceeded (429) or model not found (404)
 * Both should trigger HuggingFace fallback
 */
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('429') ||
      error.message.includes('404') ||
      error.message.includes('Not Found') ||
      error.message.includes('not found') ||
      error.message.includes('quota') ||
      error.message.includes('Too Many Requests') ||
      error.message.includes('exceeded')
    );
  }
  return false;
}

// Section markers for progressive parsing (from config)
const SECTION_MARKERS = SectionMarkers.markers;

interface StreamChunk {
  type: 'section' | 'progress' | 'complete' | 'error';
  sectionNumber?: number;
  sectionName?: string;
  content?: string;
  fullText?: string;
  progress?: number;
  error?: string;
  sections?: Record<string, string>; // Section map for complete chunks
}

/**
 * Helper to build HuggingFace prompt with HR-Breaker principles
 */
function buildPromptForHuggingFace(req: CVGenerationRequest): string {
  const roleContext = req.targetRole ? ` with deep expertise in ${req.targetRole} roles` : '';
  const industryContext = req.industry ? ` within the ${req.industry} industry` : '';
  const domainText = req.targetRole || 'Software Testing and Quality Engineering';

  // Optimization mode guidance
  const optimizationGuidance = {
    minimal: 'with MINIMAL CHANGES - preserve the user\'s original voice, style, and phrasing. Only modify when absolutely necessary for ATS optimization.',
    balanced: 'with BALANCED optimization - moderate rewriting for clarity and keyword matching while maintaining professional tone.',
    aggressive: 'with AGGRESSIVE optimization - extensive rewriting for maximum ATS score and keyword density.',
  };

  const modeInstruction = optimizationGuidance[req.optimizationMode || 'minimal'];
  const userInstructionsText = req.userInstructions
    ? `\n\nUSER'S CUSTOM INSTRUCTIONS:\n${req.userInstructions}\n(Follow these instructions when optimizing the CV)`
    : '';

  const selectedRole = req.targetRole || 'Manual';
  const context = getRoleContext(selectedRole);

  return `You are a UK-based Career Coach and Senior Talent Acquisition Specialist for the Technology sector${roleContext}${industryContext}, specialising in the ${domainText} domain.

UK RECRUITMENT STANDARDS (MANDATORY):
${UK_RECRUITMENT_STANDARDS}

ROLE-SPECIFIC DOMAIN KNOWLEDGE (QA):
${context.domainKnowledge}

GOLDEN SAMPLE (ROLE-SPECIFIC):
Before: ${context.resumeSample.before}
After: ${context.resumeSample.after}

INTERVIEW PREP GUIDANCE:
${(context.interviewPrep.technical || []).slice(0, 2).map(formatInterviewQuestion).join('\n')}
${(context.interviewPrep.behavioural || []).slice(0, 1).map(formatInterviewQuestion).join('\n')}

Your task is to assess a CV against a Job Description, identify gaps, prepare interview content, and rewrite the CV ${modeInstruction} Use British English throughout and avoid AI-sounding or robotic phrasing.${userInstructionsText}

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

HR-BREAKER OPTIMIZATION PRINCIPLES:
- Job-Specific Tailoring: Every suggestion must be directly tied to the target job description
- Keyword Density: Match 80%+ of critical keywords from the job description
- ATS-Friendly Formatting: Single-column, clear headers, no tables/graphics, standard fonts
- Opinionated Length: One page for <5 years experience, two pages for 5+ years (STRICT)
- No Fluff: Remove generic statements, focus on quantifiable achievements with metrics
- Hallucination Prevention: Never add skills, tools, or experiences not in the original CV

BANNED WORDS/PHRASES:
"Delve," "landscape," "tapestry," "symphony," "game-changer," "leverage," "spearhead," "paramount," "underscores," "in today's fast-paced world," "unlock your potential," "robust," "dynamic," "passionate"

🚨 OUTPUT FORMAT (MANDATORY: include double newlines before and after each section header):

===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====
(Include: Target Role Class, Alignment Assessment, Job-Specific Keywords Analysis with Critical Keywords Found/Missing and Keyword Density Score X/10, ATS Audit with Pass/Fail checks, Minimal Change Score X/10)

===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====
(Generate EXACTLY 5 questions with Target Competency, Why This Matters, and STAR Response Guide)

===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====
(Generate EXACTLY 5 technical questions with Domain Focus, Job Requirement Link, Senior Answer Outline, and CV Evidence)

===== SECTION 4: SKILLS GAP & ACTION PLAN =====
(List 4-6 critical gaps with Gap, Current CV Status, Evidence Missing, Action, Timeline, and Priority)

===== SECTION 5: THE REWRITTEN UK CV (SIX-SECOND RECRUITER TEST) =====
(Format: Contact → Summary → Skills → Experience → Education. Length: ONE PAGE if <5 years, TWO PAGES MAX if 5+ years. Single column, no tables/graphics, standard fonts. NO FABRICATION.)

===== SECTION 6: THE UK COVER LETTER =====
(Professional, tailored to JD, British English, 3-4 paragraphs max)

Generate all 6 sections using the exact headings above. Include keyword analysis, gaps, evidence-based assessments, and follow the optimization mode guidance.`;
}

/**
 * Generate CV review with streaming support
 * Returns an async generator that yields chunks as they arrive
 */
export async function* streamGeminiGeneration(
  req: CVGenerationRequest
): AsyncGenerator<StreamChunk> {
  debug('[DEBUG Backend] streamGeminiGeneration called with:', {
    resumeLength: req.resume?.length,
    jobDescriptionLength: req.jobDescription?.length,
    targetRole: req.targetRole,
    optimizationMode: req.optimizationMode,
  });

  if (!Config.ai.gemini.enabled || !genAI) {
    console.error('[DEBUG Backend] Gemini API key not configured!');
    yield { type: 'error', error: 'Gemini API key not configured' };
    return;
  }

  debug('[DEBUG Backend] Gemini API key found, initializing model...');
  try {
    const model = genAI.getGenerativeModel({ model: Config.ai.gemini.model });

    // Build role-specific context
    const roleContext = req.targetRole ? ` with deep expertise in ${req.targetRole} roles` : '';
    const industryContext = req.industry ? ` within the ${req.industry} industry` : '';
    const domainText = req.targetRole || 'Software Testing and Quality Engineering';

    // Optimization mode guidance (from config)
    const mode = req.optimizationMode || 'minimal';
    const modeInstruction = OptimizationModes[mode].guidance;
    const userInstructionsText = req.userInstructions
      ? `\n\nUSER'S CUSTOM INSTRUCTIONS:\n${req.userInstructions}\n(Follow these instructions when optimizing the CV)`
      : '';

    // Fetch role-specific context using the dynamic knowledge pool
    const selectedRole = req.targetRole || 'Manual';
    const context = getRoleContext(selectedRole);

    const formatInterview = (q: any) => `- ${q.focus || q.competency}: ${q.question}\n  - Guide: ${q.answer_outline || q.star_guide}`;

    // Enhanced prompt with strict formatting rules and Knowledge Pool integration
    const prompt = `You are an expert UK Career Coach and Technical Recruiter. Your task is to review a CV against a JD and provide high-accuracy, UK-standard feedback.
    
    OPTIMIZATION MODE: ${modeInstruction}

    UK RECRUITMENT STANDARDS (MANDATORY):
    ${UK_RECRUITMENT_STANDARDS}

    ROLE-SPECIFIC DOMAIN KNOWLEDGE (QA - ${selectedRole}):
    ${context.domainKnowledge}

    FEW-SHOT GOLDEN SAMPLE (ROLE-SPECIFIC):
    Before: ${context.resumeSample.before}
    After: ${context.resumeSample.after}

    GOLDEN JD FOR BENCHMARKING (IF APPLICABLE):
    ${context.goldenJD ? JSON.stringify(context.goldenJD, null, 2) : 'Use user-provided JD only'}

    CURATED INTERVIEW KNOWLEDGE:
    ${context.interviewPrep.technical.slice(0, 3).map(formatInterview).join('\n')}
    ${context.interviewPrep.behavioural.slice(0, 2).map(formatInterview).join('\n')}

    RESUME:
    ${req.resume}

    JD:
    ${req.jobDescription}${userInstructionsText}

    🚨 OUTPUT FORMAT (MANDATORY: include double newlines before and after each section header):

    ===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====

    ===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====

    ===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====

    ===== SECTION 4: SKILLS GAP & ACTION PLAN =====

    ===== SECTION 5: THE REWRITTEN UK CV =====

    ===== SECTION 6: THE UK COVER LETTER =====

    ===== SECTION 7: SIX-SECOND RECRUITER TEST =====

    🚨 CRITICAL RULES:
    - DO NOT include meta-talk, preambles, or "formatting notes" (e.g., "*(Formatting notes: ...)*").
    - For Section 5 (Optimized CV):
        1. Start directly with the Name and Contact Information.
        2. Ensure a clear horizontal divider (---) or double newlines before "Professional Summary".
        3. Ensure the Professional Summary starts with a distinct bold title "**PROFESSIONAL SUMMARY**".
        4. NEVER merge Contact Info and Summary into the same paragraph.
    - Use British English exclusively.
    - Use GFM tables for the Skills Gap section.
    - NEVER include summaries like "CV Rewrite: ..." or "Cover Letter: ..." at the end of sections. Stop exactly when the document is finished.`;

    // Start streaming
    debug('[DEBUG Backend] Starting Gemini stream generation...');
    const result = await model.generateContentStream(prompt);
    debug('[DEBUG Backend] Stream initialized, waiting for chunks...');

    let accumulatedText = '';
    let lastSectionFound = 0;
    let chunkCount = 0;
    // Section mapping for hallucination detection
    const sectionMap: { [section: string]: string } = {};

    // Stream chunks as they arrive
    for await (const chunk of result.stream) {
      chunkCount++;
      const chunkText = chunk.text();
      accumulatedText += chunkText;

      // Log EVERY chunk for debugging
      console.log(`[DEBUG Backend] Received chunk ${chunkCount}:`, chunkText);

      if (chunkCount % 10 === 0) {
        debug(`[DEBUG Backend] Received ${chunkCount} chunks, ${accumulatedText.length} chars total`);
      }

      // Calculate progress (rough estimate based on text length)
      // Target: ~3000-5000 chars total
      const estimatedProgress = Math.min(
        Math.round((accumulatedText.length / 4000) * 100),
        95
      );

      // Check if we've reached a new section
      for (let i = lastSectionFound; i < SECTION_MARKERS.length; i++) {
        if (accumulatedText.includes(SECTION_MARKERS[i])) {
          const sectionNumber = i + 1;
          const sectionNames = [
            'Strategic Role Analysis & ATS Optimisation',
            'Behavioural & Soft Skills Interview Questions',
            'Domain-Specific Technical Interview Questions',
            'Skills Gap & Action Plan',
            'The Rewritten UK CV',
            'The UK Cover Letter',
            'Six-Second Recruiter Test',
          ];

          // Extract section content up to next marker or end
          const startIdx = accumulatedText.indexOf(SECTION_MARKERS[i]);
          const nextMarkerIdx = i < SECTION_MARKERS.length - 1
            ? accumulatedText.indexOf(SECTION_MARKERS[i + 1])
            : -1;

          const sectionContent =
            nextMarkerIdx > 0
              ? accumulatedText.substring(startIdx, nextMarkerIdx).trim()
              : accumulatedText.substring(startIdx).trim();

          // Add to section map
          sectionMap[sectionNames[i]] = sectionContent;

          yield {
            type: 'section',
            sectionNumber,
            sectionName: sectionNames[i],
            content: sectionContent,
            progress: estimatedProgress,
          };

          lastSectionFound = i + 1;
        }
      }

      // Yield progress updates every 5 chunks
      if (chunkCount % 5 === 0) {
        yield {
          type: 'progress',
          progress: estimatedProgress,
        };
      }
    }

    // Final completion
    debug('[DEBUG Backend] Gemini streaming complete:', {
      totalChunks: chunkCount,
      textLength: accumulatedText.length,
      sectionsCount: Object.keys(sectionMap).length,
      sectionKeys: Object.keys(sectionMap),
      firstMarkerFound: accumulatedText.includes('===== SECTION 1:'),
      previewText: accumulatedText.substring(0, 200),
    });
    yield {
      type: 'complete',
      fullText: accumulatedText,
      progress: 100,
      sections: sectionMap,
    };
  } catch (error) {
    console.error('[DEBUG Backend] Gemini streaming error:', error);
    console.error('[DEBUG Backend] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check if quota exceeded or model not available - fallback to HuggingFace
    if (isQuotaExceededError(error)) {
      debug('[DEBUG Backend] Gemini API unavailable (quota/model not found), falling back to HuggingFace...');

      if (hf && Config.ai.huggingface.enabled) {
        try {
          // Use HuggingFace chat completion as fallback (not text-generation)
          const hfResult = await hf.chatCompletion({
            model: Config.ai.huggingface.model,
            messages: [
              {
                role: 'system' as const,
                content: 'You are an expert Career Coach and Senior Talent Acquisition Specialist for the UK Technology sector, specialising in Software Testing and Quality Engineering. Use British English exclusively and write in a natural, human consultant tone.'
              },
              {
                role: 'user' as const,
                content: buildPromptForHuggingFace(req)
              }
            ],
            max_tokens: 8000,
            temperature: 0.7,
          });

          // Stream HuggingFace response in chunks
          const text = hfResult.choices?.[0]?.message?.content || '';
          if (text) {
            const chunkSize = 500; // 500 char chunks

            for (let i = 0; i < text.length; i += chunkSize) {
              const chunk = text.slice(i, i + chunkSize);
              yield {
                type: 'progress',
                content: chunk,
                progress: Math.min(Math.round((i / text.length) * 100), 95),
              };
            }

            // Final completion
            yield {
              type: 'complete',
              fullText: text,
              progress: 100,
            };
          }
        } catch (hfError) {
          console.error('HuggingFace fallback error:', hfError);
          yield {
            type: 'error',
            error: `Gemini quota exceeded and HuggingFace fallback failed: ${hfError instanceof Error ? hfError.message : 'Unknown error'}`,
          };
        }
      } else {
        yield {
          type: 'error',
          error: 'Gemini quota exceeded. HuggingFace fallback not configured. Please enable billing on your Google account or add HuggingFace token.',
        };
      }
    } else {
      // Non-quota error
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown streaming error',
      };
    }
  }
}

/**
 * Clean AI response to remove hallucinated site elements (Navbar, duplicate status, etc.)
 */
function cleanAIResponse(text: string): string {
  if (!text) return '';

  return text
    .split('\n')
    // Nuclear: Strip any line that contains our section title keywords
    .filter(line => {
      const upperLine = line.toUpperCase();
      const isTitleLine =
        upperLine.includes('STRATEGIC ROLE ANALYSIS') ||
        upperLine.includes('ATS OPTIMISATION') ||
        upperLine.includes('BEHAVIOURAL') ||
        upperLine.includes('SOFT SKILLS') ||
        upperLine.includes('TECHNICAL QUESTIONS') ||
        upperLine.includes('DOMAIN-SPECIFIC') ||
        upperLine.includes('SKILLS GAP') ||
        upperLine.includes('ACTION PLAN') ||
        upperLine.includes('REWRITTEN UK CV') ||
        upperLine.includes('SIX-SECOND') ||
        upperLine.includes('UK COVER LETTER') ||
        upperLine.includes('FORMATTING NOTE') ||
        upperLine.includes('NOTES:') ||
        (upperLine.includes('SECTION') && /\d+/.test(upperLine) && upperLine.includes('====='));

      // Also strip lines that are purely markers (e.g., "=====")
      const isPureMarker = /^[\s*=*\-*#*]*$/.test(line) && line.length > 5;

      return !isTitleLine && !isPureMarker;
    })
    .join('\n')
    // Remove hallucinated Navbar links
    .replace(/Curriculum\s+About\s+Blog\s+🤖\s+CV\s+Review/gi, '')
    .replace(/Sign\s+In|Sign\s+Out|User\s+Profile/gi, '')
    // Remove trailing remnants
    .replace(/^[\s*=*\n]*/, '')
    .replace(/[\s*=*\n]*$/, '')
    .trim();
}

/**
 * Parse complete text into structured sections (fallback for complete response)
 */
export function parseStreamedResponse(text: string): {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
  optimizedCV: string;
  coverLetter: string;
  sixSecondTest: string;
} {
  const sections = {
    atsResume: '',
    interviewGuide: '',
    domainQuestions: '',
    gapAnalysis: '',
    optimizedCV: '',
    coverLetter: '',
    sixSecondTest: '',
  };

  // Helper to extract content between sections
  const extractSection = (num: number, nextNum: number | null) => {
    // Regex to match the section header line
    // Extremely Lenient: Matches SECTION X with any leading/trailing symbols, handles HuggingFace bolding
    const startPattern = new RegExp(`(?:[\\r\\n]|^)[\\s*#=-]*SECTION\\s+${num}[:\\-]?.*?(?:[\\r\\n]|$)`, 'i');
    const endPattern = nextNum
      ? new RegExp(`(?:[\\r\\n]|^)[\\s*#=-]*SECTION\\s+${nextNum}[:\\-]?`, 'i')
      : null;

    const startMatch = text.match(startPattern);
    if (!startMatch || startMatch.index === undefined) return '';

    const startContentIndex = startMatch.index + startMatch[0].length;
    let content = '';

    if (endPattern) {
      const endMatch = text.match(endPattern);
      if (endMatch && endMatch.index !== undefined && endMatch.index > startContentIndex) {
        content = text.substring(startContentIndex, endMatch.index);
      } else {
        content = text.substring(startContentIndex);
      }
    } else {
      content = text.substring(startContentIndex);
    }

    return cleanAIResponse(content);
  };

  sections.atsResume = extractSection(1, 2);
  sections.interviewGuide = extractSection(2, 3);
  sections.domainQuestions = extractSection(3, 4);
  sections.gapAnalysis = extractSection(4, 5);
  sections.optimizedCV = extractSection(5, 6);
  sections.coverLetter = extractSection(6, 7);
  sections.sixSecondTest = extractSection(7, null);

  // Log parsed sections for debugging
  console.log('[DEBUG Backend] Parsed sections with improved logic:', {
    section1Len: sections.atsResume.length,
    section2Len: sections.interviewGuide.length,
    section3Len: sections.domainQuestions.length,
    section4Len: sections.gapAnalysis.length,
    section5Len: sections.optimizedCV.length,
    section6Len: sections.coverLetter.length,
  });

  return sections;
}

/**
 * Extract keywords from response text
 */
export function extractKeywordsFromStream(text: string): string[] {
  const keywords: string[] = [];

  // Extract technical keywords
  const techKeywords = text.match(/\b(?:[A-Z][a-z]+(?:[A-Z][a-z]+)*|API|CI\/CD|REST|SQL|AWS|Azure|Git|Docker|Kubernetes|Jenkins|Python|Java|JavaScript|TypeScript|Selenium|Cypress|JUnit|TestNG|Agile|Scrum|JIRA|ISTQB)\b/g);

  if (techKeywords) {
    keywords.push(...techKeywords);
  }

  return [...new Set(keywords)].slice(0, 10);
}
