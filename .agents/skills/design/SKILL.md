# Design Skill

## Overview
Visual design system including colors, typography, spacing, animations, and Tailwind CSS configuration.

## When to Use
- Styling components with consistent design tokens
- Creating responsive layouts
- Adding animations and transitions
- Maintaining visual consistency across pages
- Using the design system colors and typography

## Key Files
- **Guide:** `DESIGN.md` (in this directory)
- **Config:** `tailwind.config.ts`
- **Global Styles:** `app/globals.css`
- **Components:** `components/` (examples of styled components)

## Design Tokens

### Colors
- **Primary:** Blue (#2563eb)
- **Secondary:** Purple (#9333ea)
- **Accent:** Orange (#f59e0b)
- **Neutral:** Gray scale (50-950)
- **Success/Warning/Error:** Semantic colors
- **Dark Mode:** Support via Tailwind dark: prefix

### Typography
- **Font Family:** Inter (sans-serif)
- **Sizes:** 12px (xs) to 48px (4xl)
- **Line Heights:** Proper spacing for readability
- **Font Weights:** Regular (400), Medium (500), Bold (700)

### Spacing
- **8px Grid System:** 4, 8, 12, 16, 24, 32, 40, 48px
- **Padding/Margin:** Use Tailwind classes (p-4, m-8, etc.)

### Animations
- **Transitions:** Smooth easing for interactions
- **Durations:** 200ms (quick), 300ms (standard), 500ms (slow)

## Output
When generating styled code:
1. Use Tailwind utility classes only
2. Reference design system colors (primary, secondary, accent)
3. Follow 8px grid system for spacing
4. Use semantic color variables
5. Add responsive design with sm:, md:, lg: breakpoints
6. Include smooth transitions for interactions
7. Maintain consistent visual hierarchy
