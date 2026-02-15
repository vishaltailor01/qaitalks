/**
 * AI Knowledge Pool
 * Contains curated UK-specific samples, standards, and domain knowledge
 * to improve AI response accuracy via Few-Shot prompting.
 */

import resumesData from './data/resumes.json';
import interviewsData from './data/interviews.json';
import jdsData from './data/job_descriptions.json';
import type { InterviewQuestion, InterviewPrep, JobDescription } from './types';

export const UK_RECRUITMENT_STANDARDS = `
- British English (e.g., 'optimise', 'organisation', 'utilisation').
- NO profile pictures or headshots.
- Focus on quantifiable metrics (e.g., 'Reduced regression time by 40% using Playwright').
- ISTQB CTFL v4.0.1 COMPLIANCE: 
    - Use standardized terms: Test Basis, Testware, Test Object, Test Condition, Test Script.
    - Emphasize 'Shift Left' and 'Whole Team Approach' to quality.
    - Reference the 7 Testing Principles (e.g., 'Testing shows presence of defects').
- Standard sections: Professional Summary, Key Skills, Professional Experience, Education, Certifications.
`;

export const EXPERT_SAMPLES = {
  cv: {
    before: `
      Manual Tester with 5 years experience. I test apps and find bugs. I use Jira and Excel.
    `,
    after: `
      **PROFESSIONAL SUMMARY**
      Dynamic Senior QA Engineer with 5+ years of experience in the UK fintech sector. Expert in end-to-end testing cycles with a focus on delivering high-quality user experiences. Proven track record of increasing delivery velocity by 30% through strategic test automation (Playwright/TypeScript) and robust bug lifecycle management in Jira.
    `
  },
  sixSecondTest: `
    | Element | Result | Why? |
    |---------|--------|------|
    | Job Title Match | ✅ Strong | Header clearly states 'Lead Automation Engineer'. |
    | Key Tech Stack | ✅ Visible | Python, Playwright, and CI/CD are prominent in the top 1/3 of the CV. |
    | Years Exp | ✅ Clear | Total of 8 years across UK Tier-1 firms. |
    | Certifications | ✅ Valid | ISTQB CTAL-TAE and CTAL-TM mentioned prominently. |
  `
};

export const ROLE_DOMAIN_KNOWLEDGE: Record<string, string> = {
  automation: `
    - Standards: ISTQB-CT-TAS (Test Automation Strategy), ISTQB-CTAL-ATT (Agile Technical), ISTQB-CTAL-TTA (Technical Analysis).
    - Architecture: Generic Test Automation Architecture (gTAA), TAF layering (Generation, Definition, Execution, Adaptation).
    - Strategy: ROI-driven automation, Maintenance-aware design, SUT vs Testware coupling, GUI vs API partitioning.
    - Advanced: Keyword-driven (DSL), Data-driven, Model-based (MBT - ISTQB-CT-MBT), Scriptless vs Scripted approaches.
    - Analysis: Static (Control/Data Flow), Dynamic (Memory leaks, Performance), Structural (Statement, Decision, MC/DC).
  `,
  automotive: `
    - Standards: ISO 26262 (Functional Safety), ASPICE (Process Maturity), AUTOSAR (Architecture), ISO/SAE 21434 (Cybersecurity).
    - Environment: XiL Testing (MiL: Model, SiL: Software, HiL: Hardware, PiL: Processor, ViL: Vehicle).
    - Techniques: MC/DC (Modified Condition/Decision Coverage), Fault Injection, Back-to-Back Testing, Equivalence Classes.
    - Safety: ASIL (A-D) levels, Safety Goals, V-Model integration (Software vs ECU vs Vehicle level).
    - Network: CAN, LIN, FlexRay, Ethernet protocols, Real-time behavior, Determinism.
  `,
  game_testing: `
    - Standards: ISTQB-CT-GaMe (Specialist), ISO 25010 (Quality), PEGI/ESRB (Regulation).
    - Mechanics: Core vs Meta mechanics, Gameplay vs Non-gameplay (AI, Physics, Progression).
    - Graphics: LoD (Level of Detail), Collisions, Hitboxes/Hurtboxes, VFX sync, Frame-rate drops.
    - Sound: Occlusion, Reverberation, Binaural effects, Atmos/Spatial audio mixing.
    - Approach: Playtesting, Ad hoc, Balancing, Localization (L10n), Ergonomics, Monetization (MTX) verification.
  `,
  gambling: `
    - Standards: ISTQB-CT-GT (Specialist), WLA SCS (Security), G2S/SAS/QCOM Protocols.
    - Compliance: Jurisdictional testing (GLI/BMM standards), ITL certification, Escape Compliance Metrics.
    - Math: RNG (Random Number Generation), RTP (Return to Player), PAR sheets, Pay-tables.
    - Hardware: BNA (Bank Note Acceptor), TITO (Ticket-In/Out), NVRAM retention, Geolocation logic.
    - Process: Anti-collusion, Game History (Audit), Player Privacy (GDPR), Progressive jackpot servers.
  `,
  manual: `
    - Standards: ISTQB-CTAL-TA (Test Analyst), ISTQB-CTFL v4.0 (Foundations), ISTQB-CT-AcT (Acceptance Testing).
    - Logic: Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Tables, State Transition (N-switch).
    - Advanced: Classification Tree Method (CTM), Pairwise/Orthogonal Arrays (Combinatorial), Domain Analysis.
    - Acceptance: User (UAT), Operational (OAT), Contractual/Regulative, Alpha/Beta testing.
    - Experience: Error Guessing, Checklist-based, Session-based Exploratory Testing (SBTM).
  `,
  performance: `
    - Standards: ISTQB-CT-PT (Performance Testing).
    - Attributes: Time Behavior (Latency, Response Time, Throughput), Resource Utilization (CPU, RAM, I/O), Capacity.
    - Types: Load (Operational Profiles), Stress (Breakpoint), Spike, Endurance (Soak), Scalability, Concurrency.
    - Analysis: Identifying bottlenecks (DB locks, Network contention, GC spikes, Thread starvation).
  `,
  security: `
    - Standards: ISTQB-CT-SEC (Security), OWASP Top 10, NIST SP 800-115.
    - Areas: Confidentiality, Integrity, Availability (CIA), Non-repudiation, Accountability, Authenticity.
    - Attacks: SQLi, XSS, Buffer Overflow, DoS/DDoS, MitM, Broken Access Control, CSRF.
    - Process: Risk Assessment, Vulnerability Scanning (SAST/DAST), Penetration Testing, Security Auditing.
  `,
  mobile: `
    - Standards: ISTQB-CT-MAT (Mobile Application Testing).
    - Attributes: Gesture testing, Biometrics (FaceID/TouchID), Deep Linking, Offline/Sync behavior.
    - Environment: Device diversity (Fragmentation), OS versions, Low network (edge/3G), Battery/Thermal impact.
    - Tools: Appium (Cross-platform), Maestro (Yaml/UX-centric), Detox, Espresso/XCUITest.
  `,
  lead: `
    - Standards: ISTQB-CTAL-TM (Test Management), ISTQB-CT-ATLaS (Agile Leadership at Scale).
    - Strategy: Policy vs Strategy vs Plan (Why/What/How), Mission defining, ROI/Value marketing.
    - Management: Risk-based Testing (RBT - Fault/Failure likelihood), Test Estimation (Wideband Delphi, 3-point).
    - Agile Scale: Lean Metrics (Cycle/Lead Time), Value Stream Mapping (VSM), Quality Coaching.
    - Soft Skills: Conflict management, Ethical reporting, STAR Interviewing, Transactional Analysis.
  `
};

export const SPECIALIST_DOMAINS = {
  ai_testing: `
    - Standards: ISTQB-CT-AI (Specialist AI Testing).
    - ML Workflow: Data Prep -> Train -> Evaluate (Confusion Matrix) -> Tune -> Deploy -> Monitor.
    - Techniques: Metamorphic Testing (MRs), Back-to-Back, Adversarial Testing (Data Poisoning).
    - Coverage: Neuron coverage, Threshold, Sign-Change, Value-Change, Sign-Sign.
    - Quality: Bias/Fairness, Transparency, Explainability (XAI), Concept/Data Drift.
  `,
  gen_ai: `
    - Standards: ISTQB-CT-GenAI (Generative AI Testing).
    - LLM Core: Tokenization, Embeddings, Context Windows, Temperature, Hallucinations.
    - Prompt Eng: Role/Context/Instruction/Input/Constraint/Format, Few-shot.
    - Techniques: Prompt Chaining, Meta-prompting, RAG (Retrieval-Augmented) validation.
    - Ethics: PII leakage, Toxic output, Reasoning errors, Shadow AI usage.
  `,
  usability_testing: `
    - Standards: ISTQB-CT-UT (Usability), ISO 9241, ISO 25010.
    - Metrics: Effectiveness (Completion rate), Efficiency (Time on task), Satisfaction (SUS score).
    - Techniques: Heuristic Evaluation (Nielsen's), Cognitive Walkthrough, Accessibility (WCAG 2.1+).
    - Focus: Learnability, Operability, User Error Protection, Aesthetics.
  `,
  test_process_improvement: `
    - Models: TMMi (Staged Maturity), TPI Next (Continuous Matrix), STEP, CTP.
    - Engineering: IDEAL (Initiating, Diagnosing, Establishing, Acting, Learning), PDCA (Deming).
    - Metrics: DDP (Defect Detection Percentage), Cost of Quality (CoQ), Effectiveness vs Efficiency.
    - Analysis: Causal Analysis (Ishikawa), Root Cause Analysis (RCA), GQM (Goal-Question-Metric).
  `,
  agile_tester: `
    - Standards: ISTQB-CTFL-AT (Foundation Agile), ISTQB-CTAL-ATT (Advanced Agile).
    - Concepts: Whole Team Approach, Power of Three, INVEST/SMART stories, DoD/DoR.
    - quadrants: Testing Quadrants (Business-facing vs Technical-facing).
    - Practices: TDD, BDD (Gherkin), ATDD, Pairing, Continuous Feedback, Sprint Zero.
  `
};


export const INTERVIEW_BEST_PRACTICES = {
  behavioural: "Use the STAR method (Situation, Task, Action, Result) with UK-specific workplace cultural awareness.",
  technical: "Focus on problem-solving scenarios, architectural design, and modern tool evaluation."
};

export const STAR_METHOD_EXAMPLE = `
  **Question:** Tell me about a time you resolved a complex technical issue.
  **Competency:** Problem Solving

  **STAR Framework Answer:**
  - **Situation:** During the critical Q4 release, we encountered a flaky payment gateway test that was failing 40% of the time in CI, blocking deployments.
  - **Task:** My responsibility was to identify the root cause of the flakiness and stabilize the test suite within 24 hours to ensure the release went ahead.
  - **Action:** I analyzed the Splunk logs and identified a race condition. I implemented a custom polling mechanism using Playwright's auto-wait features rather than hard-coded sleeps. I also refactored the test data setup to be atomic.
  - **Result:** The test stability improved to 100% pass rate. This unblocked the deployment pipeline, allowing the release to go out on time, and the solution was adopted as a pattern for all future async tests.
`;

export const TECHNICAL_QUESTION_EXAMPLE = `
  **Question 1:** Explain the difference between optimistic and pessimistic locking.
  **Focus Area:** Database / Architecture
  **Expected Answer:**
  - **Optimistic Locking:** Assumes conflicts are rare. Uses a version number/timestamp. Checks before commit. Best for high-read systems.
  - **Pessimistic Locking:** Locks the record immediately upon access. Prevents others from modifying it until the transaction is complete. Best for high-contention data.
  - **Follow-up:** "How would you test this in a distributed microservices environment?"
`;

/**
 * Interface for Role-Specific Context
 */
export interface RoleContext {
  domainKnowledge: string;
  resumeSample: { before: string; after: string };
  interviewPrep: InterviewPrep;
  goldenJD?: JobDescription;
}

/**
 * Get context tailored to a specific role
 */
export function getRoleContext(role: string): RoleContext {
  const normalizedRole = role.toLowerCase();

  // Mapping for role aliases to internal keys
  const roleMap: Record<string, string> = {
    'automation': 'automation',
    'sdet': 'automation',
    'manual': 'manual',
    'qa lead': 'lead',
    'test manager': 'lead',
    'head of qa': 'lead',
  };

  const key = roleMap[normalizedRole] || 'manual';

  // Type-safe access to imported JSON data
  const resumes = resumesData as Record<string, { before: string; after: string }>;
  const interviews = interviewsData as Record<string, Partial<InterviewPrep>>;
  const jds = jdsData as Record<string, JobDescription>;

  return {
    domainKnowledge: ROLE_DOMAIN_KNOWLEDGE[key] || ROLE_DOMAIN_KNOWLEDGE['manual'],
    resumeSample: resumes[key] || resumes['manual'],
    interviewPrep: {
      technical: (interviews[key]?.technical || []).concat(interviews['common']?.technical || []),
      behavioural: (interviews[key]?.behavioural || []).concat(interviews['common']?.behavioural || []),
    },
    goldenJD: jds[normalizedRole.replace(/\s+/g, '_')] || jds['manual']
  };
}
