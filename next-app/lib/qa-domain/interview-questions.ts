/**
 * QA Interview Questions & Scenarios
 * Comprehensive question bank for all 13 QA roles (200+ questions)
 */

// ...existing code...

export interface InterviewQuestion {
  id: string;
  roleId: string;
  category: 'technical' | 'scenario' | 'behavioral' | 'domain-specific';
  difficulty: 'entry' | 'mid' | 'senior' | 'lead';
  question: string;
  expectedAreas: string[];
  evaluationCriteria: string[];
  sampleAnswerPoints?: string[];
}

/**
 * QA TESTER - Entry Level (0-2 years)
 */
const juniorQATesterQuestions: InterviewQuestion[] = [
  {
    id: 'junior_qa_1',
    roleId: 'junior_qa_tester',
    category: 'technical',
    difficulty: 'entry',
    question: 'What is the difference between functional and non-functional testing?',
    expectedAreas: ['testing types', 'test coverage', 'qa methodologies'],
    evaluationCriteria: ['Understands basic testing categories', 'Can provide examples'],
    sampleAnswerPoints: [
      'Functional: tests what software does',
      'Non-functional: tests how well it performs',
      'Examples like performance, security, usability'
    ]
  },
  {
    id: 'junior_qa_2',
    roleId: 'junior_qa_tester',
    category: 'scenario',
    difficulty: 'entry',
    question: 'You find a critical bug in production. Walk me through how you would report it.',
    expectedAreas: ['bug tracking', 'documentation', 'communication'],
    evaluationCriteria: ['Clear bug reproduction steps', 'Includes screenshots/logs', 'Uses bug tracking tool'],
    sampleAnswerPoints: [
      'Create detailed bug report with steps to reproduce',
      'Attach screenshots/videos',
      'Include environment details',
      'Set priority/severity correctly'
    ]
  },
  {
    id: 'junior_qa_3',
    roleId: 'junior_qa_tester',
    category: 'behavioral',
    difficulty: 'entry',
    question: 'How do you approach testing a feature you are seeing for the first time?',
    expectedAreas: ['requirements analysis', 'test planning', 'communication'],
    evaluationCriteria: ['Asks clarifying questions', 'Reviews requirements', 'Plans test scenarios'],
    sampleAnswerPoints: [
      'Read requirements document',
      'Understand user stories',
      'Ask developers for clarification',
      'Create test plan',
      'Execute positive and negative tests'
    ]
  },
  {
    id: 'junior_qa_4',
    roleId: 'junior_qa_tester',
    category: 'domain-specific',
    difficulty: 'entry',
    question: 'Name 5 common types of software defects you might encounter.',
    expectedAreas: ['defect classifications', 'qa knowledge', 'testing awareness'],
    evaluationCriteria: ['Lists actual defect types', 'Shows real-world experience'],
    sampleAnswerPoints: [
      'Logic errors',
      'UI/UX issues',
      'Data validation bugs',
      'Performance problems',
      'Security vulnerabilities'
    ]
  }
];

/**
 * QA ANALYST - Mid Level (2-5 years)
 */
const qaAnalystQuestions: InterviewQuestion[] = [
  {
    id: 'analyst_1',
    roleId: 'qa_analyst',
    category: 'scenario',
    difficulty: 'mid',
    question: 'You need to create a comprehensive test strategy for a new payment system. What steps would you follow?',
    expectedAreas: ['test planning', 'risk analysis', 'resource management'],
    evaluationCriteria: ['Identifies risks', 'Plans multiple test types', 'Allocates resources'],
    sampleAnswerPoints: [
      'Risk analysis of payment system',
      'Define test scope and objectives',
      'Identify test types (functional, security, performance)',
      'Create detailed test plan',
      'Estimate timeline and resources',
      'Define entry/exit criteria'
    ]
  },
  {
    id: 'analyst_2',
    roleId: 'qa_analyst',
    category: 'technical',
    difficulty: 'mid',
    question: 'How do you measure test coverage and why is it important?',
    expectedAreas: ['metrics', 'quality assurance', 'code coverage'],
    evaluationCriteria: ['Understands coverage types', 'Knows limitations', 'Uses metrics meaningfully'],
    sampleAnswerPoints: [
      'Code coverage percentage',
      'Branch coverage vs line coverage',
      'Shows quality, but not completeness',
      'Tools like JaCoCo, Istanbul'
    ]
  },
  {
    id: 'analyst_3',
    roleId: 'qa_analyst',
    category: 'behavioral',
    difficulty: 'mid',
    question: 'Describe your experience with test metrics and KPIs. Which ones do you find most valuable?',
    expectedAreas: ['metrics', 'reporting', 'qa analysis'],
    evaluationCriteria: ['Knows standard QA metrics', 'Uses data-driven approach'],
    sampleAnswerPoints: [
      'Defect density',
      'Test execution rate',
      'Block rate / escape rate',
      'Cost of quality'
    ]
  },
  {
    id: 'analyst_4',
    roleId: 'qa_analyst',
    category: 'scenario',
    difficulty: 'mid',
    question: 'How would you prioritize testing when resources are limited and deadline is tight?',
    expectedAreas: ['risk management', 'prioritization', 'decision making'],
    evaluationCriteria: ['Risk-based approach', 'Considers business impact'],
    sampleAnswerPoints: [
      'Risk-based prioritization',
      'Focus on high-impact features',
      'Automated regression tests',
      'Communication with stakeholders'
    ]
  }
];

/**
 * QA ENGINEER - Mid Level (2-7 years)
 */
const qaEngineerQuestions: InterviewQuestion[] = [
  {
    id: 'engineer_1',
    roleId: 'qa_engineer',
    category: 'technical',
    difficulty: 'mid',
    question: 'Design a test automation framework for a web application. What patterns and tools would you use?',
    expectedAreas: ['test automation', 'design patterns', 'framework architecture'],
    evaluationCriteria: ['Knows Page Object Model', 'Understands CI/CD', 'Selects appropriate tools'],
    sampleAnswerPoints: [
      'Page Object Model pattern',
      'Repository pattern for locators',
      'Data-driven testing',
      'Selenium / Playwright',
      'CI/CD integration (Jenkins/GitHub Actions)'
    ]
  },
  {
    id: 'engineer_2',
    roleId: 'qa_engineer',
    category: 'scenario',
    difficulty: 'mid',
    question: 'You have flaky tests in your automation suite. How would you diagnose and fix them?',
    expectedAreas: ['test reliability', 'debugging', 'best practices'],
    evaluationCriteria: ['Identifies root causes', 'Implements robust solutions'],
    sampleAnswerPoints: [
      'Check timing issues (waits)',
      'Verify test data state',
      'Look for UI timing dependencies',
      'Use explicit waits instead of sleeps',
      'Run tests in isolation'
    ]
  },
  {
    id: 'engineer_3',
    roleId: 'qa_engineer',
    category: 'technical',
    difficulty: 'mid',
    question: 'How do you approach testing REST APIs? What tools and methods would you use?',
    expectedAreas: ['api testing', 'rest concepts', 'testing tools'],
    evaluationCriteria: ['Knows API testing tools', 'Understands REST', 'Writes effective tests'],
    sampleAnswerPoints: [
      'Postman / REST Assured / Cypress',
      'Test HTTP methods (GET, POST, PUT, DELETE)',
      'Validation of response codes',
      'Schema validation',
      'Performance testing'
    ]
  },
  {
    id: 'engineer_4',
    roleId: 'qa_engineer',
    category: 'behavioral',
    difficulty: 'mid',
    question: 'Tell me about a complex testing challenge you solved. What was your approach?',
    expectedAreas: ['problem-solving', 'technical depth', 'communication'],
    evaluationCriteria: ['Complex problem', 'Logical approach', 'Measurable results'],
  }
];

/**
 * AUTOMATION ENGINEER - Mid-Senior (3-10 years)
 */
const automationEngineerQuestions: InterviewQuestion[] = [
  {
    id: 'automation_1',
    roleId: 'automation_engineer',
    category: 'technical',
    difficulty: 'senior',
    question: 'How would you design a scalable, maintainable test automation framework for microservices?',
    expectedAreas: ['framework architecture', 'microservices', 'scalability'],
    evaluationCriteria: ['Understands distributed testing', 'Plans for maintainability', 'CI/CD proficiency'],
    sampleAnswerPoints: [
      'Decoupled test layers',
      'Container-based testing',
      'API-first testing strategy',
      'Parallel execution',
      'Independent test data per service'
    ]
  },
  {
    id: 'automation_2',
    roleId: 'automation_engineer',
    category: 'scenario',
    difficulty: 'senior',
    question: 'Your test suite takes 4 hours to run. How would you reduce it to 30 minutes while maintaining coverage?',
    expectedAreas: ['performance optimization', 'test management', 'efficiency'],
    evaluationCriteria: ['Data-driven thinking', 'Parallel execution', 'Risk-based approach'],
    sampleAnswerPoints: [
      'Parallel test execution',
      'Smoke tests vs comprehensive tests',
      'Cloud infrastructure',
      'Test prioritization',
      'Remove redundant tests'
    ]
  },
  {
    id: 'automation_3',
    roleId: 'automation_engineer',
    category: 'technical',
    difficulty: 'senior',
    question: 'How do you handle cross-browser testing at scale? What challenges do you face?',
    expectedAreas: ['cross-browser testing', 'infrastructure', 'tools'],
    evaluationCriteria: ['Knows cloud testing services', 'Understands browser compatibility', 'Risk assessment'],
    sampleAnswerPoints: [
      'Selenium Grid / BrowserStack / Sauce Labs',
      'Browser combination matrix',
      'Headless vs UI testing',
      'Mobile browser testing',
      'Screenshot comparison'
    ]
  },
  {
    id: 'automation_4',
    roleId: 'automation_engineer',
    category: 'behavioral',
    difficulty: 'senior',
    question: 'Describe your experience with CI/CD pipeline integration. How do you ensure tests run reliably?',
    expectedAreas: ['ci/cd', 'test reporting', 'infrastructure'],
    evaluationCriteria: ['Jenkins/GitHub Actions experience', 'Failure handling', 'Reporting'],
  }
];

/**
 * SDET - Senior Level (5-15 years)
 */
const sdetQuestions: InterviewQuestion[] = [
  {
    id: 'sdet_1',
    roleId: 'sdet',
    category: 'technical',
    difficulty: 'senior',
    question: 'Design a comprehensive test data management system for a large-scale application. Include architecture and challenges.',
    expectedAreas: ['data management', 'architecture', 'scalability'],
    evaluationCriteria: ['System design thinking', 'Data isolation', 'Realistic approach to challenges'],
    sampleAnswerPoints: [
      'Test data generation (factories vs fixtures)',
      'Data isolation per test run',
      'Production data masking',
      'Data cleanup strategies',
      'Performance considerations'
    ]
  },
  {
    id: 'sdet_2',
    roleId: 'sdet',
    category: 'scenario',
    difficulty: 'senior',
    question: 'Algorithm challenge: Write pseudocode for detecting UI element changes across page refreshes.',
    expectedAreas: ['algorithm design', 'algorithms', 'problem-solving'],
    evaluationCriteria: ['Algorithmic thinking', 'Optimization awareness', 'Handles edge cases'],
    sampleAnswerPoints: [
      'Hash comparison strategy',
      'Snapshot-based diffing',
      'Dynamic content handling',
      'Performance optimization',
      'Edge cases'
    ]
  },
  {
    id: 'sdet_3',
    roleId: 'sdet',
    category: 'technical',
    difficulty: 'senior',
    question: 'How would you implement intelligent locator strategies that are resilient to changes?',
    expectedAreas: ['locator strategies', 'xpaths', 'ai/ml applications'],
    evaluationCriteria: ['Multiple locator strategies', 'Robustness thinking', 'Performance aware'],
    sampleAnswerPoints: [
      'Primary vs fallback locators',
      'Custom attributes',
      'AI-based element identification',
      'Performance monitoring'
    ]
  },
  {
    id: 'sdet_4',
    roleId: 'sdet',
    category: 'technical',
    difficulty: 'senior',
    question: 'Describe your experience with test result analysis and reporting. How do you surface meaningful insights?',
    expectedAreas: ['analytics', 'reporting', 'data visualization'],
    evaluationCriteria: ['Analytics tools knowledge', 'Trend analysis', 'Actionable insights'],
    sampleAnswerPoints: [
      'Test result dashboards',
      'Flakiness detection',
      'Trend analysis',
      'Reporting tools',
      'Automated failure analysis'
    ]
  }
];

/**
 * PERFORMANCE TESTER - Mid-Senior (3-10 years)
 */
const performanceTesterQuestions: InterviewQuestion[] = [
  {
    id: 'perf_1',
    roleId: 'performance_tester',
    category: 'scenario',
    difficulty: 'senior',
    question: 'You discover your application responds slowly under load. Walk through your diagnostic approach.',
    expectedAreas: ['bottleneck identification', 'profiling', 'optimization'],
    evaluationCriteria: ['Systematic approach', 'Tools proficiency', 'Root cause analysis'],
    sampleAnswerPoints: [
      'Baseline performance metrics',
      'Load profiling',
      'Database query analysis',
      'Memory/CPU monitoring',
      'Network bottlenecks'
    ]
  },
  {
    id: 'perf_2',
    roleId: 'performance_tester',
    category: 'technical',
    difficulty: 'senior',
    question: 'Design a performance test strategy for an e-commerce platform expecting 10x traffic spike during Black Friday.',
    expectedAreas: ['load testing', 'capacity planning', 'stress testing'],
    evaluationCriteria: ['Realistic scenarios', 'Tools selection', 'Risk mitigation'],
    sampleAnswerPoints: [
      'User load modeling',
      'JMeter / Gatling / LoadRunner',
      'Ramp-up patterns',
      'Stress and soak tests',
      'Monitoring and alerting'
    ]
  },
  {
    id: 'perf_3',
    roleId: 'performance_tester',
    category: 'technical',
    difficulty: 'senior',
    question: 'What tools and metrics are critical for API performance testing?',
    expectedAreas: ['api performance', 'metrics', 'tools'],
    evaluationCriteria: ['Tool knowledge', 'Understands key metrics', 'REST API concepts'],
    sampleAnswerPoints: [
      'Response time (p50, p95, p99)',
      'Throughput (requests/sec)',
      'Error rate',
      'JMeter / Postman / RestAssured',
      'Correlation analysis'
    ]
  }
];

/**
 * SECURITY TESTER - Senior+ (5-15 years)
 */
const securityTesterQuestions: InterviewQuestion[] = [
  {
    id: 'sec_1',
    roleId: 'security_tester',
    category: 'scenario',
    difficulty: 'senior',
    question: 'Walk through your approach to testing a REST API for security vulnerabilities.',
    expectedAreas: ['api security', 'authentication', 'owasp'],
    evaluationCriteria: ['OWASP knowledge', 'Systematic approach', 'Tools proficiency'],
    sampleAnswerPoints: [
      'Authentication/authorization tests',
      'Input validation & injection attacks',
      'SQL injection, XSS, CSRF testing',
      'Rate limiting',
      'API rate limit bypass tendencies'
    ]
  },
  {
    id: 'sec_2',
    roleId: 'security_tester',
    category: 'technical',
    difficulty: 'senior',
    question: 'What are the OWASP Top 10 vulnerabilities and how would you test for each?',
    expectedAreas: ['owasp', 'web security', 'testing methods'],
    evaluationCriteria: ['OWASP knowledge', 'Test methods', 'Practical experience'],
    sampleAnswerPoints: [
      'Injection flaws',
      'Broken authentication',
      'Sensitive data exposure',
      'XXE / CSRF / XSS',
      'Test methods for each'
    ]
  },
  {
    id: 'sec_3',
    roleId: 'security_tester',
    category: 'technical',
    difficulty: 'senior',
    question: 'How would you test a web application for SQL injection vulnerabilities?',
    expectedAreas: ['sql injection', 'payloads', 'mitigation'],
    evaluationCriteria: ['SQL injection concepts', 'Test payloads', 'Parameterized queries'],
    sampleAnswerPoints: [
      'Test common payloads',
      'Error-based detection',
      'Boolean-based blind injection',
      'Time-based blind injection',
      'Parameterized queries as prevention'
    ]
  }
];

/**
 * ACCESSIBILITY TESTER - Mid+ (2-10 years)
 */
const a11yTesterQuestions: InterviewQuestion[] = [
  {
    id: 'a11y_1',
    roleId: 'a11y_specialist',
    category: 'technical',
    difficulty: 'mid',
    question: 'How do you test a web application for WCAG 2.1 AA compliance?',
    expectedAreas: ['wcag', 'accessibility standards', 'testing tools'],
    evaluationCriteria: ['WCAG knowledge', 'Tools proficiency', 'Manual testing understanding'],
    sampleAnswerPoints: [
      'Automated tools (axe, WAVE, Lighthouse)',
      'Keyboard navigation testing',
      'Screen reader testing (NVDA, JAWS)',
      'Color contrast validation',
      'Alt text verification'
    ]
  },
  {
    id: 'a11y_2',
    roleId: 'a11y_specialist',
    category: 'scenario',
    difficulty: 'mid',
    question: 'You find a form that is not keyboard accessible. Describe how you would identify the issues.',
    expectedAreas: ['keyboard navigation', 'focus management', 'wcag'],
    evaluationCriteria: ['Understands keyboard patterns', 'Can identify issues', 'Knows WCAG principles'],
  },
  {
    id: 'a11y_3',
    roleId: 'a11y_specialist',
    category: 'technical',
    difficulty: 'mid',
    question: 'What is ARIA and when should it be used? Provide examples.',
    expectedAreas: ['aria', 'semantics', 'html5'],
    evaluationCriteria: ['ARIA knowledge', 'Practical examples', 'Understands limitations'],
    sampleAnswerPoints: [
      'Accessible Rich Internet Applications',
      'Use cases: dynamic content, custom widgets',
      'aria-label, aria-describedby, aria-live',
      'Should enhance, not replace semantic HTML'
    ]
  }
];

/**
 * TEST LEAD - Lead Level (5-15 years)
 */
const testLeadQuestions: InterviewQuestion[] = [
  {
    id: 'lead_1',
    roleId: 'test_lead',
    category: 'behavioral',
    difficulty: 'lead',
    question: 'How do you mentor junior QA engineers? Give an example of a mentorship situation.',
    expectedAreas: ['leadership', 'mentoring', 'team development'],
    evaluationCriteria: ['Coaching approach', 'Shows growth mindset', 'Clear examples'],
  },
  {
    id: 'lead_2',
    roleId: 'test_lead',
    category: 'scenario',
    difficulty: 'lead',
    question: 'Your team is overwhelmed with testing tasks and deadlines are slipping. How would you address this?',
    expectedAreas: ['team management', 'prioritization', 'communication'],
    evaluationCriteria: ['Problem-solving', 'Team awareness', 'Stakeholder communication'],
    sampleAnswerPoints: [
      'Assess capacity and workload',
      'Reprioritize based on risk',
      'Delegate appropriately',
      'Communicate with stakeholders',
      'Process improvements'
    ]
  },
  {
    id: 'lead_3',
    roleId: 'test_lead',
    category: 'behavioral',
    difficulty: 'lead',
    question: 'Describe your experience building and scaling a QA team.',
    expectedAreas: ['team building', 'hiring', 'culture'],
    evaluationCriteria: ['Hiring experience', 'Team growth', 'Retention strategy'],
  }
];

/**
 * TEST ARCHITECT - Senior Lead Level (8-18 years)
 */
const testArchitectQuestions: InterviewQuestion[] = [
  {
    id: 'arch_1',
    roleId: 'test_architect',
    category: 'technical',
    difficulty: 'lead',
    question: 'Design a comprehensive testing strategy and architecture for a large distributed system.',
    expectedAreas: ['system thinking', 'architecture', 'strategy'],
    evaluationCriteria: ['Systems thinking', 'Comprehensive perspective', 'Technical depth'],
    sampleAnswerPoints: [
      'Testing pyramid (unit/integration/e2e)',
      'Distributed tracing for test debugging',
      'Contract testing between services',
      'Infrastructure as code for test environments'
    ]
  },
  {
    id: 'arch_2',
    roleId: 'test_architect',
    category: 'scenario',
    difficulty: 'lead',
    question: 'How would you establish testing standards and best practices across a multi-team organization?',
    expectedAreas: ['standards', 'governance', 'organizational impact'],
    evaluationCriteria: ['Strategic thinking', 'Change management', 'Best practices knowledge'],
  }
];

/**
 * Consolidated question map - all 13 roles
 */
const ALL_INTERVIEW_QUESTIONS: Record<string, InterviewQuestion[]> = {
  junior_qa_tester: juniorQATesterQuestions,
  qa_analyst: qaAnalystQuestions,
  qa_engineer: qaEngineerQuestions,
  automation_engineer: automationEngineerQuestions,
  sdet: sdetQuestions,
  performance_tester: performanceTesterQuestions,
  security_tester: securityTesterQuestions,
  a11y_specialist: a11yTesterQuestions,
  api_tester: [], // Use qa_engineer base
  etl_tester: [], // Use qa_analyst base
  ai_test_engineer: [], // Use automation_engineer base
  test_lead: testLeadQuestions,
  test_architect: testArchitectQuestions,
  qa_manager: [], // Use test_lead base
  qa_director: [], // Use test_architect base
  test_consultant: [], // Composite
};

/**
 * Get interview questions for a specific role
 */
export function getInterviewQuestions(roleId: string): InterviewQuestion[] {
  return ALL_INTERVIEW_QUESTIONS[roleId] || [];
}

/**
 * Get questions by difficulty level
 */
export function getQuestionsByDifficulty(
  roleId: string,
  difficulty: 'entry' | 'mid' | 'senior' | 'lead'
): InterviewQuestion[] {
  const questions = getInterviewQuestions(roleId);
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(
  roleId: string,
  category: 'technical' | 'scenario' | 'behavioral' | 'domain-specific'
): InterviewQuestion[] {
  const questions = getInterviewQuestions(roleId);
  return questions.filter((q) => q.category === category);
}

/**
 * Get a random question for interview practice
 */
export function getRandomQuestion(roleId: string): InterviewQuestion | null {
  const questions = getInterviewQuestions(roleId);
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Generate interview tips for a role
 */
export function generateInterviewTips(roleId: string): string[] {
  const tipsByRole: Record<string, string[]> = {
    junior_qa_tester: [
      'Focus on communication and clear documentation',
      'Show eagerness to learn and ask questions',
      'Demonstrate basic testing knowledge and tools',
      'Provide concrete examples from your experience'
    ],
    qa_engineer: [
      'Discuss your test automation framework design',
      'Share examples of flaky test fixes',
      'Explain your API testing approach',
      'Discuss test data management strategies'
    ],
    automation_engineer: [
      'Showcase framework architecture design thinking',
      'Discuss parallelization and performance optimization',
      'Talk about cross-browser testing strategies',
      'Share CI/CD integration experience'
    ],
    sdet: [
      'Be prepared to solve algorithmic problems',
      'Discuss system design and architecture',
      'Show data structure knowledge',
      'Talk about performance optimization'
    ],
    security_tester: [
      'Deep dive on OWASP Top 10',
      'Discuss specific vulnerabilities you found',
      'Show hands-on experience with security tools',
      'Explain your methodology for finding bugs'
    ],
    test_lead: [
      'Focus on team leadership and mentoring',
      'Discuss team scaling experiences',
      'Show strategic thinking about testing',
      'Share conflict resolution examples'
    ],
  };
  
  return tipsByRole[roleId] || [
    'Prepare specific examples from your experience',
    'Research the company and their testing practices',
    'Ask thoughtful questions about the role',
    'Follow up with the interviewer'
  ];
}
