# QAi Talks - Accessibility Guide

Comprehensive guide to building accessible web applications following WCAG 2.1 standards.

---

## Accessibility Principles

### WCAG 2.1 Standards

Four core principles for accessible design (POUR):

1. **Perceivable** — Users can see/hear content
2. **Operable** — Users can navigate and interact
3. **Understandable** — Content is clear and predictable
4. **Robust** — Works with assistive technologies

---

## Perceivable

### 1. Alternative Text for Images

Every image needs descriptive alt text for screen readers:

```tsx
// ✅ GOOD: Descriptive alt text
<img
  src="/diagram.png"
  alt="Test automation pyramid showing unit tests at base, integration tests in middle, and E2E tests at top"
/>

<Image
  src="/playwright.png"
  alt="Playwright browser automation framework logo"
  width={200}
  height={100}
/>

// ❌ BAD: Missing alt text
<img src="/diagram.png" />

// ❌ BAD: Generic alt text
<img src="/diagram.png" alt="diagram" />

// Decorative images use empty alt
<img src="/decorative-line.svg" alt="" aria-hidden="true" />
```

### 2. Color Contrast

Ensure sufficient color contrast for readability:

```tsx
// WCAG contrast requirements:
// AA: 4.5:1 for normal text, 3:1 for large text
// AAA: 7:1 for normal text, 4.5:1 for large text

// ✅ GOOD: High contrast
<div style={{ color: '#001F44', backgroundColor: '#FFFFFF' }}>
  {/* Deep blue on white = 12.6:1 contrast ratio */}
  This text is easily readable
</div>

// ❌ BAD: Low contrast
<div style={{ color: '#999999', backgroundColor: '#F5F5F5' }}>
  {/* Gray on light gray = 1.5:1 contrast ratio - FAILS */}
  This text is hard to read
</div>

// Use Tailwind with accessible color system
export function TextHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-slate-900 bg-amber-100">
      {/* text-slate-900 (#1E293B) on bg-amber-100 (#FEF3C7) = 11:1 contrast */}
      {children}
    </span>
  );
}

// Tool: Check contrast at WebAIM
// https://webaim.org/resources/contrastchecker/
```

### 3. Text Alternatives

Provide text for non-text content:

```tsx
// ✅ GOOD: Caption or transcript provided
<figure>
  <video controls width="640" height="360">
    <source src="tutorial.mp4" type="video/mp4" />
    <track kind="captions" src="captions.vtt" srclang="en" label="English" />
    Your browser does not support the video tag.
  </video>
  <figcaption>Playwright E2E testing tutorial</figcaption>
</figure>

// For icons with meaning, use aria-label
<button aria-label="Search">
  <SearchIcon size={24} />
</button>

// For charts/graphs, include data table
<figure>
  <canvas id="testChart" />
  <figcaption>
    <table>
      <tr><th>Month</th><th>Pass Rate</th></tr>
      <tr><td>Jan</td><td>95%</td></tr>
      <tr><td>Feb</td><td>97%</td></tr>
    </table>
  </figcaption>
</figure>
```

### 4. Font and Text Readability

```tsx
// Use readable fonts and sizes
export const metadata: Metadata = {
  // Already set in DESIGN.md
  // Using Inter for body, JetBrains Mono for code
};

// ✅ GOOD: Readable text
export function ArticleText({ children }: { children: string }) {
  return (
    <p className="font-sans text-base leading-relaxed">
      {/* 
        - font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
        - font-size: 16px (base)
        - line-height: 1.5+ for readability
      */}
      {children}
    </p>
  );
}

// ✅ GOOD: Avoid text-only as images
<h2>QA Testing Guide</h2>
{/* Not <img src="/qaguide.png" alt="" /> */}

// Use line spacing for readability
<div className="space-y-4">
  {/* Adds mt-4 margin between children for visual separation */}
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</div>

// Use max-width for readability
<article className="max-w-2xl">
  {/* Limits line length to ~80 characters for readability */}
</article>
```

---

## Operable

### 1. Keyboard Navigation

All functionality must be accessible via keyboard:

```tsx
// ✅ GOOD: Interactive elements are keyboard accessible
<button onClick={handleClick}>
  Click me
</button>

<a href="/about">About</a>

<input type="text" />

// ❌ BAD: Non-semantic elements aren't keyboard accessible
<div onClick={handleClick}>
  Click me {/* Can't be tabbed to or activated with Enter */}
</div>

// If you must use div, add keyboard support
<div
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  role="button"
  tabIndex={0}
>
  Click me
</div>

// Modal dialogs need focus management
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modal Ref.current?.focus();
    }
  }, [isOpen]);

  return (
    isOpen && (
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <h2 id="modal-title">Modal Title</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    )
  );
}
```

### 2. Skip Links

Allow keyboard users to skip repeated content:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip to main content link */}
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>

        <Navbar />

        <main id="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

// Tailwind sr-only class
@layer utilities {
  .sr-only {
    @apply absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-path-inset pointer-events-none border-0;
  }

  .focus:not-sr-only:focus {
    @apply static w-auto h-auto p-0 m-0 overflow-visible clip-path-auto pointer-events-auto;
  }
}
```

### 3. Focus Management

Ensure focus is visible and managed:

```tsx
// ✅ GOOD: Visible focus indicator
<style>
  {`
    button:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    input:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }
  `}
</style>

// ❌ BAD: Removing focus outline
<style>
  {`
    button:focus {
      outline: none; /* DON'T DO THIS */
    }
  `}
</style>

// Better approach: Custom focus styling
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded bg-blue-500 text-white focus:outline-blue-600 focus:outline-2 focus:outline-offset-2"
    >
      {children}
    </button>
  );
}

// Focus trap in modals
export function ModalWithFocusTrap({ children, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
      // Trap focus within modal
      if (e.key === 'Tab') {
        const focusableElements = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

---

## Understandable

### 1. Semantic HTML

Use correct semantics for better screen reader navigation:

```tsx
// ✅ GOOD: Semantic structure
export default function Blog() {
  return (
    <main>
      <h1>Blog</h1>
      <section>
        <h2>Featured Posts</h2>
        <article>
          <h3>Post Title</h3>
          <p>Post excerpt</p>
        </article>
      </section>
      <section>
        <h2>Recent Posts</h2>
        <ul>
          <li><a href="/post1">Post 1</a></li>
          <li><a href="/post2">Post 2</a></li>
        </ul>
      </section>
      <aside>
        <h2>Sidebar</h2>
        {/* Related content */}
      </aside>
    </main>
  );
}

// ❌ BAD: No semantic structure
<div className="container">
  <div className="text-big">Blog</div>
  <div>
    <div className="text-medium">Featured Posts</div>
    <div>Post Title</div>
  </div>
</div>
```

### 2. Form Accessibility

Proper form structure and labeling:

```tsx
// ✅ GOOD: Proper label association
<form>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    name="email"
    required
    aria-required="true"
  />

  <label htmlFor="message">Message</label>
  <textarea
    id="message"
    name="message"
    required
    aria-required="true"
  />

  <button type="submit">Send</button>
</form>

// ✅ GOOD: Error handling
<form>
  <div>
    <label htmlFor="username">Username</label>
    <input
      id="username"
      type="text"
      aria-invalid={hasError}
      aria-describedby={hasError ? 'error-username' : undefined}
    />
    {hasError && (
      <span id="error-username" role="alert">
        Username is required
      </span>
    )}
  </div>
</form>

// ❌ BAD: Unlabeled input
<input type="email" placeholder="your@email.com" />

// ✅ GOOD: Grouping related inputs
<fieldset>
  <legend>Select your favorite QA framework</legend>
  <div>
    <input id="playwright" type="radio" name="framework" value="playwright" />
    <label htmlFor="playwright">Playwright</label>
  </div>
  <div>
    <input id="cypress" type="radio" name="framework" value="cypress" />
    <label htmlFor="cypress">Cypress</label>
  </div>
</fieldset>
```

### 3. Clear Language

Write clear, simple content:

```tsx
// ✅ GOOD: Clear, concise
<p>
  Playwright is a framework for automated browser testing. It supports Chrome,
  Firefox, and Safari.
</p>

// ❌ BAD: Jargon-heavy
<p>
  Playwright facilitates automated UI verification across multiple browser
  engines via its polymorphic API abstraction.
</p>

// Use headings to structure content
<article>
  <h1>Getting Started with Playwright</h1>
  <section>
    <h2>Installation</h2>
    {/* Step-by-step instructions */}
  </section>
  <section>
    <h2>First Test</h2>
    {/* Simple example */}
  </section>
</article>

// Abbreviations and acronyms
<p>
  <abbr title="Test Automation">TA</abbr> helps catch bugs early.
</p>
```

---

## Robust

### 1. ARIA (Accessible Rich Internet Applications)

Supplement semantic HTML with ARIA when needed:

```tsx
// ✅ GOOD: ARIA when semantic HTML not available
<div
  role="button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }}
  tabIndex={0}
  aria-pressed={isPressed}
>
  Toggle Feature
</div>

// ARIA labels for icon buttons
<button aria-label="Close menu">
  <CloseIcon />
</button>

// ARIA live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {/* Updated when tests finish */}
  Tests completed: {testCount} passed, {failCount} failed
</div>

// ARIA hidden for decorative elements
<span aria-hidden="true">→</span>

// ARIA descriptions
<input
  type="password"
  aria-describedby="pwd-hint"
/>
<span id="pwd-hint">
  At least 8 characters including uppercase and number
</span>
```

### 2. Validation Message Content

```tsx
// ✅ GOOD: Clear validation messages
<form>
  <input
    type="email"
    id="email"
    aria-describedby="email-error"
  />
  {error && (
    <span id="email-error" role="alert" className="text-red-600">
      Please enter a valid email address (e.g., user@example.com)
    </span>
  )}
</form>

// ❌ BAD: Vague error messages
<span className="text-red-600">Invalid input</span>
```

### 3. Screen Reader Testing

```tsx
// Test with actual screen readers
// macOS: VoiceOver (built-in, Cmd+F5)
// Windows: NVDA (free), JAWS (paid)
// iOS: VoiceOver (Settings > Accessibility)
// Android: TalkBack (Settings > Accessibility)

// Common screen reader issues to check:
// 1. Images have descriptive alt text
// 2. Form labels associated with inputs
// 3. Heading hierarchy is logical
// 4. Links have descriptive text
// 5. Dynamic content announced
// 6. Focus indicators visible
// 7. Color not only indicator of meaning
```

---

## Testing for Accessibility

### 1. Automated Testing Tools

```bash
# Axe DevTools for Chrome/Firefox
# Tests 80+ accessibility rules

# Install next/image
npm install axe-core

# Test in Jest
import { configureAxe } from 'jest-axe';
import { render } from '@testing-library/react';

configureAxe({
  rules: {
    // Disable specific rules if needed
    'color-contrast': { enabled: false },
  },
});

test('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Lighthouse Accessibility Audit

```bash
# Run Lighthouse from Chrome DevTools
# Or command line:
npm install -g lighthouse
lighthouse https://qaitalks.com --view
```

### 3. Manual Testing Checklist

```typescript
const a11yChecklist = {
  keyboard: [
    'Tab through entire page',
    'All interactive elements are keyboard accessible',
    'Focus order is logical',
    'Focus indicators are visible',
  ],
  screenReader: [
    'Page structure is logical',
    'Images have alt text',
    'Form labels are associated',
    'Links have descriptive text',
    'Dynamic content is announced',
  ],
  visual: [
    'Text has sufficient contrast (4.5:1)',
    'Text is resizable (Ctrl/Cmd + Plus)',
    'No content hidden on small screens',
    'Color not only indicator',
  ],
  cognitive: [
    'Content is clear and concise',
    'Instructions are easy to follow',
    'Error messages are helpful',
    'Navigation is consistent',
  ],
};
```

---

## Accessibility Resources

### Tools
- **Axe** - Automated accessibility testing
- **WAVE** - Browser extension for accessibility checking
- **Lighthouse** - Built-in Chrome DevTools audit
- **NVDA** - Free screen reader for Windows
- **PA11y** - Automated command-line testing
- **WebAIM** - Contrast checker and resources

### Sites
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11ycasts by Google Chrome](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9Xc-RgEzwLvePng7V)
- [Next.js Accessibility](https://nextjs.org/learn/seo/web-performance/accessibility)

---

## Accessibility Checklist

Before publishing:

- [ ] All images have descriptive alt text
- [ ] Color contrast meets WCAG AA standard (4.5:1)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Form labels properly associated
- [ ] Heading hierarchy is correct
- [ ] No content relies solely on color
- [ ] Videos have captions
- [ ] Error messages are clear
- [ ] Page works with screen reader
- [ ] Tested with keyboard only
- [ ] Mobile accessibility tested
- [ ] Text is resizable
- [ ] Avoid flashing/blinking content

---

**Last Updated:** February 8, 2026
**See Also:** [DEVELOPMENT.md](DEVELOPMENT.md), [TESTING.md](TESTING.md)
