# Component and State Atlas

This document provides a structured reference for all recurring AetherLearn components and their states.

---

## Chip/Button

### Purpose
Filter buttons, category selectors, pills for interactive selection.

### Structure
- Text label
- Pill-shaped container

### Dimensions
- Width: Auto
- Height: Auto
- Padding: 0.375rem 0.875rem (px-3.5 py-1.5)
- Radius: 999px (rounded-full)

### Typography
- Size: 0.8125rem (13px)
- Weight: 500 (font-medium)

### Spacing
- None (standalone)

### Colors
**Active:**
- Background: var(--foreground)
- Text: var(--background)
- Border: var(--foreground)

**Inactive:**
- Background: transparent
- Text: var(--muted-foreground)
- Border: var(--border)

### Borders
- Width: 1px
- Color: var(--border) or var(--foreground)
- Radius: 999px

### Shadow/Elevation
- None

### Iconography
- None

### Alignment
- Center

### Variants
- Active (solid background, inverted text)
- Inactive (border only, dimmed text)

### States

**Default (Inactive):**
- Background: transparent
- Text: var(--muted-foreground)
- Border: var(--border)

**Active:**
- Background: var(--foreground)
- Text: var(--background)
- Border: var(--foreground)

**Hover (Inactive):**
- Border: var(--foreground/40)
- Text: var(--foreground)
- Duration: 150-200ms
- Easing: ease-in-out

**Focus:**
- Outline: ring-2 ring-ring ring-offset-2

**Active:**
- Not used (active state is toggled via Active variant)

**Selected:**
- Same as Active variant

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- None (same on all screen sizes)

### Motion Behavior
- Hover: color change, 150-200ms, ease-in-out

---

## Search Field

### Purpose
Search input for content filtering and discovery.

### Structure
- Search icon (left)
- Input field
- Optional "More results" link (right)

### Dimensions
- Width: 100%
- Height: 36px (h-9)
- Padding: 0.75rem 0.75rem (px-3)
- Radius: 0.375rem (rounded-md)

### Typography
- Size: 0.875rem (text-sm)
- Weight: normal

### Spacing
- Icon left: 0.75rem (left-3)
- Text left: 2.25rem (pl-9)

### Colors
- Background: var(--background)
- Border: var(--border)
- Text: var(--foreground)
- Placeholder: var(--muted-foreground)
- Icon: var(--muted-foreground)

### Borders
- Width: 1px
- Color: var(--border)
- Radius: 0.375rem (rounded-md)

### Shadow/Elevation
- None

### Iconography
- Lucide React icon
- Size: 16px × 16px (h-4 w-4)

### Alignment
- Icon: left-3, top-1/2, -translate-y-1/2

### Variants
- Standard search field
- With "More results" link

### States

**Default:**
- Border: var(--border)
- Background: var(--background)

**Focus:**
- Border: var(--foreground/40)
- Outline: none

**Hover:**
- No visual change (input only)

**Active:**
- Not used

**Selected:**
- Not used

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Full width on mobile
- Same height (h-9) on all screen sizes

### Motion Behavior
- Focus: border color change, 150-200ms

---

## Flashcard

### Purpose
Expandable flashcard component for learning content.

### Structure
- Header (clickable)
  - Question text
  - Chevron icon (right)
- Body (expandable)
  - Answer text

### Dimensions
- Width: 100%
- Height: Auto
- Padding: 1.5rem (p-6)
- Gap: 1rem (gap-4)

### Typography
- Question: 1.125rem (text-lg), font-serif, leading-relaxed
- Answer: 1rem (text-base), font-serif, leading-relaxed

### Spacing
- Gap between elements: 1rem (gap-4)
- Padding: 1.5rem (p-6)

### Colors
- Background: transparent
- Border: var(--border)
- Question text: var(--foreground)
- Answer text: var(--muted-foreground)
- Icon: var(--muted-foreground)

### Borders
- Width: 1px (bottom only)
- Color: var(--border)
- Radius: None

### Shadow/Elevation
- None

### Iconography
- Lucide React chevron
- Size: 20px × 20px (h-5 w-5)

### Alignment
- Flex, items-start

### Variants
- Collapsed (show question only)
- Expanded (show question and answer)

### States

**Default (Collapsed):**
- Show question only
- ChevronRight icon

**Expanded:**
- Show question and answer
- ChevronDown icon

**Hover:**
- Cursor pointer
- No visual change

**Focus:**
- Outline on header
- Keyboard navigation with Enter/Space

**Active:**
- Not used

**Selected:**
- Toggled via expanded state

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Same padding on all screen sizes
- No responsive changes

### Motion Behavior
- Expand/collapse: immediate (no documented transition)

---

## Button

### Purpose
Primary and secondary action buttons.

### Structure
- Label text
- Optional icon

### Dimensions
- Height: Auto
- Padding: 0.75rem 0.75rem (px-3 py-2)
- Radius: 0.375rem (rounded-md)

### Typography
- Size: 0.875rem (text-sm)
- Weight: 500 (font-medium)

### Spacing
- Gap between icon and text: 0.5rem

### Colors
**Primary (default):**
- Background: var(--primary)
- Text: var(--primary-foreground)

**Outline:**
- Background: var(--background)
- Text: var(--foreground)
- Border: var(--border)

### Borders
- Width: 1px (outline variant only)
- Color: var(--border)
- Radius: 0.375rem (rounded-md)

### Shadow/Elevation
- None

### Iconography
- Optional

### Alignment
- Center

### Variants
- Default (primary)
- Outline

### States

**Default:**
- As defined by variant

**Hover:**
- Primary: brightness or color shift
- Outline: var(--secondary), var(--foreground)
- Duration: 150-200ms

**Focus:**
- Outline: none
- Focus-visible: ring-2 ring-ring ring-offset-2

**Active:**
- Scale or color shift

**Selected:**
- Not used

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Full width on mobile if needed
- Same size on all screen sizes

### Motion Behavior
- Hover: color change, 150-200ms

---

## Card

### Purpose
Content container for grouping related information.

### Structure
- Content container
- Padding

### Dimensions
- Width: Auto or 100%
- Height: Auto
- Padding: 1rem (p-4) or 1.5rem (p-6)
- Radius: 0.75rem (rounded-lg)

### Typography
- Varies by content

### Spacing
- Internal gap: 1rem (gap-4) or 0.5rem (gap-0.5)

### Colors
- Background: var(--card)
- Text: var(--card-foreground)
- Border: var(--border)

### Borders
- Width: 1px
- Color: var(--border)
- Radius: 0.75rem (rounded-lg)

### Shadow/Elevation
- None

### Iconography
- Varies by content

### Alignment
- Varies by content

### Variants
- Standard padding (p-4)
- Large padding (p-6)

### States

**Default:**
- As defined

**Hover:**
- No hover on cards (content-based)
- Interactive elements inside cards have hover

**Focus:**
- Outline on interactive elements inside

**Active:**
- Not used

**Selected:**
- Not used

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Full width on mobile
- Grid layout on desktop

### Motion Behavior
- None

---

## Dropdown

### Purpose
Menu dropdown for navigation and actions.

### Structure
- Trigger button
- Dropdown menu

### Dimensions
- Menu width: 13rem (w-52)
- Padding: 0.25rem (p-1)
- Radius: 0.375rem (rounded-md)

### Typography
- Item text: 0.75rem (text-xs)

### Spacing
- Item padding: 0.5rem 0.75rem (px-3 py-2)

### Colors
- Background: var(--background)
- Border: var(--border)
- Text: var(--foreground) or var(--muted-foreground)
- Item hover: var(--secondary)

### Borders
- Width: 1px
- Color: var(--border)
- Radius: 0.375rem (rounded-md)

### Shadow/Elevation
- shadow-xl

### Iconography
- Optional chevron

### Alignment
- Left-aligned menu

### Variants
- None

### States

**Hidden:**
- opacity-0 invisible

**Visible:**
- opacity-100 visible

**Item hover:**
- Background: var(--secondary)
- Text: var(--foreground)
- Duration: 200ms
- Easing: ease-in-out

**Item focus:**
- Outline: ring-2 ring-ring ring-offset-2

**Active:**
- Not used

**Selected:**
- Text: var(--foreground) (when current page)

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Same on all screen sizes
- May use mobile menu instead on small screens

### Motion Behavior
- Visibility: opacity + visibility, 200ms, ease-in-out

---

## Skeleton

### Purpose
Loading placeholder for content.

### Structure
- Placeholder container
- Shimmer effect

### Dimensions
- Varies by content

### Typography
- None

### Spacing
- None

### Colors
- Background: color-mix(in oklab, var(--foreground) 7%, transparent)

### Borders
- Radius: 0.375rem (rounded) or 0.75rem (rounded-lg)

### Shadow/Elevation
- None

### Iconography
- None

### Alignment
- Varies by content

### Variants
- Line skeleton
- Card skeleton

### States

**Loading:**
- Shimmer animation active

**Loaded:**
- Replaced with actual content

**Hover:**
- Not interactive

**Focus:**
- Not interactive

**Active:**
- Not used

**Selected:**
- Not used

**Disabled:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Scales with content

### Motion Behavior
- Shimmer: translateX(-100%) to translateX(100%), 1.25s, infinite

---

## Stat Display

### Purpose
Display statistics with value and label.

### Structure
- Value (top)
- Label (bottom)

### Dimensions
- Width: Auto
- Height: Auto
- Gap: 0.125rem (gap-0.5)

### Typography
- Value: 1.875rem (text-3xl), font-display, font-semibold, leading-none
- Label: 0.6875rem (text-[11px]), uppercase, tracking-[0.14em]

### Spacing
- Gap: 0.125rem (gap-0.5)

### Colors
- Value: var(--foreground)
- Label: var(--muted-foreground)

### Borders
- None

### Shadow/Elevation
- None

### Iconography
- None

### Alignment
- Flex column

### Variants
- None

### States

**Default:**
- As defined

**Hover:**
- Not interactive

**Focus:**
- Not interactive

**Active:**
- Not used

**Selected:**
- Not used

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Scales with Tailwind text utilities
- May use smaller size on mobile

### Motion Behavior
- None

---

## Input

### Purpose
Text input for forms and data entry.

### Structure
- Input field

### Dimensions
- Height: 36px (h-9)
- Width: 100%
- Padding: 0.75rem (px-3)
- Radius: 0.375rem (rounded-md)

### Typography
- Size: 0.875rem (text-sm)
- Weight: normal

### Spacing
- None

### Colors
- Background: var(--background)
- Border: var(--border)
- Text: var(--foreground)
- Placeholder: var(--muted-foreground)

### Borders
- Width: 1px
- Color: var(--border)
- Radius: 0.375rem (rounded-md)

### Shadow/Elevation
- None

### Iconography
- None

### Alignment
- Left

### Variants
- None

### States

**Default:**
- Border: var(--border)
- Background: var(--background)

**Focus:**
- Border: var(--foreground/40)
- Outline: none

**Hover:**
- No visual change

**Active:**
- Not used

**Selected:**
- Not used

**Disabled:**
- Not used

**Loading:**
- Not used

**Error:**
- Not used

### Responsive Behavior
- Full width on mobile
- Same height (h-9) on all screen sizes

### Motion Behavior
- Focus: border color change, 150-200ms

---

## State Relationships

### Chip/Button

```
Inactive (Default)
   ↓ Hover
   ↓ Focus
   ↓ Active (Selected)
```

**Description:** Chip toggles between inactive and active states via Active variant.

### Search Field

```
Default
   ↓ Focus
```

**Description:** Search field focuses and highlights border.

### Flashcard

```
Collapsed (Default)
   ↓ Click
   ↓ Expanded
```

**Description:** Flashcard expands on click to show answer.

### Button

```
Default
   ↓ Hover
   ↓ Focus
   ↓ Active
```

**Description:** Button follows linear state progression.

### Card

```
Fixed (no states)
```

**Description:** Card is not interactive; content inside may be.

### Dropdown

```
Hidden
   ↓ Hover
   ↓ Visible
```

**Description:** Dropdown appears on group hover.

### Skeleton

```
Loading
   ↓ Loaded
```

**Description:** Skeleton replaced with content when loaded.

### Stat Display

```
Fixed (no states)
```

**Description:** Stat display is not interactive.

### Input

```
Default
   ↓ Focus
```

**Description:** Input focuses and highlights border.
