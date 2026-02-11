export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { getPrisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"

// Calculate reading time based on word count
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const htmlStripped = content.replace(/<[^>]*>/g, '')
  const wordCount = htmlStripped.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Determine category from title keywords
function getCategory(title: string, slug: string): { name: string; color: string; icon: string } {
  const slugLower = slug.toLowerCase()
  
  if (slugLower.includes('playwright') || slugLower.includes('selenium')) return { name: 'Testing', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🧪' }
  if (slugLower.includes('prisma') || slugLower.includes('database')) return { name: 'Database', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🗄️' }
  if (slugLower.includes('nextjs') || slugLower.includes('next.js')) return { name: 'Frontend', color: 'bg-black text-white border-gray-700', icon: '⚛️' }
  if (slugLower.includes('security') || slugLower.includes('xss')) return { name: 'Security', color: 'bg-red-100 text-red-800 border-red-300', icon: '🔒' }
  if (slugLower.includes('seo')) return { name: 'SEO', color: 'bg-green-100 text-green-800 border-green-300', icon: '📈' }
  if (slugLower.includes('accessibility') || slugLower.includes('wcag')) return { name: 'Accessibility', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '♿' }
  if (slugLower.includes('shift-left') || slugLower.includes('enterprise')) return { name: 'Strategy', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '📊' }
  
  return { name: 'Engineering', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '⚙️' }
}

export const metadata: Metadata = {
  title: 'QA Engineering Blog | QAi Talks',
  description: 'Expert insights on test automation, CI/CD pipelines, performance testing, and quality assurance architecture for enterprise applications.',
  openGraph: {
    title: 'QA Engineering Blog | QAi Talks',
    description: 'Expert insights on test automation, CI/CD pipelines, performance testing, and quality assurance architecture for enterprise applications.',
    type: 'website',
    url: 'https://qaitalks.com/blog',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default async function BlogPage() {
  const prisma = getPrisma()
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-logic-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-accent/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="absolute right-[8%] top-[15%] font-hand text-logic-cyan text-3xl font-bold rotate-[-3deg] animate-float drop-shadow-lg hidden md:block">
            Daily Deep Dives
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-deep-blueprint mb-6">
            Engineering Log
          </h1>
          <p className="text-xl max-w-2xl opacity-80 text-text-slate mb-8">
            Technical deep dives into test automation, architecture, and systems engineering.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/60 backdrop-blur border border-logic-cyan/30 rounded-full text-sm font-mono text-deep-blueprint">
              📚 {posts.length} Articles
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur border border-logic-cyan/30 rounded-full text-sm font-mono text-deep-blueprint">
              ⏱️ {posts.reduce((acc, p) => acc + calculateReadingTime(p.content), 0)} min read total
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-xl text-slate-600">No blog posts available yet.</p>
              <p className="text-sm text-slate-500 mt-2">Check back soon for technical deep dives!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => {
                const category = getCategory(post.title, post.slug)
                const readingTime = calculateReadingTime(post.content)
                
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <article className="group h-full bg-white rounded-xl border-2 border-slate-200 hover:border-deep-blueprint overflow-hidden shadow-sm hover:shadow-xl hover:shadow-deep-blueprint/20 transition-all duration-300 cursor-pointer">
                      {/* Featured Image */}
                      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden flex items-center justify-center">
                        {post.image ? (
                          <Image 
                            src={post.image} 
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                        )}
                        {index === 0 && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-warning-amber to-amber-400 text-deep-blueprint text-xs font-bold rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                            ⭐ Trending
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Meta Info */}
                        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                          <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${category.color}`}>
                            {category.icon} {category.name}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {readingTime} min read
                          </span>
                        </div>

                        {/* Date */}
                        <span className="text-xs font-mono text-purple-accent font-semibold uppercase tracking-wider">
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-deep-blueprint mt-3 mb-3 group-hover:text-logic-cyan transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                          {post.description}
                        </p>

                        {/* CTA Button */}
                        <div className="flex items-center gap-2 text-sm font-mono font-semibold text-logic-cyan group-hover:translate-x-2 transition-transform">
                          Read Article
                          <span>→</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
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
