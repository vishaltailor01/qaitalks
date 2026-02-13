'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { exportToPDF } from '@/lib/pdfExport'
import { exportOptimizedCV, exportCoverLetter } from '@/lib/cvTemplateExport'
import { 
  saveToHistory, 
  getHistory, 
  deleteHistoryItem, 
  formatHistoryDate, 
  isLocalStorageAvailable, 
  saveDraft,
  loadDraft,
  clearDraft,
  type CVReviewHistoryItem 
} from '@/lib/cvHistory'
import {
  getCachedResult,
  cacheResult,
  formatCacheAge,
  isCacheAvailable,
} from '@/lib/resultCache'
import { FileUpload, CVReviewVersionPanel } from '@/components/sections'
import FeedbackModal from '@/components/sections/FeedbackModal'
import InterviewPractice from '@/components/sections/InterviewPractice'
import { getAllRoleTitles, getQARole } from '@/lib/qa-domain/roles'
import { generateQASkillsReport, type QASkillsReport } from '@/lib/qa-domain/skills-validator'
import type { QARole } from '@/lib/qa-domain/roles'
import { useCVStore, useUIStore } from '@/lib/stores'

// ============================================
// SAMPLE DATA (Phase 1 - Quick Win #2)
// ============================================
const SAMPLE_RESUME = `John Smith
Senior Software Test Engineer | ISTQB Certified
London, UK | john.smith@email.com | +44 7XXX XXXXXX

PROFESSIONAL SUMMARY
Results-driven Senior Software Test Engineer with 7+ years of experience in test automation, CI/CD implementation, and Agile methodologies. Proven track record of reducing defect escape rates by 40% and increasing test coverage to 85%. Expert in Selenium, Cypress, and API testing with strong experience in microservices architecture.

TECHNICAL SKILLS
• Test Automation: Selenium WebDriver, Cypress, Playwright, TestNG, JUnit
• Programming: Java, Python, JavaScript/TypeScript
• CI/CD: Jenkins, GitLab CI, GitHub Actions, Docker
• API Testing: Postman, RestAssured, SoapUI
• Performance Testing: JMeter, Gatling
• Methodologies: Agile/Scrum, BDD, TDD, ISTQB

PROFESSIONAL EXPERIENCE
Senior Test Engineer | Tech Corp Ltd | London, UK | Jan 2021 - Present
• Designed and implemented automated testing framework using Selenium and Java, reducing regression testing time by 60%
• Led migration from manual to automated testing, achieving 85% test automation coverage
• Collaborated with development teams to implement shift-left testing practices
• Mentored 3 junior testers on automation best practices and code reviews

Test Engineer | Digital Solutions PLC | Manchester, UK | Jun 2018 - Dec 2020
• Created comprehensive test strategies for RESTful API testing using RestAssured
• Integrated automated tests into CI/CD pipeline using Jenkins
• Reduced production defects by 35% through rigorous quality assurance processes

EDUCATION
BSc Computer Science | University of Manchester | 2014-2018
ISTQB Foundation Level Certification | 2019`;

const SAMPLE_JOB_DESCRIPTION = `Lead Test Automation Engineer
Location: London, UK (Hybrid - 3 days office)
Salary: £70,000 - £85,000 + benefits

We are seeking an experienced Lead Test Automation Engineer to join our growing QA team. You will be responsible for designing and implementing our test automation strategy across multiple products.

Key Responsibilities:
• Design and develop automated testing frameworks using modern tools
• Lead the implementation of continuous testing in CI/CD pipelines
• Mentor and guide junior team members in automation best practices
• Collaborate with developers to implement quality gates
• Define testing standards and best practices for the organisation

Required Skills:
• 5+ years of experience in test automation
• Strong expertise in Selenium, Cypress, or similar tools
• Proficiency in Java or Python for test automation
• Experience with CI/CD tools (Jenkins, GitLab CI, or similar)
• Knowledge of API testing and microservices architecture
• ISTQB certification preferred
• Excellent communication and leadership skills

Nice to Have:
• Experience with performance testing tools
• Cloud platform experience (AWS, Azure, or GCP)
• Experience with containerization (Docker, Kubernetes)`;

// ============================================
// WORD COUNT UTILITY
// ============================================
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// ============================================
// CLIENT-SIDE LOGGER (Phase 2)
// ============================================
const logger = {
  info: (category: string, message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${category}] ${message}`, data || '');
    }
  },
};

// Utility to unescape HTML entities
function unescape(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/@quot;/g, '"');
}

// Types
interface CVReviewResult {
  atsResume: string
  interviewGuide: string
  domainQuestions: string
  gapAnalysis: string
  optimizedCV: string
  coverLetter: string
  matchedKeywords?: string[]
  provider: 'gemini' | 'huggingface'
  generationTimeMs: number
  // Phase 2: Cache metadata
  cached?: boolean
  contentHash?: string
  cachedAt?: number
}

export default function CVReviewPage() {
  // For Back to Top
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Zustand stores
  const {
    resume,
    jobDescription,
    targetRole,
    industry,
    result,
    isLoading,
    error,
    progress,
    progressMessage,
    setResume,
    setJobDescription,
    setTargetRole,
    setIndustry,
    setResult,
    setIsLoading,
    setError,
    setProgress,
    setProgressMessage,
  } = useCVStore();
  
  const {
    showHistory,
    showComparison,
    showFeedbackModal,
    showInterviewPractice,
    activeTooltip: showTooltip,
    expandedSections,
    setShowHistory,
    setShowComparison,
    setShowFeedbackModal,
    setShowInterviewPractice,
    setActiveTooltip: setShowTooltip,
    toggleSection,
  } = useUIStore();
  
  // Local state (not moved to stores yet)
  const [history, setHistory] = useState<CVReviewHistoryItem[]>([])
  const [optimizationMode, setOptimizationMode] = useState<'minimal' | 'balanced' | 'aggressive'>('minimal')
  const [userInstructions, setUserInstructions] = useState<string>('')
  const [selectedQARole, setSelectedQARole] = useState<QARole | null>(null)
  const [qaRoleTitles, setQARoleTitles] = useState<{ id: string; title: string }[]>([])
  const [qaSkillsReport, setQASkillsReport] = useState<QASkillsReport | null>(null)
  const [comparisonVersions, setComparisonVersions] = useState<[CVReviewHistoryItem | null, CVReviewHistoryItem | null]>([null, null])
  const [currentResultId, setCurrentResultId] = useState<string | null>(null)
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [practiceQuestions, setPracticeQuestions] = useState<string[]>([])
  const [practiceType, setPracticeType] = useState<'behavioral' | 'technical'>('behavioral')
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null)
  const [showDraftNotice, setShowDraftNotice] = useState(false)

  // Load history and draft on mount (Phase 1)
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      setHistory(getHistory());
      
      // Check for existing draft
      const draft = loadDraft();
      if (draft && !resume && !jobDescription) {
        setShowDraftNotice(true);
      }
    }
  }, [resume, jobDescription]);
  
  // Load QA roles on mount
  useEffect(() => {
    const roles = getAllRoleTitles();
    setQARoleTitles(roles);
    
    // Set initial QA role
    const initialRole = getQARole('qa_engineer');
    if (initialRole) {
      setSelectedQARole(initialRole);
    }
  }, []);
  
  // Update selected QA role when targetRole changes
  useEffect(() => {
    if (targetRole) {
      const role = getQARole(targetRole);
      setSelectedQARole(role || null);
    }
  }, [targetRole]);

  // Auto-save draft every 30 seconds (Phase 1)
  useEffect(() => {
    if (!isLocalStorageAvailable() || !resume || !jobDescription) {
      return;
    }

    const saveDraftTimeout = setTimeout(() => {
      saveDraft(resume, jobDescription);
      setLastDraftSave(new Date());
    }, 30000); // 30 seconds

    return () => clearTimeout(saveDraftTimeout);
  }, [resume, jobDescription]);

  // Load sample data (Phase 1)
  const loadSampleData = useCallback(() => {
    setResume(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setError(null);
  }, [setResume, setJobDescription, setError]);

  // Restore draft (Phase 1)
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setResume(draft.resume);
      setJobDescription(draft.jobDescription);
      setShowDraftNotice(false);
      setError(null);
    }
  }, [setResume, setJobDescription, setShowDraftNotice, setError]);

  // Handle file upload (Phase 2)
  const handleFileUpload = useCallback((text: string, fileName: string) => {
    setResume(text);
    setError(null);
    logger.info('file', 'File uploaded successfully', {
      fileName,
      textLength: text.length,
      wordCount: getWordCount(text),
    });
  }, [setResume, setError]);

  // Get character count feedback (Phase 1)
  const getCharCountFeedback = (text: string, minChars: number, type: 'resume' | 'job') => {
    const chars = text.length;
    const words = getWordCount(text);
    
    if (chars === 0) {
      return { color: 'text-slate-500', message: `0 characters, 0 words`, icon: '' };
    }
    
    if (type === 'resume') {
      if (chars < minChars) {
        return { color: 'text-red-600', message: `${chars} chars (${words} words) - Need ${minChars - chars} more`, icon: '❌' };
      } else if (chars < 500) {
        return { color: 'text-amber-600', message: `${chars} chars (${words} words) - Could be more detailed`, icon: '⚠️' };
      } else if (chars < 2000) {
        return { color: 'text-green-600', message: `${chars} chars (${words} words) - Good level of detail ✓`, icon: '✅' };
      } else {
        return { color: 'text-blue-600', message: `${chars} chars (${words} words) - Excellent detail (best results)`, icon: '🎯' };
      }
    } else {
      if (chars < minChars) {
        return { color: 'text-red-600', message: `${chars} chars (${words} words) - Need ${minChars - chars} more`, icon: '❌' };
      } else if (chars < 200) {
        return { color: 'text-amber-600', message: `${chars} chars (${words} words) - Add more requirements for better results`, icon: '⚠️' };
      } else {
        return { color: 'text-green-600', message: `${chars} chars (${words} words) - Good detail ✓`, icon: '✅' };
      }
    }
  };

  // Parse questions from markdown text (Phase 3.3)
  const parseQuestionsFromMarkdown = (text: string): string[] => {
    const questions: string[] = [];
    
    // Match numbered questions like "1. What is..." or "**1.** What is..."
    const numberedRegex = /(?:\*\*)?(\d+)\.(?:\*\*)?\s*(.+?)(?=(?:\*\*)?(?:\d+)\.|\n\n|$)/g;
    const matches = Array.from(text.matchAll(numberedRegex));
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const question = match[2].trim();
        if (question && question.length > 10) {
          questions.push(question);
        }
      });
    } else {
      // Try to match lines starting with "- " or "* "
      const lines = text.split('\n');
      for (const line of lines) {
        const bulletMatch = line.match(/^[\-\*]\s+(.+?)$/);
        if (bulletMatch && bulletMatch[1].includes('?')) {
          questions.push(bulletMatch[1].trim());
        }
      }
    }
    
    return questions;
  };

  // Start interview practice (Phase 3.3)
  const startInterviewPractice = (type: 'behavioral' | 'technical') => {
    if (!result) return;
    
    const text = type === 'behavioral' ? result.interviewGuide : result.domainQuestions;
    const questions = parseQuestionsFromMarkdown(text);
    
    if (questions.length === 0) {
      alert('No questions found in this section. Please generate CV review results first.');
      return;
    }
    
    setPracticeQuestions(questions);
    setPracticeType(type);
    setShowInterviewPractice(true);
  };

  // Streaming handler (Phase 1.6 - Real-time AI response streaming)
  const handleSubmitWithStreaming = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('Connecting to AI...');

    try {
      // Check cache first (Phase 2) - TEMPORARILY DISABLED FOR DEBUGGING
      console.log('[DEBUG] Cache check bypassed - forcing fresh generation');
      /* CACHE DISABLED FOR DEBUGGING
      if (isCacheAvailable()) {
        const cached = getCachedResult(resume, jobDescription);
        if (cached) {
          setProgress(100);
          setProgressMessage('Retrieved from cache...');
          
          const cachedResult: CVReviewResult = {
            ...cached.result,
            cached: true,
            cachedAt: cached.timestamp,
            contentHash: cached.hash,
          };
          
          setResult(cachedResult);
          setIsLoading(false);
          setProgress(0);
          setProgressMessage('');
          
          logger.info('cache', 'Cache hit (streaming)', {
            hash: cached.hash,
            age: Date.now() - cached.timestamp,
          });
          
          return;
        }
      }
      */

      // Start streaming
      const response = await fetch('/api/cv-review/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
          targetRole,
          targetRoleId: targetRole,
          selectedQARole: selectedQARole,
          industry,
          optimizationMode,
          userInstructions: userInstructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate review');
        setIsLoading(false);
        return;
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Track sections as they arrive
      const sectionMessages = [
        'Analyzing your CV against job requirements...',
        'Preparing behavioral interview questions...',
        'Crafting technical interview questions...',
        'Identifying skills gaps and action plan...',
        'Rewriting your CV for ATS optimization...',
        'Generating your cover letter...',
      ];

      let receivedSections = 0;
      let finalResult: CVReviewResult | null = null;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;

          const eventMatch = line.match(/^event: (.+)\ndata: (.+)$/);
          if (!eventMatch) continue;

          const [, eventType, dataStr] = eventMatch;
          const data = JSON.parse(dataStr);

          switch (eventType) {
            case 'section':
              receivedSections++;
              setProgress(Math.round((receivedSections / 6) * 95));
              setProgressMessage(
                `✅ ${data.sectionName} (${receivedSections}/6)`
              );
              logger.info('streaming', `Section ${data.sectionNumber} received`, {
                sectionName: data.sectionName,
                contentLength: data.content?.length || 0,
              });
              break;

            case 'progress':
              setProgress(data.progress || 0);
              if (receivedSections > 0 && receivedSections < 6) {
                setProgressMessage(
                  `Processing... ${sectionMessages[receivedSections] || 'Generating content...'}`
                );
              }
              break;

            case 'parsed':
              // Final parsed sections
              finalResult = data.sections as CVReviewResult;
              setProgress(100);
              setProgressMessage('Complete!');
              break;

            case 'retry':
              // Smart Retry Logic (Phase 2.5)
              setProgress(Math.max(10, progress));
              setProgressMessage(
                `⚠️ Retrying... (Attempt ${data.attempt}/${data.maxAttempts})`
              );
              logger.info('streaming', 'Retry attempt', {
                attempt: data.attempt,
                maxAttempts: data.maxAttempts,
                delay: data.delay,
              });
              break;

            case 'error':
              const errorPrefix = data.retryable ? '⚠️ Temporary error' : '❌ Error';
              setError(`${errorPrefix}: ${data.error || 'Streaming failed'}`);
              setIsLoading(false);
              return;

            case 'complete':
              setProgress(100);
              setProgressMessage('Finalizing...');
              break;

            case 'debug':
              // Log debug messages from backend to browser console
              console.log('[streaming DEBUG]', data.message || data, {
                apiKeyConfigured: data.apiKeyConfigured,
                requestLength: data.requestLength,
                hasFullText: data.hasFullText,
                hasSections: data.hasSections,
                sectionsCount: data.sectionsCount,
              });
              break;
          }
        }
      }

      // Set final result
      if (finalResult) {
        console.log('[DEBUG] Setting final result to state:', {
          hasAtsResume: !!finalResult.atsResume,
          hasInterviewGuide: !!finalResult.interviewGuide,
          hasDomainQuestions: !!finalResult.domainQuestions,
          hasGapAnalysis: !!finalResult.gapAnalysis,
          hasOptimizedCV: !!finalResult.optimizedCV,
          hasCoverLetter: !!finalResult.coverLetter,
        });
        setResult(finalResult);
        
        // Generate QA Skills Report
        if (selectedQARole) {
          const report = generateQASkillsReport(resume, selectedQARole);
          setQASkillsReport(report);
        }

        // Cache the result (Phase 2) - DISABLED FOR DEBUGGING
        console.log('[DEBUG] Cache save skipped during debugging');
        /* CACHE DISABLED FOR DEBUGGING
        if (isCacheAvailable()) {
          cacheResult(resume, jobDescription, finalResult);
        }
        */

        // Save to history and clear draft (Phase 1)
        if (isLocalStorageAvailable()) {
          saveToHistory(finalResult, resume, jobDescription);
          setHistory(getHistory());
          clearDraft();
          setLastDraftSave(null);
          setShowDraftNotice(false);
        }

        logger.info('streaming', 'Stream complete', {
          sectionsReceived: receivedSections,
        });
      } else {
        setError('Failed to parse response');
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setError('Network error during streaming. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleSubmit = handleSubmitWithStreaming;

  // Regenerate (bypass cache) - Phase 2 with streaming
  const handleRegenerate = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Regenerating with AI...');

    try {
      // Start streaming (bypass cache)
      const response = await fetch('/api/cv-review/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
          targetRole,
          targetRoleId: targetRole,
          selectedQARole: selectedQARole,
          industry,
          bypassCache: true, // Force fresh generation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate review');
        setIsLoading(false);
        return;
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      const sectionMessages = [
        'Analyzing your CV against job requirements...',
        'Preparing behavioral interview questions...',
        'Crafting technical interview questions...',
        'Identifying skills gaps and action plan...',
        'Rewriting your CV for ATS optimization...',
        'Generating your cover letter...',
      ];

      let receivedSections = 0;
      let finalResult: CVReviewResult | null = null;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;

          const eventMatch = line.match(/^event: (.+)\ndata: (.+)$/);
          if (!eventMatch) continue;

          const [, eventType, dataStr] = eventMatch;
          const data = JSON.parse(dataStr);

          switch (eventType) {
            case 'section':
              receivedSections++;
              setProgress(Math.round((receivedSections / 6) * 95));
              setProgressMessage(
                `✅ ${data.sectionName} (${receivedSections}/6)`
              );
              break;

            case 'progress':
              setProgress(data.progress || 0);
              if (receivedSections > 0 && receivedSections < 6) {
                setProgressMessage(
                  `Processing... ${sectionMessages[receivedSections] || 'Generating content...'}`
                );
              }
              break;

            case 'parsed':
              finalResult = data.sections as CVReviewResult;
              console.log('[DEBUG] Parsed result received:', {
                hasResult: !!finalResult,
                keys: finalResult ? Object.keys(finalResult) : [],
                atsResume: finalResult?.atsResume ? 'present' : 'missing',
                interviewGuide: finalResult?.interviewGuide ? 'present' : 'missing',
                domainQuestions: finalResult?.domainQuestions ? 'present' : 'missing',
              });
              setProgress(100);
              setProgressMessage('Complete!');
              break;

            case 'retry':
              // Smart Retry Logic (Phase 2.5)
              setProgress(Math.max(10, progress));
              setProgressMessage(
                `⚠️ Retrying... (Attempt ${data.attempt}/${data.maxAttempts})`
              );
              break;

            case 'error':
              const errorPrefix = data.retryable ? '⚠️ Temporary error' : '❌ Error';
              setError(`${errorPrefix}: ${data.error || 'Streaming failed'}`);
              setIsLoading(false);
              return;

            case 'complete':
              setProgress(100);
              setProgressMessage('Finalizing...');
              break;
          }
        }
      }

      // Set final result
      if (finalResult) {
        setResult(finalResult);
        
        // Generate QA Skills Report
        if (selectedQARole) {
          const report = generateQASkillsReport(resume, selectedQARole);
          setQASkillsReport(report);
        }

        // Update cache with new result
        if (isCacheAvailable()) {
          cacheResult(resume, jobDescription, finalResult);
        }

        // Update history
        if (isLocalStorageAvailable()) {
          saveToHistory(finalResult, resume, jobDescription);
          setHistory(getHistory());
        }

        logger.info('streaming', 'Regenerate stream complete', {
          sectionsReceived: receivedSections,
        });
      } else {
        setError('Failed to parse response');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const isFormValid = resume.length >= 100 && jobDescription.length >= 30
  
  // Get feedback for display
  const resumeFeedback = getCharCountFeedback(resume, 100, 'resume');
  const jobFeedback = getCharCountFeedback(jobDescription, 30, 'job');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-logic-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-accent/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-block mb-6 px-3 py-1 bg-white border-2 border-logic-cyan rounded-full font-mono text-xs font-semibold text-logic-cyan-bright tracking-widest">
            🤖 AI-POWERED TOOL
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint mb-6 leading-tight">
            CV Review & Interview Prep
          </h1>
          
          <p className="text-lg md:text-xl text-text-slate mb-8 max-w-3xl opacity-90 leading-relaxed">
            UK-focused CV review with 20 interview questions (10 behavioural STAR + 10 domain-specific technical), 
            complete UK CV rewrite, ATS optimisation, and Six-Second Recruiter Test. <span className="font-semibold text-deep-blueprint">100% private, no data stored.</span>
          </p>

          {/* Privacy Badge */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-green-500/20">
              <span className="text-2xl">🔒</span>
              <span className="text-sm font-semibold text-slate-700">No Data Stored</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-blue-500/20">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-slate-700">Results in ~60s</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-purple-500/20">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-semibold text-slate-700">ATS Optimized</span>
            </div>
            {/* Try Example Button (Phase 1) */}
            <button
              type="button"
              onClick={loadSampleData}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors shadow-md"
            >
              <span className="text-2xl">✨</span>
              <span className="text-sm font-semibold text-white">Try Example</span>
            </button>
            {history.length > 0 && (
              <>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-amber-500/20 hover:bg-amber-50 transition-colors"
                >
                  <span className="text-2xl">📚</span>
                  <span className="text-sm font-semibold text-slate-700">
                    History ({history.length})
                  </span>
                </button>
                {history.length >= 2 && (
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-purple-500/20 hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-2xl">🔄</span>
                    <span className="text-sm font-semibold text-slate-700">
                      Compare Versions
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* History Sidebar */}
      {showHistory && history.length > 0 && (
        <section className="pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-deep-blueprint flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Recent Reviews (Last {history.length})
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-500 hover:text-slate-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setResult(item.result);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate mb-1">
                          {item.resumePreview}...
                        </p>
                        <p className="text-xs text-slate-500 truncate mb-2">
                          Job: {item.jobPreview}...
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{formatHistoryDate(item.timestamp)}</span>
                          <span>•</span>
                          <span>{item.result.provider === 'gemini' ? '🚀 Gemini' : '🤗 HuggingFace'}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                          setHistory(getHistory());
                        }}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Reviews are saved locally in your browser. Maximum 5 recent reviews.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Version Comparison (Phase 2.4) */}
      {showComparison && history.length >= 2 && (
        <section className="pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-500/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-deep-blueprint flex items-center gap-2">
                  <span>🔄</span>
                  Compare CV Review Versions
                </h3>
                <button
                  onClick={() => {
                    setShowComparison(false);
                    setComparisonVersions([null, null]);
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Version Selectors */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-deep-blueprint mb-3">
                    📋 Version 1 (Older)
                  </label>
                  <select
                    aria-label="Select Version 1 (Older) for comparison"
                    value={comparisonVersions[0]?.id || ''}
                    onChange={(e) => {
                      const selected = history.find(h => h.id === e.target.value);
                      setComparisonVersions([selected || null, comparisonVersions[1]]);
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors bg-white"
                  >
                    <option value="">Select a version...</option>
                    {history.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatHistoryDate(item.timestamp)} - {item.resumePreview.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-deep-blueprint mb-3">
                    📋 Version 2 (Newer)
                  </label>
                  <select
                    aria-label="Select Version 2 (Newer) for comparison"
                    value={comparisonVersions[1]?.id || ''}
                    onChange={(e) => {
                      const selected = history.find(h => h.id === e.target.value);
                      setComparisonVersions([comparisonVersions[0], selected || null]);
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors bg-white"
                  >
                    <option value="">Select a version...</option>
                    {history.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatHistoryDate(item.timestamp)} - {item.resumePreview.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Display */}
              {comparisonVersions[0] && comparisonVersions[1] && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <span>💡</span>
                      <span>Comparing <strong>{formatHistoryDate(comparisonVersions[0].timestamp)}</strong> vs <strong>{formatHistoryDate(comparisonVersions[1].timestamp)}</strong></span>
                    </p>
                  </div>

                  {/* Section-by-Section Comparison */}
                  <div className="space-y-6">
                    {[
                      { key: 'atsResume' as const, label: '📊 ATS Resume Analysis', icon: '📊' },
                      { key: 'interviewGuide' as const, label: '💼 Behavioral Interview Questions', icon: '💼' },
                      { key: 'domainQuestions' as const, label: '🔧 Technical Interview Questions', icon: '🔧' },
                      { key: 'gapAnalysis' as const, label: '📈 Skills Gap Analysis', icon: '📈' },
                      { key: 'optimizedCV' as const, label: '✨ Optimized CV', icon: '✨' },
                      { key: 'coverLetter' as const, label: '✉️ Cover Letter', icon: '✉️' },
                    ].map((section) => {
                      const content1 = comparisonVersions[0]!.result[section.key] || '';
                      const content2 = comparisonVersions[1]!.result[section.key] || '';
                      const hasChanges = content1 !== content2;

                      return (
                        <div key={section.key} className="border-2 border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-100 px-6 py-3 flex items-center justify-between">
                            <h4 className="font-bold text-deep-blueprint flex items-center gap-2">
                              <span>{section.icon}</span>
                              {section.label}
                            </h4>
                            {hasChanges ? (
                              <span className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-semibold">
                                CHANGED
                              </span>
                            ) : (
                              <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                                SAME
                              </span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-0 divide-x-2 divide-slate-200">
                            <div className="p-6 bg-blue-50/30">
                              <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                                <span>📅</span>
                                Version 1: {formatHistoryDate(comparisonVersions[0]!.timestamp)}
                              </div>
                              <div className="prose prose-sm max-w-none text-slate-700">
                                <pre className="whitespace-pre-wrap text-xs font-mono bg-white p-4 rounded border">
                                  {unescape(content1).substring(0, 500)}{content1.length > 500 ? '...' : ''}
                                </pre>
                              </div>
                            </div>
                            <div className="p-6 bg-purple-50/30">
                              <div className="text-xs font-bold text-purple-700 mb-3 flex items-center gap-2">
                                <span>📅</span>
                                Version 2: {formatHistoryDate(comparisonVersions[1]!.timestamp)}
                              </div>
                              <div className="prose prose-sm max-w-none text-slate-700">
                                <pre className="whitespace-pre-wrap text-xs font-mono bg-white p-4 rounded border">
                                  {unescape(content2).substring(0, 500)}{content2.length > 500 ? '...' : ''}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!comparisonVersions[0] || !comparisonVersions[1]) && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg">👆 Select two versions above to compare</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Form Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {!result ? (
            <div className="space-y-6">
              {/* Draft Restore Notice (Phase 1) */}
              {showDraftNotice && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">💾</span>
                      <div>
                        <h3 className="font-bold text-amber-900 mb-1">Draft Found</h3>
                        <p className="text-sm text-amber-800">
                          We found a previously saved draft. Would you like to restore it?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={restoreDraft}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-sm"
                      >
                        Restore Draft
                      </button>
                      <button
                        onClick={() => setShowDraftNotice(false)}
                        className="px-4 py-2 bg-white border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-semibold text-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8 md:p-12">
                {/* Draft Save Indicator (Phase 1) */}
                {lastDraftSave && (
                  <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <span>💾</span>
                    <span>Draft saved at {lastDraftSave.toLocaleTimeString()}</span>
                  </div>
                )}

                {/* Enhanced AI Prompts (Phase 2.3) */}
                <div className="mb-8 grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="targetRole" className="block text-sm font-bold text-deep-blueprint mb-2 flex items-center gap-2">
                      🎯 Target Role
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip('role')}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                          aria-label="Help"
                        >
                          ?
                        </button>
                        {showTooltip === 'role' && (
                          <div className="absolute z-10 -top-2 left-8 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl">
                            Select your target role to get more relevant interview questions and CV optimization tips
                          </div>
                        )}
                      </div>
                    </label>
                    <select
                      id="targetRole"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors bg-white"
                      aria-label="Select target QA role"
                    >
                      {qaRoleTitles.map((roleItem) => {
                        const role = getQARole(roleItem.id);
                        return role ? (
                          <option key={roleItem.id} value={roleItem.id}>
                            {role.title} ({role.level[0].toUpperCase() + role.level.slice(1)})
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-bold text-deep-blueprint mb-2 flex items-center gap-2">
                      🏢 Industry
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip('industry')}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                          aria-label="Help"
                        >
                          ?
                        </button>
                        {showTooltip === 'industry' && (
                          <div className="absolute z-10 -top-2 left-8 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl">
                            Industry context helps tailor technical questions and domain-specific CV keywords
                          </div>
                        )}
                      </div>
                    </label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors bg-white"
                      aria-label="Select industry"
                    >
                      <option value="Technology">Technology / SaaS</option>
                      <option value="FinTech">FinTech / Banking</option>
                      <option value="E-commerce">E-commerce / Retail</option>
                      <option value="Healthcare">Healthcare / MedTech</option>
                      <option value="Insurance">Insurance / InsurTech</option>
                      <option value="Telecommunications">Telecommunications</option>
                      <option value="Gaming">Gaming / Entertainment</option>
                      <option value="Automotive">Automotive / Mobility</option>
                      <option value="Energy">Energy / Utilities</option>
                      <option value="Education">Education / EdTech</option>
                      <option value="Travel">Travel / Hospitality</option>
                      <option value="Government">Government / Public Sector</option>
                      <option value="Consulting">Consulting / Professional Services</option>
                      <option value="Manufacturing">Manufacturing / Industrial</option>
                      <option value="Media">Media / Publishing</option>
                    </select>
                  </div>
                </div>

                {/* Optimization Mode & User Instructions (Phase 3) */}
                <div className="mb-8 grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="optimizationMode" className="block text-sm font-bold text-deep-blueprint mb-2 flex items-center gap-2">
                      ⚙️ Optimization Mode
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip('optimization')}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                          aria-label="Help"
                        >
                          ?
                        </button>
                        {showTooltip === 'optimization' && (
                          <div className="absolute z-10 -top-2 left-8 w-72 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl">
                            <strong className="block mb-2">Choose how much to change your CV:</strong>
                            <ul className="space-y-1">
                              <li><strong>Minimal:</strong> Preserve your voice, fix only ATS issues</li>
                              <li><strong>Balanced:</strong> Moderate rewriting for clarity and keywords</li>
                              <li><strong>Aggressive:</strong> Extensive rewrite for maximum ATS optimization</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </label>
                    <select
                      id="optimizationMode"
                      value={optimizationMode}
                      onChange={(e) => setOptimizationMode(e.target.value as 'minimal' | 'balanced' | 'aggressive')}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors bg-white"
                      aria-label="Select optimization mode"
                    >
                      <option value="minimal">🎨 Minimal Changes (Preserve Voice)</option>
                      <option value="balanced">⚖️ Balanced (Recommended)</option>
                      <option value="aggressive">🚀 Aggressive (Max ATS Score)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="userInstructions" className="block text-sm font-bold text-deep-blueprint mb-2 flex items-center gap-2">
                      📝 Custom Instructions (Optional)
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip('instructions')}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                          aria-label="Help"
                        >
                          ?
                        </button>
                        {showTooltip === 'instructions' && (
                          <div className="absolute z-10 -top-2 left-8 w-72 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl">
                            <strong className="block mb-2">Examples:</strong>
                            <ul className="space-y-1">
                              <li>• "Emphasize leadership experience"</li>
                              <li>• "Keep technical jargon for engineering role"</li>
                              <li>• "Highlight remote work achievements"</li>
                              <li>• "Focus on quantifiable metrics"</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </label>
                    <textarea
                      id="userInstructions"
                      value={userInstructions}
                      onChange={(e) => setUserInstructions(e.target.value)}
                      placeholder="e.g., 'Emphasize leadership skills' or 'Keep technical terms'"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors resize-none text-sm"
                      rows={3}
                      maxLength={500}
                      aria-label="Enter custom instructions for CV optimization"
                    />
                    <div className="text-xs text-slate-500 mt-1 text-right">
                      {userInstructions.length}/500 characters
                    </div>
                  </div>
                </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Resume Input */}
                <div>
                  <label htmlFor="resume" className="block text-lg font-bold text-deep-blueprint mb-3 flex items-center gap-2">
                    Your Resume / CV
                    <span className="text-warning-amber ml-2">*</span>
                    {/* Tooltip (Phase 1) */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('resume')}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                        aria-label="Help"
                      >
                        ?
                      </button>
                      {showTooltip === 'resume' && (
                        <div className="absolute left-0 top-8 z-50 w-72 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl">
                          <p className="mb-2"><strong>Tip:</strong> Include your full work history, skills, and achievements.</p>
                          <p>Recommended: 500-2000 words for best AI results. More detail = more personalized feedback.</p>
                        </div>
                      )}
                    </div>
                  </label>
                  
                  {/* File Upload Component (Phase 2) */}
                  <div className="mb-4">
                    <FileUpload 
                      onTextExtracted={handleFileUpload}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-slate-500">
                      Or paste text manually
                    </div>
                    <textarea
                      id="resume"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste your resume text here (minimum 100 characters)..."
                      className="w-full h-96 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors resize-none font-mono text-sm"
                      required
                      minLength={100}
                    />
                  </div>
                  <div className={`text-xs mt-2 font-semibold ${resumeFeedback.color} flex items-center gap-2`}>
                    {resumeFeedback.icon && <span>{resumeFeedback.icon}</span>}
                    <span>{resumeFeedback.message}</span>
                  </div>
                  {resume.length >= 100 && resume.length < 500 && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 Better results with 500+ words (you have {getWordCount(resume)} words)
                    </p>
                  )}
                </div>

                {/* Job Description Input */}
                <div>
                  <label htmlFor="jobDescription" className="block text-lg font-bold text-deep-blueprint mb-3 flex items-center gap-2">
                    Target Job Description
                    <span className="text-warning-amber ml-2">*</span>
                    {/* Tooltip (Phase 1) */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('job')}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="w-5 h-5 rounded-full bg-logic-cyan/20 text-logic-cyan text-xs font-bold flex items-center justify-center hover:bg-logic-cyan/30 transition-colors"
                        aria-label="Help"
                      >
                        ?
                      </button>
                      {showTooltip === 'job' && (
                        <div className="absolute left-0 top-8 z-50 w-72 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl">
                          <p className="mb-2"><strong>Tip:</strong> Include the full job posting with requirements and responsibilities.</p>
                          <p>The more details you provide, the better the AI can tailor interview questions and CV optimization.</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description you're targeting (minimum 30 characters)..."
                    className="w-full h-96 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors resize-none font-mono text-sm"
                    required
                    minLength={30}
                  />
                  <div className={`text-xs mt-2 font-semibold ${jobFeedback.color} flex items-center gap-2`}>
                    {jobFeedback.icon && <span>{jobFeedback.icon}</span>}
                    <span>{jobFeedback.message}</span>
                  </div>
                  {jobDescription.length >= 30 && jobDescription.length < 200 && (
                    <p className="text-xs text-amber-600 mt-1">
                      💡 Add more job requirements for better tailored results
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">Error</h3>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-4 px-8 rounded-lg font-bold text-lg transition-all duration-300 ${
                  !isFormValid || isLoading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-logic-cyan to-logic-cyan-bright text-white hover:shadow-2xl hover:shadow-logic-cyan/50 hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{progressMessage || 'Generating Review...'}</span>
                    </div>
                    {/* Progress Bar (Phase 1) */}
                    {progress > 0 && (
                      <div className="w-full bg-slate-400/30 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round(progress)))}%` }}
                          role="progressbar"
                          aria-label="CV review generation progress"
                          aria-valuenow={Number.isFinite(progress) ? Math.round(progress) : 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    )}
                    {progress > 0 && (
                      <p className="text-sm opacity-90">{Math.round(progress)}% complete</p>
                    )}
                  </div>
                ) : (
                  '🚀 Generate AI Review'
                )}
              </button>

              {/* Privacy Notice */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Privacy Notice:</strong> Your resume and job description are processed in real-time and never stored on our servers. 
                  All data is handled client-side and deleted after generation. We comply with GDPR and do not share any information with third parties.
                </p>
              </div>
            </form>
            </div>
          ) : (
            /* Results Display with Version Panel */
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Results */}
              <div className="flex-1 space-y-6 relative">
                {/* Sticky Section Navigation */}
                <nav className="hidden md:block sticky top-8 z-30">
                  <ul className="flex gap-3 mb-6">
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('ats-section')?.scrollIntoView({behavior:'smooth'})}>ATS Analysis</button></li>
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('interview-section')?.scrollIntoView({behavior:'smooth'})}>Behavioural Qs</button></li>
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('domain-section')?.scrollIntoView({behavior:'smooth'})}>Technical Qs</button></li>
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('gap-section')?.scrollIntoView({behavior:'smooth'})}>Skills Gap</button></li>
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('cv-section')?.scrollIntoView({behavior:'smooth'})}>Optimized CV</button></li>
                    <li><button type="button" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-xs font-bold" onClick={() => document.getElementById('cover-section')?.scrollIntoView({behavior:'smooth'})}>Cover Letter</button></li>
                  </ul>
                </nav>
              {/* Cache Status Banner removed as per request */}

              {/* QA Role Meta & Readiness Score */}
              {selectedQARole && qaSkillsReport && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-blue-200 p-8">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Role Information */}
                    <div className="md:col-span-2">
                      <h2 className="text-2xl font-bold text-deep-blueprint flex items-center gap-2 mb-4">
                        <span className="text-3xl">🎯</span>
                        {selectedQARole.title}
                      </h2>
                      <div className="space-y-2 text-sm text-slate-700">
                        <p><strong>Category:</strong> {selectedQARole.category.charAt(0).toUpperCase() + selectedQARole.category.slice(1)}</p>
                        <p><strong>Experience Level:</strong> {selectedQARole.yearsExperience.min}-{selectedQARole.yearsExperience.max} years</p>
                        <p><strong>Key Focus:</strong> {selectedQARole.keyResponsibilities[0]}</p>
                      </div>
                    </div>
                    
                    {/* Readiness Score */}
                    <div className="bg-white rounded-xl p-6 text-center border-2 border-blue-300">
                      <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                        {qaSkillsReport.overallReadiness}%
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Role Readiness</p>
                      <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round(qaSkillsReport.overallReadiness)))}%` }}
                          role="progressbar"
                          aria-label="Role readiness percentage"
                          aria-valuenow={Number.isFinite(qaSkillsReport.overallReadiness) ? Math.round(qaSkillsReport.overallReadiness) : 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Strengths & Gaps */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                      <p className="text-sm font-bold text-green-900 mb-2">✅ Your Strengths</p>
                      <ul className="text-xs text-green-800 space-y-1">
                        {qaSkillsReport.strengths.map((strength: string, i: number) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Critical Gaps</p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        {qaSkillsReport.criticalGaps.map((gap: string, i: number) => (
                          <li key={i}>• {gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Results Header */}
              <div id="ats-section" className="bg-white rounded-2xl shadow-xl border-2 border-green-500/20 p-8 mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-8 bg-green-400 rounded-full mr-2" />
                  <h2 className="text-2xl font-bold text-deep-blueprint flex items-center gap-3">✅ Review Generated Successfully</h2>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-deep-blueprint flex items-center gap-3">
                    ✅ Review Generated Successfully
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const resultId = `result_${Date.now()}`;
                        setCurrentResultId(resultId);
                        setShowFeedbackModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
                    >
                      ⭐ Rate This Result
                    </button>
                    <button
                      onClick={() => {
                        setResult(null)
                        setResume('')
                        setJobDescription('')
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      ← New Review
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {result.cached 
                    ? `Originally generated in ${(result.generationTimeMs / 1000).toFixed(1)}s • Retrieved instantly from cache`
                    : `Generated in ${(result.generationTimeMs / 1000).toFixed(1)}s using ${result.provider === 'gemini' ? '🚀 Gemini AI' : '🤗 HuggingFace AI'}`
                  }
                </p>
                {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Terms Identified:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-logic-cyan/10 text-logic-cyan-bright border border-logic-cyan/20 rounded-full text-xs font-semibold"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic Role Analysis & ATS Optimisation */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8">
                <h3 className="text-xl font-bold text-deep-blueprint mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Strategic Role Analysis & ATS Optimisation
                </h3>
                <div className="prose max-w-none">
                  <ReactMarkdown 
                    components={{
                      // Highlight keywords if available
                      p: ({children}) => {
                        if (typeof children === 'string' && result.matchedKeywords) {
                          let text = children;
                          result.matchedKeywords.forEach(keyword => {
                            const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
                            text = text.replace(regex, `<mark class="bg-logic-cyan/20 px-1 rounded">$1</mark>`);
                          });
                          return <p dangerouslySetInnerHTML={{__html: text}} className="mb-4 text-slate-700" />;
                        }
                        return <p className="mb-4 text-slate-700">{children}</p>;
                      }
                    }}
                  >
                    {unescape(result.atsResume)}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Interview Preparation Guide */}
              <div id="interview-section" className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 overflow-hidden mt-12">
                <button
                  onClick={() => toggleSection('interview')}
                  className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-400 rounded-full mr-2" />
                    <h3 className="text-xl font-bold text-deep-blueprint flex items-center gap-2">
                      <span className="text-2xl">🎤</span>
                      Behavioural & Soft Skills Questions (5 STAR Method)
                    </h3>
                  </div>
                  {expandedSections.interview ? 
                    <ChevronUp className="w-6 h-6 text-slate-400" /> : 
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  }
                </button>
                <button
                  onClick={() => toggleSection('interview')}
                  className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-deep-blueprint flex items-center gap-2">
                    <span className="text-2xl">🎤</span>
                    Behavioural & Soft Skills Questions (5 STAR Method)
                  </h3>
                  {expandedSections.interview ? 
                    <ChevronUp className="w-6 h-6 text-slate-400" /> : 
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  }
                </button>
                {expandedSections.interview && (
                  <div className="px-8 pb-8">
                    <div className="prose max-w-none">
                      <ReactMarkdown>{unescape(result.interviewGuide)}</ReactMarkdown>
                    </div>
                    
                    {/* Interview Practice Button removed as per request */}
                  </div>
                )}
              </div>

              {/* Domain Questions */}
              <div id="domain-section" className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 overflow-hidden mt-12">
                <button
                  onClick={() => toggleSection('domain')}
                  className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-400 rounded-full mr-2" />
                    <h3 className="text-xl font-bold text-deep-blueprint flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Domain-Specific Technical Questions (5 Questions)
                    </h3>
                  </div>
                  {expandedSections.domain ? 
                    <ChevronUp className="w-6 h-6 text-slate-400" /> : 
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  }
                </button>
                <button
                  onClick={() => toggleSection('domain')}
                  className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-deep-blueprint flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Domain-Specific Technical Questions (5 Questions)
                  </h3>
                  {expandedSections.domain ? 
                    <ChevronUp className="w-6 h-6 text-slate-400" /> : 
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  }
                </button>
                {expandedSections.domain && (
                  <div className="px-8 pb-8">
                    <div className="prose max-w-none">
                      <ReactMarkdown>{unescape(result.domainQuestions)}</ReactMarkdown>
                    </div>
                    
                    {/* Technical Practice Button removed as per request */}
                  </div>
                )}
              </div>

              {/* Skills Gap & Action Plan */}
              <div id="gap-section" className="bg-white rounded-2xl shadow-xl border-2 border-warning-amber/30 p-8 mt-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-8 bg-amber-400 rounded-full mr-2" />
                  <h3 className="text-xl font-bold text-deep-blueprint flex items-center gap-2"><span className="text-2xl">📊</span>Skills Gap & Action Plan</h3>
                </div>
                <div className="prose max-w-none">
                  <ReactMarkdown>{unescape(result.gapAnalysis)}</ReactMarkdown>
                </div>
              </div>

              {/* Optimized CV Section */}
              {result.optimizedCV && (
                <div id="cv-section" className="bg-white rounded-2xl shadow-xl border-2 border-logic-cyan/30 p-8 mt-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-8 bg-cyan-400 rounded-full mr-2" />
                    <h3 className="text-xl font-bold text-logic-cyan-bright flex items-center gap-2"><span className="text-2xl">📝</span>The Rewritten UK CV (with Six-Second Recruiter Test)</h3>
                  </div>
                  <div className="prose max-w-none mb-6">
                    <ReactMarkdown
                      components={{
                        p: ({children}) => {
                          if (typeof children === 'string' && result.matchedKeywords) {
                            let text = children;
                            result.matchedKeywords.forEach(keyword => {
                              const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
                              text = text.replace(regex, `<mark class=\"bg-logic-cyan/20 px-1 rounded font-bold\">$1</mark>`);
                            });
                            return <p dangerouslySetInnerHTML={{__html: text}} className="mb-4 text-slate-700" />;
                          }
                          return <p className="mb-4 text-slate-700">{children}</p>;
                        }
                      }}
                    >
                      {unescape(result.optimizedCV)}
                    </ReactMarkdown>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        try {
                          exportOptimizedCV(result.optimizedCV!, {
                            format: 'professional',
                            colorScheme: 'blue',
                            includeKeywords: true,
                            qaRole: selectedQARole,
                            qaFocused: true,
                          });
                        } catch (error) {
                          alert('Failed to export PDF. Please try again.');
                          console.error('PDF export error:', error);
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-logic-cyan to-logic-cyan-bright text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-600/30 transition-all duration-300 flex items-center gap-2"
                    >
                      📥 Download Professional CV (PDF)
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(unescape(result.optimizedCV!));
                        alert('Optimized CV copied to clipboard!');
                      }}
                      className="px-6 py-3 bg-logic-cyan text-white rounded-lg font-semibold hover:bg-logic-cyan-bright transition-colors"
                    >
                      📋 Copy Text
                    </button>
                  </div>
                </div>
              )}

              {/* Cover Letter Section */}
              {result.coverLetter && (
                <div id="cover-section" className="bg-white rounded-2xl shadow-xl border-2 border-purple-400/30 p-8 mt-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-8 bg-purple-400 rounded-full mr-2" />
                    <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2"><span className="text-2xl">✉️</span>Tailored UK Cover Letter</h3>
                  </div>
                  <div className="prose max-w-none mb-6">
                    <ReactMarkdown>{unescape(result.coverLetter)}</ReactMarkdown>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        try {
                          exportCoverLetter(result.coverLetter!, 'purple');
                        } catch (error) {
                          alert('Failed to export cover letter PDF.');
                          console.error('PDF export error:', error);
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 flex items-center gap-2"
                    >
                      📥 Download Cover Letter (PDF)
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(unescape(result.coverLetter!));
                        alert('Cover letter copied to clipboard!');
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      📋 Copy Text
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
              {/* Back to Top Button */}
              {showTop && (
                <button
                  type="button"
                  onClick={() => window.scrollTo({top:0,behavior:'smooth'})}
                  className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-bold"
                  aria-label="Back to Top"
                >
                  ⬆ Back to Top
                </button>
              )}
                <button
                  onClick={() => {
                    try {
                      exportToPDF(result);
                    } catch (error) {
                      alert('Failed to export PDF. Please try again or use the print option.');
                      console.error('PDF export error:', error);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-600/30 transition-all duration-300"
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-deep-blueprint text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                >
                  🖨️ Print Results
                </button>
                <button
                  onClick={() => {
                    const text = `ATS Resume:\n${result.atsResume}\n\nInterview Guide:\n${result.interviewGuide}\n\nDomain Questions:\n${result.domainQuestions}\n\nGap Analysis:\n${result.gapAnalysis}`
                    navigator.clipboard.writeText(text)
                    alert('Results copied to clipboard!')
                  }}
                  className="px-6 py-3 bg-logic-cyan text-white rounded-lg font-semibold hover:bg-logic-cyan-bright transition-colors"
                >
                  📋 Copy All Results
                </button>
              </div>
              </div>
              {/* Version History Sidebar */}
              <div className="w-full md:w-80 shrink-0">
                <CVReviewVersionPanel
                  currentVersionId={currentVersionId ?? undefined}
                  onRestore={version => {
                    // Restore versioned result
                    try {
                      const parsed = {
                        ...JSON.parse(version.response),
                        // fallback for legacy fields
                        atsResume: JSON.parse(version.response).atsResume || '',
                        interviewGuide: JSON.parse(version.response).interviewGuide || '',
                        domainQuestions: JSON.parse(version.response).domainQuestions || '',
                        gapAnalysis: JSON.parse(version.response).gapAnalysis || '',
                        optimizedCV: JSON.parse(version.response).optimizedCV || '',
                        coverLetter: JSON.parse(version.response).coverLetter || '',
                        matchedKeywords: JSON.parse(version.response).matchedKeywords || [],
                        provider: JSON.parse(version.response).provider || 'gemini',
                        generationTimeMs: JSON.parse(version.response).generationTimeMs || 0,
                      };
                      setResult(parsed);
                      setCurrentVersionId(version.id);
                    } catch (e) {
                      alert('Failed to restore version: ' + (e as Error).message);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gradient-to-br from-deep-blueprint to-blue-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
              AI-powered analysis in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">1. Paste Your Content</h3>
              <p className="text-slate-200 leading-relaxed">
                Add your resume and target job description. No file uploads needed, just copy & paste.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">2. UK-Focused AI Analysis</h3>
              <p className="text-slate-200 leading-relaxed">
                Our AI specialises in UK tech recruitment, analyses role alignment, generates 20 interview questions (10 behavioural + 10 technical), and uses British English throughout.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3">3. Get Results</h3>
              <p className="text-slate-200 leading-relaxed">
                Receive complete UK CV rewrite, 20 STAR interview questions, skills gap action plan, and Six-Second Recruiter Test.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Modal (Phase 3.1 + Phase 5 QA Enhancement) */}
      {showFeedbackModal && currentResultId && (
        <FeedbackModal
          resultId={currentResultId}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={() => {
            // Refresh to show feedback submitted state
            setShowFeedbackModal(false);
          }}
          selectedQARole={selectedQARole}
          qaSkillsReport={qaSkillsReport}
        />
      )}

      {/* Interview Practice Modal (Phase 3.3) */}
      {showInterviewPractice && (
        <InterviewPractice
          questions={practiceQuestions}
          type={practiceType}
          onClose={() => setShowInterviewPractice(false)}
        />
      )}
    </main>
  )
}
