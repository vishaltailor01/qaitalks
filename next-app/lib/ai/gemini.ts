// Gemini AI provider implementation
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVGenerationRequest, CVGenerationResponse } from './types';

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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
    // Use Gemini 1.5 Flash (latest stable version)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Construct the prompt
    const prompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist for QA/SDET roles. 

RESUME:
${req.resume}

TARGET JOB DESCRIPTION:
${req.jobDescription}

Please analyze the resume against the job description and provide the following four sections:

1. ATS-OPTIMIZED RESUME SUGGESTIONS:
- List 5-7 keyword matches and gaps
- Provide specific formatting recommendations
- Suggest action verbs to strengthen impact
- Identify missing technical skills mentioned in job description

2. INTERVIEW PREPARATION GUIDE (STAR+ METHOD):
- Create 3-5 behavioral interview questions based on the candidate's experience
- For each question, provide:
  * The question
  * Why it might be asked
  * A framework answer using STAR+ method (Situation, Task, Action, Result, Plus Learning/Impact)

3. TECHNICAL DOMAIN QUESTIONS:
- Generate 5-7 technical scenario-based questions specific to this role
- Include questions about:
  * Test automation frameworks mentioned in job description
  * CI/CD pipeline and DevOps practices
  * Testing strategies and methodologies
  * Tools and technologies listed in requirements

4. SKILLS GAP ANALYSIS:
- List 3-5 key skills from job description missing or weak in resume
- Provide actionable steps to acquire/improve each skill
- Suggest relevant certifications or courses
- Prioritize skills by importance for the role

Format your response clearly with headers and bullet points. Be specific and actionable.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the response into sections
    const sections = parseGeminiResponse(text);

    return {
      atsResume: sections.atsResume,
      interviewGuide: sections.interviewGuide,
      domainQuestions: sections.domainQuestions,
      gapAnalysis: sections.gapAnalysis,
      provider: 'gemini',
      generationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate CV review with Gemini');
  }
}

// Parse Gemini response into structured sections
function parseGeminiResponse(text: string): {
  atsResume: string;
  interviewGuide: string;
  domainQuestions: string;
  gapAnalysis: string;
} {
  // Try to extract sections using headers
  const sections = {
    atsResume: '',
    interviewGuide: '',
    domainQuestions: '',
    gapAnalysis: '',
  };

  // Split by numbered sections or headers
  const atsMatch = text.match(/1\.\s*ATS[^]*?(?=2\.|$)/i);
  const interviewMatch = text.match(/2\.\s*INTERVIEW[^]*?(?=3\.|$)/i);
  const domainMatch = text.match(/3\.\s*TECHNICAL[^]*?(?=4\.|$)/i);
  const gapMatch = text.match(/4\.\s*SKILLS[^]*?$/i);

  sections.atsResume = atsMatch ? atsMatch[0].trim() : extractSection(text, 0, 0.25);
  sections.interviewGuide = interviewMatch ? interviewMatch[0].trim() : extractSection(text, 0.25, 0.5);
  sections.domainQuestions = domainMatch ? domainMatch[0].trim() : extractSection(text, 0.5, 0.75);
  sections.gapAnalysis = gapMatch ? gapMatch[0].trim() : extractSection(text, 0.75, 1);

  return sections;
}

// Fallback: extract section by approximate position
function extractSection(text: string, startRatio: number, endRatio: number): string {
  const start = Math.floor(text.length * startRatio);
  const end = Math.floor(text.length * endRatio);
  return text.substring(start, end).trim() || 'Section could not be parsed. Please review full response.';
}
