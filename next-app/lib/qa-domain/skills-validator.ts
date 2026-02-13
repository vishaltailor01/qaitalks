/**
 * QA Skills Validator
 * Extracts, validates, and analyzes QA-specific skills from CVs
 */

import { QARole } from './roles';

export interface SkillAssessment {
  skill: string;
  found: boolean;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidenceText?: string;
  recommendation?: string;
}

export interface QASkillsReport {
  role: QARole;
  coreSkillsAssessment: SkillAssessment[];
  toolsAssessment: SkillAssessment[];
  certificationsFound: string[];
  certificationGaps: string[];
  qaKeywordsFound: string[];
  overallReadiness: number; // 0-100
  strengths: string[];
  criticalGaps: string[];
  recommendations: string[];
}

/**
 * Extract all text content from CV
 */
function extractTextFromCV(cvContent: string): string {
  return cvContent.toLowerCase();
}

/**
 * Detect proficiency level based on context keywords
 */
function detectProficiencyLevel(text: string, skill: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const skillPattern = new RegExp(`(${skill})([^.]*?)(?:\\.|,|$)`, 'i');
  const match = text.match(skillPattern);
  
  if (!match) return 'beginner';
  
  const context = match[2].toLowerCase();
  
  // Expert indicators
  if (context.includes('expert') || context.includes('mastered') || context.includes('sme')) {
    return 'expert';
  }
  
  // Advanced indicators
  if (context.includes('advanced') || context.includes('designed') || context.includes('architected') || context.includes('led')) {
    return 'advanced';
  }
  
  // Intermediate indicators
  if (context.includes('developed') || context.includes('created') || context.includes('built')) {
    return 'intermediate';
  }
  
  // Beginner indicators
  if (context.includes('learning') || context.includes('familiar') || context.includes('basic')) {
    return 'beginner';
  }
  
  return 'intermediate';
}

/**
 * Find evidence of a skill in CV text
 */
function findSkillEvidence(text: string, skill: string): string | undefined {
  const pattern = new RegExp(`([^.]*${skill}[^.]*\\.)`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : undefined;
}

/**
 * Assess core skills against CV
 */
export function assessCoreSkills(cvText: string, role: QARole): SkillAssessment[] {
  return role.coreSkills.map((skill) => {
    const lowerCvText = extractTextFromCV(cvText);
    const skillKeywords = skill.toLowerCase().split(' ');
    
    const found = skillKeywords.some((keyword) =>
      lowerCvText.includes(keyword)
    );
    
    const proficiencyLevel = found ? detectProficiencyLevel(lowerCvText, skill) : 'beginner';
    const evidenceText = found ? findSkillEvidence(lowerCvText, skill) : undefined;
    
    let recommendation = '';
    if (!found) {
      recommendation = `Add evidence of ${skill} experience. Include specific projects or achievements demonstrating this skill.`;
    } else if (proficiencyLevel === 'beginner') {
      recommendation = `Upgrade descriptions of ${skill} from basic to intermediate level. Add metrics and impact.`;
    } else if (proficiencyLevel === 'intermediate') {
      recommendation = `Elevate ${skill} descriptions to advanced level. Highlight leadership or technical depth.`;
    }
    
    return {
      skill,
      found,
      proficiencyLevel: found ? proficiencyLevel : 'beginner',
      evidenceText,
      recommendation,
    };
  });
}

/**
 * Assess tools against CV
 */
export function assessTools(cvText: string, role: QARole): SkillAssessment[] {
  return role.technicalTools.map((tool) => {
    const lowerCvText = extractTextFromCV(cvText);
    const toolKeywords = tool.toLowerCase().split(/\s+(?:and|&|\()?/);
    
    const found = toolKeywords.some((keyword) =>
      lowerCvText.includes(keyword.replace(/[()]/g, ''))
    );
    
    const proficiencyLevel = found ? detectProficiencyLevel(lowerCvText, tool) : 'beginner';
    const evidenceText = found ? findSkillEvidence(lowerCvText, tool) : undefined;
    
    return {
      skill: tool,
      found,
      proficiencyLevel: found ? proficiencyLevel : 'beginner',
      evidenceText,
      recommendation: found ? undefined : `Add hands-on experience with ${tool}`,
    };
  });
}

/**
 * Find certifications mentioned in CV
 */
export function findCertifications(cvText: string, role: QARole): { found: string[]; gaps: string[] } {
  const lowerCvText = extractTextFromCV(cvText);
  
  const found = role.certifications.filter((cert) =>
    lowerCvText.includes(cert.toLowerCase().replace(/[()]/g, ''))
  );
  
  const gaps = role.certifications.filter((cert) =>
    !lowerCvText.includes(cert.toLowerCase().replace(/[()]/g, ''))
  );
  
  return { found, gaps };
}

/**
 * Find QA keywords in CV
 */
export function findQAKeywords(cvText: string, role: QARole): string[] {
  const lowerCvText = extractTextFromCV(cvText);
  return role.keywords.filter((keyword) =>
    lowerCvText.includes(keyword.toLowerCase())
  );
}

/**
 * Calculate readiness score
 */
export function calculateReadinessScore(
  coreSkillsAssessment: SkillAssessment[],
  toolsAssessment: SkillAssessment[],
  certificationsFound: string[],
  role: QARole
): number {
  let score = 0;
  
  // Core skills: 50% weight
  const coreSkillsFound = coreSkillsAssessment.filter((s) => s.found).length;
  const coreSkillsPercentage = (coreSkillsFound / coreSkillsAssessment.length) * 100;
  score += coreSkillsPercentage * 0.5;
  
  // Tools: 30% weight
  const toolsFound = toolsAssessment.filter((s) => s.found).length;
  const toolsPercentage = (toolsFound / toolsAssessment.length) * 100;
  score += toolsPercentage * 0.3;
  
  // Proficiency levels: 10% weight
  const proficiencyScore = calculateProficiencyScore(coreSkillsAssessment, toolsAssessment);
  score += proficiencyScore * 0.1;
  
  // Certifications: 10% weight
  const certScore = (certificationsFound.length / role.certifications.length) * 100;
  score += Math.min(certScore, 100) * 0.1;
  
  return Math.round(score);
}

/**
 * Calculate proficiency score based on skill levels
 */
function calculateProficiencyScore(
  coreSkillsAssessment: SkillAssessment[],
  toolsAssessment: SkillAssessment[]
): number {
  const allAssessments = [...coreSkillsAssessment, ...toolsAssessment];
  
  const proficiencyWeights: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  
  const totalWeight = allAssessments.reduce((sum, assessment) => {
    const weight = proficiencyWeights[assessment.proficiencyLevel || 'beginner'] || 0;
    return sum + weight;
  }, 0);
  
  return allAssessments.length > 0 ? totalWeight / allAssessments.length : 0;
}

/**
 * Identify strengths based on assessments
 */
export function identifyStrengths(
  coreSkillsAssessment: SkillAssessment[],
  toolsAssessment: SkillAssessment[],
  qaKeywordsFound: string[]
): string[] {
  const strengths: string[] = [];
  
  // High proficiency skills
  const advancedSkills = coreSkillsAssessment
    .filter((s) => s.proficiencyLevel === 'advanced' || s.proficiencyLevel === 'expert')
    .map((s) => s.skill);
  
  if (advancedSkills.length > 0) {
    strengths.push(`Advanced expertise in ${advancedSkills.slice(0, 2).join(' and ')}`);
  }
  
  // Tools proficiency
  const advancedTools = toolsAssessment
    .filter((s) => s.proficiencyLevel === 'advanced' || s.proficiencyLevel === 'expert')
    .map((s) => s.skill);
  
  if (advancedTools.length > 0) {
    strengths.push(`Strong hands-on experience with ${advancedTools.slice(0, 2).join(', ')}`);
  }
  
  // QA-specific knowledge
  if (qaKeywordsFound.length >= 5) {
    strengths.push(`Solid QA domain knowledge (${qaKeywordsFound.length}+ key concepts)`);
  }
  
  return strengths;
}

/**
 * Identify critical gaps
 */
export function identifyCriticalGaps(
  coreSkillsAssessment: SkillAssessment[],
  toolsAssessment: SkillAssessment[],
  certificationsFound: string[]
): string[] {
  const gaps: string[] = [];
  
  // Missing essential skills
  const missingEssentialSkills = coreSkillsAssessment
    .filter((s) => !s.found)
    .slice(0, 2);
  
  if (missingEssentialSkills.length > 0) {
    gaps.push(
      `Missing critical skills: ${missingEssentialSkills.map((s) => s.skill).join(', ')}`
    );
  }
  
  // Missing essential tools
  const missingEssentialTools = toolsAssessment
    .filter((s) => !s.found)
    .slice(0, 2);
  
  if (missingEssentialTools.length > 0) {
    gaps.push(
      `Limited experience with key tools: ${missingEssentialTools.map((s) => s.skill).join(', ')}`
    );
  }
  
  // Certification gaps
  if (certificationsFound.length === 0) {
    gaps.push('No QA certifications (ISTQB Foundation recommended)');
  }
  
  return gaps;
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(
  coreSkillsAssessment: SkillAssessment[],
  toolsAssessment: SkillAssessment[],
  certificationGaps: string[],
  role: QARole
): string[] {
  const recommendations: string[] = [];
  
  // Skill improvements
  const skillRecommendations = coreSkillsAssessment
    .filter((s) => s.recommendation)
    .map((s) => s.recommendation!)
    .slice(0, 2);
  
  recommendations.push(...skillRecommendations);
  
  // Tool learning
  const toolRecommendations = toolsAssessment
    .filter((s) => !s.found)
    .map((s) => `Learn ${s.skill} through hands-on projects`)
    .slice(0, 2);
  
  recommendations.push(...toolRecommendations);
  
  // Certifications
  if (certificationGaps.length > 0) {
    recommendations.push(`Pursue ${certificationGaps[0]} certification`);
  }
  
  // Domain expertise
  recommendations.push(
    `Deepen knowledge in ${role.keyResponsibilities[0]}`
  );
  
  return recommendations;
}

/**
 * Generate comprehensive QA skills report
 */
export function generateQASkillsReport(cvText: string, role: QARole): QASkillsReport {
  const coreSkillsAssessment = assessCoreSkills(cvText, role);
  const toolsAssessment = assessTools(cvText, role);
  const { found: certificationsFound, gaps: certificationGaps } = findCertifications(cvText, role);
  const qaKeywordsFound = findQAKeywords(cvText, role);
  
  const overallReadiness = calculateReadinessScore(
    coreSkillsAssessment,
    toolsAssessment,
    certificationsFound,
    role
  );
  
  const strengths = identifyStrengths(coreSkillsAssessment, toolsAssessment, qaKeywordsFound);
  const criticalGaps = identifyCriticalGaps(coreSkillsAssessment, toolsAssessment, certificationsFound);
  const recommendations = generateRecommendations(coreSkillsAssessment, toolsAssessment, certificationGaps, role);
  
  return {
    role,
    coreSkillsAssessment,
    toolsAssessment,
    certificationsFound,
    certificationGaps,
    qaKeywordsFound,
    overallReadiness,
    strengths,
    criticalGaps,
    recommendations,
  };
}
