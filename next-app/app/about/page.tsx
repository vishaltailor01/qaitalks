import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About QAi Talks - From Manual Tester to Automation Architect',
  description: 'Discover the mission of QAi Talks: transforming manual testers into elite automation architects through structured blueprints and mentorship.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint mb-6 leading-tight">
              Building the <span className="text-logic-cyan">Architects</span>
              <br />
              of Tomorrow
            </h1>
            <span className="absolute -top-5 right-[15%] text-logic-cyan font-hand text-xl font-bold rotate-[2deg] pointer-events-none hidden lg:block animate-float drop-shadow-lg">
              & Our Core Topics
            </span>
          </div>
          <p className="text-lg md:text-xl text-text-slate mt-6 max-w-2xl opacity-90 leading-relaxed">
            QAi Talks is on a mission to transform manual testers into elite automation architects.
            We don&apos;t just teach code; we teach <span className="font-bold">systems thinking</span>.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-white to-slate-50 border-2 border-deep-blueprint p-8 md:p-12 shadow-[8px_8px_0_rgba(0,27,68,0.1)] hover:shadow-[12px_12px_0_rgba(0,27,68,0.1)] hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-4 -right-2 text-logic-cyan font-hand text-base font-bold -rotate-2 bg-white px-2 pointer-events-none">
              ★ Our Core Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-deep-blueprint mb-6 pb-4 inline-block border-b-2 border-deep-blueprint">
              The Gap in QA
            </h2>
            <p className="text-lg text-text-slate leading-relaxed">
              The industry is flooded with &quot;script writers&quot; who can copy-paste code but can&apos;t design scalable
              frameworks.
              <br /><br />
              <strong>We exist to bridge that gap.</strong> We provide the <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">blueprint</code> for your career
              evolution—moving from executing test cases to designing the infrastructure that runs them.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-blueprint mb-12 pb-4 inline-block border-b-2 border-deep-blueprint">
            The Philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            {/* Ad-Hoc Way */}
            <div>
              <h3 className="text-2xl font-bold text-deep-blueprint mb-4 mt-8">
                ❌ The Ad-Hoc Way
              </h3>
              <p className="text-text-slate opacity-70 text-base leading-relaxed">
                Copy-pasting solutions from StackOverflow. Fragile tests.
                No design patterns. &quot;It works on my machine.&quot;
              </p>
            </div>

            {/* Blueprint Way */}
            <div className="relative">
              <span className="absolute -left-10 top-10 text-logic-cyan font-hand text-base font-bold -rotate-2 pointer-events-none hidden md:block">
                ✓ The Better Way
              </span>
              <h3 className="text-2xl font-bold text-deep-blueprint mb-4 mt-8">
                ✅ The Blueprint Way
              </h3>
              <p className="text-text-slate text-base leading-relaxed">
                Rigid structure. Solid foundations. Understanding <em>why</em> before writing <em>how</em>.
                Treating test code with the same respect as production code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50/20 to-slate-100/40 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-blueprint mb-6 pb-4 inline-block border-b-2 border-deep-blueprint">
            Meet the Mentors
          </h2>
          <p className="text-lg text-text-slate mb-12">
            Guided by industry veterans who have built automation at scale.
          </p>

          {/* Mentor Card */}
          <div className="max-w-md bg-gradient-to-br from-white to-slate-50 border-2 border-deep-blueprint p-8 shadow-[8px_8px_0_rgba(0,27,68,0.1)] hover:shadow-[12px_12px_0_rgba(0,180,216,0.1)] hover:-translate-y-1 transition-all duration-300">
            {/* Placeholder avatar */}
            <div className="w-24 h-24 bg-slate-300 rounded-full mb-4"></div>
            <h3 className="text-2xl font-bold text-deep-blueprint mb-2">
              Jane Doe
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Senior SDET Architect
            </p>
            <p className="text-base text-text-slate">
              &quot;I help testers stop fighting fires and start building fireproof houses.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-deep-blueprint to-[#0D2F4F] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to upgrade your career?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Stop guessing. Start building. Join the elite automation cohort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/curriculum"
              className="inline-block px-12 py-4 bg-gradient-to-r from-warning-amber to-[#FFC933] text-deep-blueprint font-bold text-lg border-2 border-deep-blueprint rounded uppercase tracking-wide shadow-[4px_4px_0_rgba(255,184,0,0.3)] hover:shadow-[8px_8px_0_rgba(255,184,0,0.5)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              View the Curriculum
            </Link>
            <span className="px-6 py-3 bg-warning-amber/30 border-2 border-warning-amber rounded text-deep-blueprint font-mono font-bold text-sm backdrop-blur-sm animate-pulse">
              Limited Intake: Next Cohort Starting Soon
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
