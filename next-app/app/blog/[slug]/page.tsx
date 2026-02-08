export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getPrisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import DOMPurify from "isomorphic-dompurify"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prisma = getPrisma()
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Article Wrapper */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-[1fr_280px] gap-16">
          {/* Main Article Content */}
          <article className="bg-white rounded border border-deep-blueprint/10 shadow-lg p-16 relative">
            <span className="absolute right-8 top-8 font-hand text-warning-amber text-2xl font-bold rotate-[-3deg] animate-float drop-shadow-lg">
              Technical Guide
            </span>
            
            <header className="mb-12">
              <div className="font-mono text-sm text-purple-accent font-semibold mb-4">
                {formatDate(post.publishedAt ?? post.createdAt)} / {slug.toUpperCase().replace(/-/g, " ")} / V1.0.0
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-deep-blueprint leading-tight mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-logic-cyan pl-6">
                {post.description}
              </p>
            </header>

            {/* Article Content - HTML sanitized with DOMPurify for XSS protection */}
            <div
              id="content"
              className="prose prose-lg prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-deep-blueprint prose-headings:border-b prose-headings:border-deep-blueprint/10 prose-headings:pb-3 prose-headings:mt-12 prose-headings:mb-6
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-logic-cyan prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-pre:bg-deep-blueprint prose-pre:text-slate-200 prose-pre:border-l-4 prose-pre:border-logic-cyan prose-pre:rounded prose-pre:p-6 prose-pre:font-mono
                prose-code:font-mono prose-code:text-logic-cyan prose-code:bg-cyan-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-semibold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-slate-700 prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-logic-cyan prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
                prose-strong:text-deep-blueprint prose-strong:font-bold
                prose-img:rounded-lg prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Author Info */}
            {post.author && (
              <div className="mt-16 pt-8 border-t border-deep-blueprint/10">
                <div className="flex items-center gap-4">
                  {post.author.image && (
                    <Image
                      src={post.author.image}
                      alt={post.author.name || 'Author'}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-2 border-deep-blueprint"
                    />
                  )}
                  <div>
                    <div className="font-bold text-deep-blueprint text-lg">
                      {post.author.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-slate-600">
                      Article Author
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to Blog Link */}
            <div className="mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-['JetBrains_Mono'] font-semibold text-sm text-deep-blueprint hover:text-logic-cyan transition-colors"
              >
                <span>←</span> Back to Engineering Log
              </Link>
            </div>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <div className="bg-white rounded border border-deep-blueprint/10 p-6 shadow-sm">
                <h4 className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-logic-cyan font-bold mb-4">
                  On this page
                </h4>
                <nav className="space-y-2">
                  <a
                    href="#content"
                    className="block text-sm text-slate-600 hover:text-deep-blueprint hover:pl-2 transition-all duration-200"
                  >
                    Article Content
                  </a>
                </nav>
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
