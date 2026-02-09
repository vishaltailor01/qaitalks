# QAi Talks - Debug Report

**Date:** February 6, 2026  
**Status:** ✅ Cleanup Complete

---

## 1. Issues Found & Fixed

### ✅ FIXED: Duplicate Skill Directories
**Problem:** Four identical copies of the `stitch-loop` skill in `.agents/`, `.claude/`, `.codex/`, `.opencode/`  
**Action:** Removed `.claude/`, `.codex/`, `.opencode/` directories  
**Result:** Single source of truth in `.agents/skills/stitch-loop/`  
**Benefit:** Reduced clutter, simplified navigation, prevents out-of-sync skill updates  

### ✅ FIXED: Unused Config File
**Problem:** `init.json` was a template/test MCP initialization request (not used by the project)  
**Action:** Deleted `init.json`  
**Result:** Cleaner root directory  

### ✅ FIXED: Empty Queue Directory
**Problem:** `queue/` folder was empty (reserved for Stitch output staging)  
**Action:** Left in place for future use; it's intentionally part of the stitch-loop workflow  

---

## 2. Broken/Placeholder Links Identified in HTML

### High Priority (Core Navigation)
All pages have **placeholder social links** at the bottom. Currently set to `href="#"`:
- GitHub (GH)
- LinkedIn (LI)
- X (Twitter)

**Recommendation:** Either:
1. Add actual URLs (e.g., `https://github.com/qai-talks`)
2. Remove the section entirely if not needed yet

### Medium Priority (Footer Links)
Multiple pages link to non-existent routes:
- **Careers** → `href="#"` (no careers.html page)
- **Contact** → `href="#"` (no contact.html page)
- **Partners** → `href="#"` (no partners.html page)
- **Tuition & FAQ** → `href="#"` (no tuition.html page)

**Recommendation:** Create these pages or replace with real URLs, or remove placeholder links

### Low Priority (Internal Links)
All working pages:
- ✅ `index.html` → curriculum, about, blog (all exist)
- ✅ `curriculum.html` → about, blog, index (all exist)
- ✅ `blog.html` → index, curriculum, about, blog/* (all exist)
- ✅ `about.html` → index, curriculum, blog (all exist)
- ✅ Blog post files → correct relative paths (../)

---

## 3. Code Quality Checks

### JavaScript
- ✅ Minimal JS (only `toggleModule()` in curriculum.html for accordion)
- ✅ No errors detected
- ✅ Vanilla implementation (no dependencies)

### CSS
- ✅ All inline (no external CSS files)
- ✅ CSS Custom Properties (--obsidian-navy, --ai-amber, etc.) properly defined
- ✅ Responsive design patterns (no obvious issues)

### HTML
- ✅ Semantic HTML5 (proper use of `<header>`, `<nav>`, `<section>`, `<footer>`, `<article>`)
- ✅ Meta tags present (viewport, description, charset)
- ✅ Accessibility features (alt text on images, proper heading hierarchy)
- ✅ Google Fonts preconnected for performance

### Assets
- ✅ SVG assets (logo, favicon) in `site/public/branding/` - verified paths are correct

---

## 4. Next Steps

### Before Next Major Release
1. **Update placeholder social links** → Add real URLs or remove
2. **Add missing pages** → Careers, Contact, Partners, Tuition & FAQ (or update links)
3. **Run Lighthouse audit** → Verify performance/accessibility/SEO (target: 90+ on all metrics)
4. **Test on mobile** → Ensure responsive design works on all breakpoints

### Optional Optimizations
- Minify CSS/JS (currently inline, so minimal benefit)
- Add sitemap.xml
- Add robots.txt
- Implement analytics (Google Analytics or Vercel Analytics)
- Add 404 error page

---

## 5. Project Structure (After Cleanup)

```
QaiTAlk/
├── .agents/
│   └── skills/stitch-loop/           # Single source of truth for Stitch workflow
├── site/
│   └── public/                        # Static HTML pages
│       ├── index.html                 # ✅ Live
│       ├── about.html                 # ✅ Live
│       ├── curriculum.html            # ✅ Live
│       ├── blog.html                  # ✅ Live
│       ├── blog/
│       │   ├── pom-is-dead.html       # ✅ Live
│       │   ├── contract-testing.html  # ✅ Live
│       │   └── scaling-playwright.html # ✅ Live
│       └── branding/                  # SVG assets
├── queue/                             # Staging area (ready for Stitch output)
├── DESIGN.md                          # Visual design system
├── SITE.md                            # Project vision & roadmap
├── SKILLS.md                          # Development best practices
├── next-prompt.md                     # Stitch baton (next page to generate)
├── stitch.json                        # Stitch project ID
└── README.md                          # (Add if needed)

```

---

## 6. Files Removed

- ~~.claude/~~ (duplicate)
- ~~.codex/~~ (duplicate)
- ~~.opencode/~~ (duplicate)
- ~~init.json~~ (unused test config)

---

**Cleanup completed successfully. Project is ready for:** full-stack migration, new Stitch page generation, or deployment.
