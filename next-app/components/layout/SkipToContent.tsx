"use client"
import { useEffect } from 'react'

export default function SkipToContent() {
  useEffect(() => {
    // Find the first main landmark and ensure it has an id and is focusable
    const main = document.querySelector('main') as HTMLElement | null
    if (!main) return
    if (!main.id) main.id = 'main-content'
    // Ensure it's programmatically focusable for skip link
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
  }, [])

  return (
    <nav aria-label="Skip links">
      <a
        href="#main-content"
        className="skip-to-content visually-hidden focus:not-sr-only fixed left-4 top-4 z-50 rounded px-3 py-2 bg-deep-navy text-white shadow focus:outline-none focus:ring-2 focus:ring-electric-cyan"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
    </nav>
  )
}
