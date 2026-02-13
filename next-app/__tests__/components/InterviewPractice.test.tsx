import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterviewPractice from '@/components/sections/InterviewPractice';

describe('InterviewPractice', () => {
  const mockQuestions = [
    'Tell me about a time when you faced a difficult challenge at work?',
    'How do you handle conflicts with team members?',
    'Describe your biggest professional achievement?',
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with behavioral questions', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Interview Practice Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Behavioral/i)).toBeInTheDocument();
      expect(screen.getByText(mockQuestions[0])).toBeInTheDocument();
    });

    it('should render with technical questions', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="technical"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Technical/i)).toBeInTheDocument();
    });

    it('should display question count and progress', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Question 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByText(/0 Completed/i)).toBeInTheDocument();
    });

    it('should show close button', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Answer Submission', () => {
    it('should not submit empty answer', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      // Should not show analyzing state when answer is empty
      expect(screen.queryByText(/Analyzing Your Answer/i)).not.toBeInTheDocument();
    });

    it('should submit answer and show analyzing state', async () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: {
          value:
            'In my previous role as a Quality Assurance Engineer, I faced a challenge when our automated test suite became unreliable. I took the initiative to redesign the framework, which reduced test failures by 80% and improved deployment confidence.',
        },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      expect(screen.getByText(/Analyzing Your Answer/i)).toBeInTheDocument();
    });

    it('should show feedback after analysis', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: {
          value:
            'In the situation where we experienced production issues, my task was to identify and fix the root cause. I took action by implementing comprehensive monitoring and resolved the issue. The result was 99.9% uptime.',
        },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      // Fast-forward past analysis delay
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Your Score/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Navigation', () => {
    it('should show skip button', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Skip/i)).toBeInTheDocument();
    });

    it('should navigate to next question after submission', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      // Submit first answer
      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'A detailed answer with more than 100 words...' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Next Question/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/Next Question/i);
      fireEvent.click(nextButton);

      // Should show second question
      expect(screen.getByText(/Question 2 of 3/i)).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('should show complete button on last question', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={['Single question?']}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'Answer to the only question' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Complete Practice Session/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Timer Functionality', () => {
    it('should display elapsed time', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Time:/i)).toBeInTheDocument();
      expect(screen.getByText(/0:00/i)).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress bar after completion', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'A detailed answer' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/1 Completed/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should show average score after completions', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: {
          value:
            'A comprehensive answer with STAR method demonstrating situation, task, action, and specific results with metrics showing 50% improvement.',
        },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Avg Score:/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Feedback System', () => {
    it('should show strengths in feedback', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: {
          value:
            'In the situation where we needed to improve our testing process, my task was to implement automation. I took action by researching tools and building a framework. The result was that we increased test coverage by 60% and reduced bugs by 40%.',
        },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/What You Did Well/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should show improvements in feedback', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'I did some work and it was good.' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Areas to Improve/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should show pro tip in feedback', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'Answer text here' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Pro Tip/i)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when completing practice session', async () => {
      jest.useFakeTimers();

      render(
        <InterviewPractice
          questions={['Single question?']}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'Answer to the only question' },
      });

      const submitButton = screen.getByText(/Submit Answer/i);
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        const completeButton = screen.getByText(/Complete Practice Session/i);
        fireEvent.click(completeButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('Word Count Display', () => {
    it('should show word count as user types', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText(/Structure your answer/i);
      fireEvent.change(textarea, {
        target: { value: 'This is a test answer' },
      });

      expect(screen.getByText(/5 words/i)).toBeInTheDocument();
    });

    it('should show STAR method tip for behavioral questions', () => {
      render(
        <InterviewPractice
          questions={mockQuestions}
          type="behavioral"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Use STAR method/i)).toBeInTheDocument();
    });
  });
});
