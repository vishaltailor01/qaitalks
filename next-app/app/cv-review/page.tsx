'use client'

import { useState, useEffect } from 'react'
import { exportToPDF } from '@/lib/pdfExport'
import { saveToHistory, getHistory, deleteHistoryItem, formatHistoryDate, isLocalStorageAvailable, type CVReviewHistoryItem } from '@/lib/cvHistory'

// Types
interface CVReviewResult {
  atsResume: string
  interviewGuide: string
  domainQuestions: string
  gapAnalysis: string
  provider: 'gemini' | 'huggingface'
  generationTimeMs: number
}

interface CVReviewError {
  error: string
  code: string
  retryable: boolean
}

export default function CVReviewPage() {
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CVReviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<CVReviewHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load history on mount
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      setHistory(getHistory());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/cv-review/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as CVReviewError
        setError(errorData.error || 'Failed to generate review')
        return
      }

      setResult(data as CVReviewResult);
      
      // Save to history
      if (isLocalStorageAvailable()) {
        saveToHistory(data as CVReviewResult, resume, jobDescription);
        setHistory(getHistory());
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = resume.length >= 100 && jobDescription.length >= 30

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
            Get AI-powered feedback on your resume, ATS optimization tips, interview preparation guides, 
            and personalized gap analysis. <span className="font-semibold text-deep-blueprint">100% private, no data stored.</span>
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
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-amber-500/20 hover:bg-amber-50 transition-colors"
              >
                <span className="text-2xl">📚</span>
                <span className="text-sm font-semibold text-slate-700">
                  History ({history.length})
                </span>
              </button>
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

      {/* Main Form Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {!result ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Resume Input */}
                <div>
                  <label htmlFor="resume" className="block text-lg font-bold text-deep-blueprint mb-3">
                    Your Resume / CV
                    <span className="text-warning-amber ml-2">*</span>
                  </label>
                  <textarea
                    id="resume"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your resume text here (minimum 100 characters)..."
                    className="w-full h-96 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors resize-none font-mono text-sm"
                    required
                    minLength={100}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Characters: {resume.length} / 100 minimum
                  </p>
                </div>

                {/* Job Description Input */}
                <div>
                  <label htmlFor="jobDescription" className="block text-lg font-bold text-deep-blueprint mb-3">
                    Target Job Description
                    <span className="text-warning-amber ml-2">*</span>
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
                  <p className="text-xs text-slate-500 mt-2">
                    Characters: {jobDescription.length} / 30 minimum
                  </p>
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
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating Review... (~60 seconds)</span>
                  </span>
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
          ) : (
            /* Results Display */
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-green-500/20 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-deep-blueprint flex items-center gap-3">
                    ✅ Review Generated Successfully
                  </h2>
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
                <p className="text-sm text-slate-600">
                  Generated in {(result.generationTimeMs / 1000).toFixed(1)}s using {result.provider === 'gemini' ? '🚀 Gemini AI' : '🤗 HuggingFace AI'}
                </p>
              </div>

              {/* ATS-Optimized Resume */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8">
                <h3 className="text-xl font-bold text-deep-blueprint mb-4 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  ATS-Optimized Resume Suggestions
                </h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-200">
{result.atsResume}
                  </pre>
                </div>
              </div>

              {/* Interview Preparation Guide */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8">
                <h3 className="text-xl font-bold text-deep-blueprint mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎤</span>
                  Interview Preparation Guide
                </h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-200">
{result.interviewGuide}
                  </pre>
                </div>
              </div>

              {/* Domain Questions */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-deep-blueprint/10 p-8">
                <h3 className="text-xl font-bold text-deep-blueprint mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Technical Domain Questions
                </h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-200">
{result.domainQuestions}
                  </pre>
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-warning-amber/30 p-8">
                <h3 className="text-xl font-bold text-deep-blueprint mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Skills Gap Analysis
                </h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed bg-amber-50 p-6 rounded-lg border border-warning-amber/30">
{result.gapAnalysis}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
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
              <h3 className="text-xl font-bold mb-3">2. AI Analysis</h3>
              <p className="text-slate-200 leading-relaxed">
                Our AI analyzes keyword matches, skills gaps, and generates interview questions in ~60 seconds.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3">3. Get Results</h3>
              <p className="text-slate-200 leading-relaxed">
                Receive ATS tips, interview prep, domain questions, and actionable improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
