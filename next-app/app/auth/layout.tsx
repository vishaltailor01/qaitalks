import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Authentication - QAi Talks',
  description: 'Sign in to access your QAi Talks dashboard and CV review tools',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Animated Grid Background */}
      <div className="grid-background"></div>
      <div className="font-primary text-text-slate bg-gradient-to-br from-bg-cloud via-slate-50 to-slate-100 relative overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </div>
    </>
  )
}
