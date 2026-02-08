export const dynamic = "force-dynamic"

import Link from "next/link"
import { getPrisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"

async function getBlogPosts() {
  const prisma = getPrisma()
  return prisma.blogPost.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  })
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto relative">
          <span className="absolute right-[8%] top-[15%] font-hand text-logic-cyan text-3xl font-bold rotate-[-3deg] animate-float drop-shadow-lg hidden md:block">
            Daily Deep Dives
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-deep-blueprint mb-6">
            Engineering Log
          </h1>
          <p className="text-xl max-w-2xl opacity-80 text-text-slate">
            Technical deep dives into test automation, architecture, and systems engineering.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-slate-600">No blog posts available yet.</p>
                <p className="text-sm text-slate-500 mt-2">Check back soon for technical deep dives!</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg border-2 border-deep-blueprint p-8 shadow-[4px_4px_0_rgba(0,27,68,0.1)] hover:shadow-[8px_8px_0_rgba(0,27,68,0.15)] hover:translate-y-[-4px] transition-all duration-300 relative group"
                >
                  {index === 0 && (
                    <span className="absolute right-5 -top-4 font-hand text-warning-amber text-lg font-bold rotate-[3deg]">
                      Trending →
                    </span>
                  )}
                  {index === 1 && (
                    <span className="absolute left-[30%] -top-5 font-hand text-logic-cyan text-base font-bold rotate-[-2deg]">
                      Technical Guide
                    </span>
                  )}
                  
                  <div className="mb-6">
                    <div className="font-mono text-xs text-slate-500 mb-2">
                      {/* Featured Post */}
                    </div>
                    <span className="text-sm font-mono text-purple-accent font-semibold">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                    <h3 className="text-2xl font-bold text-deep-blueprint mt-3 mb-3 group-hover:text-logic-cyan transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block px-6 py-3 border-2 border-deep-blueprint rounded font-mono font-semibold text-sm text-deep-blueprint hover:bg-deep-blueprint hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    Read.md
                  </Link>
                </article>
              ))
            )}
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
