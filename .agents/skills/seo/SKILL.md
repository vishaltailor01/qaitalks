# SEO Skill

## Overview
Search engine optimization for ranking in search results and improving Core Web Vitals.

## When to Use
- Creating new pages or blog posts
- Optimizing page speed and performance
- Improving Core Web Vitals scores
- Adding meta tags and structured data
- Implementing internal linking strategy

## Key Files
- **Guide:** `SEO.md` (in this directory)
- **Metadata:** Next.js metadata in `layout.tsx` and page components
- **Performance:** Lighthouse audits via Chrome DevTools

## Key Patterns
- **Meta Tags:** Title (50-60 chars), description (150-160 chars)
- **Open Graph:** og:title, og:description, og:image for social sharing
- **Heading Hierarchy:** H1 once per page, proper H2/H3 nesting
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Structured Data:** JSON-LD schema for articles, recipes, etc.
- **Image Optimization:** Next.js `<Image>` component with lazy loading
- **Internal Linking:** Links between related pages

## SEO Checklist
- [ ] Page has unique H1
- [ ] Meta description added (under 160 chars)
- [ ] Open Graph tags included
- [ ] Images optimized and have alt text
- [ ] Lighthouse score ≥ 90
- [ ] Mobile responsive
- [ ] Page speed < 3 seconds
- [ ] Internal links to related content

## Output
When generating SEO code:
1. Add proper Next.js metadata to pages
2. Use semantic HTML (H1, `<main>`, `<article>`)
3. Optimize images with `<Image>` component
4. Add descriptive alt text to images
5. Include Open Graph meta tags
6. Add structured data (JSON-LD) if appropriate
7. Internal link to related pages
