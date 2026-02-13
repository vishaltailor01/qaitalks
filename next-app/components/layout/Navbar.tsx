'use client'

import Link from 'next/link'
import Image from 'next/image'
import UserButton from '@/components/auth/UserButton'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="QAi Talks Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl text-deep-blueprint hidden">
              QAi Talks
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/curriculum" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              Curriculum
            </Link>
            <Link href="/about" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              About
            </Link>
            <Link href="/blog" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              Blog
            </Link>
            <Link 
              href="/cv-review" 
              className="px-4 py-2 bg-gradient-to-r from-logic-cyan to-logic-cyan-bright text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-logic-cyan/30 transition-all duration-300"
            >
              🤖 CV Review
            </Link>
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-3">
              <Link
                href="/curriculum"
                className="px-4 py-2 text-text-slate hover:text-deep-blueprint hover:bg-slate-50 rounded-lg transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Curriculum
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-text-slate hover:text-deep-blueprint hover:bg-slate-50 rounded-lg transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 text-text-slate hover:text-deep-blueprint hover:bg-slate-50 rounded-lg transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/cv-review"
                className="px-4 py-2 bg-gradient-to-r from-logic-cyan to-logic-cyan-bright text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                🤖 CV Review
              </Link>
              <div className="px-4 pt-2 border-t border-slate-200">
                <UserButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
