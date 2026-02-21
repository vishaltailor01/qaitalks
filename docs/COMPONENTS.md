# QAi Talks Component Documentation

**Last Updated:** February 18, 2026

This document provides technical definitions and usage guidelines for core UI components, based on the QAi Blueprint design specification.

---

## 1. Interactive Elements

### 1.1 Button: Initialize Process
- **Purpose:** Triggers a primary workflow or process.
- **Style:**
  - Height: 40px
  - Border Radius: 2px
  - Border: 1px solid #0A2540
  - Font: Inter, bold, 16px
  - Background: Paper White (#F0F0FC) by default
  - Text Color: Deep Navy (#0A2540)
  - Hover/Active: Electric Cyan (#00C4FF) border or background
- **Example:**
  ```tsx
  <button className="h-10 rounded border border-deep-navy font-bold text-deep-navy bg-paper-white px-6 hover:bg-electric-cyan focus:ring-2 focus:ring-electric-cyan">
    Initialize Process
  </button>
  ```

### 1.2 Button: View Documentation
- **Purpose:** Navigates to documentation or help resources.
- **Style:**
  - Same as above, but may use a secondary color or outline style.

---

## 2. Data Entry

### 2.1 System Parameter Field
- **Purpose:** Accepts technical configuration values.
- **Style:**
  - Font: JetBrains Mono, 16px
  - Border: 1px solid #0A2540
  - Border Radius: 2px
  - Background: Paper White (#F0F0FC)
  - Padding: 8px
- **Example:**
  ```tsx
  <input className="font-mono border border-deep-navy rounded px-2 py-1 bg-paper-white text-deep-navy" value="Configuration_V2" />
  ```

---

## 3. Annotation Logic

### 3.1 Human Layer Markup
- **Purpose:** Highlights manual review or special notes (e.g., "Needs Review").
- **Style:**
  - Tag: Signal Yellow (#FFB600), rounded, bold text
  - Placement: Overlays or breaks grid rigidity
- **Example:**
  ```tsx
  <span className="bg-signal-yellow text-deep-navy font-bold rounded px-2 py-1">Needs Review</span>
  ```

### 3.2 Padding Check
- **Purpose:** Visual indicator for spacing validation.
- **Style:**
  - Outline or circle, Electric Cyan (#00C4FF)

---

## 4. Base Units & Layout
- **Base unit:** 8px
- **Column gutter:** 24px
- **Corner radius:** 2px
- **Border weight:** 1px

---

## 5. Accessibility
- All interactive elements must have visible focus states.
- Sufficient color contrast (WCAG 2.1 AA).
- Use semantic HTML and ARIA attributes where needed.

---

For updates, refer to the main DESIGN_SYSTEM.md and Tailwind configuration.
