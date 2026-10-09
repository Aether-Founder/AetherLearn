# Components Reference

This document provides in-depth details for recurring AetherLearn components.

---

## Chip/Button

### Purpose
Filter buttons, category selectors, pills for interactive selection.

### Structure
```tsx
<button type="button" className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors">
  {children}
</button>
```

### Complete CSS (Tailwind)
```css
rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors
```

### Active State
```css
border-foreground bg-foreground text-background
```

### Inactive State
```css
border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground
```

### States

**Active:**
- Background: bg-foreground
- Text: text-background
- Border: border-foreground

**Inactive:**
- Background: transparent
- Text: text-muted-foreground
- Border: border-border
- Hover: border-foreground/40, text-foreground

**Focus:**
- Focus-visible outline
- Ring indicator

### Responsive
- No responsive changes
- Same on all screen sizes

---

## Search Field

### Purpose
Search input for content filtering and discovery.

### Structure
```tsx
<div className="relative">
  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <input className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40" />
</div>
```

### Complete CSS (Tailwind)
```css
relative h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

### Icon
```css
pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground
```

### States

**Default:**
- Border: border-border
- Background: bg-background
- Placeholder: text-muted-foreground

**Focus:**
- Border: border-foreground/40
- Outline: none
- No ring by default

**Disabled:**
- Not used in current implementation

### Responsive
- Full width on mobile
- Same height (h-9) on all screen sizes

---

## Flashcard

### Purpose
Expandable flashcard component for learning content.

### Structure
```tsx
<div className="border-b border-border">
  <div className="w-full flex items-start gap-4 p-6 text-left cursor-pointer">
    <div className="font-serif text-lg leading-relaxed text-foreground">
      {question}
    </div>
  </div>
  {isExpanded && (
    <div className="px-6 pb-6">
      <div className="font-serif text-base leading-relaxed text-muted-foreground">
        {answer}
      </div>
    </div>
  )}
</div>
```

### Complete CSS (Tailwind)
```css
border-b border-border
w-full flex items-start gap-4 p-6 text-left cursor-pointer
font-serif text-lg leading-relaxed text-foreground
font-serif text-base leading-relaxed text-muted-foreground
```

### States

**Collapsed:**
- Show question only
- ChevronRight icon

**Expanded:**
- Show question and answer
- ChevronDown icon

**Hover:**
- Cursor pointer
- No visual change (content-based)

**Focus:**
- Outline on header
- Keyboard navigation with Enter/Space

### Responsive
- Same padding on all screen sizes
- No responsive changes

---

## Button

### Purpose
Primary and secondary action buttons.

### Variants

**Primary (default):**
```css
bg-primary text-primary-foreground rounded-md
```

**Outline:**
```css
border border-border bg-background rounded-md
```

### Complete CSS (Tailwind)
```css
rounded-md px-3 py-2 text-sm font-medium transition-colors
```

### States

**Hover:**
- Primary: brightness or color shift
- Outline: bg-secondary, text-foreground

**Focus:**
- focus:outline-none
- focus-visible:ring-2 ring-ring ring-offset-2

**Active:**
- Scale or color shift

**Disabled:**
- Not used in current implementation

### Responsive
- Full width on mobile if needed
- Same size on all screen sizes

---

## Card

### Purpose
Content container for grouping related information.

### Complete CSS (Tailwind)
```css
border border-border bg-background rounded-lg
```

### Padding Variants

**Standard:**
```css
p-4
```

**Large:**
```css
p-6
```

### States

**Hover:**
- No hover on cards (content-based)
- Interactive elements inside cards have hover

**Focus:**
- Outline on interactive elements inside

### Responsive
- Full width on mobile
- Grid layout on desktop

---

## Dropdown

### Purpose
Menu dropdown for navigation and actions.

### Structure
```tsx
<div className="relative group">
  <button>Menu</button>
  <div className="absolute left-0 top-full z-40 mt-2 w-52 rounded-md border border-border bg-background p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    {items}
  </div>
</div>
```

### Complete CSS (Tailwind)
```css
absolute left-0 top-full z-40 mt-2 w-52 rounded-md border border-border bg-background p-1 shadow-xl
opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
```

### Item
```css
rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground
```

### States

**Hidden:**
- opacity-0 invisible

**Visible:**
- opacity-100 visible

**Item hover:**
- bg-secondary
- text-foreground

### Responsive
- Same on all screen sizes
- May use mobile menu instead on small screens

---

## Skeleton

### Purpose
Loading placeholder for content.

### Structure
```tsx
<div className="relative overflow-hidden">
  <div className="skeleton-line h-4 w-full" />
</div>
```

### Complete CSS (Tailwind)
```css
relative overflow-hidden
```

### Shimmer Animation
```css
background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 8%, transparent), transparent)
transform: translateX(-100%)
animation: subject-shimmer 1.25s infinite
```

### Animation Keyframe
```css
@keyframes subject-shimmer {
  to {
    transform: translateX(100%);
  }
}
```

### States

**Loading:**
- Shimmer animation active

**Loaded:**
- Replaced with actual content

### Responsive
- Scales with content
- No specific responsive rules

---

## Stat Display

### Purpose
Display statistics with value and label.

### Structure
```tsx
<div className="flex flex-col gap-0.5">
  <span className="font-display text-3xl font-semibold leading-none">{value}</span>
  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
</div>
```

### Complete CSS (Tailwind)
```css
flex flex-col gap-0.5
font-display text-3xl font-semibold leading-none
text-[11px] uppercase tracking-[0.14em] text-muted-foreground
```

### States
- Static only
- No interactive states

### Responsive
- Scales with Tailwind text utilities
- May use smaller size on mobile

---

## Input

### Purpose
Text input for forms and data entry.

### Complete CSS (Tailwind)
```css
h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

### States

**Default:**
- Border: border-border
- Background: bg-background

**Focus:**
- Border: border-foreground/40
- Outline: none

**Disabled:**
- Not used in current implementation

### Responsive
- Full width on mobile
- Same height (h-9) on all screen sizes

---

## Select

### Purpose
Dropdown for selection.

### Complete CSS (Tailwind)
Similar to input:
```css
h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40
```

### States
- Same as input

### Responsive
- Full width on mobile

---

## Component Summary

|| Component | Radius | Padding | States | Responsive |
||-----------|--------|---------|--------|------------|
|| Chip/Button | rounded-full | px-3.5 py-1.5 | Active, Inactive, Focus | Same on all screens |
|| Search Field | rounded-md | px-3, h-9 | Default, Focus | Full width mobile |
|| Flashcard | none | p-6 | Collapsed, Expanded | Same on all screens |
|| Button | rounded-md | px-3 py-2 | Hover, Focus | Full width mobile |
|| Card | rounded-lg | p-4 or p-6 | None | Full width mobile |
|| Dropdown | rounded-md | p-1 | Hidden, Visible | Same on all screens |
|| Skeleton | none | N/A | Loading, Loaded | Scales with content |
|| Stat Display | none | N/A | None | Scales with text |
|| Input | rounded-md | px-3, h-9 | Default, Focus | Full width mobile |

---

## Component Patterns

### Card Pattern

All cards use this pattern:
```css
border border-border bg-background rounded-lg
```

### Button Pattern

All buttons use this pattern:
```css
rounded-md px-3 py-2 text-sm font-medium transition-colors
```

### Input Pattern

All inputs use this pattern:
```css
h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

### Focus Pattern

All interactive elements use this pattern:
```css
focus:outline-none
focus-visible:ring-2 ring-ring ring-offset-2
```

### Radius Pattern

- Cards/panels: rounded-lg (0.75rem)
- Buttons/inputs: rounded (0.5rem)
- Chips/pills: rounded-full
- Small elements: rounded-md (0.375rem)
