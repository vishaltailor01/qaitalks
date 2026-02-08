import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import { Navbar, Footer } from '@/components'
import './globals.css'

export const metadata: Metadata = {
  title: 'QAi Talks - Master QA Automation & SDET Architecture',
  description: 'Master the complete QA pipeline with our structured technical curriculum. Build robust frameworks and optimize your testing strategy.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className="font-primary text-text-slate bg-gradient-to-br from-bg-cloud via-slate-50 to-slate-100 relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Animated Grid Background */}
        <div className="grid-background"></div>

        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
