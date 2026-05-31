# Frontend Taste Skill - Ultra-Minimalist Apple Style

This file defines the visual styling rules and Design System constraints for all UI changes in the GearUp project.

## 🎛️ Design Configuration Dials

```json
{
  "DESIGN_VARIANCE": 2,
  "MOTION_INTENSITY": 2,
  "VISUAL_DENSITY": 3
}
```

* **DESIGN_VARIANCE (2/10):** Conservative, highly structured, symmetric, and clean. Emphasize alignment and clear visual hierarchy.
* **MOTION_INTENSITY (2/10):** Minimalist motion. No complex physics or heavy scaling. Use only subtle transitions on opacity or background color.
* **VISUAL_DENSITY (3/10):** Spacious, airy, gallery-like layout. Prioritize ample whitespace to give design elements room to breathe.

---

## 🎨 Aesthetics & Styling Constraints

### 1. Typography & Hierarchy
* Headings: Large, bold, using `var(--font-primary)`.
* Body text: Clean, legible, utilizing `var(--font-secondary)`.
* No icons embedded within text blocks or action labels. Text must remain clean and readable.

### 2. Colors & Brand Gradient
* Brand Name & Heading Gradients: Apply a premium linear gradient for brand terms and key hero titles (e.g., from Ocean Blue `var(--color-primary)` to a secondary accent).
* Backgrounds: Pure white, clean off-white, or flat light gray surfaces.
* Borders: Use thin, subtle borders (`1px solid var(--color-border)`) to delineate sections.

### 3. Shadows & Borders
* **NO Shadows:** Disable all decorative shadows (`box-shadow: none` or default border-only look). No elevation card styles.
* **Rounded Corners:** Modern, clean bo-góc (`border-radius: var(--radius-md)` or `8px` to `12px` max) without excessive rounded shapes.

### 4. Interactive Hover States
* Hover effects must be subtle and clean. Use simple changes like `opacity: 0.8` or transitioning to a slightly different flat background. No scaling, rotating, or heavy bounce animations.

---

## 🔍 Pre-flight Audit Checklist

Before submitting code, verify:
1. [ ] **No shadows:** Are all elements flat, utilizing subtle borders for separation instead of box shadows?
2. [ ] **Subtle hover:** Do all hover transitions use clean opacity/color changes with no translation or scaling?
3. [ ] **No icons in text:** Are all action labels and text blocks free of inline icons?
4. [ ] **Brand gradients:** Are brand keywords or primary headers styled with the premium linear gradient?
