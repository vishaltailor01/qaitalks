// Hallucination/Fabrication Detection Validator for CV Review Tool
// Detects invented skills, employers, tools, or dates not present in original CV

import { CVGenerationRequest, CVGenerationResponse } from './types';

export interface HallucinationIssue {
  type: 'skill' | 'employer' | 'tool' | 'date' | 'other';
  value: string;
  section: string;
  reason: string;
}

/**
 * Extracts all skills, employers, tools, and dates from a CV string
 * Returns sets for comparison
 */
export function extractEntitiesFromCV(cvText: string) {
  // Simple regex-based extraction (can be improved with NLP)
  const skills = new Set<string>();
  const employers = new Set<string>();
  const tools = new Set<string>();
  const dates = new Set<string>();

  // Example: extract years, months, company names, tool names
  // TODO: Replace with domain-specific lists or NLP
  const skillRegex = /\b(Java|Python|Selenium|Cypress|JIRA|TestRail|CI\/CD|Docker|Jenkins|SQL|API|Performance|Security|DevOps)\b/gi;
  const employerRegex = /\b(?:at|for) ([A-Z][a-zA-Z0-9& ]{2,})\b/g;
  const toolRegex = /\b(Selenium|Cypress|JIRA|TestRail|Docker|Jenkins|Git|SQL|API)\b/gi;
  const dateRegex = /\b(\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g;

  for (const match of cvText.matchAll(skillRegex)) skills.add(match[1]);
  for (const match of cvText.matchAll(employerRegex)) employers.add(match[1]);
  for (const match of cvText.matchAll(toolRegex)) tools.add(match[1]);
  for (const match of cvText.matchAll(dateRegex)) dates.add(match[1]);

  return { skills, employers, tools, dates };
}

/**
 * Checks AI output for hallucinated entities not found in original CV
 * Returns list of issues
 */
export function detectHallucinations(
  cvRequest: CVGenerationRequest,
  aiResponse: CVGenerationResponse
): HallucinationIssue[] {
  const { skills, employers, tools, dates } = extractEntitiesFromCV(cvRequest.resume);
  const issues: HallucinationIssue[] = [];

  // Check each section for invented entities
  for (const sectionName in aiResponse.sections) {
    const sectionText = aiResponse.sections[sectionName];
    // Skills
    for (const match of sectionText.matchAll(/\b(Java|Python|Selenium|Cypress|JIRA|TestRail|CI\/CD|Docker|Jenkins|SQL|API|Performance|Security|DevOps)\b/gi)) {
      if (!skills.has(match[1])) {
        issues.push({
          type: 'skill',
          value: match[1],
          section: sectionName,
          reason: 'Skill not found in original CV',
        });
      }
    }
    // Employers
    for (const match of sectionText.matchAll(/\b(?:at|for) ([A-Z][a-zA-Z0-9& ]{2,})\b/g)) {
      if (!employers.has(match[1])) {
        issues.push({
          type: 'employer',
          value: match[1],
          section: sectionName,
          reason: 'Employer not found in original CV',
        });
      }
    }
    // Tools
    for (const match of sectionText.matchAll(/\b(Selenium|Cypress|JIRA|TestRail|Docker|Jenkins|Git|SQL|API)\b/gi)) {
      if (!tools.has(match[1])) {
        issues.push({
          type: 'tool',
          value: match[1],
          section: sectionName,
          reason: 'Tool not found in original CV',
        });
      }
    }
    // Dates
    for (const match of sectionText.matchAll(/\b(\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g)) {
      if (!dates.has(match[1])) {
        issues.push({
          type: 'date',
          value: match[1],
          section: sectionName,
          reason: 'Date not found in original CV',
        });
      }
    }
  }

  return issues;
}
