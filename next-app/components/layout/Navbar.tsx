'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/curriculum" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              Curriculum
            </Link>
            <Link href="/about" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              About
            </Link>
            <Link href="/blog" className="text-text-slate hover:text-deep-blueprint transition font-medium">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
