# Accessibility Reference

This document details accessibility conventions in AetherLearn.

---

## Focus Visibility

### Canonical Implementation

```css
focus:outline-none
focus-visible:ring-2 ring-ring ring-offset-2
```

### Applied To

All interactive elements:
- Buttons
- Inputs
- Links
- Chips
- Dropdowns

### Why focus-visible Instead of :focus

- `:focus-visible` only shows outline for keyboard navigation
- `:focus` would show outline for mouse clicks too
- Respects user preference for visual feedback

### Implementation

```css
button:focus-visible {
  outline: none;
  ring-2 ring-ring ring-offset-2;
}

input:focus-visible {
  outline: none;
  ring-2 ring-ring ring-offset-2;
}
```

---

## Contrast

### Color Contrast Ratios

**Primary text on backgrounds:**
- Light theme: High contrast (WCAG AA compliant)
- Dark theme: High contrast (WCAG AA compliant)
- OKLCH color space ensures perceptual uniformity

**Secondary text:**
- Light theme: OKLCH with 0.573 lightness (WCAG AA)
- Dark theme: OKLCH with 0.712 lightness (WCAG AA)

### Guidelines

- **Never use low contrast for important text**
- **Always maintain WCAG AA contrast ratios**
- **Test with contrast checker if uncertain**
- **Consider color blindness when choosing colors**

---

## Touch Targets

### Minimum Sizes

**Buttons:**
- Minimum height: 44px on mobile

**Implementation:**
```css
@media (max-width: 768px) {
  button,
  a,
  input,
  select,
  textarea {
    min-height: 44px;
  }
}
```

**Links:**
- Minimum: 44px × 44px recommended
- Implementation: Adequate padding

**Cards:**
- No minimum height requirement
- Entire card is clickable
- Padding provides adequate touch area

### Guidelines

- **Ensure buttons are at least 44px tall on mobile**
- **Provide adequate padding for links**
- **Don't make touch targets too small**
- **Test on actual mobile devices**

---

## Keyboard Navigation

### Tab Order

**Logical tab order:**
1. Top navigation
2. Main content
3. Interactive elements
4. Footer

### Skip Links

**Not currently implemented**

**Could be added:**
```html
<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
```

### Keyboard Shortcuts

**Not extensively documented**
- Enter/Space for buttons
- Escape for modals (if implemented)

---

## Non-Color State Communication

### Principle

**Never rely on color alone** to communicate state.

### Implementation

**Hover state uses multiple indicators:**
- Background color change
- Border color change
- Text color change

**Example:**
```css
.chip:hover {
  background-color: var(--secondary);
  border-color: var(--foreground/40);
  color: var(--foreground);
}
```

**Focus state uses:**
- Ring outline
- Border color change
- No color-only focus indicator

---

## Text Readability

### Font Sizes

**Minimum body text:** 0.875rem (14px)

**Recommended minimum:** 1rem (16px)

**AetherLearn sizes:**
- Body text: 1rem (recommended)
- Small text: 0.875rem (minimum acceptable)
- Labels: 0.6875rem (11px) - uppercase

### Line Heights

**Body text:** 1.5
**Headings:** normal

### Font Families

**Display font:** Cormorant Garamond (for headings only)
**UI font:** Inter (for body text)

**Why Inter:**
- Excellent readability
- Optimized for screens
- Wide weight range

### Letter Spacing

**Uppercase text:** 0.14em (labels)
**Headings:** -0.01em (normal case)
**Negative letter-spacing:** Display headings

---

## Disabled States

### Not Currently Used

**Could be implemented as:**

```css
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Guidelines

- **Reduce opacity to 0.5**
- **Remove hover effects**
- **Show not-allowed cursor**
- **Maintain readable text**

---

## Error Communication

### Not Currently Used

**Could be implemented as:**

**Visual:**
- Destructive color (oklch(0.577 0.222 27.3))
- Error icon
- Error message below input

**Implementation:**
```css
.input-error {
  border-color: var(--destructive);
}

.error-message {
  color: var(--destructive);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
```

---

## Screen Reader Support

### ARIA Labels

**Not extensively used in current implementation**

**Could be added:**
```html
<button aria-label="Toggle theme between light and dark">
  <Sun />
</button>
```

**Role attributes:**
```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/subjects">Subjects</a></li>
  </ul>
</nav>
```

### Alt Text

**Images:**
- Not extensively used in current implementation

**If added:**
- Always provide descriptive alt text
- Use empty alt for decorative images

---

## Reduced Motion

### Current Status

**Not explicitly implemented**

**Should be added:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript support:**
```javascript
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  // Disable animations
}
```

---

## Accessibility Checklist

Before considering implementation complete:

- [ ] Focus-visible outline on all interactive elements
- [ ] Contrast ratios meet WCAG AA (4.5:1 for normal text)
- [ ] Touch targets at least 44px height on mobile
- [ ] Adequate padding for links
- [ ] States communicate without color alone
- [ ] Keyboard navigation works logically
- [ ] Reduced motion is respected (when implemented)
- [ ] Text is readable (font size, line height)
- [ ] Font families are legible
- [ ] Forms have labels (when implemented)
- [ ] Error states are clear (when implemented)
- [ ] Screen reader support (ARIA labels, roles)
