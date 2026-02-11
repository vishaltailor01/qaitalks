// HuggingFace AI provider implementation (fallback)
import { HfInference } from '@huggingface/inference';
import { CVGenerationRequest, CVGenerationResponse } from './types';

// Initialize HuggingFace client
const hf = process.env.HUGGINGFACE_API_TOKEN
  ? new HfInference(process.env.HUGGINGFACE_API_TOKEN)
  : null;

export async function generateWithHuggingFace(
  req: CVGenerationRequest
): Promise<CVGenerationResponse> {
  const startTime = Date.now();

  // Check if API token is configured
  if (!process.env.HUGGINGFACE_API_TOKEN || !hf) {
    throw new Error('HuggingFace API token not configured');
  }

  try {
    // Use Microsoft Phi-2 model (free inference API, reliable)
    const model = 'microsoft/phi-2';

    // Construct the prompt
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert career coach and ATS specialist for QA/SDET roles. Analyze resumes and provide structured feedback.<|eot_id|>

<|start_header_id|>user<|end_header_id|>
RESUME:
${req.resume}

TARGET JOB DESCRIPTION:
${req.jobDescription}

Please provide:

1. ATS-OPTIMIZED RESUME SUGGESTIONS:
- Keyword matches and gaps
- Formatting recommendations
- Action verbs to strengthen impact
- Missing technical skills

2. INTERVIEW PREPARATION GUIDE (STAR+ METHOD):
- 3-5 behavioral interview questions
- Framework answers using STAR+ method

3. TECHNICAL DOMAIN QUESTIONS:
- 5-7 scenario-based questions for this role
- Cover automation frameworks, CI/CD, testing strategies

4. SKILLS GAP ANALYSIS:
- 3-5 key missing skills
- Actionable improvement steps
- Relevant certifications/courses
- Priority ranking<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>`;

    // Generate text using HuggingFace Inference API (textGeneration without streaming)
    const response = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        return_full_text: false,
      },
    });

    const fullResponse = response.generated_text;

    // Parse the response into sections
    const sections = parseHuggingFaceResponse(fullResponse);

    return {
      atsResume: sections.atsResume,
      interviewGuide: sections.interviewGuide,
      domainQuestions: sections.domainQuestions,
      gapAnalysis: sections.gapAnalysis,
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
} {
  const sections = {
    atsResume: '',
    interviewGuide: '',
    domainQuestions: '',
    gapAnalysis: '',
  };

  // Try to extract sections using numbered headers
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
