import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const blogPosts = [
  {
    slug: 'pom-is-dead',
    title: 'Why the Page Object Model is Dead: Modern UI Test Automation',
    description: 'Discover why the Page Object Model is obsolete and how the Screenplay pattern and component-based testing deliver better reusability, maintainability, and speed for modern UI test automation frameworks.',
    image: '/blog/pom-is-dead.svg',
    content: `
      <img src="/blog/pom-is-dead.svg" alt="Illustration showing the evolution from Page Object Model to Screenplay pattern and component-based testing" style="max-width:100%;height:auto;" />
      <h2>The Evolution of Test Architecture</h2>
      <p>For years, the Page Object Model (POM) was the gold standard for structuring UI test automation. But as frameworks and applications have evolved, POM's limitations have become increasingly apparent.</p>
      <h2>The Problems with Traditional POM</h2>
      <p>Traditional POM suffers from several critical issues:</p>
      <ul>
        <li><strong>Tight Coupling:</strong> Page objects become tightly coupled to specific pages, making them difficult to reuse across different test scenarios.</li>
        <li><strong>Maintenance Nightmare:</strong> Changes to the UI require updates across multiple page objects, leading to brittle tests.</li>
        <li><strong>Scalability Issues:</strong> As applications grow, the number of page objects explodes, making the codebase unwieldy.</li>
      </ul>
      <h2>Enter the Screenplay Pattern</h2>
      <p>The Screenplay pattern represents a paradigm shift in test automation. Instead of modelling pages, it models user interactions as a series of tasks, actions, and questions. This approach provides:</p>
      <ul>
        <li>Better separation of concerns</li>
        <li>Higher reusability of test components</li>
        <li>More maintainable test code</li>
        <li>Clearer test intent</li>
      </ul>
      <pre><code class="language-js">// Traditional POM
const loginPage = new LoginPage();
loginPage.enterUsername('user@example.com');
loginPage.enterPassword('password123');
loginPage.clickSubmit();

// Screenplay Pattern
await actor.attemptsTo(
  Login.withCredentials('user@example.com', 'password123')
);</code></pre>
      <h2>Component-Based Testing</h2>
      <p>Modern frameworks like React and Vue have embraced component-based architecture. Our testing strategies should follow suit. Component-based testing focuses on reusable UI components rather than entire pages, providing:</p>
      <ul>
        <li>Better alignment with modern frontend architecture</li>
        <li>Easier to test components in isolation</li>
        <li>Reduced duplication across test suites</li>
      </ul>
      <h2>The Future is Now</h2>
      <p>While POM served us well for many years, it's time to evolve. Modern test automation demands patterns that are more flexible, maintainable, and aligned with current development practices. The Screenplay pattern and component-based testing represent the future of UI test automation.</p>
      <p>For more on scaling your E2E tests, see <a href="/blog/scaling-playwright">Scaling Playwright to 1000 Nodes</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-10-24'),
  },
  {
    slug: 'contract-testing',
    title: 'Contract Testing with Pact: Fast, Reliable Microservice Integration',
    description: 'Consumer-driven contract testing with Pact verifies microservice integrations in milliseconds, replacing slow E2E tests and enabling fast, reliable, and independent deployments.',
    image: '/blog/contract-testing.svg',
    content: `
      <img src="/blog/contract-testing.svg" alt="Diagram showing contract testing workflow with Pact for microservices" style="max-width:100%;height:auto;" />
      <h2>The End-to-End Trap</h2>
      <p>In mid-to-large distributed systems, end-to-end (E2E) tests often become the bottleneck. They are slow, flaky, and require a stable environment with all dependencies deployed. When a test fails in a 50-service ecosystem, finding the root cause is a nightmare.</p>
      
      <h2>What is Pact?</h2>
      <p>Pact is a code-first tool for implementing consumer-driven contract testing. It allows the consumer (e.g., a frontend app) to define the expectations they have for a provider (e.g., a REST API). These expectations are saved as a "Pact file".</p>
      
      <p>The consumer writes tests that define:</p>
      <ul>
        <li>The request they will make</li>
        <li>The response they expect</li>
        <li>The state the provider should be in</li>
      </ul>
      
      <pre><code>// Defining a Pact interaction
pactWith({ consumer: 'MyOrderApp', provider: 'OrderService' }, provider => {
  describe('getting an order', () => {
    it('returns the order details', async () => {
      await provider.addInteraction({
        state: 'order 123 exists',
        uponReceiving: 'a request for order 123',
        withRequest: {
          method: 'GET',
          path: '/orders/123',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: 123,
            status: 'pending',
            total: 99.99
          }
        }
      });
      
      const response = await orderClient.getOrder(123);
      expect(response.status).toBe('pending');
    });
  });
});</code></pre>
      
      <h2>Why it Matters</h2>
      <p>Contract tests are decoupled. You can verify the consumer without the provider, and vice-versa. This enables:</p>
      <ul>
        <li><strong>Independent Deployments:</strong> Teams can deploy services independently without waiting for full E2E test runs</li>
        <li><strong>Fast Feedback:</strong> Contract tests run in milliseconds, not minutes or hours</li>
        <li><strong>Clear Contracts:</strong> The Pact files serve as living documentation of service interactions</li>
        <li><strong>High Confidence:</strong> You know your services will work together in production</li>
      </ul>
      
      <h2>The Workflow</h2>
      <ol>
        <li>Consumer writes tests defining their expectations (generates Pact files)</li>
        <li>Pact files are published to a Pact Broker</li>
        <li>Provider fetches the relevant Pact files</li>
        <li>Provider runs verification tests against their service</li>
        <li>Results are published back to the broker</li>
      </ol>
      
      <h2>Getting Started</h2>
      <p>Start small. Pick one critical integration between two services. Write consumer tests for that integration. Verify the provider. Gradually expand coverage. In a few months, you'll have significantly reduced your E2E test suite while increasing confidence and speed.</p>
      <p>For more on test architecture, see <a href="/blog/pom-is-dead">Why the Page Object Model is Dead</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-10-12'),
  },
  {
    slug: 'scaling-playwright',
    title: 'Scaling Playwright Tests to 1000 Nodes: Fast, Reliable CI/CD',
    description: 'Reduce your test suite execution from 4 hours to 8 minutes using Playwright sharding, Docker containers, and transient infrastructure. Achieve cost-effective, scalable CI/CD for modern teams.',
    image: '/blog/scaling-playwright.svg',
    content: `
      <img src="/blog/scaling-playwright.svg" alt="Visualisation of Playwright test sharding and distributed execution across 1000 nodes" style="max-width:100%;height:auto;" />
      <h2>The Challenge</h2>
      <p>Our test suite had grown to over 10,000 tests. Running them sequentially took 4+ hours. Even with 10 parallel workers, we were still looking at 40+ minutes. For a team practicing continuous deployment, this was unacceptable.</p>
      
      <h2>The Solution: Massive Parallelization</h2>
      <p>We needed to scale horizontally. Not 10 workers, not 100 workers, but 1000+ workers running simultaneously. Here's how we did it:</p>
      
      <h3>1. Test Sharding</h3>
      <p>Playwright's built-in sharding feature allows you to split tests across multiple machines:</p>
      <pre><code>npx playwright test --shard=1/10  # Run shard 1 of 10
npx playwright test --shard=2/10  # Run shard 2 of 10
# ... and so on</code></pre>
      
      <h3>2. Docker Containerization</h3>
      <p>We containerized our test runners with a minimal Docker image:</p>
      <pre><code>FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /tests
COPY package*.json ./
RUN npm ci
COPY . .

ENV SHARD_INDEX=1
ENV SHARD_TOTAL=1

CMD ["npx", "playwright", "test", "--shard=$SHARD_INDEX/$SHARD_TOTAL"]</code></pre>
      
      <h3>3. Transient Docker Swarm</h3>
      <p>We built a system that spins up a Docker Swarm on-demand when tests are triggered:</p>
      <ul>
        <li>Jenkins receives a webhook from GitHub</li>
        <li>Our orchestrator provisions 100 EC2 spot instances</li>
        <li>Docker Swarm is initialized across all instances</li>
        <li>1000 containers are deployed (10 per instance)</li>
        <li>Each container runs a shard of the test suite</li>
        <li>Results are aggregated and reported</li>
        <li>Instances are terminated after 15 minutes</li>
      </ul>
      
      <h2>The Results</h2>
      <p>With 1000 parallel workers:</p>
      <ul>
        <li><strong>Execution Time:</strong> Reduced from 4 hours to 8-10 minutes</li>
        <li><strong>Cost:</strong> $12 per run using EC2 spot instances</li>
        <li><strong>Feedback Speed:</strong> Developers get results in their PR within 15 minutes</li>
        <li><strong>Scalability:</strong> System auto-scales based on test suite size</li>
      </ul>
      
      <h2>Key Learnings</h2>
      <ol>
        <li><strong>Shard Deterministically:</strong> Use consistent test ordering to ensure shards are balanced</li>
        <li><strong>Handle Flaky Tests:</strong> Implement automatic retries and mark known flaky tests</li>
        <li><strong>Aggregate Efficiently:</strong> Use a central store (S3) to collect results from all shards</li>
        <li><strong>Monitor Costs:</strong> Spot instances can save 70% compared to on-demand instances</li>
        <li><strong>Clean Up Resources:</strong> Implement aggressive timeouts to prevent runaway costs</li>
      </ol>
      
      <h2>Infrastructure as Code</h2>
      <p>The entire setup is defined as infrastructure as code using Terraform. We use AWS Launch Templates to define the test runner instances, configure user data for initialization, and leverage spot instances for cost optimization.</p>
      <p>The infrastructure includes:</p>
      <ul>
        <li>EC2 Auto Scaling Groups for dynamic capacity</li>
        <li>Docker Swarm for container orchestration</li>
        <li>S3 for storing test results and artifacts</li>
        <li>CloudWatch for monitoring and alerting</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>We're continuously improving the system:</p>
      <ul>
        <li>Implementing intelligent test selection (only run affected tests)</li>
        <li>Adding visual regression testing with Percy</li>
        <li>Experimenting with Kubernetes for better orchestration</li>
        <li>Building a custom dashboard for real-time test monitoring</li>
      </ul>
      
      <p>Scaling to 1000 nodes wasn't just about speed—it transformed how our team thinks about testing. Fast feedback enables true continuous deployment.</p>
      <p>For Playwright best practices, see <a href="/blog/playwright-e2e-testing-professional">Playwright E2E Testing at Scale</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-09-28'),
  },
  {
    slug: 'shift-left-testing-enterprise',
    title: 'Shift-Left Testing for Enterprise: Building Quality from Day One',
    description: 'Detect bugs at the design phase, not in production. Shift-left testing reduces release cycles by 40% and builds quality into enterprise development workflows, saving time and money.',
    image: '/blog/shift-left-testing-enterprise.svg',
    content: `
      <img src="/blog/shift-left-testing-enterprise.svg" alt="Shift-left testing pyramid for enterprise quality" style="max-width:100%;height:auto;" />
      <h2>What is Shift-Left Testing?</h2>
      <p>Shift-Left testing means moving quality assurance activities further to the left in the software development lifecycle. Instead of testing only after development is complete, you integrate testing from the design phase onwards.</p>
      <p>This paradigm shift has transformed enterprise testing: E-Commerce, Insurance, Public Sector, and SaaS companies have all achieved 60%+ reductions in production incidents through shift-left practices.</p>

      <h2>The Shift-Left Pyramid</h2>
      <p>Enterprise testing follows a hierarchical structure from design reviews through production monitoring:</p>
      <ul>
        <li><strong>Design Review:</strong> QA reviews specs before coding begins (highest ROI)</li>
        <li><strong>Unit Testing:</strong> Developers write tests during implementation (very high ROI)</li>
        <li><strong>API Testing:</strong> Verify integrations before components merge (very high ROI)</li>
        <li><strong>Component Testing:</strong> Test components as features complete (high ROI)</li>
        <li><strong>E2E Testing:</strong> Comprehensive testing before release (medium ROI)</li>
      </ul>

      <h2>Enterprise Implementation Strategy</h2>
      <p>The earliest shift-left activity happens before any code is written. QA teams collaborate with business analysts and architects to review requirements and design a comprehensive test strategy. This prevents costly rework later.</p>

      <h2>Measuring Success</h2>
      <ul>
        <li><strong>Defect Escape Rate:</strong> Target less than 2 per 1,000 lines in production</li>
        <li><strong>Time to Detect:</strong> 95% detected before production</li>
        <li><strong>Release Cycle:</strong> Reduction from 3 months to 2 weeks</li>
        <li><strong>Cost per Defect:</strong> Design-phase fix costs \$1; production fix costs \$100+ (1000x ROI)</li>
      </ul>

      <h2>Real-World Case Study</h2>
      <p>A global insurance company processing 50M+ policies annually implemented shift-left testing. Before: policy calculation bugs discovered in UAT caused 3-week delays costing \$2M. After: bugs caught in code review phase, release cycle reduced from 12 weeks to 3 weeks, production incidents dropped 70%, annual savings \$4.2M.</p>

      <h2>Getting Started: 30-Day Action Plan</h2>
      <ol>
        <li><strong>Week 1:</strong> Train team on shift-left principles; establish QA design review attendance</li>
        <li><strong>Week 2:</strong> Create API contracts for critical services; get team buy-in on coverage targets</li>
        <li><strong>Week 3:</strong> Implement unit test validation in CI/CD pipeline; establish 70% coverage goal</li>
        <li><strong>Week 4:</strong> Establish metrics dashboard; measure baseline defect escape rate</li>
      </ol>

      <h2>Conclusion</h2>
      <p>Shift-left testing transforms quality from a gate to a practice woven throughout development. In enterprise environments where release cost and risk are high, shifting left delivers measurable ROI: fewer production incidents, faster releases, and confident deployments.</p>
      <p>For technical practices that support shift-left, explore <a href="/blog/web-security-production-applications">web security and production hardening</a> and <a href="/blog/prisma-database-design-optimization">Prisma database optimisation</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-08'),
  },
  {
    slug: 'selenium-java-automation-framework-ecommerce',
    title: 'Selenium-Java for E-Commerce: Fast, Reliable Checkout Testing',
    description: 'A production-grade Selenium-Java framework using POM, parallel execution, and intelligent flaky test management. Run 2,000 checkout tests in 35 minutes, not 6 hours, and boost reliability.',
    image: '/blog/selenium-java-automation-framework-ecommerce.svg',
    content: `
      <img src="/blog/selenium-java-automation-framework-ecommerce.svg" alt="Selenium-Java automation for e-commerce checkout testing" style="max-width:100%;height:auto;" />
      <h2>Why Selenium + Java for E-Commerce?</h2>
      <p>E-commerce platforms are the most demanding testing environments. Every second of downtime costs money. Every checkout bug loses customers permanently. A well-architected Selenium-Java framework provides the safety net needed for high-reliability systems.</p>
      <ul>
        <li><strong>Performance Critical:</strong> Java's compiled nature means 2-3x faster test execution</li>
        <li><strong>Enterprise Stability:</strong> Used by Amazon, eBay, Target for production QA</li>
        <li><strong>Rich Ecosystem:</strong> Maven, Gradle, TestNG provide mature infrastructure</li>
        <li><strong>Parallel Execution:</strong> ThreadPoolExecutor enables testing hundreds of scenarios simultaneously</li>
        <li><strong>Team Scalability:</strong> Developers leverage Java expertise; lower learning curve</li>
      </ul>

      <h2>Production-Grade Framework Architecture</h2>
      <p>A real e-commerce test framework spans 5 critical layers: WebDriver management, Page Objects, Business Logic, Test Cases, and Infrastructure. Each layer has specific responsibilities ensuring maintainability and scalability.</p>

      <h2>WebDriver Management</h2>
      <p>Proper driver management prevents 80% of flaky tests. Use ThreadLocal to manage driver instances safely across parallel test executions. Configure implicit/explicit waits appropriately. Handle browser-specific options (headless mode for CI, GUI for local debugging).</p>

      <h2>E-Commerce Checkout Testing</h2>
      <p>Checkout is where 90% of revenue lives. It's also where 90% of bugs hide. Tests should cover: valid card processing, expired card rejection, coupon application, tax calculation, shipping method selection, and address validation across regions.</p>

      <h2>Handling Flaky Tests</h2>
      <p>E-commerce sites are complex with external payment gateway dependencies. Network timeouts happen; payment gateways lag. Implement selective retry logic that retries on known flaky errors (TimeoutException, StaleElementReferenceException) but not on logic errors.</p>

      <h2>Parallel Execution</h2>
      <p>Running 500 checkout scenarios sequentially takes hours. Configure TestNG with parallel="methods" and appropriate thread counts. Ensure tests are independent: each test needs its own data, isolated state, and independent browser instances using ThreadLocal.</p>

      <h2>Best Practices</h2>
      <ul>
        <li><strong>ThreadLocal WebDriver:</strong> Prevents driver interference in parallel tests</li>
        <li><strong>Explicit Waits Only:</strong> Implicit waits cause timing issues</li>
        <li><strong>No Test Interdependencies:</strong> Enables parallel execution</li>
        <li><strong>Data Isolation:</strong> Each test needs fresh data and clean state</li>
        <li><strong>Centralised Configuration:</strong> Secrets, URLs, timeouts in config files</li>
      </ul>

      <h2>Real-World Case Study: RetailCorp</h2>
      <p>A £500M/year e-commerce platform implemented this framework and achieved: 2,000 tests running in 35 minutes (down from 6 hours), flaky test rate dropped from 15% to 2%, checkout test coverage increased from 65% to 94%, production checkout bugs decreased 78%, team velocity increased 40%.</p>

      <h2>Conclusion</h2>
      <p>A production-grade Selenium-Java framework is the difference between a 6-hour test run and 35 minutes. Between debugging flaky tests and confidently deploying. In e-commerce, where every checkout bug costs thousands of pounds, this framework pays for itself on day one.</p>
      <p>For modern browser automation alternatives, check <a href="/blog/playwright-e2e-testing-professional">Playwright E2E testing at scale</a> or <a href="/blog/scaling-playwright">Scaling Playwright to 1000 Nodes</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-07'),
  },
  {
    slug: 'nextjs-16-development-mastery',
    title: 'Next.js 16 Mastery: Server Components, App Router, and Performance',
    description: 'Master Next.js 16 and React 19: App Router, Server/Client Components, Zod forms, TypeScript, and patterns that reduce JavaScript bundle size by 40–60% for lightning-fast web apps.',
    image: '/blog/nextjs-16-development-mastery.svg',
    content: `
      <img src="/blog/nextjs-16-development-mastery.svg" alt="Next.js 16 and React 19 server components and app router architecture" style="max-width:100%;height:auto;" />
      <h2>Why Next.js 16 Dominates Modern Frontend Development</h2>
      <p>Next.js 16 with React 19 represents a fundamental shift in how we build web applications. The App Router, Server Components, and native streaming enable building applications that are simultaneously fast, scalable, and developer-friendly.</p>
      <ul>
        <li><strong>Server Components by Default:</strong> Reduce JavaScript bundle size by 40-60% compared to client-side applications</li>
        <li><strong>Automatic Code Splitting:</strong> Every route becomes its own code chunk; users only download what they need</li>
        <li><strong>Real-time Database Access:</strong> Query databases directly from components without API routes</li>
        <li><strong>Built-in Performance:</strong> Image optimisation, code splitting, and caching automatically configured</li>
        <li><strong>TypeScript First:</strong> Full type safety from database query to component prop</li>
      </ul>

      <h2>Understanding Server Components vs. Client Components</h2>
      <p>The biggest mindset shift is embracing Server Components as the default. Server Components render on the server and send HTML to the browser—zero JavaScript. They're perfect for data fetching, database queries, and rendering static content.</p>
      <p>Client Components ("use client") are for interactivity: forms, state management, event handlers, hooks. Make components client only when they need interactivity, not before.</p>

      <h2>App Router Architecture: The New Standard</h2>
      <p>The App Router replaces the pages/ directory with a file-system based routing system that's more flexible and powerful. Routes are organised by folder structure. Special files like layout.tsx and error.tsx provide global structure and error handling.</p>

      <h2>Forms & Validation with React 19 + Zod</h2>
      <p>React 19 makes form handling significantly better. Progressive enhancement means forms work even with JavaScript disabled. Use Zod for runtime validation ensuring both frontend and API layer have identical validation rules.</p>

      <h2>Data Fetching Patterns</h2>
      <p>Fetch data in Server Components using async/await. Use React cache() to deduplicate requests. For dynamic data, leverage Incremental Static Regeneration (ISR) to update content on-demand without full rebuilds.</p>

      <h2>TypeScript Best Practices in Next.js</h2>
      <p>Leverage TypeScript fully: type route params, type API responses, type component props. Use discriminated unions for complex state. Extract types from Prisma queries for type-safe database access.</p>

      <h2>Performance Optimisation Tips</h2>
      <ul>
        <li><strong>Bundle Analysis:</strong> Use @next/bundle-analyzer to identify large dependencies</li>
        <li><strong>Streaming:</strong> Use Suspense for UI that renders in stages whilst data loads</li>
        <li><strong>Route Prefetching:</strong> Next.js automatically prefetches links in viewport</li>
        <li><strong>Middleware:</strong> Handle authentication and redirects before Next.js processes requests</li>
        <li><strong>Caching Headers:</strong> Set appropriate Cache-Control headers for static content</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Next.js 16 with React 19 is the most productive way to build modern web applications. Server Components eliminate JavaScript bloat, types provide confidence, and built-in optimisations mean your first build is nearly production-ready. Master these patterns and you'll build applications that are fast, scalable, and maintainable.</p>
      <p>For data layer patterns, explore <a href="/blog/prisma-database-design-optimization">Prisma optimisation and N+1 prevention</a> or our <a href="/curriculum">curriculum</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-06'),
  },
  {
    slug: 'prisma-database-design-optimization',
    title: 'Prisma Optimisation: Preventing N+1 Queries and Scaling Gracefully',
    description: 'Master Prisma ORM: schema design, N+1 prevention, indexing strategies, migrations, and query patterns that scale to millions of records. Avoid performance pitfalls and build robust apps.',
    image: '/blog/prisma-database-design-optimization.svg',
    content: `
      <img src="/blog/prisma-database-design-optimization.svg" alt="Prisma ORM schema design and N+1 query prevention" style="max-width:100%;height:auto;" />
      <h2>Why Database Design Matters: The Cost of Poor Queries</h2>
      <p>A single N+1 query bug can slow a page from 100ms to 5 seconds. Poorly indexed queries that work fine with 1,000 rows fail catastrophically with 1 million rows. This is why database performance is non-negotiable for scaling applications.</p>
      <p>Prisma makes database design accessible to frontend developers, but this comes with responsibility—bad database patterns become catastrophic at scale.</p>

      <h2>Prisma Schema Design Fundamentals</h2>
      <p>Schema design determines what's possible. Use relations liberally (one-to-many, many-to-many) to express business logic. Prisma handles the foreign keys and migrations automatically.</p>
      <p>Key principle: Normalise to 3NF (Third Normal Form) to eliminate redundancy. Avoid storing denormalised data unless absolutely necessary for performance reasons.</p>

      <h2>The N+1 Query Problem: The Deadly Pattern</h2>
      <p>N+1 happens when you query in a loop: fetch 100 users (1 query), then for each user fetch their posts (100 queries) = 101 total queries. This is the most common performance killer.</p>
      <p>Solution: Use include() or select() to fetch related data in advance. Fetch all posts in a single query joining users and posts.</p>

      <h2>Query Optimisation: Include vs. Select</h2>
      <p><strong>include():</strong> Fetch all fields plus related records. Simple but least efficient.</p>
      <p><strong>select():</strong> Choose exactly which fields to fetch. More efficient for large tables with many columns you don't need.</p>

      <h2>Indexing Strategies for Production</h2>
      <p>Indexes speed up WHERE clause filtering and JOIN operations. Create indexes on columns frequently queried: user IDs in lookups, timestamps for range queries, foreign keys for joins.</p>
      <p>Common index patterns: User lookup by email, Post lookup by slug, Timestamp range queries, Category filtering.</p>

      <h2>Pagination at Scale</h2>
      <p>Never fetch all records. Use cursor-based pagination (more efficient than offset) for better performance on large datasets. Offset pagination becomes inefficient when offset is large.</p>

      <h2>Transactions & ACID Guarantees</h2>
      <p>Transactions ensure consistency: if any statement fails, all changes rollback. Use transactions for critical operations (payments, inventory updates) where partial execution is dangerous.</p>

      <h2>Database Migrations: Evolving Your Schema Safely</h2>
      <p>Migrations track database schema changes over time. Use npx prisma migrate dev to create migrations—Prisma generates the SQL automatically. This enables version control for your database.</p>

      <h2>Scaling to Millions of Records</h2>
      <p>At scale: partition large tables by date, archive old data, read replicas for reporting queries, write to primary and read from replicas, implement caching layer (Redis).</p>

      <h2>Conclusion</h2>
      <p>Database design and query optimisation are the foundation of scalable applications. Understanding Prisma, N+1 patterns, indexing, and migration strategies separates applications that scale gracefully from those that crumble under load. Master these patterns early and your future self will thank you.</p>
      <p>Pair Prisma excellence with <a href="/blog/web-security-production-applications">production security practices</a> and <a href="/blog/shift-left-testing-enterprise">shift-left testing</a> to protect your data.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-05'),
  },
  {
    slug: 'web-security-production-applications',
    title: 'Web Security: Defence Against XSS, CSRF, and Modern Threats',
    description: 'Production security essentials: prevent XSS, CSRF, and injection attacks, implement rate limiting, enforce HTTPS, set security headers, and follow a pre-deployment security checklist for robust protection.',
    image: '/blog/web-security-production-applications.svg',
    content: `
      <img src="/blog/web-security-production-applications.svg" alt="Web security checklist for XSS, CSRF, and production hardening" style="max-width:100%;height:auto;" />
      <h2>The Reality of Web Security: Production Incidents Are Expensive</h2>
      <p>A single security breach costs organisations £3M on average. Exposed user data, downtime, legal fees, and lost trust compound quickly. Yet security is often treated as an afterthought rather than a first-class engineering concern.</p>
      <p>This guide covers practical, implementable security practices that reduce your risk exposure by 95%.</p>

      <h2>XSS (Cross-Site Scripting): The Most Common Web Vulnerability</h2>
      <p>XSS happens when untrusted user input is rendered as HTML/JavaScript in the browser. An attacker crafts input containing JavaScript code. When the victim loads the page, the malicious script executes in their browser.</p>
      <p>React provides protection by default: JSX escapes values automatically. Never use dangerouslySetInnerHTML unless absolutely necessary. If you must render user HTML, use DOMPurify to sanitise it first.</p>

      <h2>CSRF (Cross-Site Request Forgery): Protecting Against Form Hijacking</h2>
      <p>CSRF tricks users into making unintended requests. A user logs into their bank, then visits a malicious site. The malicious site makes a transfer request to the bank using the user's session—the bank thinks it's legitimate.</p>
      <p>Protection: Use CSRF tokens tied to the user session. The token must be submitted with state-changing requests (POST, PUT, DELETE). Next.js middleware can validate these automatically.</p>

      <h2>SQL Injection: Preventing Database Compromise</h2>
      <p>SQL injection happens when user input is interpolated directly into SQL queries. An attacker crafts input containing SQL syntax to break out of the intended query.</p>
      <p>Prevention is simple: never concatenate strings into SQL queries. Use parameterised queries (prepared statements). Prisma ORM handles this automatically—queries are parameterised by default.</p>

      <h2>Input Validation & Sanitisation Layer</h2>
      <p>Validate all input at the boundary. Use Zod, Yup, or similar libraries to define schemas and validate against them. Reject requests that don't match expected formats.</p>

      <h2>Authentication & Password Security</h2>
      <p>Never store passwords as plain text. Hash passwords with bcrypt, scrypt, or Argon2. These algorithms are "slow" by design—a 100ms hash makes brute-force attacks impractical.</p>

      <h2>Environment Variables & Secrets Management</h2>
      <p>Secrets (API keys, database URLs, encryption keys) must never be committed to git. Use environment variables loaded from .env files (locally) or platform secrets (production).</p>

      <h2>Rate Limiting: Preventing Abuse & Brute Force</h2>
      <p>Rate limiting throttles requests from a single IP/user to prevent abuse. Brute force attacks try many password combinations. Rate limiting slows attackers to a crawl.</p>

      <h2>HTTPS & TLS: Encrypting Data in Transit</h2>
      <p>All production traffic must use HTTPS with a valid TLS certificate. This encrypts data in transit and authenticates the server. Never allow HTTP on production.</p>

      <h2>Security Headers & CSP</h2>
      <p>Content Security Policy (CSP) restricts what resources (scripts, styles, images) the browser can load. A strict CSP header prevents inline scripts and limits external resources to your own domains.</p>

      <h2>Pre-Deployment Security Checklist</h2>
      <ul>
        <li>☐ All inputs validated against schemas (Zod/Yup)</li>
        <li>☐ No dangerouslySetInnerHTML without DOMPurify</li>
        <li>☐ Passwords hashed with bcrypt/Argon2</li>
        <li>☐ Environment variables not in git or code</li>
        <li>☐ HTTPS enabled with valid certificate</li>
        <li>☐ CSRF tokens implemented on forms</li>
        <li>☐ SQL queries use parameterised queries (Prisma)</li>
        <li>☐ Rate limiting on authentication endpoints</li>
        <li>☐ npm audit passes with no high/critical vulnerabilities</li>
      </ul>

      <h2>Conclusion</h2>
      <p>By understanding XSS, CSRF, SQL injection, and implementing defence-in-depth strategies (validation, rate limiting, encryption, monitoring), you build applications that withstand attacks and protect user data. Security is a requirement, not a feature.</p>
      <p>Combine security with <a href="/blog/web-accessibility-wcag-21-compliance">accessibility practices</a> and <a href="/blog/technical-seo-engineering-blog">technical SEO</a> to build inclusive, protected applications.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-04'),
  },
  {
    slug: 'technical-seo-engineering-blog',
    title: 'Technical SEO for Engineering Blogs: Ranking, Core Web Vitals, and Content Strategy',
    description: 'SEO fundamentals for engineers: meta tags, Core Web Vitals, content strategy, heading hierarchy, internal linking, and Lighthouse optimisation to help your blog rank and reach your audience.',
    image: '/blog/technical-seo-engineering-blog.svg',
    content: `
      <img src="/blog/technical-seo-engineering-blog.svg" alt="Technical SEO for engineering blogs: meta tags, Core Web Vitals, and content strategy" style="max-width:100%;height:auto;" />
      <h2>Why Engineers Should Care About SEO</h2>
      <p>You write amazing technical content. But if no one discovers it through search engines, your work reaches only direct visitors. Technical SEO ensures your content ranks in Google, Reddit, and web search—where your audience is looking for solutions.</p>

      <h2>On-Page SEO: Meta Tags & Metadata</h2>
      <p>Every page needs a unique title (50-60 chars), meta description (150-160 chars), and heading hierarchy. Title and description appear in Google search results—they're your first impression.</p>
      <p>Heading hierarchy: h1 for page title, h2 for main sections, h3 for subsections. Never skip heading levels. Screen readers and search engines rely on hierarchy.</p>

      <h2>Core Web Vitals: The Metrics Google Actually Measures</h2>
      <p>Google's ranking algorithm includes page speed metrics. Three matter most:</p>
      <ul>
        <li><strong>LCP (Largest Contentful Paint):</strong> How fast the main content loads. Target: under 2.5 seconds</li>
        <li><strong>FID (First Input Delay):</strong> How responsive the page feels when users interact. Target: under 100ms</li>
        <li><strong>CLS (Cumulative Layout Shift):</strong> Visual stability. Target: under 0.1</li>
      </ul>
      <p>Improve them by optimising images, code splitting, and removing render-blocking JavaScript.</p>

      <h2>Content Strategy for Technical Audiences</h2>
      <p>Write for search intent: people searching "how to optimise Prisma queries" expect a solution, not a tutorial. Match intent by providing clear, actionable answers in the first 100 words.</p>

      <h2>Internal Linking: Distributing Authority</h2>
      <p>Internal links signify importance and spread authority throughout your site. Link from home page to key category pages. Link between related articles. Use descriptive anchor text ("Next.js deployment guide" not "click here").</p>

      <h2>Semantic HTML: Clarity for Machines and Humans</h2>
      <p>Use semantic HTML tags: &lt;article&gt; for blog posts, &lt;section&gt; for main sections, &lt;nav&gt; for navigation, &lt;aside&gt; for sidebars. Screen readers and search engines understand structure better than generic &lt;div&gt; tags.</p>

      <h2>Image Optimisation for SEO</h2>
      <p>Images account for most page weight. Optimise: use modern formats (WebP), compress aggressively, include descriptive alt text, use lazy loading.</p>

      <h2>Monitoring & Measurement</h2>
      <ul>
        <li><strong>Google Search Console:</strong> See which queries drive traffic, which pages rank for what, crawl errors</li>
        <li><strong>Google Analytics:</strong> Track user behaviour, bounce rate, time on page, conversion tracking</li>
        <li><strong>Lighthouse:</strong> Automated performance and accessibility audits</li>
      </ul>

      <h2>Conclusion</h2>
      <p>SEO and good engineering align perfectly: semantic HTML, fast page speed, accessibility, clear information architecture. By implementing these practices, your technical content reaches the audience searching for solutions. Your blog becomes a resource rather than a forgotten project.</p>
      <p>Improve your site's accessibility further by reading <a href="/blog/web-accessibility-wcag-21-compliance">WCAG 2.1 compliance guidance</a> or our <a href="/curriculum">curriculum</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-03'),
  },
  {
    slug: 'web-accessibility-wcag-21-compliance',
    title: 'Web Accessibility: WCAG 2.1 Level AA Essentials',
    description: 'Accessibility essentials: colour contrast, keyboard navigation, screen readers, ARIA, semantic HTML, and WCAG 2.1 Level AA compliance checklist. Build inclusive, legally compliant web apps.',
    image: '/blog/web-accessibility-wcag-21-compliance.svg',
    content: `
      <img src="/blog/web-accessibility-wcag-21-compliance.svg" alt="Web accessibility and WCAG 2.1 Level AA compliance essentials" style="max-width:100%;height:auto;" />
      <h2>Why Accessibility Matters: Legal, Ethical, and Business Reasons</h2>
      <p>15% of the global population (1.3 billion people) have disabilities affecting vision, hearing, mobility, or cognition. Web accessibility ensures these users can use your application.</p>
      <p>Legal perspective: The ADA (Americans with Disabilities Act) applies to websites. WCAG 2.1 Level AA is the accessibility standard. Non-compliance risks lawsuits and costly redesigns.</p>

      <h2>The Four WCAG Principles: POUR</h2>
      <p><strong>Perceivable:</strong> Users must perceive content. Text must be readable, images need alt text, colour isn't the only way to convey information.</p>
      <p><strong>Operable:</strong> Users must interact. Keyboard navigation must work, interactive elements must be clickable, users can skip repetitive content.</p>
      <p><strong>Understandable:</strong> Content must be clear. Language is plain, instructions are clear, errors are explained.</p>
      <p><strong>Robust:</strong> Content works across technologies. Valid HTML, proper semantic tags, assistive technologies can interpret content.</p>

      <h2>Colour Contrast: The 4.5:1 Rule</h2>
      <p>Text and background colours must have sufficient contrast for readability. WCAG AA requires 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+).</p>
      <p>Tools: Check contrast with WebAIM contrast checker or browser DevTools. Never rely solely on colour to convey information.</p>

      <h2>Keyboard Navigation: Essential for Many Users</h2>
      <p>Power users prefer keyboards. Visually impaired users rely on keyboards. Screen reader users navigate via keyboard.</p>
      <p>Requirement: Every interactive element must be reachable via Tab key. Tab order should match visual reading order (left-to-right, top-to-bottom). Skip links let users bypass navigation.</p>

      <h2>Screen Readers: Making Audio Content from Visual Layout</h2>
      <p>Screen readers read page content aloud. Users navigate via keyboard. They hear "heading level 2" and "button" but don't see visual presentation.</p>
      <p>Implementation: Use semantic HTML so screen readers understand structure. Use ARIA only when semantic HTML can't express something.</p>
      <p>Testing: NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS). Spend 15 minutes using your site with a screen reader enabled—you'll find accessibility issues immediately.</p>

      <h2>Alt Text: Describing Images for Those Who Can't See Them</h2>
      <p>Every non-decorative image needs alt text. Describe the content/purpose, not "image of" or the filename.</p>
      <p>Good alt text: "Screenshot of Prisma query result showing 3 users"</p>
      <p>Bad alt text: "image123.jpg" or "screenshot"</p>

      <h2>Semantic HTML: The Foundation of Accessibility</h2>
      <p>&lt;h1&gt;, &lt;h2&gt;, &lt;button&gt;, &lt;nav&gt;, &lt;article&gt;, &lt;form&gt;, &lt;input&gt;, &lt;label&gt;—these elements have built-in accessibility. Screen readers understand them immediately. Keyboards activate buttons.</p>
      <p>Never replace &lt;button&gt; with &lt;div onclick&gt;. Semantic HTML gets you 80% of accessibility automatically.</p>

      <h2>WCAG 2.1 Level AA Compliance Checklist</h2>
      <ul>
        <li>☐ Colour contrast 4.5:1 (normal text), 3:1 (large text)</li>
        <li>☐ All interactive elements keyboard accessible (Tab key works)</li>
        <li>☐ All images have descriptive alt text (or alt="" for decorative)</li>
        <li>☐ Form labels connected to inputs with &lt;label&gt;</li>
        <li>☐ Headings follow hierarchy (no skipped levels)</li>
        <li>☐ Page language specified (lang attribute)</li>
        <li>☐ No auto-playing video/sound</li>
        <li>☐ Links descriptive ("Read Next.js deployment guide" not "click here")</li>
        <li>☐ Error messages associated with form fields</li>
        <li>☐ Focus visible for keyboard navigation</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Building accessible web applications is not altruism—it's engineering excellence. Semantic HTML, keyboard navigation, clear labels, colour contrast, and screen reader testing ensure your application works for everyone. WCAG 2.1 Level AA is the standard. Implement it from day one, not as an afterthought.</p>
      <p>Discover how <a href="/blog/technical-seo-engineering-blog">technical SEO can amplify your accessible content</a> or explore our <a href="/curriculum">curriculum</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-02'),
  },
  {
    slug: 'playwright-e2e-testing-professional',
    title: 'Playwright E2E Testing at Scale: Best Practices for Fast, Reliable Automation',
    description: 'Playwright best practices: page objects, fixtures, parallel execution, cross-browser testing, flaky test prevention, and CI/CD integration. Ship with confidence and speed.',
    image: '/blog/playwright-e2e-testing-professional.svg',
    content: `
      <img src="/blog/playwright-e2e-testing-professional.svg" alt="Playwright E2E testing best practices and CI/CD integration" style="max-width:100%;height:auto;" />
      <h2>Why Playwright Dominates E2E Testing</h2>
      <p>Playwright (Microsoft) and Cypress are the modern E2E testing frameworks. Playwright wins on: cross-browser support (Chrome, Firefox, Safari, Edge), multiple programming languages (JS, Python, Java), fast execution, and enterprise reliability.</p>
      <ul>
        <li><strong>Real Browser Automation:</strong> Controls actual browsers, not browser APIs. Tests real user interactions.</li>
        <li><strong>Cross-Browser:</strong> Run same tests on Chrome, Firefox, Safari, Edge simultaneously</li>
        <li><strong>Parallel Execution:</strong> Run hundreds of tests simultaneously across multiple machines</li>
        <li><strong>Built-in Waiting:</strong> Waits for elements automatically; tests are less flaky</li>
        <li><strong>Debugging Tools:</strong> UI mode, trace viewer, inspector make debugging easy</li>
      </ul>

      <h2>Test Structure & Best Practices</h2>
      <p>Organise tests by feature, not by page. Group related tests in describe blocks. Use meaningful test names that describe user intent, not implementation details.</p>
      <p>Good name: "User can login with valid credentials"</p>
      <p>Bad name: "Test click button element and check if page title changed"</p>

      <h2>Page Object Model: Eliminating Test Duplication</h2>
      <p>Page Objects encapsulate page-specific interactions. Instead of hard-coding selectors and click sequences in every test, create a Page Object that exposes high-level actions.</p>
      <p>Benefit: When UI changes, update selectors in one place (the Page Object) rather than in 50 tests.</p>

      <h2>Test Fixtures: Setup/Teardown Done Right</h2>
      <p>Fixtures automate setup and teardown. Create fixtures for: authentication (log user in), database state (seed test data), test users (create users with specific roles), browser context (cookies, local storage).</p>

      <h2>Waiting Strategies: Eliminating Flaky Tests</h2>
      <p>Playwright waits automatically. Selector queries wait up to 30 seconds for element to appear. This is smart waiting—if element appears in 1 second, test continues immediately. If it takes 30 seconds, test times out.</p>

      <h2>Parallel Execution: Testing at Scale</h2>
      <p>Playwright tests run in parallel by default. Configure workers: 4-8 workers per machine is typical. 100 tests run in 10 minutes with proper parallelisation.</p>
      <p>Requirement: Tests must be independent. Each test should have its own browser context, unique data, no shared state.</p>

      <h2>Cross-Browser Testing: Chrome, Firefox, Safari</h2>
      <p>Same tests run on multiple browsers. This ensures your site works across browsers. Different rendering engines expose different issues.</p>

      <h2>Running Tests in CI/CD: GitHub Actions</h2>
      <p>GitHub Actions runs tests automatically on every commit. Test results appear directly on pull requests. Failing tests block merges.</p>

      <h2>Debugging Playwright Tests</h2>
      <ul>
        <li><strong>UI Mode:</strong> npx playwright test --ui opens interactive test runner. Watch test execution step-by-step.</li>
        <li><strong>Debug Mode:</strong> npx playwright test --debug pauses at each step. Inspect page state, run commands in console.</li>
        <li><strong>Trace Viewer:</strong> Recordings capture every action, screenshot, and network request. Review failures in detail.</li>
        <li><strong>Inspector:</strong> Opens DevTools-like interface whilst test runs. Inspect elements, run JavaScript.</li>
      </ul>

      <h2>Test Data Strategy: Isolation & Cleanup</h2>
      <p>Each test needs fresh, isolated data. Create test users, products, and records in setup. Delete them in teardown. Prevent test interdependencies and allow parallel execution.</p>

      <h2>Conclusion</h2>
      <p>Playwright is the modern standard for E2E testing. Combined with proper architecture (Page Objects, fixtures, API tests), parallel execution, and CI/CD integration, you achieve fast, reliable test suites that catch bugs before production. Master Playwright and your applications ship with confidence.</p>
      <p>Ready to scale your testing? Check <a href="/blog/scaling-playwright">scaling Playwright to 1000 nodes</a> or <a href="/curriculum">our curriculum</a>.</p>
    `,
    published: true,
    publishedAt: new Date('2026-02-01'),
  },
]

async function main() {
  console.log('Seeding blog posts...')

  // Create blog posts
  for (const post of blogPosts) {
    const createdPost = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        authorName: 'QAi Talks Team',
      },
      create: {
        ...post,
        authorName: 'QAi Talks Team',
      },
    })

    console.log(`Created/updated: ${createdPost.title}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
