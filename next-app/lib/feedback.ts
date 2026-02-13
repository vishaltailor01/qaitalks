// Quality Feedback System (Phase 3.1)
// Store and retrieve user feedback on CV review results
// Enhanced with QA domain-specific feedback categories (Phase 5)

export interface QAFeedback {
  coreSkillsRating?: number; // How well CV demonstrates required QA skills
  toolProficiencyRating?: number; // Hands-on tool experience
  certificationReadinessRating?: number; // Perceived certification alignment
  roleAlignmentRating?: number; // How well CV matches target QA role
  skillGapFeedback?: string; // User's comment on missing skills
  toolGapFeedback?: string; // User's comment on missing tools
  recommendedLearning?: string[]; // User suggests these to learn
}

export interface Feedback {
  id: string; // Result ID
  timestamp: number;
  overallRating: number; // 1-5
  sectionRatings: {
    atsResume?: number;
    interviewGuide?: number;
    domainQuestions?: number;
    gapAnalysis?: number;
    optimizedCV?: number;
    coverLetter?: number;
  };
  comment?: string;
  helpful?: boolean;
  improvementSuggestions?: string[];
  qaFeedback?: QAFeedback; // QA domain-specific ratings (Phase 5)
  targetRole?: string; // Track which QA role was rated
}

const FEEDBACK_STORAGE_KEY = 'qaitalk_cv_feedback';
const MAX_FEEDBACK_ITEMS = 50;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save feedback for a result
 */
export function saveFeedback(feedback: Feedback): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const existing = getAllFeedback();
    const filtered = existing.filter((f) => f.id !== feedback.id);
    const updated = [feedback, ...filtered].slice(0, MAX_FEEDBACK_ITEMS);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail - not critical
  }
}

/**
 * Get feedback for a specific result
 */
export function getFeedback(resultId: string): Feedback | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const all = getAllFeedback();
    return all.find((f) => f.id === resultId) || null;
  } catch {
    return null;
  }
}

/**
 * Get all feedback
 */
export function getAllFeedback(): Feedback[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate average ratings
 */
export function getAverageRatings(): {
  overall: number;
  sections: {
    atsResume: number;
    interviewGuide: number;
    domainQuestions: number;
    gapAnalysis: number;
    optimizedCV: number;
    coverLetter: number;
  };
  totalFeedback: number;
} {
  const feedback = getAllFeedback();

  if (feedback.length === 0) {
    return {
      overall: 0,
      sections: {
        atsResume: 0,
        interviewGuide: 0,
        domainQuestions: 0,
        gapAnalysis: 0,
        optimizedCV: 0,
        coverLetter: 0,
      },
      totalFeedback: 0,
    };
  }

  const overallSum = feedback.reduce((sum, f) => sum + f.overallRating, 0);
  const overall = overallSum / feedback.length;

  const sectionKeys = [
    'atsResume',
    'interviewGuide',
    'domainQuestions',
    'gapAnalysis',
    'optimizedCV',
    'coverLetter',
  ] as const;

  const sections = sectionKeys.reduce(
    (acc, key) => {
      const ratings = feedback
        .map((f) => f.sectionRatings[key])
        .filter((r): r is number => r !== undefined);
      acc[key] = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return acc;
    },
    {} as Record<typeof sectionKeys[number], number>
  ) as {
    atsResume: number;
    interviewGuide: number;
    domainQuestions: number;
    gapAnalysis: number;
    optimizedCV: number;
    coverLetter: number;
  };

  return {
    overall,
    sections,
    totalFeedback: feedback.length,
  };
}

/**
 * Get helpfulness ratio (% of helpful feedback)
 */
export function getHelpfulnessRatio(): number {
  const feedback = getAllFeedback();
  if (feedback.length === 0) return 0;

  const helpfulCount = feedback.filter((f) => f.helpful === true).length;
  return (helpfulCount / feedback.length) * 100;
}

/**
 * Check if feedback exists for a result
 */
export function hasFeedback(resultId: string): boolean {
  return getFeedback(resultId) !== null;
}

/**
 * Delete feedback
 */
export function deleteFeedback(resultId: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const existing = getAllFeedback();
    const filtered = existing.filter((f) => f.id !== resultId);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete feedback:', error);
  }
}

/**
 * Clear all feedback
 */
export function clearAllFeedback(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(FEEDBACK_STORAGE_KEY);
}

/**
 * Get QA-specific feedback analysis (Phase 5)
 */
export function getQAFeedbackAnalysis(targetRole?: string): {
  avgCoreSkillsRating: number;
  avgToolProficiencyRating: number;
  avgCertificationReadinessRating: number;
  avgRoleAlignmentRating: number;
  commonSkillGaps: string[];
  commonToolGaps: string[];
  topRecommendedLearning: string[];
  feedbackCount: number;
} {
  const feedback = getAllFeedback();
  const filtered = targetRole 
    ? feedback.filter((f) => f.targetRole === targetRole)
    : feedback.filter((f) => f.qaFeedback);

  if (filtered.length === 0) {
    return {
      avgCoreSkillsRating: 0,
      avgToolProficiencyRating: 0,
      avgCertificationReadinessRating: 0,
      avgRoleAlignmentRating: 0,
      commonSkillGaps: [],
      commonToolGaps: [],
      topRecommendedLearning: [],
      feedbackCount: 0,
    };
  }

  // Calculate averages
  const qaFeedbacks = filtered.map((f) => f.qaFeedback).filter(Boolean) as QAFeedback[];
  const avgCoreSkillsRating = qaFeedbacks.reduce((sum, f) => sum + (f.coreSkillsRating || 0), 0) / qaFeedbacks.length;
  const avgToolProficiencyRating = qaFeedbacks.reduce((sum, f) => sum + (f.toolProficiencyRating || 0), 0) / qaFeedbacks.length;
  const avgCertificationReadinessRating = qaFeedbacks.reduce((sum, f) => sum + (f.certificationReadinessRating || 0), 0) / qaFeedbacks.length;
  const avgRoleAlignmentRating = qaFeedbacks.reduce((sum, f) => sum + (f.roleAlignmentRating || 0), 0) / qaFeedbacks.length;

  // Extract common gaps and learning recommendations
  const skillGaps: Record<string, number> = {};
  const toolGaps: Record<string, number> = {};
  const learningMap: Record<string, number> = {};

  qaFeedbacks.forEach((f) => {
    if (f.skillGapFeedback) {
      skillGaps[f.skillGapFeedback] = (skillGaps[f.skillGapFeedback] || 0) + 1;
    }
    if (f.toolGapFeedback) {
      toolGaps[f.toolGapFeedback] = (toolGaps[f.toolGapFeedback] || 0) + 1;
    }
    if (f.recommendedLearning) {
      f.recommendedLearning.forEach((item) => {
        learningMap[item] = (learningMap[item] || 0) + 1;
      });
    }
  });

  const commonSkillGaps = Object.entries(skillGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);

  const commonToolGaps = Object.entries(toolGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tool]) => tool);

  const topRecommendedLearning = Object.entries(learningMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([learning]) => learning);

  return {
    avgCoreSkillsRating,
    avgToolProficiencyRating,
    avgCertificationReadinessRating,
    avgRoleAlignmentRating,
    commonSkillGaps,
    commonToolGaps,
    topRecommendedLearning,
    feedbackCount: filtered.length,
  };
}
