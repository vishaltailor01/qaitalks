import dynamic from 'next/dynamic';

// Dynamically import InterviewPractice for code splitting
const InterviewPractice = dynamic(() => import('@/components/sections/InterviewPractice'), {
  loading: () => <div>Loading interview practice...</div>,
  ssr: false,
});

export default InterviewPractice;
