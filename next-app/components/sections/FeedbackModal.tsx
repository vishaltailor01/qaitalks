'use client';

import { useState } from 'react';
import { saveFeedback, Feedback, QAFeedback } from '@/lib/feedback';
import type { QARole } from '@/lib/qa-domain/roles';
import type { QASkillsReport } from '@/lib/qa-domain/skills-validator';

interface FeedbackModalProps {
  resultId: string;
  onClose: () => void;
  onSubmit?: () => void;
  selectedQARole?: QARole | null; // QA domain: Selected role
  qaSkillsReport?: QASkillsReport | null; // QA domain: Skills assessment
}

// Move static child component out of render to satisfy react-hooks/static-components
function StarRating({
  rating,
  onChange,
  size = 'md',
}: {
  rating: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  } as const;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${sizeClasses[size]} transition-transform hover:scale-110`}
        >
          {star <= rating ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}

export default function FeedbackModal({ 
  resultId, 
  onClose, 
  onSubmit,
  selectedQARole,
  qaSkillsReport,
}: FeedbackModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [sectionRatings, setSectionRatings] = useState({
    atsResume: 0,
    interviewGuide: 0,
    domainQuestions: 0,
    gapAnalysis: 0,
    optimizedCV: 0,
    coverLetter: 0,
  });
  const [comment, setComment] = useState('');
  const [helpful, setHelpful] = useState<boolean | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  
  // QA Domain Feedback (Phase 5)
  const [qaRatings, setQARatings] = useState<QAFeedback>({
    coreSkillsRating: 0,
    toolProficiencyRating: 0,
    certificationReadinessRating: 0,
    roleAlignmentRating: 0,
  });
  const [skillGapComment, setSkillGapComment] = useState('');
  const [toolGapComment, setToolGapComment] = useState('');
  const [recommendedLearning, setRecommendedLearning] = useState<string[]>([]);

  const sections = [
    { key: 'atsResume' as const, label: '📊 ATS Resume Analysis', icon: '📊' },
    { key: 'interviewGuide' as const, label: '💼 Behavioral Questions', icon: '💼' },
    { key: 'domainQuestions' as const, label: '🔧 Technical Questions', icon: '🔧' },
    { key: 'gapAnalysis' as const, label: '📈 Skills Gap Analysis', icon: '📈' },
    { key: 'optimizedCV' as const, label: '✨ Optimized CV', icon: '✨' },
    { key: 'coverLetter' as const, label: '✉️ Cover Letter', icon: '✉️' },
  ];

  const handleSubmit = () => {
    const feedback: Feedback = {
      id: resultId,
      timestamp: Date.now(),
      overallRating,
      sectionRatings,
      comment: comment.trim() || undefined,
      helpful,
      targetRole: selectedQARole?.id || undefined,
      qaFeedback: selectedQARole ? {
        coreSkillsRating: qaRatings.coreSkillsRating || undefined,
        toolProficiencyRating: qaRatings.toolProficiencyRating || undefined,
        certificationReadinessRating: qaRatings.certificationReadinessRating || undefined,
        roleAlignmentRating: qaRatings.roleAlignmentRating || undefined,
        skillGapFeedback: skillGapComment.trim() || undefined,
        toolGapFeedback: toolGapComment.trim() || undefined,
        recommendedLearning: recommendedLearning.length > 0 ? recommendedLearning : undefined,
      } : undefined,
    };

    saveFeedback(feedback);
    setSubmitted(true);

    setTimeout(() => {
      onSubmit?.();
      onClose();
    }, 1500);
  };

  // StarRating defined above

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-black text-deep-blueprint mb-2">
            Thank You!
          </h3>
          <p className="text-slate-600">
            Your feedback helps us improve the CV Review Tool.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-deep-blueprint flex items-center gap-2">
            <span>⭐</span>
            Rate This Result
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Overall Rating */}
        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <label className="block text-lg font-bold text-deep-blueprint mb-3">
            Overall Rating
          </label>
          <div className="flex items-center gap-4">
            <StarRating rating={overallRating} onChange={setOverallRating} size="lg" />
            {overallRating > 0 && (
              <span className="text-sm font-semibold text-slate-600">
                {overallRating === 5 && '🎉 Excellent!'}
                {overallRating === 4 && '👍 Great!'}
                {overallRating === 3 && '😊 Good'}
                {overallRating === 2 && '😐 Fair'}
                {overallRating === 1 && '😔 Needs Work'}
              </span>
            )}
          </div>
        </div>

        {/* QA Domain-Specific Feedback Section (Phase 5) */}
        {selectedQARole && qaSkillsReport && (
          <div className="mb-8 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-deep-blueprint mb-4 flex items-center gap-2">
              <span>🎯</span>
              {selectedQARole.title} - Role-Specific Feedback
            </h4>
            
            {/* QA Role Ratings */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Core Skills Rating */}
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Core QA Skills Alignment
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`skills-${star}`}
                      type="button"
                      onClick={() => setQARatings({ ...qaRatings, coreSkillsRating: star })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (qaRatings.coreSkillsRating || 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tool Proficiency Rating */}
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tool Proficiency
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`tools-${star}`}
                      type="button"
                      onClick={() => setQARatings({ ...qaRatings, toolProficiencyRating: star })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (qaRatings.toolProficiencyRating || 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Certification Readiness */}
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Certification Readiness
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`cert-${star}`}
                      type="button"
                      onClick={() => setQARatings({ ...qaRatings, certificationReadinessRating: star })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (qaRatings.certificationReadinessRating || 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Role Alignment */}
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role Alignment
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`role-${star}`}
                      type="button"
                      onClick={() => setQARatings({ ...qaRatings, roleAlignmentRating: star })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (qaRatings.roleAlignmentRating || 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Skill Gaps Feedback */}
            {qaSkillsReport.criticalGaps.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📌 Thoughts on skill gaps? (Optional)
                </label>
                <textarea
                  value={skillGapComment}
                  onChange={(e) => setSkillGapComment(e.target.value)}
                  placeholder="e.g., 'Missing Vagrant experience', 'Needs more API testing beyond REST'..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                  rows={2}
                />
              </div>
            )}
            
            {/* Tool Gaps Feedback */}
            {qaSkillsReport.toolsAssessment.some((t) => !t.found) && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  🔧 Missing tools feedback? (Optional)
                </label>
                <textarea
                  value={toolGapComment}
                  onChange={(e) => setToolGapComment(e.target.value)}
                  placeholder="e.g., 'Should learn Docker', 'Needs GraphQL testing experience'..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                  rows={2}
                />
              </div>
            )}
            
            {/* Recommended Learning */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                💡 What should they learn next? (Select 1-3)
              </label>
              <div className="bg-white border border-purple-200 rounded-lg p-4 space-y-2">
                {[
                  'Advanced test automation patterns',
                  'CI/CD pipeline mastery',
                  'API testing & contract testing',
                  'Performance testing fundamentals',
                  'Security testing (OWASP)',
                  'BDD & Cucumber',
                  'Cloud testing (AWS/Azure)',
                  'Accessibility testing (WCAG)',
                  'Mobile testing',
                  'Leadership & mentoring',
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={recommendedLearning.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked && recommendedLearning.length < 3) {
                          setRecommendedLearning([...recommendedLearning, item]);
                        } else if (!e.target.checked) {
                          setRecommendedLearning(recommendedLearning.filter((i) => i !== item));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Ratings */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-deep-blueprint mb-4">
            Rate Individual Sections (Optional)
          </label>
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.key}
                className="flex items-center justify-between border-2 border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {section.label}
                  </span>
                </div>
                <StarRating
                  rating={sectionRatings[section.key]}
                  onChange={(rating) =>
                    setSectionRatings((prev) => ({ ...prev, [section.key]: rating }))
                  }
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Helpful Toggle */}
        <div className="mb-6">
          <label className="block text-lg font-bold text-deep-blueprint mb-3">
            Was this review helpful?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setHelpful(true)}
              className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                helpful === true
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-green-300'
              }`}
            >
              👍 Yes, Helpful
            </button>
            <button
              type="button"
              onClick={() => setHelpful(false)}
              className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                helpful === false
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'
              }`}
            >
              👎 Not Helpful
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-deep-blueprint mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts, suggestions, or what could be improved..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-logic-cyan transition-colors resize-none"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={(selectedQARole && qaRatings.roleAlignmentRating === 0) || overallRating === 0}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
            (selectedQARole && qaRatings.roleAlignmentRating === 0) || overallRating === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg'
          }`}
        >
          {overallRating === 0 
            ? 'Please rate overall to submit' 
            : selectedQARole && qaRatings.roleAlignmentRating === 0
            ? 'Please rate role alignment to submit'
            : 'Submit Feedback'}
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Your feedback is anonymous and stored locally in your browser.
        </p>
      </div>
    </div>
  );
}
