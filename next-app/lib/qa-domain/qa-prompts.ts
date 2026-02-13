/**
 * QA Domain-Specific AI Prompts
 * Generates customized prompts based on target QA role
 */

import { QARole } from './roles';

/**
 * Generate a role-specific system prompt for the AI
 */
export function generateQASystemPrompt(role: QARole, targetRole?: string): string {
  const roleDesc = targetRole || role.title;
  const toolsList = role.technicalTools.join(', ');
  const skillsList = role.coreSkills.join(', ');
  const keywords = role.keywords.join(', ');

  return `You are a UK-based Career Coach and Senior Talent Acquisition Specialist for the Technology sector, specialising in Software Testing and Quality Engineering.

You are specifically evaluating candidates for the role of: **${roleDesc}**

ROLE-SPECIFIC CONTEXT:
- Level: ${role.level.toUpperCase()}
- Category: ${role.category.toUpperCase()}
- Expected Years of Experience: ${role.yearsExperience.min}-${role.yearsExperience.max} years
- Key Responsibilities: ${role.keyResponsibilities.slice(0, 3).join('; ')}
- Core Technical Skills: ${skillsList}
- Required Testing Tools: ${toolsList}
- Industry Keywords to Look For: ${keywords}

CRITICAL EVALUATION CRITERIA FOR THIS ROLE:
${role.coreSkills.map((skill, idx) => `${idx + 1}. ${skill}: Assess depth and relevance`).join('\n')}

TOOLS & FRAMEWORKS VALIDATION:
Validate candidate's proficiency in: ${role.technicalTools.slice(0, 5).join(', ')}
Flag gaps in: ${role.technicalTools.slice(5, 8).join(', ')}

CERTIFICATIONS TO LOOK FOR:
${role.certifications.map((cert) => `- ${cert}`).join('\n')}

Your goal is to:
1. Analyse the candidate's CV/Resume against the **${roleDesc}** position
2. Identify specific gaps in QA domain knowledge and testing tools
3. Highlight strengths relevant to this QA specialization
4. Provide domain-specific interview questions tailored to this role
5. Suggest concrete improvements in testing terminology, tools, and methodologies
6. Rewrite their CV with QA-focused keywords and metrics

QUALITY RULES (NON-NEGOTIABLE):
- British English only (specialise, programme, organisation, whilst)
- Avoid AI-sounding or robotic phrasing
- Do not invent experience or employers; use [Bracketed Placeholders] when missing
- Medium length: ~300-450 words per section

BANNED WORDS: "Delve," "landscape," "tapestry," "symphony," "game-changer," "leverage," "spearhead," "paramount," "underscores," "in today's fast-paced world," "unlock your potential"

Write as a professional human consultant would - varied sentences, natural transitions.`;
}

/**
 * Generate role-specific follow-up prompt sections
 */
export function generateRoleSpecificGuidance(role: QARole): string {
  const focusAreas = role.interviewFocusAreas.map((area) => `- ${area}`).join('\n');

  return `\n\n📋 ROLE-SPECIFIC INTERVIEW FOCUS AREAS FOR ${role.title.toUpperCase()}:
${focusAreas}

🛠️ MUST-HAVE TOOLS FOR THIS ROLE:
${role.technicalTools.slice(0, 8).map((tool) => `- ${tool}`).join('\n')}

📚 CERTIFICATIONS TO HIGHLIGHT:
${role.certifications.map((cert) => `- ${cert}`).join('\n')}

⚡ KEY DIFFERENTIATORS FOR ${role.title.toUpperCase()}:
${generateDifferentiators(role)}`;
}

/**
 * Generate differentiators based on role level and category
 */
function generateDifferentiators(role: QARole): string {
  const differentiatorMap: Record<string, Record<string, string[]>> = {
    junior_qa_tester: {
      highlights: [
        'Ability to learn quickly and follow testing methodologies',
        'Clear communication of defects with reproducible steps',
        'Willingness to grow and pursue ISTQB certification',
      ],
    },
    qa_analyst: {
      highlights: [
        'Deep understanding of exploratory testing techniques',
        'Business requirements analysis skills',
        'Risk-based testing approach',
      ],
    },
    qa_engineer: {
      highlights: [
        'Balance between manual and automation testing',
        'Agile project participation and adaptability',
        'Continuous learning of automation frameworks',
      ],
    },
    automation_engineer: {
      highlights: [
        'Scalable test automation framework design',
        'Advanced programming skills in testing context',
        'Test maintenance and flaky test debugging',
      ],
    },
    sdet: {
      highlights: [
        'Building test infrastructure from scratch',
        'Contributing to application testability improvements',
        'Microservices and distributed system testing expertise',
      ],
    },
    performance_tester: {
      highlights: [
        'Identifying bottlenecks and capacity constraints',
        'Load testing strategy and realistic scenario design',
        'Performance metrics and SLA definition',
      ],
    },
    security_tester: {
      highlights: [
        'OWASP Top 10 vulnerability identification',
        'Ethical hacking and penetration testing methodology',
        'Security compliance knowledge (GDPR, PCI-DSS)',
      ],
    },
    a11y_specialist: {
      highlights: [
        'WCAG 2.2 compliance expertise',
        'Assistive technology testing (screen readers, voice control)',
        'Inclusive design principle advocacy',
      ],
    },
    api_tester: {
      highlights: [
        'REST and GraphQL API testing expertise',
        'Contract testing and data validation',
        'Microservices integration knowledge',
      ],
    },
    etl_tester: {
      highlights: [
        'Advanced SQL query writing and optimization',
        'Data pipeline validation and integrity checks',
        'Data warehouse and ETL tool proficiency',
      ],
    },
    ai_test_engineer: {
      highlights: [
        'Prompt engineering for test generation',
        'Leveraging GenAI for test automation improvements',
        'Staying current with AI/ML testing advancements',
      ],
    },
    test_lead: {
      highlights: [
        'Test planning and strategy development',
        'Resource allocation and team coordination',
        'Quality metrics and reporting',
      ],
    },
    test_architect: {
      highlights: [
        'Designing scalable testing infrastructure',
        'Tool stack evaluation and selection',
        'Creating testing standards and best practices',
      ],
    },
    qa_manager: {
      highlights: [
        'People management and team development',
        'Budget planning and financial acumen',
        'Quality KPI definition and tracking',
      ],
    },
    qa_director: {
      highlights: [
        'Strategic alignment with business objectives',
        'Organizational transformation leadership',
        'Executive-level quality culture building',
      ],
    },
    test_consultant: {
      highlights: [
        'Testing maturity assessment expertise',
        'Cross-organization best practice implementation',
        'Strategic advisory and change management',
      ],
    },
  };

  const highlights = differentiatorMap[role.id]?.highlights || [];
  return highlights.map((h) => `- ${h}`).join('\n');
}

/**
 * Generate skill gap analysis prompt
 */
export function generateSkillGapPrompt(role: QARole): string {
  return `
SKILLS GAP ANALYSIS FOR ${role.title.toUpperCase()}:

Critical Skills to Evaluate:
${role.coreSkills.map((skill, idx) => `${idx + 1}. ${skill}`).join('\n')}

Tools/Frameworks to Assess:
${role.technicalTools.map((tool) => `- ${tool}`).join('\n')}

For each skill, rate the candidate's proficiency and provide specific improvement recommendations.

YEAR 20- Target Experience: ${role.yearsExperience.min}-${role.yearsExperience.max} years

If the candidate's experience is BELOW the minimum, highlight what early-career experience would help.
If experience is ABOVE the maximum, highlight where to position as a senior specialist or mentor.`;
}

/**
 * Generate certification recommendation prompt
 */
export function generateCertificationPrompt(role: QARole): string {
  const essential = role.certifications.filter((_, idx) => idx === 0 || idx === 1);
  const recommended = role.certifications.slice(2);

  return `
CERTIFICATION RECOMMENDATIONS FOR ${role.title.toUpperCase()}:

🔴 ESSENTIAL:
${essential.map((cert) => `- ${cert}`).join('\n')}

🟡 RECOMMENDED:
${recommended.map((cert) => `- ${cert}`).join('\n')}

For each certification gap, provide:
1. Why it matters for this role
2. Learning time estimate
3. Preparation resources
4. Career impact`;
}

/**
 * Generate QA keywords for CV analysis
 */
export function getQAKeywords(role: QARole): string[] {
  return role.keywords;
}

/**
 * Check if CV contains QA-specific keywords
 */
export function findQAKeywordsInText(text: string, role: QARole): string[] {
  const lowerText = text.toLowerCase();
  return role.keywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if CV mentions required tools for the role
 */
export function findToolsInText(text: string, role: QARole): string[] {
  const lowerText = text.toLowerCase();
  return role.technicalTools.filter((tool) =>
    lowerText.includes(tool.toLowerCase())
  );
}

/**
 * Generate interview preparation guidance
 */
export function generateInterviewGuidance(role: QARole): string {
  return `
🎯 INTERVIEW PREPARATION FOR ${role.title.toUpperCase()}:

Expected Question Areas:
${role.interviewFocusAreas.map((area) => `1. ${area}`).join('\n')}

Preparation Strategy:
1. Review and practice answers to the above questions
2. Prepare real examples from your experience
3. Study the required tools and frameworks
4. Review ISTQB materials relevant to this role
5. Research current trends in ${role.category} testing

Evaluation Criteria:
- Technical depth in ${role.coreSkills[0]} and ${role.coreSkills[1]}
- Practical experience with ${role.technicalTools.slice(0, 2).join(' and ')}
- Understanding of QA best practices
- Communication of testing strategy and approach
- Problem-solving in complex scenarios`;
}

/**
 * Generate comprehensive role evaluation prompt
 */
export function generateComprehensiveRolePrompt(
  resume: string,
  jobDescription: string,
  role: QARole
): string {
  const systemPrompt = generateQASystemPrompt(role);
  const roleGuidance = generateRoleSpecificGuidance(role);
  const skillGapPrompt = generateSkillGapPrompt(role);
  const certificationPrompt = generateCertificationPrompt(role);

  return `${systemPrompt}

RESUME/CV:
${resume}

TARGET JOB DESCRIPTION:
${jobDescription}

${roleGuidance}

${skillGapPrompt}

${certificationPrompt}

OUTPUT FORMAT (MUST FOLLOW EXACTLY):
Start EVERY section with this EXACT delimiter format:

===== SECTION 1: STRATEGIC ROLE ANALYSIS & ATS OPTIMISATION =====
(Include role-specific insights for ${role.title})

===== SECTION 2: BEHAVIOURAL & SOFT SKILLS INTERVIEW QUESTIONS =====
(Focus on ${role.interviewFocusAreas[0]})

===== SECTION 3: DOMAIN-SPECIFIC TECHNICAL INTERVIEW QUESTIONS =====
(${role.category.toUpperCase()} testing focus)

===== SECTION 4: SKILLS GAP & ACTION PLAN =====
(Cover: ${role.coreSkills.slice(0, 3).join(', ')})

===== SECTION 5: THE REWRITTEN UK CV (SIX-SECOND RECRUITER TEST) =====
(Emphasize: ${role.keywords.slice(0, 5).join(', ')})

===== SECTION 6: THE UK COVER LETTER =====
(Highlight relevant ${role.title} experience)

Generate all 6 sections with comprehensive, professional content tailored to the ${role.title} role. Use ATS-focused keywords, evidence-based claims, and avoid generic filler.`;
}
