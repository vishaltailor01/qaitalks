import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-deep-blueprint text-white border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg text-logic-cyan-bright mb-4">QAi Talks</h3>
            <p className="text-slate-300 text-sm mb-4">
              Master QA automation and SDET architecture with industry experts.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com" className="hover:text-logic-cyan-bright transition" title="Twitter">
                𝕏
              </a>
              <a href="https://github.com" className="hover:text-logic-cyan-bright transition" title="GitHub">
                GitHub
              </a>
              <a href="https://linkedin.com" className="hover:text-logic-cyan-bright transition" title="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-bold text-warning-amber mb-4">Learning</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curriculum" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-warning-amber mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-300 hover:text-logic-cyan-bright transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-warning-amber mb-4">Newsletter</h4>
            <p className="text-slate-300 text-sm mb-4">
              Get the latest QA automation insights delivered weekly.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-2 rounded bg-slate-800 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-logic-cyan"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-warning-amber text-deep-blueprint rounded font-semibold hover:bg-opacity-90 transition text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 QAi Talks. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-logic-cyan-bright transition">
              Privacy Policy
            </Link>
            <Link href="/" className="text-slate-400 hover:text-logic-cyan-bright transition">
              Terms of Service
            </Link>
            <Link href="/" className="text-slate-400 hover:text-logic-cyan-bright transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
