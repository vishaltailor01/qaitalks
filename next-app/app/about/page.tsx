import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About QAi Talks - From Manual Tester to Automation Architect',
  description: 'Discover the mission of QAi Talks: transforming manual testers into elite automation architects through structured blueprints and mentorship.',
}

export default function AboutPage() {


  return (
    <main className="min-h-screen">
      {/* About QaiTalk Section */}
      <section className="pt-32 pb-20 relative bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="text-7xl md:text-8xl mb-2 drop-shadow-lg animate-bounce" aria-hidden="true">🧑‍💻</span>
          <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint leading-tight tracking-tight mb-2">
            QaiTalk: <span className="text-logic-cyan">By QA Engineers, For QA Engineers</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-logic-cyan mb-6 max-w-2xl">
            We built the platform we always wished existed—because we lived the pain.
          </h2>
          <div className="bg-white/80 rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-text-slate leading-relaxed mb-2">
              <strong>We know the struggle.</strong> Years of manual testing. Endless test cases. Copy-pasting Selenium scripts that break on every UI change. CVs rejected by ATS. Interview questions you weren't ready for.
            </p>
            <p className="text-lg md:text-xl text-text-slate leading-relaxed mb-2">
              QaiTalk was born from that frustration. We're not a faceless edtech company we're a real community of QA engineers who've survived the manual grind, the framework wars, the SDET interviews, and the leap to modern test architecture.
            </p>
            <p className="text-lg md:text-xl text-text-slate leading-relaxed">
              We built QaiTalk because generic bootcamps and ChatGPT couldn't solve our real problems. Here, you get what actually works no hype, no fluff, just the tools and support we wish we'd had.
            </p>
          </div>
        </div>
      </section>

      {/* QA Industry Gap Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-white to-slate-50 border-2 border-deep-blueprint p-8 md:p-12 shadow-[8px_8px_0_rgba(0,27,68,0.1)] hover:shadow-[12px_12px_0_rgba(0,27,68,0.1)] hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-4 -right-2 text-logic-cyan font-primary text-base font-bold -rotate-2 bg-white px-2 pointer-events-none">
              ★ The QA Industry Gap We Solve
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-deep-blueprint mb-6 pb-4 inline-block border-b-2 border-deep-blueprint">
              Why Most QA Training Fails
            </h2>
            <ul className="text-lg text-text-slate leading-relaxed list-disc pl-6 mb-6">
              <li><span className="inline-block text-2xl align-middle mr-2">🛑</span>Generic content – teaches "click this button" instead of systems thinking</li>
              <li><span className="inline-block text-2xl align-middle mr-2">⏳</span>Outdated patterns – still preaching Page Object Model in 2026</li>
              <li><span className="inline-block text-2xl align-middle mr-2">🚫</span>No career integration – you learn Selenium but your CV still says "Manual Tester"</li>
              <li><span className="inline-block text-2xl align-middle mr-2">❌</span>No proof of skills – certificates that mean nothing to hiring managers</li>
            </ul>
            <p className="text-lg text-text-slate leading-relaxed mb-2">
              <strong>QaiTalk fixes this with:</strong>
            </p>
            <ul className="text-lg text-text-slate leading-relaxed list-disc pl-6">
              <li><strong>AI Career Tools</strong> that optimize your CV + prepare you for the exact job</li>
              <li><strong>Micro-Credentials</strong> with verifiable digital badges that appear in your generated CVs</li>
              <li><strong>Modern patterns</strong> – Screenplay, contract testing, CI/CD architecture</li>
              <li><strong>Skill gap detection</strong> – CV analysis tells you exactly what to learn next</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-deep-blueprint mb-12 pb-4 inline-block border-b-2 border-deep-blueprint tracking-tight">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <span className="text-5xl mb-5 text-logic-cyan">🤖</span>
              <h3 className="font-bold text-lg mb-2 text-deep-blueprint">AI-Powered CV Optimization</h3>
              <p className="text-base text-text-slate">Go beyond generic Selenium tutorials—get QA-specific, AI-driven CV and career tools.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <span className="text-5xl mb-5 text-signal-yellow">⏱️</span>
              <h3 className="font-bold text-lg mb-2 text-deep-blueprint">Micro-Credentials, Not Marathons</h3>
              <p className="text-base text-text-slate">No 12-week commitments—earn verifiable badges in focused, 2-4 hour courses.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <span className="text-5xl mb-5 text-green-600">🏅</span>
              <h3 className="font-bold text-lg mb-2 text-deep-blueprint">Proof, Not PDFs</h3>
              <p className="text-base text-text-slate">Ditch the PDF certificates—showcase real, verifiable digital badges that hiring managers trust.</p>
            </div>
            {/* Card 4 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <span className="text-5xl mb-5 text-blue-500">🧭</span>
              <h3 className="font-bold text-lg mb-2 text-deep-blueprint">Career Integration</h3>
              <p className="text-base text-text-slate">Get personalized course recommendations based on your CV—no more guessing what to learn next.</p>
            </div>
            {/* Card 5 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center hover:scale-105 hover:shadow-2xl transition-all duration-200">
              <span className="text-5xl mb-5 text-pink-500">💸</span>
              <h3 className="font-bold text-lg mb-2 text-deep-blueprint">Affordable, Accessible</h3>
              <p className="text-base text-text-slate">No £2700+ bootcamps—get targeted application packs for just £4.99.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real QA Engineers, Real Results Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-deep-blueprint mb-12 pb-4 inline-block border-b-2 border-deep-blueprint tracking-tight text-center w-full">
            Real QA Engineers, Real Results
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center mb-12">
            {/* Stat Card 1 */}
            <div className="flex-1 bg-gradient-to-br from-cyan-50 to-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3 text-logic-cyan">📈</span>
              <div className="text-4xl font-extrabold text-deep-blueprint mb-1">+30</div>
              <div className="text-base text-text-slate mb-2">ATS match score points (90% of users, 1 Application Pack)</div>
            </div>
            {/* Stat Card 2 */}
            <div className="flex-1 bg-gradient-to-br from-yellow-50 to-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3 text-signal-yellow">⏳</span>
              <div className="text-4xl font-extrabold text-deep-blueprint mb-1">75%</div>
              <div className="text-base text-text-slate mb-2">complete their first micro-credential in 7 days</div>
            </div>
            {/* Stat Card 3 */}
            <div className="flex-1 bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-xl border border-slate-100 p-10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3 text-green-600">🎯</span>
              <div className="text-4xl font-extrabold text-deep-blueprint mb-1">3x</div>
              <div className="text-base text-text-slate mb-2">more interview callbacks with QAi badges (our data)</div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto text-center mb-8">
            <blockquote className="text-xl md:text-2xl font-semibold text-logic-cyan mb-4">
              "No hype. Just measurable outcomes."
            </blockquote>
            <p className="text-lg text-text-slate mb-4">
              No corporate course sellers here. We're practicing QA engineers who've hired, fired, interviewed, and mentored dozens of testers. We've felt the ATS rejections. We've failed SDET interviews. We built what actually works.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <a href="/cv-review" className="px-6 py-3 bg-logic-cyan text-white font-bold rounded shadow hover:bg-cyan-700 transition">Free CV Check</a>
            <a href="/learn" className="px-6 py-3 bg-signal-yellow text-deep-navy font-bold rounded shadow hover:bg-signal-yellow/90 transition">Micro-Credentials</a>
            <a href="/blog" className="px-6 py-3 bg-deep-blueprint text-white font-bold rounded shadow hover:bg-blue-900 transition">QA Blog</a>
          </div>
          <div className="mt-8 text-base text-slate-500 text-center">Built by QA engineers rejected by ATS.</div>
        </div>
      </section>

    </main>
  )
}
