import dynamic from 'next/dynamic';

// Dynamically import FeedbackModal for code splitting
const FeedbackModal = dynamic(() => import('@/components/sections/FeedbackModal'), {
  loading: () => <div>Loading feedback form...</div>,
  ssr: false, // Only render on client
});

export default FeedbackModal;
