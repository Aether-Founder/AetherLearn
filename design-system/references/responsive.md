# Responsive Design Reference

This document details the actual responsive behavior of AetherLearn.

---

## Breakpoints

### Canonical Values (Tailwind Default)

|| Breakpoint | Pixel Value | Usage |
||------------|-------------|-------|
|| sm | 640px | Small tablets |
|| md | 768px | Tablets |
|| lg | 1024px | Desktop |
|| xl | 1280px | Large desktop |

### Usage Rules

- Use Tailwind's default breakpoints
- Don't introduce new breakpoints without reason
- Use these exact values for consistency
- Test at each breakpoint

---

## Desktop (Above 1024px)

### Layout

**Homepage:**
- Full grid layout
- Auto-fit with minmax(14rem, 1fr)
- Sidebars visible
- Desktop navigation

**Content pages:**
- Two-column layout where applicable
- Sidebars visible
- Full content width

**Navigation:**
- Top navigation bar
- Horizontal navigation links
- Dropdowns with hover

### Typography

**Full heading sizes:**
- Use Tailwind text-size utilities
- No scaling on desktop

**Body text:**
- Full size (text-base)

### Components

**Cards:**
- Full width with descriptions
- All spacing full value
- Grid layout

**Buttons:**
- Standard padding
- Inline with other elements

**Inputs:**
- Standard padding
- h-9 height

---

## Tablet (768px - 1024px)

### Layout

**Homepage:**
- Adjusted grid
- Sidebars may collapse
- Responsive navigation

**Content pages:**
- Single column or adjusted two-column
- Sidebars may collapse to bottom

**Navigation:**
- Same as desktop or mobile menu
- Depends on implementation

### Typography

**Full heading sizes:**
- No scaling on tablet
- Use Tailwind utilities

**Body text:**
- Full size

### Components

**Cards:**
- All spacing full value
- May adjust grid columns

**Buttons:**
- Standard padding

**Inputs:**
- Standard padding

---

## Mobile (Below 768px)

### Layout

**Homepage:**
- Single column
- Bottom navigation (if used)
- Mobile menu
- Sidebars hidden or stacked

**Content pages:**
- Single column
- Sidebars hidden or stacked
- Full width content

**Navigation:**
- Mobile menu (hamburger)
- Bottom navigation (if used)
- Horizontal scroll for top nav

### Typography

**Full heading sizes:**
- No scaling on mobile
- Use Tailwind utilities

**Body text:**
- Full size

### Components

**Cards:**
- Full width on mobile
- Stacked layout

**Buttons:**
- Full width on mobile (if needed)
- min-h-44px for touch targets

**Inputs:**
- Full width on mobile
- h-9 height

**Panels:**
- Full width on mobile

---

## Specific Responsive Rules

### Touch Targets

**Minimum height: 44px**

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

### Safe Areas

**For notched phones:**

**Implementation:**
```css
@supports (padding: max(0px)) {
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }
}
```

### Visibility

**Hide on mobile:**
```css
lg:hidden /* Hidden on mobile, visible on desktop */
```

**Show on mobile only:**
```css
lg:block /* Visible on desktop, can use lg:hidden for mobile-only */
```

### Grid Columns

**Desktop:**
```css
grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
```

**Mobile:**
```css
grid-template-columns: 1fr;
```

---

## Responsive Transformation Summary

|| Element | Desktop | Tablet | Mobile |
||---------|---------|--------|--------|
|| Grid columns | Auto-fit | Adjusted | 1 col |
|| Navigation | Top nav | Top/nav | Mobile menu |
|| Sidebars | Visible | May collapse | Hidden/stacked |
|| Typography | Full size | Full size | Full size |
|| Buttons | Inline | Inline | Full width |
|| Inputs | Auto width | Auto width | Full width |
|| Touch targets | N/A | N/A | min-h-44px |

---

## Responsive Implementation Guidelines

### When Implementing Responsive Behavior

1. **Use Tailwind breakpoints**
   - sm: 640px
   - md: 768px
   - lg: 1024px
   - xl: 1280px

2. **Follow documented transformations**
   - Grid: auto-fit → adjusted → 1 column
   - Sidebars: visible → collapse → hidden
   - Navigation: top → top → mobile menu

3. **Ensure touch targets**
   - Minimum 44px height on mobile
   - Adequate padding for links
   - Adequate spacing

4. **Test on actual devices**
   - Mobile phone
   - Tablet
   - Desktop
   - Large desktop

### Mobile-First vs Desktop-First

**AetherLearn uses Tailwind's responsive utilities**
- Can be mobile-first or desktop-first
- Use lg: prefixes for desktop-specific styles
- Use mobile utilities for mobile-specific styles

### Responsive Testing Checklist

- [ ] Grid layout correct at all breakpoints
- [ ] Typography remains readable
- - Padding changes at correct breakpoints
- - Sidebars behave correctly
- - Buttons full width on mobile when needed
- - Inputs full width on mobile
- - Touch targets adequate on mobile
- - Navigation usable on mobile
- - No horizontal scroll on body
- - Content remains accessible
