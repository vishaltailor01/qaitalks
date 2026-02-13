// UI state management with Zustand
import { create } from 'zustand';

interface UIState {
  // Modal states
  showFeedbackModal: boolean;
  showInterviewPractice: boolean;
  showHistory: boolean;
  showComparison: boolean;
  
  // Tooltip state
  activeTooltip: string | null;
  
  // Section expansion
  expandedSections: { [key: string]: boolean };
  
  // Actions
  setShowFeedbackModal: (show: boolean) => void;
  setShowInterviewPractice: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowComparison: (show: boolean) => void;
  setActiveTooltip: (tooltip: string | null) => void;
  toggleSection: (section: string) => void;
  reset: () => void;
}

const initialState = {
  showFeedbackModal: false,
  showInterviewPractice: false,
  showHistory: false,
  showComparison: false,
  activeTooltip: null,
  expandedSections: {
    interview: true,
    domain: true,
  },
};

export const useUIStore = create<UIState>((set) => ({
  ...initialState,
  
  setShowFeedbackModal: (showFeedbackModal) => set({ showFeedbackModal }),
  setShowInterviewPractice: (showInterviewPractice) => set({ showInterviewPractice }),
  setShowHistory: (showHistory) => set({ showHistory }),
  setShowComparison: (showComparison) => set({ showComparison }),
  setActiveTooltip: (activeTooltip) => set({ activeTooltip }),
  
  toggleSection: (section) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section],
      },
    })),
  
  reset: () => set(initialState),
}));
