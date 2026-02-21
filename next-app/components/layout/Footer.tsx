import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-signal-yellow font-primary rounded-t-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-2xl text-signal-yellow mb-4">QAi Talks</h3>
            <p className="text-electric-cyan text-sm mb-4">
              Master QA automation and SDET architecture with industry experts.
            </p>
            {/* Social Media Links - Update with actual QAi Talks accounts when available */}
            <div className="flex gap-4">
              <a href="https://x.com" className="text-white hover:text-signal-yellow transition text-lg" title="Twitter" aria-label="Follow us on X/Twitter">
                𝕏
              </a>
              <a href="https://github.com/qaitalks" className="text-white hover:text-signal-yellow transition text-lg" title="GitHub" aria-label="View our GitHub repositories">
                GitHub
              </a>
              <a href="https://linkedin.com" className="text-white hover:text-signal-yellow transition text-lg" title="LinkedIn" aria-label="Connect on LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-bold text-signal-yellow mb-4">Learning</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/curriculum" className="text-white hover:text-signal-yellow transition rounded-md px-2 py-1">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-signal-yellow transition rounded-md px-2 py-1">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-signal-yellow transition rounded-md px-2 py-1">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-signal-yellow mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/qaitalks" className="text-white hover:text-signal-yellow transition rounded-md px-2 py-1">
                  GitHub Repos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-signal-yellow mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:hello@qaitalks.com" className="text-white hover:text-signal-yellow transition rounded-md px-2 py-1">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t-2 border-signal-yellow pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white">
          <p>&copy; 2025 QAi Talks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
