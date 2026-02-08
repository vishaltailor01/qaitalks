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
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 27, 68, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 27, 68, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            animation: 'gridMove 20s linear infinite',
            zIndex: -1,
          }}
        ></div>

        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
