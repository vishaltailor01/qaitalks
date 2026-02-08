# QAi Talks Blueprint Landing Page v2 - Design Specification

## 1. Project Overview
**Project Name:** QAi Talks Blueprint Landing Page v2
**Design System Version:** SYS_V1.0 // BUILD_892
**Status:** LOCKED

## 2. Design Theme & Identity
The "Blueprint" aesthetic combines a rigid, technical foundation with a "Human Layer" of organic annotations.

### Color Palette
| Token | Hex | Role |
|-------|-----|------|
| **Base Surface** | `#F6F9FC` | Backgrounds, "Draft Paper" feel |
| **Deep Blueprint** | `#0A2540` | Primary Text, Headers, Strong Structural elements |
| **Logic Cyan** | `#00D4FF` | Accents, "Human Layer" annotations, Focus areas |
| **Warning Amber** | `#FFB800` | CTAs, Alerts, Actions |
| **Purple Accent** | `#6366F1` | Metadata, post headers, system status |

### Typography
- **Primary Font:** Inter (main body text and headings)
- **Code/Technical:** JetBrains Mono (code snippets and technical content)
- **Accent Font:** Indie Flower (hand-drawn annotations and labels)

### Visual Style
- **The Human Layer:** Use "Logic Cyan" (#00D4FF) for hand-drawn style annotations over the rigid grid structure.
- **Roundness:** "Round Four" (from project metadata).
- **Grid:** Rigid 8px/16px grid system.

## 3. Screen Inventory

### Core Pages
1.  **QAi Talks Blueprint Landing Page v1**
    - **Purpose:** Main marketing and navigation entry point.
    - **Key Elements:** Hero section, curriculum overview, "Human Layer" annotations.

2.  **Senior SDET Curriculum Blueprint**
    - **Purpose:** Detailed course structure.
    - **Key Elements:** Course modules, learning paths, technical details.

3.  **Mentor Architect Deep Dive**
    - **Purpose:** Instructor profiles and credibility.
    - **Key Elements:** Bio, achievements, "architect" styling.

4.  **QAi Technical Blog Post Detail**
    - **Purpose:** Content consumption.
    - **Key Elements:** Article layout, code blocks, related posts.

5.  **QAi Blueprint Technical Style Guide**
    - **Purpose:** Source of truth for visual primitives. Reference this guide for all UI implementation details.

## 4. Component Architecture (Inferred)

### Layout Components
- **GlobalNavigation**: Sticky/Fixed header containing brand and main links.
- **Footer**: Standard footer with links and copyright.

### UI Components
- **BlueprintCard**: Card with `#F6F9FC` background and rigid borders.
- **AnnotationHighlight**: Text or box styled with `#00D4FF` to mimic hand-drawn notes.
- **ActionButton**: Primary CTA using `#FFB800`.
- **CodeBlock**: Styled code containers for technical content.
- **AccordionCard**: Collapsible modules with removed radial glows and neutral hover shadows for a professional look.
- **AnnotationNode**: Shifted to allow "popping" out of containers (removed `overflow: hidden` restrictions).
