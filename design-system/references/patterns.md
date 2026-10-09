# Patterns Reference

This document documents reusable UI patterns in AetherLearn.

---

## Page Composition Patterns

### Hub/Landing Page Pattern

**Structure:**
1. Top navigation bar
2. Hero section with stats
3. Subject filter chips
4. Card grid (study sets)
5. Footer

**Container:**
- No fixed max-width
- Responsive padding
- Tailwind container utilities where needed

**Content Hierarchy:**
- Stats: primary (Cormorant Garamond, large)
- Section headers: secondary
- Cards: tertiary
- Card content: quaternary

### Content Detail Page Pattern

**Structure:**
1. Top navigation bar
2. Page header (left-aligned)
3. Main content (centered or left-aligned)
4. Sidebar (if applicable)
5. Footer

**Container:**
- Responsive padding
- No fixed max-width

**Content Hierarchy:**
- Title: primary (Cormorant Garamond)
- Subtitle: secondary
- Section headings: tertiary
- Body content: quaternary

---

## Content Hierarchy

### Visual Hierarchy Levels

**Level 1 (Primary):**
- Stat values: text-3xl, Cormorant Garamond, font-semibold
- Page titles: text-2xl+, Cormorant Garamond

**Level 2 (Secondary):**
- Section headings: text-lg, Inter, font-semibold
- Subtitles

**Level 3 (Tertiary):**
- Card titles: text-base, Inter
- Body text: text-base, Inter

**Level 4 (Quaternary):**
- Card descriptions: text-sm, Inter
- Labels: text-xs, Inter, uppercase
- Metadata: text-muted-foreground

---

## Navigation Hierarchy

### Topbar Navigation

**Structure:**
- Brand/logo (left)
- Navigation links (center)
- User menu/actions (right)

**Visual Hierarchy:**
- Brand: largest, Cormorant Garamond
- Links: smaller, Inter
- Actions: icon-based

**Interaction:**
- Links: color change on hover
- Dropdowns: group hover with opacity transition
- Theme toggle: button

---

## Card Composition

### Card Pattern

**Internal Layout:**
- Padding: p-4 or p-6
- Border: border-border
- Background: bg-background
- Radius: rounded-lg

**Spacing:**
- Gap between elements: gap-4 or gap-0.5
- Padding: consistent

**Visual Weight:**
- Title: high (foreground, larger)
- Description: low (muted-foreground, smaller)
- Badge: high (primary color)

---

## Empty States

### Pattern

**Visual:**
- Centered text
- muted-foreground color
- No decoration

**Implementation:**
```css
text-center
color: var(--muted-foreground)
```

**Example Usage:**
- No search results
- No items in category
- Loading placeholder

---

## Dashboards

### Not Used in Current Implementation

**If needed, follow these principles:**
- Use card grid pattern
- Use stat display pattern
- Use rounded-lg cards
- Maintain AetherLearn visual identity

---

## Forms

### Form Pattern

**Structure:**
1. Form title (Cormorant Garamond)
2. Form description (muted-foreground)
3. Input fields (rounded, border-border, bg-background)
4. Helper text (muted-foreground)
5. Error messages (when implemented)
6. Submit button (rounded, bg-primary)

**Input Field Pattern:**
```css
h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

---

## Detail Pages

### Article/Content Pattern

**Structure:**
1. Breadcrumb navigation (if applicable)
2. Header (title, subtitle, metadata)
3. Main content sections
4. Related content (if applicable)

**Layout:**
- Single column
- Responsive padding
- No fixed max-width

**Responsive:**
- Single column on all screens
- Adjusted padding on mobile

---

## Creation Flows

### Not Used in Current Implementation

**If needed, follow these principles:**
- Use rounded-lg panels
- Use consistent spacing
- Use bg-background
- Maintain AetherLearn visual identity

---

## Settings

### Not Used in Current Implementation

**If needed, follow these principles:**
- Use card grid pattern
- Use toggle switches (rounded or rounded-full)
- Use rounded-lg panels
- Maintain AetherLearn visual identity

---

## Lists

### Card Grid Pattern

**Structure:**
1. Section header (title)
2. Card grid
3. Next section

**Implementation:**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
gap: 0.75rem;
margin-top: 2.5rem;
```

---

## Responsive Transformations

### Grid Transformations

**Desktop:**
```css
grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
```

**Mobile:**
```css
grid-template-columns: 1fr;
```

### Typography Transformations

**No specific scaling**
- Use Tailwind text-size utilities
- No responsive font size changes documented

### Content Visibility Transformations

**Hide on mobile:**
```css
lg:hidden /* Hidden on mobile, visible on desktop */
```

---

## Layout Variations

### Full Width Layout
```css
w-full
```

### Container Layout
```css
container mx-auto px-4
```

### Grid Layout
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

### Flex Layout
```css
flex flex-col gap-4
```

---

## Pattern Summary

|| Pattern | Use Case | Key Characteristics |
||---------|----------|-------------------|
|| Hub page | Landing, navigation | Stats, chips, card grid |
|| Detail page | Content, articles | Header, single column |
|| Card | Navigation | rounded-lg, border-border |
|| Form | Data entry | rounded inputs, bg-background |
|| List | Category sections | Grid layout, gap-0.75 |
|| Empty state | No results | Centered, muted-foreground |
|| Stat display | Statistics | Cormorant, uppercase label |
