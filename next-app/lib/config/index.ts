/**
 * Centralized Configuration Management
 * All application constants and environment variables in one place
 * Follows 12-Factor App principles
 */

import { z } from 'zod';

// ===========================================
// ENVIRONMENT VARIABLE VALIDATION
// ===========================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI Providers
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  HUGGINGFACE_API_TOKEN: z.string().optional(),
  HUGGINGFACE_MODEL: z.string().optional(),

  // Application URLs
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),

  // Monitoring (optional)
  LOG_ENDPOINT: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
  DATADOG_CLIENT_TOKEN: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

/**
 * Validate and parse environment variables
 * Throws error if required variables are missing
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }

  return parsed.data;
}

// Validate on module load (fails fast)
const env = validateEnv();

// ===========================================
// AI PROVIDER CONFIGURATION
// ===========================================

export const AIConfig = {
  // Gemini Configuration
  gemini: {
    apiKey: env.GEMINI_API_KEY || '',
    model: env.GEMINI_MODEL || 'gemini-pro',
    enabled: !!env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com',
  },

  // HuggingFace Configuration
  huggingface: {
    apiToken: env.HUGGINGFACE_API_TOKEN || '',
    model: env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2',
    enabled: !!env.HUGGINGFACE_API_TOKEN,
  },

  // Fallback Strategy
  fallback: {
    enabled: true,
    order: ['gemini', 'huggingface'] as const,
  },
} as const;

// ===========================================
// CV REVIEW TOOL CONFIGURATION
// ===========================================

export const CVReviewConfig = {
  // Input Validation
  validation: {
    minResumeLength: 100,
    minJobDescriptionLength: 30,
    maxInputLength: 10000, // ~2500 tokens
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  // Caching
  cache: {
    enabled: true,
    maxEntries: 10,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  },

  // History
  history: {
    maxItems: 5,
    storageKey: 'cv-review-history',
  },

  // Retry Logic
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // ms
    maxDelay: 10000, // ms
    backoffMultiplier: 2,
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Feedback
  feedback: {
    maxItems: 50,
  },

  // Timeouts
  timeouts: {
    responseThreshold: 60000, // 60 seconds
    streamChunkTimeout: 5000, // 5 seconds
  },
} as const;

// ===========================================
// OPTIMIZATION MODES
// ===========================================

export const OptimizationModes = {
  minimal: {
    key: 'minimal' as const,
    label: 'Minimal Changes',
    description: 'Preserve original voice, only essential ATS optimization',
    guidance: 'with MINIMAL CHANGES - preserve the user\'s original voice, style, and phrasing. Only modify when absolutely necessary for ATS optimization.',
  },
  balanced: {
    key: 'balanced' as const,
    label: 'Balanced',
    description: 'Moderate rewriting for clarity and keyword matching',
    guidance: 'with BALANCED optimization - moderate rewriting for clarity and keyword matching while maintaining professional tone.',
  },
  aggressive: {
    key: 'aggressive' as const,
    label: 'Aggressive',
    description: 'Extensive rewriting for maximum ATS score',
    guidance: 'with AGGRESSIVE optimization - extensive rewriting for maximum ATS score and keyword density.',
  },
} as const;

export type OptimizationMode = keyof typeof OptimizationModes;

// ===========================================
// SECTION MARKERS (for streaming parsing)
// ===========================================

export const SectionMarkers = {
  markers: [
    '===== SECTION 1:',
    '===== SECTION 2:',
    '===== SECTION 3:',
    '===== SECTION 4:',
    '===== SECTION 5:',
    '===== SECTION 6:',
    '===== SECTION 7:',
  ] as const,

  names: {
    1: 'ATS Optimization Analysis',
    2: 'Behavioral Interview Questions',
    3: 'Technical Interview Questions',
    4: 'Skills Gap & Action Plan',
    5: 'Optimized CV',
    6: 'Cover Letter',
    7: 'Six-Second Recruiter Test',
  } as const,
} as const;

// ===========================================
// QA ROLES CONFIGURATION
// ===========================================

export const QARoles = {
  manual: {
    id: 'manual' as const,
    label: 'Manual QA Tester',
    description: 'Test case design, exploratory testing, bug reporting',
  },
  automation: {
    id: 'automation' as const,
    label: 'Automation QA Engineer',
    description: 'Selenium, Playwright, API testing, CI/CD integration',
  },
  performance: {
    id: 'performance' as const,
    label: 'Performance/Load Testing',
    description: 'JMeter, K6, Gatling, scalability testing',
  },
  security: {
    id: 'security' as const,
    label: 'Security/Penetration Testing',
    description: 'OWASP, vulnerability scanning, security audits',
  },
  mobile: {
    id: 'mobile' as const,
    label: 'Mobile QA (iOS/Android)',
    description: 'Appium, device testing, mobile-specific issues',
  },
  lead: {
    id: 'lead' as const,
    label: 'QA Lead/Manager',
    description: 'ISTQB Test Management, Team Lead, and Process Improvement Expert',
  },
  automotive: {
    id: 'automotive' as const,
    label: 'Automotive QA (ISO 26262)',
    description: 'HiL/SiL, MC/DC, ASPICE, AUTOSAR, Functional Safety',
  },
  game_testing: {
    id: 'game_testing' as const,
    label: 'Game Testing specialist',
    description: 'Console/PC Mechanics, LQA, Multiplayer, Physics',
  },
  gambling: {
    id: 'gambling' as const,
    label: 'Gambling Industry Tester',
    description: 'RNG/RTP validation, UKGC/GLI compliance, TITO',
  },
  ai_testing: {
    id: 'ai_testing' as const,
    label: 'AI & Machine Learning QA',
    description: 'LLM/RAG validation, Metamorphic Testing, Model Drift',
  },
  test_process_improvement: {
    id: 'test_process_improvement' as const,
    label: 'Test Process Consultant',
    description: 'TMMi, TPI Next, IDEAL, Value Stream Mapping',
  },
  test_automation_engineer: {
    id: 'test_automation_engineer' as const,
    label: 'Advanced Automation (TAE)',
    description: 'Automation Architecture (gTAA), TAS lifecycle',
  },
  technical_test_analyst: {
    id: 'technical_test_analyst' as const,
    label: 'Technical Test Analyst (TTA)',
    description: 'White-box, structural analysis, reliability testing',
  },
  test_analyst: {
    id: 'test_analyst' as const,
    label: 'Advanced Test Analyst (TA)',
    description: 'Functional testing, black-box optimization',
  },
  usability_tester: {
    id: 'usability_tester' as const,
    label: 'Usability & Accessibility Specialist',
    description: 'WCAG 2.2, ISO 9241, Heuristic Evaluation',
  }
} as const;

export type QARole = keyof typeof QARoles;

// ===========================================
// MONITORING CONFIGURATION
// ===========================================

export const MonitoringConfig = {
  enabled: env.NODE_ENV === 'production',

  logging: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    endpoint: env.LOG_ENDPOINT,
  },

  sentry: {
    enabled: !!env.SENTRY_DSN,
    dsn: env.SENTRY_DSN,
  },

  datadog: {
    enabled: !!env.DATADOG_CLIENT_TOKEN,
    clientToken: env.DATADOG_CLIENT_TOKEN,
  },

  aws: {
    enabled: !!env.AWS_REGION && !!env.AWS_ACCESS_KEY_ID,
    region: env.AWS_REGION,
  },
} as const;

// ===========================================
// APPLICATION CONSTANTS
// ===========================================

export const AppConfig = {
  name: 'QaiTAlk',
  fullName: 'QAi Talks - Mentorship & Career Development',
  description: 'Connecting mentors with job seekers through blog content, curriculum resources, and AI-powered CV review',
  version: '1.0.0',

  urls: {
    base: env.NEXT_PUBLIC_BASE_URL,
    api: `${env.NEXT_PUBLIC_BASE_URL}/api`,
    github: 'https://github.com/yourusername/qaitalks',
  },

  features: {
    cvReview: true,
    interviewPrep: true,
    blog: true,
    curriculum: true,
    authentication: false, // Not yet implemented
  },

  // Time constants (in milliseconds)
  time: {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  },

  // Size constants (in bytes)
  size: {
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  },
} as const;

// ===========================================
// EXPORTS
// ===========================================

export const Config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  auth: {
    secret: env.AUTH_SECRET,
    github: {
      enabled: !!env.GITHUB_ID && !!env.GITHUB_SECRET,
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    },
    google: {
      enabled: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  ai: AIConfig,
  cvReview: CVReviewConfig,
  monitoring: MonitoringConfig,
  app: AppConfig,

  // Helper functions
  getAIProvider: () => {
    if (AIConfig.gemini.enabled) return 'gemini';
    if (AIConfig.huggingface.enabled) return 'huggingface';
    throw new Error('No AI provider configured');
  },

  isFallbackEnabled: () => {
    return AIConfig.fallback.enabled &&
      (AIConfig.gemini.enabled || AIConfig.huggingface.enabled);
  },
} as const;

// ===========================================
// TYPE EXPORTS
// ===========================================

export type AppEnv = z.infer<typeof envSchema>;
export type AIProvider = 'gemini' | 'huggingface';

// Default export
export default Config;
