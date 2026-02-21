# Component Specifications

Standardised interface elements for the QAiTalks platform. Strict adherence to the 8px baseline grid is mandatory for all implementations.

## High level
- System status: stable
- Visual spec reference date: 12 Oct 2023

## Layer 01 — Atomic Components
Atomic components are the smallest reusable building blocks. These should be token-driven and accessible by default.

### Action elements
- Purpose: primary and secondary click targets (buttons, icon buttons).
- Tokens: radius: 2px; primary bg: #FFB700; primary text: dark (ensure WCAG contrast); secondary border: 2px #A2A5AD; secondary bg: transparent.
- Usage:
  - Primary Action — filled, high-contrast, main CTA.
  - Secondary Action — outlined/ghost for less emphasis.
- Example:

```html
<button class="qa-btn qa-btn--primary">Primary Action</button>
<button class="qa-btn qa-btn--secondary">Secondary Action</button>
```

### Code snippets
- Provide copyable code snippets in the documentation for each atomic control.

### Data entry
- Purpose: inputs, selects, textareas, and compound controls.
- Tokens: border: 1px solid #E5E7EB (example); consistent vertical padding; rounded corners; clear focus ring.
- Accessibility: every control must have an associated label, appropriate ARIA attributes, and visible focus styles.

Example:

```html
<label for="username">User identification</label>
<input id="username" type="text" placeholder="Enter username…" />

<label for="region">Region selection</label>
<select id="region"><option>United Kingdom (UK)</option></select>
```

## Layer 02 — Molecules & Modules
Composed components that combine atoms to deliver distinct UI patterns.

- Navigation path (breadcrumbs): hierarchical path with separators; depth indicators are optional.
- Data container (cards/panels): header, metadata & summary area (uptime, latency, load) with consistent padding and subtle border/elevation.
- Metadata tags: small pill chips for IDs, doc tags, statuses (deployed, staging, etc.). Use token colours and ensure readable contrast.

Guidelines:
- Keep molecule composition simple: optimise for reusability and predictable layout across breakpoints.
- Use the 8px grid to size paddings, gaps, and element heights.

## Layer 03 — The Human Layer API
Developer-facing assets and micro-APIs to enable consistent integrations and designer handoffs.

- Provide an SVG icon pack (downloadable) and lightweight helper utilities.
- Publish design tokens (colors, spacing, radii, type-scale) as JSON/CSS variables for consumption by apps.

## Implementation notes
- Spacing: follow an 8px baseline grid; prefer multiples of 8px for spacing and sizing.
- Tokens: centralise colour, spacing, typography and motion tokens in a single source of truth.
- Accessibility: keyboard operability, focus states, semantic markup and ARIA where necessary.

---
_This document reflects the visual component-spec shown in the attached image: Action Elements, Data Entry, Molecules & Modules, and The Human Layer API (SVG pack)._