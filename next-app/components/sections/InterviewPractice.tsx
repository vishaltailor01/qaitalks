'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  type: 'behavioral' | 'technical';
  answered: boolean;
  answer?: string;
  feedback?: {
    score: number; // 1-10
    strengths: string[];
    improvements: string[];
    suggestedAnswer?: string;
  };
}

interface InterviewPracticeProps {
  questions: string[];
  type: 'behavioral' | 'technical';
  onClose: () => void;
}

export default function InterviewPractice({ questions: rawQuestions, type, onClose }: InterviewPracticeProps) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(
    rawQuestions.map((q, i) => ({
      id: i,
      question: q,
      type,
      answered: false,
    }))
  );
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = (questions.filter((q) => q.answered).length / questions.length) * 100;
  const progressValue = Number.isFinite(progress) ? Math.round(progress) : 0;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]); // Reset timer when question changes

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const simulateAIFeedback = (answer: string): Question['feedback'] => {
    const wordCount = answer.split(/\s+/).length;
    const hasSTAR = /situation|task|action|result/i.test(answer);
    const hasSpecifics = /\d+|percent|%|increased|decreased|improved/i.test(answer);

    let score = 5;
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (wordCount >= 100) {
      score += 2;
      strengths.push('Good level of detail in your answer');
    } else {
      improvements.push('Provide more detail - aim for 100-150 words');
    }

    if (hasSTAR && type === 'behavioral') {
      score += 2;
      strengths.push('STAR method structure detected');
    } else if (type === 'behavioral') {
      improvements.push('Use STAR method: Situation, Task, Action, Result');
    }

    if (hasSpecifics) {
      score += 1;
      strengths.push('Includes quantifiable results');
    } else {
      improvements.push('Add specific metrics or results to strengthen your answer');
    }

    if (wordCount < 50) {
      score = Math.max(3, score - 2);
      improvements.push('Answer is too brief - expand on your experience');
    }

    return {
      score: Math.min(10, score),
      strengths,
      improvements,
      suggestedAnswer: type === 'behavioral'
        ? 'Remember to structure your answer using STAR: Start with the Situation/context, explain the Task/challenge, describe your Actions, and conclude with measurable Results.'
        : 'For technical questions, demonstrate your understanding with examples, explain trade-offs, and mention real-world applications.',
    };
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      return; // Silently return if empty
    }

    setIsAnalyzing(true);

    // Simulate AI analysis (in real implementation, call API)
    setTimeout(() => {
      const feedback = simulateAIFeedback(currentAnswer);
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        answered: true,
        answer: currentAnswer,
        feedback,
      };

      setQuestions(updatedQuestions);
      setIsAnalyzing(false);
      setShowFeedback(true);

    }, 2000);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentAnswer('');
    setTimeElapsed(0);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkipQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer('');
      setTimeElapsed(0);
    }
  };

  const completedQuestions = questions.filter((q) => q.answered).length;
  const averageScore =
    completedQuestions > 0
      ? questions
          .filter((q) => q.feedback)
          .reduce((sum, q) => sum + (q.feedback?.score || 0), 0) / completedQuestions
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <span>🎯</span>
              Interview Practice Mode
            </h3>
            <button onClick={onClose} className="text-white hover:text-logic-cyan text-xl font-primary marker-highlight transition-all rounded-full">
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{completedQuestions} Completed</span>
            </div>
            <div className="w-full bg-purple-800 rounded-full h-3 relative">
              <div
                className={`bg-white rounded-full h-3 transition-all duration-300 absolute origin-left header-progress-bar width-${Math.max(0, Math.min(100, Math.round(progress)))}`}
                role="progressbar"
                aria-label="Question progress bar"
                aria-valuenow={Number(progressValue)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="opacity-80">Type:</span>{' '}
              <strong>{type === 'behavioral' ? 'Behavioral' : 'Technical'}</strong>
            </div>
            <div>
              <span className="opacity-80">Time:</span> <strong>{formatTime(timeElapsed)}</strong>
            </div>
            {completedQuestions > 0 && (
              <div>
                <span className="opacity-80">Avg Score:</span>{' '}
                <strong>{averageScore.toFixed(1)}/10</strong>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!showFeedback ? (
            <>
              {/* Question */}
              <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-bold text-deep-blueprint mb-3">Question:</h4>
                <p className="text-slate-800 leading-relaxed">{currentQuestion.question}</p>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-deep-blueprint mb-2">
                  Your Answer
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={
                    type === 'behavioral'
                      ? `Structure your answer using STAR method:
          • Situation: Set the context
          • Task: Explain the challenge
          • Action: Describe what you did
          • Result: Share the outcome with metrics`
                      : 'Explain your approach, mention key concepts, and provide examples...'
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  rows={12}
                  disabled={isAnalyzing}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-500">
                    {currentAnswer.split(/\s+/).filter((w) => w).length} words (aim for 100-150)
                  </span>
                  {type === 'behavioral' && (
                    <span className="text-xs text-blue-600 font-semibold">
                      💡 Tip: Use STAR method
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isAnalyzing || !currentAnswer.trim()}
                  className={`flex-1 py-4 rounded-lg font-bold text-white font-primary marker-highlight transition-all ${
                    isAnalyzing || !currentAnswer.trim()
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg'
                  }`}
                >
                  {isAnalyzing ? '🔄 Analyzing Your Answer...' : '✅ Submit Answer'}
                </button>
                <button
                  onClick={handleSkipQuestion}
                  disabled={isAnalyzing}
                  className="px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold font-primary marker-highlight hover:bg-slate-50 transition-colors"
                >
                  ⏭️ Skip
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Feedback */}
              <div className="space-y-6">
                {/* Score */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-deep-blueprint">Your Score</h4>
                    <div className="text-4xl font-black text-green-600">
                      {currentQuestion.feedback?.score}/10
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r from-green-500 to-blue-500 rounded-full h-3 transition-all score-bar width-${Math.max(0, Math.min(100, (currentQuestion.feedback?.score || 0) * 10))}`}
                      title="Score progress bar"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Strengths */}
                {Array.isArray(currentQuestion.feedback?.strengths) && currentQuestion.feedback!.strengths.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                      <span>✅</span>
                      What You Did Well
                    </h4>
                    <ul className="space-y-2">
                      {currentQuestion.feedback!.strengths.map((strength, idx) => (
                        <li key={idx} className="text-slate-700 flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {Array.isArray(currentQuestion.feedback?.improvements) && currentQuestion.feedback!.improvements.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2">
                      <span>💡</span>
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {currentQuestion.feedback!.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-slate-700 flex items-start gap-2">
                          <span className="text-amber-600">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Answer */}
                {currentQuestion.feedback?.suggestedAnswer && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      Pro Tip
                    </h4>
                    <p className="text-slate-700">{currentQuestion.feedback.suggestedAnswer}</p>
                  </div>
                )}

                {/* Actions */}
                    <div className="flex gap-4">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold font-primary marker-highlight hover:shadow-lg transition-all"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold font-primary marker-highlight hover:shadow-lg transition-all"
                    >
                      🎉 Complete Practice Session
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
