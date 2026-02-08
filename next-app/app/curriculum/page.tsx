'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ModuleProps {
  number: string
  icon: string
  title: string
  subtitle: string
  version: string
  content: React.ReactNode
  highlight?: string
}

function Module({ number, icon, title, subtitle, version, content, highlight }: ModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="relative bg-white rounded-lg border-2 border-deep-blueprint shadow-lg overflow-hidden transition-all duration-300">
      {highlight && (
        <span className="absolute -top-5 left-[30%] font-hand text-lg font-bold rotate-[2deg] z-10 text-warning-amber">
          {highlight}
        </span>
      )}
      
      <div
        className="p-8 cursor-pointer hover:bg-slate-50 transition-colors relative"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex gap-6 items-start">
          <div className="text-5xl">{icon}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-logic-cyan font-bold">
                {number}
              </span>
              <span className="font-mono text-[0.7rem] text-purple-accent opacity-70">
                {version}
              </span>
            </div>
            <h2 className="text-3xl font-black text-deep-blueprint mb-2">{title}</h2>
            <div className="text-slate-600 font-medium mb-2">{subtitle}</div>
            <div className="text-sm text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">
              {isCollapsed ? 'Click to expand module details' : 'Click to collapse module details'}
            </div>
          </div>
          <div className={`text-3xl text-logic-cyan transition-transform duration-300 ${isCollapsed ? 'rotate-[-90deg]' : ''}`}>
            ▼
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0' : 'max-h-[5000px]'
        }`}
      >
        <div className="p-8 pt-0 space-y-4">
          {content}
        </div>
      </div>
    </div>
  )
}

function TopicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50/50 rounded-lg p-6 border-l-4 border-logic-cyan hover:bg-cyan-50/50 hover:border-warning-amber hover:translate-x-1 transition-all duration-300">
      <h3 className="text-xl font-bold text-deep-blueprint mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function CurriculumPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center relative">
        <div className="max-w-7xl mx-auto relative">
          <span className="absolute right-[8%] top-[10%] font-hand text-logic-cyan text-3xl font-bold rotate-[-3deg] animate-float drop-shadow-lg hidden md:block">
            12 Week Intensive
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-deep-blueprint mb-6">
            The Blueprint Curriculum
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-80 text-text-slate">
            A precisely engineered journey from manual testing to full-stack automation and DevOps leadership.
          </p>
        </div>
      </section>

      {/* Curriculum Modules */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Module 1: Manual Testing */}
          <Module
            number="Module 01"
            icon="📋"
            title="Manual Testing"
            subtitle="Professional Curriculum aligned with ISTQB Standards"
            version="VER: 1.2.0 // FOUNDATIONS"
            content={
              <>
                <TopicSection title="1. Fundamentals of Testing">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">What is Testing:</strong> Moving beyond &quot;finding bugs&quot; to quality assurance and risk reduction</li>
                    <li><strong className="text-logic-cyan">Why Testing is Necessary:</strong> Cost of failure and testing&apos;s role in SDLC</li>
                    <li><strong className="text-logic-cyan">7 Testing Principles:</strong> Context-dependent testing, Pesticide Paradox, and more</li>
                    <li><strong className="text-logic-cyan">Activities & Testware:</strong> Test basis, conditions, cases, scripts, and reports</li>
                    <li><strong className="text-logic-cyan">Roles & Skills:</strong> Tester vs. Test Manager; analytical and communication skills</li>
                  </ul>
                </TopicSection>

                <TopicSection title="2. Testing Throughout the SDLC">
                  <h4 className="font-bold text-deep-blueprint mb-2">Test Levels:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-700 mb-4">
                    <li>Component/Unit Testing</li>
                    <li>Integration Testing</li>
                    <li>System Testing</li>
                    <li>User Acceptance Testing (UAT)</li>
                  </ul>
                  <h4 className="font-bold text-deep-blueprint mb-2">Test Types:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-700">
                    <li>Functional vs. Non-functional testing</li>
                    <li>Change-related testing (Confirmation vs. Regression)</li>
                  </ul>
                </TopicSection>

                <TopicSection title="3. Static Testing">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Value of finding defects without code execution</li>
                    <li>Formal vs. Informal reviews</li>
                    <li>Review roles: Author, Moderator, Reader, Scribe</li>
                  </ul>
                </TopicSection>

                <TopicSection title="4. Test Techniques">
                  <h4 className="font-bold text-deep-blueprint mb-2">Black-Box:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-700 mb-3">
                    <li>Equivalence Partitioning & Boundary Value Analysis</li>
                    <li>Decision Table Testing</li>
                    <li>State Transition Testing</li>
                  </ul>
                  <h4 className="font-bold text-deep-blueprint mb-2">White-Box:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-700 mb-3">
                    <li>Statement testing and Decision coverage</li>
                  </ul>
                  <h4 className="font-bold text-deep-blueprint mb-2">Experience-Based:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-700">
                    <li>Error Guessing, Exploratory Testing, Checklist-based testing</li>
                  </ul>
                </TopicSection>

                <TopicSection title="5. Managing Test Activities">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">Test Planning:</strong> Estimation, entry/exit criteria, resource allocation</li>
                    <li><strong className="text-logic-cyan">Risk Management:</strong> Project vs. product risks; prioritization</li>
                    <li><strong className="text-logic-cyan">Monitoring & Control:</strong> Metrics like defect density and test coverage</li>
                    <li><strong className="text-logic-cyan">Defect Management:</strong> Lifecycle from discovery to closure</li>
                  </ul>
                </TopicSection>

                <TopicSection title="6. Test Tools">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Tool classification: Management, static, execution, performance</li>
                    <li><strong className="text-logic-cyan">Automation Benefits:</strong> Efficiency, repeatability, regression reliability</li>
                    <li><strong className="text-logic-cyan">Automation Risks:</strong> Unrealistic expectations, maintenance overhead</li>
                  </ul>
                </TopicSection>
              </>
            }
          />

          {/* Module 2: Core Java */}
          <Module
            number="Module 02"
            icon="☕"
            title="Core Java"
            subtitle="Essential Java Programming for Test Automation"
            version="VER: 2.1.0 // CORE_ENGINE"
            content={
              <>
                <TopicSection title="1. Java Programming Basics">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Data Types: Primitive (int, char, boolean, double) vs. non-primitive</li>
                    <li><strong className="text-logic-cyan">String Class:</strong> Immutability, concat(), split(), substring(), contains()</li>
                    <li>Operators: Arithmetic and concatenation (+)</li>
                    <li>Control Flow: if-else, switch-case, for, while, do-while</li>
                    <li>Arrays: Single Dimensional Arrays for test data</li>
                  </ul>
                </TopicSection>

                <TopicSection title="2. Object-Oriented Programming (OOPs)">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Classes and Objects: Blueprint vs. instance</li>
                    <li>Constructors: Default and parameterized</li>
                    <li><strong className="text-logic-cyan">Four Pillars:</strong>
                      <ul className="ml-6 mt-2 space-y-1">
                        <li><strong>Inheritance:</strong> Reusing code with <code className="bg-cyan-50 px-2 py-1 rounded text-sm font-mono">extends</code></li>
                        <li><strong>Polymorphism:</strong> Method Overloading and Overriding</li>
                        <li><strong>Encapsulation:</strong> Private variables with getters/setters</li>
                        <li><strong>Abstraction:</strong> Abstract Classes and Interfaces (WebDriver)</li>
                      </ul>
                    </li>
                  </ul>
                </TopicSection>

                <TopicSection title="3. Methods and Keywords">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Defining reusable functions with parameters and return types</li>
                    <li><strong className="text-logic-cyan">Special Keywords:</strong> this, super, final, finally, finalize, static</li>
                  </ul>
                </TopicSection>

                <TopicSection title="4. Advanced Java Concepts">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">Exception Handling:</strong> try-catch-finally, throw/throws</li>
                    <li>Wrapper Classes: Integer, Boolean for Collections</li>
                    <li>Memory Management: Garbage Collector</li>
                  </ul>
                </TopicSection>

                <TopicSection title="5. Java Collections Framework">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">ArrayList:</strong> Dynamic lists of WebElements</li>
                    <li><strong className="text-logic-cyan">Set:</strong> Unique data (Window Handles)</li>
                    <li><strong className="text-logic-cyan">HashMap & Hashtable:</strong> Key-Value pairs for test data</li>
                  </ul>
                </TopicSection>
              </>
            }
          />

          {/* Module 3: Selenium WebDriver */}
          <Module
            number="Module 03"
            icon="🌐"
            title="Selenium WebDriver"
            subtitle="Core & Advanced Web Automation Techniques"
            version="VER: 3.2.0 // AUTOMATION_UI"
            highlight="Most Important! →"
            content={
              <>
                <TopicSection title="1. WebDriver Architecture">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Java client communication via JSON Wire Protocol (W3C)</li>
                    <li>The Hierarchy: <code className="bg-cyan-50 px-2 py-1 rounded text-sm font-mono">WebDriver driver = new ChromeDriver();</code></li>
                    <li>Browser launching: Chrome, Firefox (GeckoDriver), Safari</li>
                  </ul>
                </TopicSection>

                <TopicSection title="2. Browser & WebElement Commands">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Basic Control: get(), getTitle(), getPageSource()</li>
                    <li>Execution: close() vs. quit()</li>
                    <li>Navigation: back(), forward(), refresh(), to()</li>
                    <li>Element Interaction: sendKeys(), clear(), click()</li>
                    <li>Validation: isDisplayed(), isEnabled(), isSelected()</li>
                  </ul>
                </TopicSection>

                <TopicSection title="3. Locators & Element Identification">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Strategies: ID, Name, ClassName, LinkText, PartialLinkText, TagName</li>
                    <li><strong className="text-logic-cyan">Mastering XPath & CSS:</strong>
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>Absolute vs. Relative XPath</li>
                        <li>Handling dynamic IDs: contains(), starts-with(), XPath axes</li>
                      </ul>
                    </li>
                    <li>Tools: Chrome DevTools, SelectorHub, XPath Helper</li>
                  </ul>
                </TopicSection>

                <TopicSection title="4. Complex UI Components">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Static & Dynamic Tables: Iterating rows and columns</li>
                    <li><strong className="text-logic-cyan">Dropdowns:</strong> Select Class (by Index, Value, Visible Text)</li>
                    <li>Checkboxes and Radio buttons</li>
                  </ul>
                </TopicSection>

                <TopicSection title="5. Synchronization & Window Management">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">Waits:</strong> Implicit, Explicit, Fluent with ExpectedConditions</li>
                    <li>Alerts: Simple, Confirmation, Prompt</li>
                    <li><strong className="text-logic-cyan">Multi-Window:</strong> getWindowHandles() and Set interface</li>
                  </ul>
                </TopicSection>

                <TopicSection title="6. Actions Class & Advanced Scenarios">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>User Gestures: Mouse Hover, Drag-and-Drop, Double Click, Right Click</li>
                    <li><strong className="text-logic-cyan">Complex Challenges:</strong>
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>Shadow DOM and SVG Elements</li>
                        <li>iFrames and nested frames</li>
                        <li>Infinite Scroll and Pagination</li>
                        <li>Pseudo-elements and Calendars</li>
                      </ul>
                    </li>
                  </ul>
                </TopicSection>
              </>
            }
          />

          {/* Module 4: Advanced Automation */}
          <Module
            number="Module 04"
            icon="🏗️"
            title="Advanced Automation"
            subtitle="Frameworks, DevOps & Cloud Integration"
            version="VER: 4.1.0 // INFRASTRUCTURE"
            content={
              <>
                <TopicSection title="1. TestNG Framework">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Installation and testng.xml configuration</li>
                    <li><strong className="text-logic-cyan">Annotations:</strong> @BeforeSuite, @BeforeClass, @BeforeMethod, @Test</li>
                    <li>Execution Control: Prioritization, Grouping, Dependencies</li>
                    <li>Data Providers: Parameterized testing</li>
                    <li>Parallel Execution and Multi-browser testing</li>
                  </ul>
                </TopicSection>

                <TopicSection title="2. Automation Framework Design">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Framework Types: Data-Driven, Keyword-Driven, Hybrid</li>
                    <li><strong className="text-logic-cyan">Page Object Model (POM):</strong> Industry-standard design pattern</li>
                    <li><strong className="text-logic-cyan">Components:</strong>
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>Data Management: Excel (Apache POI), .properties files</li>
                        <li>Maven Integration: pom.xml dependency management</li>
                        <li>Reporting: Extent, Allure, PDF formats</li>
                        <li>Listeners & Logs: TestNG Listeners, Log4j</li>
                      </ul>
                    </li>
                  </ul>
                </TopicSection>

                <TopicSection title="3. Build Management">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Creating Library JARs and Fat JARs</li>
                    <li>Adding custom JARs to Maven repositories</li>
                  </ul>
                </TopicSection>

                <TopicSection title="4. CI/CD with Jenkins & GIT">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">Version Control:</strong> git init, clone, push, pull, merge, Pull Requests</li>
                    <li><strong className="text-logic-cyan">Jenkins Pipelines:</strong> Groovy syntax, Blue Ocean tracking</li>
                    <li>Automated Triggers: Git WebHooks with NgRok</li>
                  </ul>
                </TopicSection>

                <TopicSection title="5. Virtualization with Docker & Selenoid">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Understanding Images vs. Containers</li>
                    <li>Selenium Grid on Docker</li>
                    <li><strong className="text-logic-cyan">Docker Compose:</strong> Hub and Nodes orchestration</li>
                    <li>Selenoid: Cross-browser testing with video recording</li>
                  </ul>
                </TopicSection>

                <TopicSection title="6. Cloud Infrastructure (AWS)">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>AWS Fundamentals: VPCs, Subnets, Security Groups</li>
                    <li>EC2 Deployment: Linux/Windows instances for Dockerized Grid</li>
                    <li><strong className="text-logic-cyan">Cloud Storage:</strong> AWS S3 for static HTML report hosting</li>
                  </ul>
                </TopicSection>
              </>
            }
          />

          {/* Module 5: Cucumber BDD */}
          <Module
            number="Module 05"
            icon="🥒"
            title="Cucumber BDD"
            subtitle="Behaviour Driven Development with Gherkin"
            version="VER: 5.0.0 // BDD_PROCESS"
            highlight="Career Ready 🚀"
            content={
              <>
                <TopicSection title="1. Introduction to BDD">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Understanding BDD: &quot;Testing&quot; to &quot;Behaviour Specification&quot;</li>
                    <li>BDD vs. TDD: Why BDD for end-to-end automation</li>
                    <li><strong className="text-logic-cyan">Gherkin Language:</strong> Feature, Scenario, Given, When, Then, And, But</li>
                  </ul>
                </TopicSection>

                <TopicSection title="2. Cucumber Components">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Feature Files: .feature extension for requirements</li>
                    <li>Step Definitions: Mapping Gherkin to Java (Glue code)</li>
                    <li>Test Runner Class: JUnit or TestNG execution</li>
                    <li>Cucumber Options: features, glue, dryRun, monochrome, plugin</li>
                  </ul>
                </TopicSection>

                <TopicSection title="3. Advanced Gherkin Techniques">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li><strong className="text-logic-cyan">Scenario Outlines:</strong> Multiple data sets with Examples tables</li>
                    <li>Data Tables: Handling complex input with DataTable maps/lists</li>
                    <li>Background: Common steps (Login) before every scenario</li>
                    <li><strong className="text-logic-cyan">Tags & Hooks:</strong>
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>@Smoke, @Regression tags for filtered execution</li>
                        <li>@Before and @After hooks for setup/teardown</li>
                      </ul>
                    </li>
                  </ul>
                </TopicSection>

                <TopicSection title="4. BDD Framework Integration">
                  <ul className="space-y-2 list-disc list-inside text-slate-700">
                    <li>Cucumber with POM: Integration for better maintenance</li>
                    <li><strong className="text-logic-cyan">Dependency Injection (PicoContainer):</strong> Sharing state between Step Definitions</li>
                    <li>Reporting: Cucumber HTML, JSON, Masterthought, Extent Reports</li>
                  </ul>
                </TopicSection>
              </>
            }
          />
        </div>
      </section>

      {/* Stats Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: '12', label: 'Weeks' },
              { number: '5', label: 'Modules' },
              { number: '80+', label: 'Topics' },
              { number: '100%', label: 'Job Ready' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-white to-slate-50 border-2 border-deep-blueprint rounded-lg p-6 text-center shadow-[3px_3px_0_rgba(0,27,68,0.1)] hover:shadow-[5px_5px_0_rgba(0,27,68,0.1)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl font-black bg-gradient-to-r from-logic-cyan to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-deep-blueprint to-blue-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Engineer Your Future?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the cohort of elite engineers building the future of quality assurance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/curriculum"
              className="inline-block px-12 py-4 bg-gradient-to-r from-warning-amber to-amber-400 text-deep-blueprint font-bold text-lg border-2 border-deep-blueprint rounded hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_rgba(255,184,0,0.5)] shadow-[4px_4px_0_rgba(255,184,0,0.3)] transition-all duration-200 uppercase tracking-wide"
            >
              View Full Curriculum
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

