'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user?: User
}

export default function UserButton() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

    if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-signal-yellow animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 bg-signal-yellow text-deep-navy rounded-md font-primary font-semibold hover:bg-signal-yellow/90 transition-all duration-300 shadow"
      >
        Sign In
      </Link>
    )
  }

  return (
    <div className="relative font-primary">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-signal-yellow/20 transition border border-signal-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border-2 border-signal-yellow shadow"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-signal-yellow text-deep-navy flex items-center justify-center font-bold border-2 border-signal-yellow shadow">
            {session.user.name?.[0] || session.user.email?.[0] || 'U'}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-deep-navy">
          {session.user.name || session.user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-paper-white border-2 border-signal-yellow rounded-md shadow-lg z-20 font-primary">
            <div className="p-3 border-b border-signal-yellow">
              <p className="text-sm font-medium text-deep-navy">{session.user.name}</p>
              <p className="text-xs text-logic-cyan truncate">{session.user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-deep-navy hover:bg-signal-yellow/20 rounded-md"
                onClick={() => setShowDropdown(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/cv-review"
                className="block px-4 py-2 text-sm text-deep-navy hover:bg-signal-yellow/20 rounded-md"
                onClick={() => setShowDropdown(false)}
              >
                CV Review
              </Link>
            </div>
            <div className="border-t border-signal-yellow py-1">
              <Link
                href="/auth/signout"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-signal-yellow/10 rounded-md"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
