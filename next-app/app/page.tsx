import Link from 'next/link'
import { SectionHeading, PillarCard } from '@/components'

const blueprintModules = [
  { number: '01', title: 'Manual Fundamentals', description: 'ISTQB principles and Test Case design.' },
  { number: '02', title: 'Selenium Fundamentals', description: 'Webdriver, locators, and basic automation.' },
  { number: '03', title: 'Java Essentials', description: 'OOP concepts and design patterns.' },
  { number: '04', title: 'Page Object Model', description: 'Advanced framework architecture.' },
  { number: '05', title: 'CI/CD Pipelines', description: 'Jenkins, Docker, and automation scaling.' },
  { number: '06', title: 'DevOps Integration', description: 'Cloud deployment and monitoring.' },
]

const stats = [
  { value: '12', label: 'Weeks' },
  { value: 'Manual→Auto', label: 'Transformation' },
  { value: '+75%', label: 'Salary Growth' },
  { value: '500+', label: 'Engineers Trained' },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative annotation */}
          <div className="absolute right-8 top-0 text-warning-amber font-hand text-2xl font-bold rotate-[-2deg] pointer-events-none hidden lg:block animate-float drop-shadow-lg">
            Latest Cohort Open!
          </div>

          {/* Version Badge */}
          <div className="inline-block mb-6 px-3 py-1 bg-slate-100 border border-logic-cyan border-opacity-20 rounded-full font-mono text-xs font-semibold text-logic-cyan-bright tracking-widest">
            v2.0 // SYSTEM_ONLINE
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint mb-6 leading-tight max-w-3xl">
            QA Automation Bootcamp:<br className="hidden md:block" />
            From Manual to DevOps
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg md:text-xl text-text-slate mb-12 max-w-2xl opacity-90 leading-relaxed">
            Master the complete QA pipeline with our structured technical curriculum. Build robust frameworks and optimize your testing strategy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 relative">
            <div className="absolute left-0 md:left-52 top-0 text-warning-amber font-hand text-sm font-bold transform rotate-1 pointer-events-none hidden md:block">
              Start Here ⤵
            </div>
            <Link
              href="#blueprint-preview"
              className="px-8 py-3 bg-deep-blueprint text-white rounded font-semibold hover:bg-blue-900 transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Start Learning
            </Link>
            <Link
              href="/curriculum"
              className="px-8 py-3 border-2 border-deep-blueprint text-deep-blueprint rounded font-semibold hover:bg-slate-50 transition transform hover:-translate-y-0.5"
            >
              View Syllabus
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative">
            <div className="absolute right-0 lg:right-32 -top-12 text-logic-cyan font-hand text-xl font-bold transform rotate-2 pointer-events-none hidden lg:block">
              High ROI 🚀
            </div>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-deep-blueprint rounded px-6 py-6 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-logic-cyan to-warning-amber"></div>
                <div className="font-bold text-xl md:text-2xl text-deep-blueprint font-mono">{stat.value}</div>
                <div className="text-sm text-text-slate opacity-80 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Three Pillars Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Three Pillars"
            subtitle="Our bootcamp is built on the structural integrity of these core technical domains, designed like a precise schematic."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <PillarCard
              icon="📚"
              title="Manual Fundamentals"
              description="Master the theoretical foundations and defect lifecycle before writing a single line of code."
            />
            <PillarCard
              icon="⚙️"
              title="Selenium & Java Mastery"
              description="Transition to engineer with core Java concepts and advanced Selenium WebDriver architecture."
            />
            <PillarCard
              icon="🚀"
              title="DevOps Infrastructure"
              description="Integrate your tests into modern CI/CD pipelines and scale using Docker containers."
            />
          </div>
        </div>
      </section>

      {/* Blueprint Preview Section */}
      <section id="blueprint-preview" className="py-20 bg-gradient-to-br from-logic-cyan via-slate-50 to-warning-amber bg-opacity-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute left-6 top-16 text-logic-cyan font-hand text-sm font-bold -rotate-1 pointer-events-none hidden md:block">
            industry standard ⤵
          </div>

          <SectionHeading
            title="Blueprint Preview"
            subtitle="Follow the engineered path from fundamentals to advanced DevOps integration."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {blueprintModules.map((module, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-deep-blueprint border-l-4 border-l-logic-cyan rounded p-6 hover:translate-x-2 hover:border-l-warning-amber hover:shadow-lg transition cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-logic-cyan-bright mb-2 tracking-wider">
                  MODULE {module.number}
                </div>
                <h3 className="text-lg font-bold text-deep-blueprint mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-text-slate opacity-80">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CV Review Tool Highlight Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4 px-3 py-1 bg-logic-cyan/10 border-2 border-logic-cyan rounded-full font-mono text-xs font-semibold text-logic-cyan-bright tracking-widest">
                🤖 NEW TOOL
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-deep-blueprint mb-6 leading-tight">
                AI-Powered CV Review & Interview Prep
              </h2>
              <p className="text-lg text-text-slate mb-6 leading-relaxed">
                Get instant, actionable feedback on your resume with our AI-powered tool. 
                Optimize for ATS systems, prepare for interviews with STAR+ method questions, 
                and identify skills gaps before you apply.
              </p>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <span className="text-slate-700"><strong>ATS Optimization:</strong> Keyword matching and formatting tips</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <span className="text-slate-700"><strong>Interview Questions:</strong> Personalized STAR+ method prep</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <span className="text-slate-700"><strong>Domain Questions:</strong> Technical scenario-based questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lg">✅</span>
                  <span className="text-slate-700"><strong>Gap Analysis:</strong> Skills recommendations for your target role</span>
                </li>
              </ul>

              <Link
                href="/cv-review"
                className="inline-block px-8 py-4 bg-gradient-to-r from-logic-cyan to-logic-cyan-bright text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-logic-cyan/50 transition-all duration-300 transform hover:scale-105"
              >
                🚀 Try CV Review Tool (Free)
              </Link>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 border-2 border-deep-blueprint/10 shadow-xl">
                <div className="bg-white rounded-lg p-6 mb-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-100 rounded w-4/6"></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 mb-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      🎤
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded"></div>
                    <div className="h-2 bg-slate-100 rounded w-4/5"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
                      📊
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-3/5 mb-2"></div>
                      <div className="h-2 bg-slate-100 rounded w-2/5"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-warning-amber text-deep-blueprint px-4 py-2 rounded-lg font-bold text-sm shadow-lg transform rotate-3 border-2 border-deep-blueprint">
                100% Private
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-deep-blueprint to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your QA Career?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join 500+ engineers who&apos;ve mastered QA automation and SDET architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/curriculum"
              className="inline-block px-12 py-4 bg-gradient-to-r from-warning-amber to-amber-400 text-deep-blueprint font-bold text-lg border-2 border-deep-blueprint rounded hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_rgba(255,184,0,0.5)] shadow-[4px_4px_0_rgba(255,184,0,0.3)] transition-all duration-200 uppercase tracking-wide"
            >
              View Curriculum
            </Link>
            <span className="px-6 py-3 bg-deep-blueprint/30 border-2 border-warning-amber rounded text-warning-amber font-mono font-bold text-sm backdrop-blur-sm animate-pulse">
              Limited Intake: Next Cohort Starting Soon
            </span>
          </div>
        </div>
      </section>

    </main>
  )
}
