export const dynamic = "force-dynamic"

import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPrisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import DOMPurify from "isomorphic-dompurify"

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const htmlStripped = content.replace(/<[^>]*>/g, '')
  const wordCount = htmlStripped.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Extract headings from HTML content for TOC
function extractHeadings(html: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = []
  const headingRegex = /<h([2-3])[^>]*>([^<]+)<\/h[23]>/g
  let match
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '')
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    headings.push({ level, text, id })
  }
  
  return headings
}

// Get category from slug
function getCategory(slug: string): { name: string; color: string; icon: string } {
  const slugLower = slug.toLowerCase()
  
  if (slugLower.includes('playwright') || slugLower.includes('selenium')) return { name: 'Testing', color: 'bg-blue-100 text-blue-800', icon: '🧪' }
  if (slugLower.includes('prisma') || slugLower.includes('database')) return { name: 'Database', color: 'bg-purple-100 text-purple-800', icon: '🗄️' }
  if (slugLower.includes('nextjs') || slugLower.includes('next.js')) return { name: 'Frontend', color: 'bg-black text-white', icon: '⚛️' }
  if (slugLower.includes('security') || slugLower.includes('xss')) return { name: 'Security', color: 'bg-red-100 text-red-800', icon: '🔒' }
  if (slugLower.includes('seo')) return { name: 'SEO', color: 'bg-green-100 text-green-800', icon: '📈' }
  if (slugLower.includes('accessibility') || slugLower.includes('wcag')) return { name: 'Accessibility', color: 'bg-yellow-100 text-yellow-800', icon: '♿' }
  if (slugLower.includes('shift-left') || slugLower.includes('enterprise')) return { name: 'Strategy', color: 'bg-indigo-100 text-indigo-800', icon: '📊' }
  
  return { name: 'Engineering', color: 'bg-slate-100 text-slate-800', icon: '⚙️' }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const prisma = getPrisma()
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post) {
    return {
      title: 'Post Not Found | QAi Talks',
    }
  }

  return {
    title: `${post.title} | QAi Talks`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: ['QAi Talks Team'],
      url: `https://qaitalks.com/blog/${slug}`,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prisma = getPrisma()
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post) {
    notFound()
  }

  const category = getCategory(slug)
  const readingTime = calculateReadingTime(post.content)
  const headings = extractHeadings(post.content)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <Link href="/blog" className="hover:text-deep-blueprint transition-colors">
            ← Back to Blog
          </Link>
          <span>/</span>
          <span className="text-deep-blueprint font-semibold">{post.title}</span>
        </nav>
      </div>

      {/* Featured Image Section */}
      <section className="bg-white border-y-2 border-deep-blueprint/10 py-0 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {post.image && (
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}
          {!post.image && (
            <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-9xl opacity-20">
              {category.icon}
            </div>
          )}
        </div>
      </section>

      {/* Article Wrapper */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Main Article Content */}
          <article className="bg-white rounded-xl border-2 border-slate-200 shadow-lg p-12 md:p-16 relative">
            <header className="mb-12 pb-12 border-b-2 border-slate-100">
              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm font-mono text-slate-600">
                <span className="flex items-center gap-2">
                  📅 {formatDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span className="flex items-center gap-2">
                  ⏱️ {readingTime} minute read
                </span>
                <span className="flex items-center gap-2">
                  ✍️ {post.authorName || 'QAi Talks Team'}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint leading-tight mb-8">
                {post.title}
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed border-l-4 border-logic-cyan pl-6 py-2 bg-cyan-50/30 rounded-r-lg">
                {post.description}
              </p>
            </header>

            {/* Article Content - HTML sanitized with DOMPurify for XSS protection */}
            <div
              id="content"
              className="prose prose-lg prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-deep-blueprint prose-headings:border-b prose-headings:border-deep-blueprint/10 prose-headings:pb-3 prose-headings:mt-12 prose-headings:mb-6
                prose-h2:text-3xl prose-h3:text-2xl
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-logic-cyan prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:decoration-2
                prose-pre:bg-deep-blueprint prose-pre:text-slate-200 prose-pre:border-l-4 prose-pre:border-logic-cyan prose-pre:rounded-lg prose-pre:p-6 prose-pre:font-mono prose-pre:shadow-lg prose-pre:overflow-x-auto
                prose-code:font-mono prose-code:text-logic-cyan prose-code:bg-cyan-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-semibold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                prose-li:text-slate-700
                prose-blockquote:border-l-4 prose-blockquote:border-logic-cyan prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-cyan-50/30 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                prose-strong:text-deep-blueprint prose-strong:font-bold
                prose-img:rounded-lg prose-img:shadow-lg prose-img:border-2 prose-img:border-slate-200"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Share & Navigation Section */}
            <div className="mt-16 pt-12 border-t-2 border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 font-mono font-semibold text-sm px-6 py-3 border-2 border-deep-blueprint rounded-lg hover:bg-deep-blueprint hover:text-white transition-all duration-300"
                >
                  <span>←</span> Back to Engineering Log
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 font-mono">Share:</span>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://qaitalks.com/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-slate-300 rounded hover:bg-blue-50 transition-colors" title="Share on Twitter">
                    𝕏
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://qaitalks.com/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-slate-300 rounded hover:bg-blue-50 transition-colors" title="Share on LinkedIn">
                    in
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Table of Contents & Author */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-lg">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-logic-cyan font-bold mb-6 pb-3 border-b-2 border-slate-200">
                    📖 On This Page
                  </h4>
                  <nav className="space-y-3">
                    {headings.map((heading, idx) => (
                      <a
                        key={idx}
                        href={`#${heading.id}`}
                        className={`block text-sm transition-all duration-200 hover:text-logic-cyan hover:pl-2 ${
                          heading.level === 2
                            ? 'font-semibold text-slate-800'
                            : 'pl-4 text-slate-600'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Reading Info Card */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-logic-cyan/30 p-6 shadow-sm">
                <h4 className="font-mono text-xs uppercase tracking-widest text-deep-blueprint font-bold mb-4">
                  📊 Article Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">Reading Time:</span>
                    <span className="font-bold text-deep-blueprint">{readingTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">Published:</span>
                    <span className="font-mono text-sm text-slate-600">{formatDate(post.publishedAt ?? post.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">Category:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${category.color}`}>
                      {category.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
