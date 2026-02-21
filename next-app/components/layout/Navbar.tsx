'use client'

import Link from 'next/link'
import Image from 'next/image'
import UserButton from '@/components/auth/UserButton'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-paper-white border-b-2 border-signal-yellow shadow-sm flex items-center h-20 px-4 font-primary">
      <div className="w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo - perfectly flush left, no text */}
          <div className="flex items-center">
            <Link href="/" className="block">
              <Image
                src="/QaiTalksLogo.svg"
                alt="QAi Talks Logo"
                width={360}
                height={112}
                className="h-20 w-auto object-left"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/curriculum" className="text-deep-navy hover:text-signal-yellow transition font-medium rounded-md px-2 py-1">
              Curriculum
            </Link>
            <Link href="/about" className="text-deep-navy hover:text-signal-yellow transition font-medium rounded-md px-2 py-1">
              About
            </Link>
            <Link href="/blog" className="text-deep-navy hover:text-signal-yellow transition font-medium rounded-md px-2 py-1">
              Blog
            </Link>
            {/* Design Screens link removed (stitch integration removed) */}
            <Link 
              href="/cv-review" 
              className="px-4 py-2 bg-signal-yellow text-deep-navy rounded-md font-semibold font-primary shadow hover:bg-signal-yellow/90 transition-all duration-300 border-2 border-signal-yellow"
            >
              🤖 CV Review
            </Link>
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md border-2 border-signal-yellow hover:bg-signal-yellow/20 transition"
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
          <div className="md:hidden py-4 border-t-2 border-signal-yellow bg-paper-white rounded-b-md shadow-lg">
            <div className="flex flex-col gap-3 font-primary">
              <Link
                href="/curriculum"
                className="px-4 py-2 text-deep-navy hover:text-signal-yellow hover:bg-signal-yellow/10 rounded-md transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Curriculum
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-deep-navy hover:text-signal-yellow hover:bg-signal-yellow/10 rounded-md transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 text-deep-navy hover:text-signal-yellow hover:bg-signal-yellow/10 rounded-md transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/cv-review"
                className="px-4 py-2 bg-signal-yellow text-deep-navy rounded-md font-semibold shadow border-2 border-signal-yellow hover:bg-signal-yellow/90 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                🤖 CV Review
              </Link>
              <div className="px-4 pt-2 border-t-2 border-signal-yellow">
                <UserButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
