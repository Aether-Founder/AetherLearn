# Book Cover Styling Rules

## Color System

Book covers use the web app's theme system for consistency:

### Background Color
- **All book covers use the same background color**: the web app's current theme background
- This is typically `bg-background` or the theme's primary background color
- The background automatically adapts to light/dark theme

### Genre Indication
- **Genre is indicated by a gradient behind the book element** (not in the cover HTML)
- The gradient is separate from the book cover and applied in the web app's code
- Each genre has a specific gradient color

## Genre Gradient Mapping

| Genre/Topic | Gradient Color (oklch) | Description |
|-------------|----------------------|-------------|
| Self-Improvement | oklch(0.65 0.20 150) | Vibrant Green |
| Psychology | oklch(0.60 0.18 300) | Purple |
| Business | oklch(0.55 0.15 220) | Deep Blue |
| Productivity | oklch(0.70 0.18 45) | Orange |
| History | oklch(0.65 0.12 40) | Amber/Brown |
| Science | oklch(0.70 0.15 200) | Cyan |
| Health | oklch(0.65 0.20 25) | Red |
| Finance | oklch(0.80 0.15 85) | Gold/Yellow |
| Technology | oklch(0.60 0.20 270) | Electric Purple/Blue |
| Education | oklch(0.55 0.20 260) | Indigo |

## Cover Design Rules

### 1. Background
- **Must use theme background color** (e.g., `bg-background`)
- No genre-specific colors in the cover HTML
- Color should be set via inline style using CSS variable: `background: var(--background)`

### 2. Layout
- **Aspect Ratio:** 3:4 (book cover format)
- **Padding:** 1rem (16px) on all sides
- **Display:** Flexbox, column direction
- **Justify:** Center (vertically and horizontally)
- **Overflow:** Hidden (prevent content spillover)

### 3. Typography
- **Font Family:** Cormorant Garamond, Georgia, serif
- **Title:** 
  - Font size: 1.5rem (24px)
  - Font weight: 600
  - Line height: 1.2
  - Color: `var(--foreground)` (theme foreground color)
  - Text align: center
  - Margin bottom: 0.5rem
- **Author:**
  - Font size: 0.875rem (14px)
  - Font weight: 400
  - Color: `var(--foreground)` with 90% opacity
  - Text align: center

### 4. Box Model
- **Box sizing:** border-box
- **No borders** on the cover itself
- **No shadows** within the cover HTML (card shadow handles this)

### 5. Content Structure
```html
<div style="width: 100%; height: 100%; background: var(--background); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1rem; color: var(--foreground); font-family: 'Cormorant Garamond', Georgia, serif; box-sizing: border-box; overflow: hidden;">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap" rel="stylesheet">
  <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; text-align: center; line-height: 1.2;">[BOOK TITLE]</div>
  <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.9;">[AUTHOR NAME]</div>
</div>
```

### 6. Genre Gradient Application
- The genre gradient is applied as a **circular glow behind the book element** in the web app's code
- The glow is a radial gradient that protrudes beyond the book borders on all sides (top, bottom, left, right)
- Glow is larger than the book element and extends at the borders in a circular shape
- Glow color is determined by the book's `topic` field
- The entire book element is one cohesive unit - hover anywhere affects the whole element
- Example implementation in BookCard component:
```tsx
<div className="relative group w-48 transition-colors hover:bg-secondary cursor-pointer flex flex-col border border-border rounded-xl overflow-hidden bg-background">
  {/* Genre Gradient Glow Behind */}
  <div
    className="absolute -inset-3 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none"
    style={{
      background: `radial-gradient(circle, ${getGenreGradient(book.topic)} 0%, transparent 70%)`,
    }}
  />
  
  <Link href={`/books/${book.slug}`} className="relative z-10 h-full flex flex-col">
    {/* Cover and content */}
  </Link>
</div>
```

### 7. Hover Behavior
- When hovering a book element, the background changes to the theme's secondary color
- This is handled by the web app's hover state (e.g., `hover:bg-secondary`)
- The gradient remains visible behind the secondary color

## Implementation Notes

### In book.json
```json
{
  "topic": "self-improvement",
  "cover": {
    "type": "html",
    "html": "<div style=\"background: var(--background); ...\">...</div>"
  }
}
```

### In BookCard Component
The BookCard component (or its wrapper) should:
1. Accept the book's topic/genre
2. Apply the appropriate genre gradient as a background
3. Handle hover state with theme secondary color

### Dynamic Gradient Assignment
When rendering book cards, use the genre mapping to automatically assign the correct gradient based on the `topic` field.

## Examples

### Self-Improvement (Atomic Habits)
```html
<div style="background: var(--background);">
  <div>Atomic Habits</div>
  <div>James Clear</div>
</div>
```
With genre gradient (applied in web app):
```tsx
// Gradient: oklch(0.65 0.20 150) - Vibrant Green
<div style="background: radial-gradient(circle, oklch(0.65 0.20 150) 0%, transparent 70%);">
  <!-- BookCard with theme background -->
</div>
```

### Psychology (Thinking Fast and Slow)
```html
<div style="background: var(--background);">
  <div>Thinking, Fast and Slow</div>
  <div>Daniel Kahneman</div>
</div>
```
With genre gradient (applied in web app):
```tsx
// Gradient: oklch(0.60 0.18 300) - Purple
<div style="background: radial-gradient(circle, oklch(0.60 0.18 300) 0%, transparent 70%);">
  <!-- BookCard with theme background -->
</div>
```

### Business (The Lean Startup)
```html
<div style="background: var(--background);">
  <div>The Lean Startup</div>
  <div>Eric Ries</div>
</div>
```
With genre gradient (applied in web app):
```tsx
// Gradient: oklch(0.55 0.15 220) - Deep Blue
<div style="background: radial-gradient(circle, oklch(0.55 0.15 220) 0%, transparent 70%);">
  <!-- BookCard with theme background -->
</div>
```

## Theme Adaptation
- Book covers automatically adapt to light/dark theme via CSS variables
- `var(--background)` resolves to the theme's background color
- `var(--foreground)` resolves to the theme's foreground color
- Hover state uses theme's secondary color via Tailwind's `hover:bg-secondary`

## Accessibility
- Text uses theme foreground color for optimal contrast
- Gradients are subtle and don't interfere with readability
- All text remains legible on both light and dark themes

## Book Reading Page Architecture

### Page Type: Content Reader (Lesson Reader)

The book reading page at `/books/[slug]/read/page.tsx` is a **Content Reader** page type. This is the universal page type name used throughout the project for rendering structured content with navigation and reading modes.

### Architecture Alignment

The book reader follows the same architectural pattern as the existing JSON lesson pages:

- **Generic Lesson Page**: `app/[page]/page.tsx` - Renders JSON content with multiple view modes
- **Subject Lesson Page**: `app/leer/[subjectId]/[pageId]/page.tsx` - Uses the generic lesson page for subject-specific content
- **Book Reader Page**: `app/books/[slug]/read/page.tsx` - Renders book chapters with reading modes

All three are "Content Reader" or "Lesson Reader" pages - they render structured content with:
- Navigation (chapters/sections)
- Format/mode selection (concise/detailed)
- Language support
- Progress tracking
- Reading controls

### URL Structure

- Book library: `/books`
- Book details: `/books/[slug]`
- Book reader: `/books/[slug]/read?chapters={ids}&format={format}&lang={lang}`

The language is controlled by the app's locale context, not by the URL. Switching language keeps the same URL.

### Localization

All book pages support full localization through the app's existing i18n infrastructure:
- `app/books/page.tsx` - Uses `useTranslation` hook
- `app/books/[slug]/page.tsx` - Uses `useTranslation` hook
- `app/books/[slug]/read/page.tsx` - Uses `useTranslation` hook
- Locale keys: `books.*` in `public/locales/en.json` and `public/locales/nl.json`