
import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import { Navbar, Footer } from '@/components'
import ConsentBanner from '@/components/ConsentBanner'
import SkipToContent from '@/components/layout/SkipToContent'
import './globals.css'

export const metadata: Metadata = {
  title: 'QAi Talks - Master QA Automation & SDET Architecture',
  description: 'Master the complete QA pipeline with our structured technical curriculum. Build robust frameworks and optimize your testing strategy.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="font-primary text-text-slate bg-gradient-to-br from-bg-cloud via-slate-50 to-slate-100 relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Skip link for keyboard users + Animated Grid Background */}
        <SkipToContent />
        <div className="grid-background"></div>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
