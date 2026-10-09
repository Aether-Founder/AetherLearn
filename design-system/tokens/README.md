# Token Schema

This document explains the structure of the machine-readable `tokens.json` file for the AetherLearn design system.

---

## Schema Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://aetherlearn.design-system/tokens.json",
  "title": "AetherLearn Design Tokens",
  "description": "Machine-readable design tokens for the AetherLearn design system.",
  "version": "1.0.0",
  "tokens": {
    "color": { ... },
    "typography": { ... },
    "spacing": { ... },
    "radius": { ... },
    "border": { ... },
    "shadow": { ... },
    "motion": { ... },
    "breakpoint": { ... },
    "zIndex": { ... },
    "touchTarget": { ... }
  }
}
```

---

## Token Categories

### color

Surface and text colors for the AetherLearn interface, including theme support.

**Structure:**
- `radius` — Default border radius (0.75rem)
- `light` — Light theme colors
  - `background` — Primary background (oklch(0.965 0.011 259))
  - `foreground` — Primary text (oklch(0.176 0.031 265))
  - `card` — Card background
  - `cardForeground` — Card text
  - `popover` — Popover background
  - `popoverForeground` — Popover text
  - `primary` — Primary action color
  - `primaryForeground` — Primary action text
  - `secondary` — Secondary surface
  - `secondaryForeground` — Secondary text
  - `muted` — Muted surface
  - `mutedForeground` — Muted text
  - `accent` — Accent surface
  - `accentForeground` — Accent text
  - `destructive` — Destructive action
  - `destructiveForeground` — Destructive text
  - `success` — Success state
  - `warning` — Warning state
  - `streak` — Streak indicator
  - `border` — Border color
  - `input` — Input border
  - `ring` — Focus ring
- `dark` — Dark theme colors (same structure as light)

### typography

Font families, sizes, weights, and spacing.

**Structure:**
- `fontFamily.display` — Cormorant Garamond
- `fontFamily.ui` — Inter
- `fontSize.display.h1` — H1 display size (2rem)
- `fontSize.display.h2` — H2 display size (1.5rem)
- `fontSize.display.h3` — H3 display size (1.25rem)
- `fontSize.stat.value` — Stat value size (1.875rem)
- `fontSize.stat.label` — Stat label size (0.6875rem)
- `fontSize.chip` — Chip text size (0.8125rem)
- `fontSize.body` — Body text (1rem)
- `fontSize.small` — Small text (0.875rem)
- `fontSize.button` — Button text (0.875rem)
- `fontSize.input` — Input text (0.875rem)
- `fontWeight.regular` — 400
- `fontWeight.medium` — 500
- `fontWeight.semibold` — 600
- `fontWeight.bold` — 700
- `lineHeight.body` — Body line height (1.5)
- `lineHeight.heading` — Heading line height (normal)
- `lineHeight.none` — No leading (1)
- `letterSpacing.heading` — Heading letter spacing (-0.01em)
- `letterSpacing.uppercase` — Uppercase letter spacing (0.14em)
- `letterSpacing.displayHeading` — Display heading (-0.025em)

### spacing

Spacing scale and layout spacing.

**Structure:**
- `scale` — Tailwind spacing scale (0.25rem to 6rem)
- `cardPadding.standard` — Standard card padding (1rem)
- `cardPadding.large` — Large card padding (1.5rem)
- `gridGap` — Grid gap (0.75rem)
- `sectionMargin` — Section margin (2.5rem)
- `contentMargin` — Content margin (0.75rem)

### radius

Border radius values.

**Structure:**
- `small` — Small rounded (0.375rem)
- `medium` — Medium rounded (0.5rem)
- `large` — Large rounded (0.75rem)
- `pill` — Pill shape (999px)

### border

Border properties.

**Structure:**
- `width` — Border width (1px)
- `color.light` — Light theme border
- `color.dark` — Dark theme border

### shadow

Shadow effects.

**Structure:**
- `dropdown` — Dropdown shadow (shadow-xl)

### motion

Animation durations and easing.

**Structure:**
- `duration.hover` — Hover transition (150-200ms)
- `duration.dropdown` — Dropdown fade (200ms)
- `duration.success` — Success animation (1.2s)
- `duration.shimmer` — Skeleton shimmer (1.25s)
- `duration.reflection` — Reflection animation (2.4s)
- `easing.hover` — Hover easing (ease-in-out)
- `easing.dropdown` — Dropdown easing (ease-in-out)
- `easing.confetti` — Confetti easing (ease-in)
- `easing.reflection` — Reflection easing (ease-in-out)

### breakpoint

Responsive breakpoints (Tailwind default).

**Structure:**
- `sm` — Small tablets (640px)
- `md` — Tablets (768px)
- `lg` — Desktop (1024px)
- `xl` — Large desktop (1280px)

### zIndex

Z-index layering.

**Structure:**
- `dropdown` — Dropdown layer (20)
- `sidebar` — Sidebar layer (40)
- `modal` — Modal layer (50)
- `loader` — Initial loader (9999)

### touchTarget

Minimum touch target for mobile.

**Structure:**
- `minimumHeight` — Minimum height (44px)

---

## Using the Tokens

The tokens correspond exactly to the canonical rules documented in `DESIGN.md`. Do not use these tokens independently of the canonical documentation.

When implementing AetherLearn visuals:
1. Read the relevant section of `DESIGN.md`
2. Reference the corresponding token value in `tokens.json`
3. Use the exact value
4. Do not modify the token without updating `DESIGN.md`

---

## Theme Support

AetherLearn supports light, dark, and custom themes. The token file includes separate `light` and `dark` color definitions. Custom theme values are set dynamically via JavaScript and are not included in the static token file.

---

## Versioning

The token file version matches the design-system version. When tokens change, update both `tokens.json` and `DESIGN.md`, and increment the version accordingly.
