# QAi Talks Design System — Updated

**Last Updated:** February 18, 2026

## Design Principles
- Drafting-table aesthetic: precise, engineered, and legible.
- Consistency over ornament: use tokens and the 8px grid for predictable layout.
- Accessibility-first: semantic markup, keyboard navigation, and sufficient contrast.

## Core Tokens
- Base unit: 8px (all spacing and sizes follow multiples of 8px)
- Corner radius: 2px
- Border weight: 1px

### Color tokens
- `--color-bg`: #F0F0FC (Paper White)
- `--color-ink`: #0A2540 (Deep Navy)
- `--color-accent`: #00C4FF (Electric Cyan)
- `--color-main`: #FFB600 / #FFB700 (Signal Yellow)

### Type tokens
- Primary: Inter (Headings, Body, Labels)
- Mono: JetBrains Mono (code, technical values)
- Recommended scale: 16px base for body, 20–28px for headings (tokenised)

## Component rules
- Spacing & sizing must follow the 8px grid.
- Borders: use tokenised border color and 1px weight by default.
- Buttons: 40px height recommended for primary actions; 2px radius; token-driven colours.
- Inputs: consistent padding, visible focus ring, labelled for accessibility.

## Layout & Modules
- Column gutter: 24px
- Use cards/panels for data containers with clear header and metadata regions.
- Breadcrumb/navigation path: shallow, tokenised separators and optional chips for current context.

## Human Layer
- Provide a human-facing markup style (tags, annotations) for editorial notes and review workflows.
- Provide downloadable SVG icon pack for consistent assets.

## Tokens export
- Publish tokens as a JSON and CSS variables file in the design repo for programmatic consumption.

---
If you'd like, I can:
- Replace the original `docs/COMPONENTS.md` and `docs/DESIGN_SYSTEM.md` with these updated versions.
- Or create a PR that updates them in-place.

Tell me which option you prefer and I will proceed.
