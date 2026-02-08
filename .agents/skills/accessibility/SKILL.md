# Accessibility Skill

## Overview
WCAG 2.1 Level AA compliance for inclusive web applications supporting screen readers and keyboard navigation.

## When to Use
- Building interactive components
- Creating forms and input fields
- Fixing accessibility issues or test failures
- Testing with screen readers or keyboard
- Improving inclusive user experience

## Key Files
- **Guide:** `ACCESSIBILITY.md` (in this directory)
- **Tests:** `e2e/` (includes accessibility tests)
- **Standards:** WCAG 2.1 Level AA

## Key Patterns
- **Color Contrast:** Minimum 4.5:1 for normal text
- **Keyboard Navigation:** All interactive elements must be reachable
- **ARIA Attributes:** Add `aria-label`, `aria-live`, `aria-hidden` where needed
- **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, `<section>` instead of `<div>`
- **Focus Management:** Visible focus indicators and logical tab order
- **Form Accessibility:** Labels linked to inputs, error messages associated

## Accessibility Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader tested with NVDA/VoiceOver
- [ ] Alt text on images
- [ ] Form fields have proper labels
- [ ] Focus indicators visible
- [ ] Semantic HTML used correctly

## Output
When generating accessible code:
1. Use semantic HTML elements
2. Add proper ARIA labels if needed
3. Ensure sufficient color contrast
4. Make all interactive elements keyboard accessible
5. Add descriptive alt text to images
6. Link form labels to inputs
7. Include focus management for complex components
