# Implementation Notes

This document provides evidence from the existing AetherLearn codebase that supports the design rules documented in DESIGN.md.

---

## File Locations

### Global CSS

**app/globals.css**
- Contains all CSS custom properties
- Source of truth for design tokens
- Background gradient (none, uses solid colors)
- Typography base
- Animations
- Theme variables
- Lines 1-586

**tailwind.config.ts**
- Tailwind configuration
- Color mapping to OKLCH tokens
- Font configuration
- Lines 1-58

### Pages

**app/layout.tsx**
- Font loading (Cormorant Garamond, Inter)
- Theme initialization script
- Metadata
- Lines 1-155

**app/page.tsx**
- Main homepage layout
- Stat display component
- Chip/filter component
- Card grid
- Lines 1-100+

---

## Design Token Evidence

### Colors

**app/globals.css lines 74-175:**
```css
:root {
  --radius: 0.75rem;
  --background: oklch(0.965 0.011 259);
  --foreground: oklch(0.176 0.031 265);
  --card: oklch(0.965 0.011 259);
  --card-foreground: oklch(0.176 0.031 265);
  --primary: oklch(0.176 0.031 265);
  --primary-foreground: oklch(0.98 0.005 250);
  --secondary: oklch(0.966 0.006 247);
  --secondary-foreground: oklch(0.176 0.031 265);
  --muted: oklch(0.966 0.006 247);
  --muted-foreground: oklch(0.573 0.032 254);
  --accent: oklch(0.966 0.006 247);
  --accent-foreground: oklch(0.176 0.031 265);
  --destructive: oklch(0.577 0.222 27.3);
  --destructive-foreground: oklch(0.98 0.005 250);
  --success: oklch(0.596 0.16 149);
  --warning: oklch(0.652 0.152 62);
  --streak: oklch(0.755 0.153 51);
  --border: oklch(0.85 0.012 258);
  --input: oklch(0.85 0.012 258);
  --ring: oklch(0.573 0.032 254);
}
```

### Typography

**app/layout.tsx lines 7-20:**
```typescript
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
});
```

### Spacing

**Tailwind spacing scale** (documented in DESIGN.md, not in code)

- p-4: 1rem padding
- p-6: 1.5rem padding
- gap-0.75: 0.75rem gap
- mt-2.5: 2.5rem margin-top
- mb-0.75: 0.75rem margin-bottom

### Geometry

**app/globals.css line 75:**
```css
--radius: 0.75rem;
```

**Tailwind utilities:**
- rounded-md: 0.375rem
- rounded: 0.5rem
- rounded-lg: 0.75rem
- rounded-full: 999px

### Motion

**app/globals.css lines 281-285:**
```css
@keyframes subject-shimmer {
  to {
    transform: translateX(100%);
  }
}
```

**app/globals.css lines 345-353:**
```css
@keyframes workspace-drop-success {
  0%, 45% {
    background-color: var(--secondary);
  }
  100% {
    background-color: transparent;
  }
}
```

**app/globals.css lines 415-430:**
```css
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

**app/globals.css lines 379-386:**
```css
@keyframes initial-loader-reflection {
  from {
    transform: translate(-100%, -100%);
  }
  to {
    transform: translate(100%, 100%);
  }
}
```

### Responsive

**app/globals.css lines 51-59:**
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

---

## Component Evidence

### Stat Display

**app/page.tsx lines 14-21:**
```tsx
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-3xl font-semibold leading-none">{value}</span>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    </div>
  );
}
```

### Chip/Button

**app/page.tsx lines 23-46:**
```tsx
function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
```

### Search Field

**components/AppShell.tsx lines 26-80:**
```tsx
export function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
  showMoreResults = false,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  showMoreResults?: boolean;
}) {
  // ... implementation
  return (
    <div className={'relative ' + className}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={val}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInner(e.target.value))}
        placeholder={placeholder ?? t('search_placeholder_sets')}
        aria-label={t('search_aria')}
        className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </div>
  );
}
```

### Flashcard

**components/Flashcard.tsx lines 1-57:**
```tsx
export default function Flashcard({ id, question, answer }: FlashcardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div id={id} className="border-b border-border">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            setIsExpanded((value) => !value);
          }
        }}
        aria-expanded={isExpanded}
        className="w-full flex items-start gap-4 p-6 text-left cursor-pointer"
      >
        <div className="flex-1">
          <div className="font-serif text-lg leading-relaxed text-foreground">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {question}
            </ReactMarkdown>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        )}
      </div>
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="font-serif text-base leading-relaxed text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Button

**components/ui/button** (shadcn/ui component)
- Uses rounded-md
- Uses bg-primary for default variant
- Uses border for outline variant

---

## Theme Evidence

### Light Theme

**app/globals.css lines 74-113:**
```css
:root {
  --background: oklch(0.965 0.011 259);
  --foreground: oklch(0.176 0.031 265);
  /* ... */
}
```

### Dark Theme

**app/globals.css lines 115-146:**
```css
.dark {
  --background: oklch(0.176 0.031 265);
  --foreground: oklch(0.981 0.003 247);
  /* ... */
}
```

### Custom Theme Support

**app/globals.css lines 149-175:**
```css
[data-theme="custom"] {
  --background: var(--theme-background);
  --foreground: var(--theme-text);
  --card: var(--theme-background);
  --card-foreground: var(--theme-text);
  --primary: var(--theme-main);
  --primary-foreground: var(--theme-text);
  --secondary: var(--theme-shade-secondary);
  --secondary-foreground: var(--theme-text);
  --muted: var(--theme-shade-secondary);
  --muted-foreground: var(--theme-shade-primary);
  --accent: var(--theme-shade-secondary);
  --accent-foreground: var(--theme-text);
  --border: var(--theme-shade-primary);
  --input: var(--theme-shade-primary);
  --ring: var(--theme-shade-primary);
}
```

---

## State Evidence

### Hover

**Chip hover (app/page.tsx):**
```css
hover:border-foreground/40 hover:text-foreground
```

### Focus

**Input focus (components/AppShell.tsx):**
```css
focus:border-foreground/40
```

---

## Summary

This document provides specific file locations and line numbers that serve as evidence for the design rules documented in DESIGN.md. When in doubt about a design rule, refer to the original implementation in these files.
