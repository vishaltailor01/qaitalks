import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const blogPosts = [
  {
    slug: 'pom-is-dead',
    title: 'Why Page Object Model is Dead',
    description: 'Exploring how the Screenplay pattern and Component-based testing are rendering the traditional POM obsolete in modern frameworks.',
    content: `
      <h2>The Evolution of Test Architecture</h2>
      <p>For years, the Page Object Model (POM) has been the gold standard for structuring UI test automation. But as frameworks and applications have evolved, POM's limitations have become increasingly apparent.</p>
      
      <h2>The Problems with Traditional POM</h2>
      <p>Traditional POM suffers from several critical issues:</p>
      <ul>
        <li><strong>Tight Coupling:</strong> Page objects become tightly coupled to specific pages, making them difficult to reuse across different test scenarios.</li>
        <li><strong>Maintenance Nightmare:</strong> Changes to the UI require updates across multiple page objects, leading to brittle tests.</li>
        <li><strong>Scalability Issues:</strong> As applications grow, the number of page objects explodes, making the codebase unwieldy.</li>
      </ul>
      
      <h2>Enter the Screenplay Pattern</h2>
      <p>The Screenplay pattern represents a paradigm shift in test automation. Instead of modeling pages, it models user interactions as a series of tasks, actions, and questions. This approach provides:</p>
      <ul>
        <li>Better separation of concerns</li>
        <li>Higher reusability of test components</li>
        <li>More maintainable test code</li>
        <li>Clearer test intent</li>
      </ul>
      
      <pre><code>// Traditional POM
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
    `,
    published: true,
    publishedAt: new Date('2026-10-24'),
  },
  {
    slug: 'contract-testing',
    title: 'Contract Testing with Pact',
    description: 'Stop writing E2E tests for backend logic. Learn how to verify microservice integration in milliseconds with consumer-driven contracts.',
    content: `
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
    `,
    published: true,
    publishedAt: new Date('2026-10-12'),
  },
  {
    slug: 'scaling-playwright',
    title: 'Scaling Playwright to 1000 Nodes',
    description: 'A case study on reducing build times from 4 hours to 10 minutes using sharding and transient Docker swarms.',
    content: `
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
    `,
    published: true,
    publishedAt: new Date('2026-09-28'),
  },
]

async function main() {
  console.log('Seeding blog posts...')

  // First, create a default author if one doesn't exist
  const author = await prisma.user.upsert({
    where: { email: 'admin@qaitalk.com' },
    update: {},
    create: {
      email: 'admin@qaitalk.com',
      name: 'QAi Talks Team',
      role: 'admin',
    },
  })

  console.log(`Created/found author: ${author.email}`)

  // Create blog posts
  for (const post of blogPosts) {
    const createdPost = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        authorId: author.id,
      },
      create: {
        ...post,
        authorId: author.id,
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
