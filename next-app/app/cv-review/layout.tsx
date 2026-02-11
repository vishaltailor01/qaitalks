import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CV Review & Interview Prep | QAi Talks',
  description: 'Get AI-powered feedback on your resume, ATS optimization tips, interview preparation guides, and personalized gap analysis. 100% private, no data stored.',
  keywords: ['CV review', 'resume feedback', 'ATS optimization', 'interview preparation', 'career development', 'AI feedback'],
}

export default function CVReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
