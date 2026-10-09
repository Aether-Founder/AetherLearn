# AetherLearn Design System

This is the canonical visual design specification for AetherLearn. It documents the complete visual language of the AetherLearn interface so it can be consistently reproduced across future projects and different technology stacks.

---

## 1. Introduction

### What This System Is

The AetherLearn Design System is a comprehensive documentation of the visual identity observed in the existing AetherLearn implementation. It captures:

- Exact color values using OKLCH color space
- Typography hierarchy with Cormorant Garamond and Inter
- Spacing scale and layout patterns
- Component behaviors and states
- Motion language and animation principles
- Responsive design transformations
- Accessibility conventions
- Theme system (light/dark/custom)

### Why It Exists

This system exists to:

1. **Preserve visual consistency** across multiple projects
2. **Enable portable implementation** of the AetherLearn visual language
3. **Provide authoritative design tokens** that prevent arbitrary visual decisions
4. **Document the design DNA** that makes AetherLearn recognizable
5. **Support automated development workflows** with structured design instructions

### What It Intends to Preserve

The system preserves:

- The blue-navy color palette with OKLCH color space
- Cormorant Garamond display typography with Inter UI
- Subtle, refined aesthetic
- Light/dark theme support
- Custom theme capability (MonkeyType integration)
- Rounded corner geometry (0.75rem)
- Clean, minimal interface
- High contrast readability
- Generous spacing rhythm

### How It Should Be Used

**When implementing AetherLearn visuals:**
1. Reference exact tokens from the Design Tokens section
2. Follow component rules from the Components section
3. Apply layout patterns from the Layout section
4. Use motion rules from the Motion section
5. Respect responsive behavior from the Responsive Design section

**When creating something new:**
1. Reuse the closest existing AetherLearn pattern
2. Use documented tokens for colors, spacing, typography
3. Follow the component behavior rules
4. Apply the motion language
5. Perform design review against this specification

### What Is Authoritative

The authority hierarchy is:

1. **Exact design tokens** — CSS custom properties with exact OKLCH values
2. **Component-specific rules** — Dimensions, states, behaviors
3. **Layout and interaction rules** — Grids, spacing, responsive patterns
4. **General design principles** — Overall philosophy
5. **Reasonable judgment** — Only when genuinely unspecified

When a rule is documented here, follow it. Do not invent competing values.

### Separating Design Rules from Project Content

This system documents **design rules**, not AetherLearn-specific content:

- It describes "how a button looks" not "the AetherLearn homepage has these specific buttons"
- It documents "the color palette" not "subjects use specific colors"
- It explains "the component patterns" not "the specific flashcard implementation"

This separation allows the visual language to be reused in projects with completely different content, features, and purpose.

---

## 2. Design Philosophy

### Overall Visual Philosophy

AetherLearn creates a clean, refined educational interface that feels academic yet modern. The design balances functionality with visual elegance.

**Key characteristics:**
- Blue-navy color palette with OKLCH color space
- Cormorant Garamond for display, Inter for UI
- Light/dark theme support
- Custom theme capability
- Subtle animations
- High contrast for readability
- Generous spacing rhythm
- Rounded corners (0.75rem)

### Visual Mood

The interface feels:
- **Academic** — Cormorant Garamond display font
- **Clean** — Minimal, uncluttered design
- **Modern** — OKLCH color space, modern CSS
- **Professional** — Consistent patterns
- **Focused** — High contrast and clear hierarchy

### Hierarchy

Visual hierarchy is established through:

1. **Size** — Large display typography for headings
2. **Color** — OKLCH foreground colors with varying lightness
3. **Font** — Cormorant Garamond for headings, Inter for UI
4. **Spacing** — Generous margins between sections
5. **Weight** — Font weights (400, 500, 600, 700)

### Density

The interface is **spacious, not cramped**:
- Cards have generous padding
- Grid gaps are substantial
- Section margins are large
- Content has room to breathe
- Not cluttered despite rich functionality

### Spacing Philosophy

Spacing is intentional and consistent:
- Follows Tailwind's spacing scale
- Generous margins create visual separation
- Consistent gaps create rhythm
- Whitespace is a design element, not empty space
- Never compress spacing to fit more content

### Surface Philosophy

All interactive surfaces use:
- Solid backgrounds (no glassmorphism)
- Subtle borders
- Rounded corners (0.75rem)
- Hover states with color changes
- Focus states with outline

### Interaction Philosophy

Interactions are subtle and responsive:
- Hover: color change, background change
- Active: minimal scale or color shift
- Focus: visible outline for keyboard navigation
- Loading: skeleton screens with shimmer animation
- Reduced motion: respects user preferences

### Restraint vs Decoration

The design uses decoration **strategically**:
- No starfield or animated backgrounds
- No glassmorphism effects
- No gradients (except for specific use cases)
- Clean, solid colors
- Icons used functionally
- Skeleton loaders for loading states

Decoration serves the design, it doesn't overpower it.

### Principles Behind Visual Decisions

**Why OKLCH color space?**
- Perceptually uniform color space
- Better color manipulation
- Modern CSS standard
- Consistent appearance across displays

**Why Cormorant Garamond?**
- Academic, scholarly feel
- Elegant display typography
- Readable at large sizes
- Matches educational context

**Why Inter?**
- Clean, modern UI font
- Excellent readability
- Wide weight range
- Optimized for screens

**Why rounded corners (0.75rem)?**
- Friendly, approachable
- Modern aesthetic
- Consistent throughout
- Not too rounded, not too sharp

**Why light/dark themes?**
- User preference support
- Accessibility
- Different contexts (day/night)
- Custom theme capability

---

## 3. Design Tokens

### CSS Custom Properties

The following CSS custom properties define the complete AetherLearn token system. These are the authoritative values that should be used in any implementation.

```css
:root {
  /* === RADIUS === */
  --radius: 0.75rem;

  /* === LIGHT THEME === */
  --background: oklch(0.965 0.011 259);
  --foreground: oklch(0.176 0.031 265);
  --card: oklch(0.965 0.011 259);
  --card-foreground: oklch(0.176 0.031 265);
  --popover: oklch(0.965 0.011 259);
  --popover-foreground: oklch(0.176 0.031 265);
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
  --sidebar: oklch(0.966 0.006 247);
  --sidebar-foreground: oklch(0.176 0.031 265);
  --sidebar-primary: oklch(0.176 0.031 265);
  --sidebar-primary-foreground: oklch(0.98 0.005 250);
  --sidebar-accent: oklch(0.966 0.006 247);
  --sidebar-accent-foreground: oklch(0.176 0.031 265);
  --sidebar-border: oklch(0.85 0.012 258);
  --sidebar-ring: oklch(0.573 0.032 254);
}

.dark {
  /* === DARK THEME === */
  --background: oklch(0.176 0.031 265);
  --foreground: oklch(0.981 0.003 247);
  --card: oklch(0.176 0.031 265);
  --card-foreground: oklch(0.981 0.003 247);
  --popover: oklch(0.176 0.031 265);
  --popover-foreground: oklch(0.981 0.003 247);
  --primary: oklch(0.981 0.003 247);
  --primary-foreground: oklch(0.176 0.031 265);
  --secondary: oklch(0.297 0.032 261);
  --secondary-foreground: oklch(0.981 0.003 247);
  --muted: oklch(0.297 0.032 261);
  --muted-foreground: oklch(0.712 0.031 254);
  --accent: oklch(0.297 0.032 261);
  --accent-foreground: oklch(0.981 0.003 247);
  --destructive: oklch(0.577 0.222 27.3);
  --destructive-foreground: oklch(0.981 0.003 247);
  --success: oklch(0.596 0.16 149);
  --warning: oklch(0.652 0.152 62);
  --streak: oklch(0.755 0.153 51);
  --border: oklch(0.297 0.032 261);
  --input: oklch(0.297 0.032 261);
  --ring: oklch(0.437 0.03 261);
  --sidebar: oklch(0.176 0.031 265);
  --sidebar-foreground: oklch(0.981 0.003 247);
  --sidebar-primary: oklch(0.981 0.003 247);
  --sidebar-primary-foreground: oklch(0.176 0.031 265);
  --sidebar-accent: oklch(0.297 0.032 261);
  --sidebar-accent-foreground: oklch(0.981 0.003 247);
  --sidebar-border: oklch(0.297 0.032 261);
  --sidebar-ring: oklch(0.437 0.03 261);
}
```

### Custom Theme Support

For MonkeyType theme integration, custom themes are applied via data-theme attribute:

```css
[data-theme="custom"] {
  --background: var(--theme-background);
  --foreground: var(--theme-text);
  --card: var(--theme-background);
  --card-foreground: var(--theme-text);
  --primary: var(--theme-main);
  --primary-foreground: var(--theme-text);
  --secondary: var(--theme-shade-secondary);
  --muted: var(--theme-shade-secondary);
  --muted-foreground: var(--theme-shade-primary);
  --border: var(--theme-shade-primary);
  --input: var(--theme-shade-primary);
  --ring: var(--theme-shade-primary);
}
```

### Theme Picker Implementation

AetherLearn includes a theme picker with 80+ custom themes from the MonkeyType theme library.

**Features:**
- 80+ themes (Aether, 8008, 9009, 80s After Dark, Dracula, Catppuccin, etc.)
- Light/dark mode switching for supported themes
- Search functionality
- Preview on hover
- Local storage persistence
- Automatic theme application to CSS custom properties

**HTML:**
```html
<!-- Theme picker is auto-injected by the script -->
<!-- Button appears in top-right corner -->
```

**JavaScript Implementation (Exact):**

The complete theme picker is implemented in `aether-theme-picker.js`. Key configuration:

```javascript
const CONFIG = {
    storageKey: 'aether-selected-theme',
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left
    zIndex: '2147483646', // One less than banner
    showThemePicker: true,
    defaultTheme: 'aether',
};

// Theme structure
const THEMES = [
    {
        id: 'aether',
        name: 'Aether',
        supportsModeSwitching: true,
        isDefault: true,
        colors: {
            background: '#f5f5f5',
            main: '#1a1a2e',
            text: '#1a1a2e',
            shadePrimary: '#e0e0e0',
            shadeSecondary: '#d0d0d0',
        },
    },
    // ... 80+ additional themes
];

// Theme application
function applyTheme(theme, save = false) {
    const root = document.documentElement;
    const colors = theme.colors;

    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-main', colors.main);

    const textColor = getContrastColor(colors.background);
    root.style.setProperty('--theme-text', textColor);

    const primaryForeground = getPrimaryForeground(colors.main);
    root.style.setProperty('--primary-foreground', primaryForeground);

    root.style.setProperty('--theme-shade-primary', colors.shadePrimary);
    root.style.setProperty('--theme-shade-secondary', colors.shadeSecondary);
    root.setAttribute('data-theme', 'custom');

    if (save) {
        localStorage.setItem(CONFIG.storageKey, theme.id);
        currentTheme = theme;
    }
}
```

**Theme Picker Features:**
- Modal with grid of theme swatches
- Search input to filter themes
- Preview theme on hover
- Click to apply theme
- Persist selection to localStorage
- Respects system color scheme
- Smooth transitions between themes

**Complete Implementation File:**
See `aether-theme-picker.js` for the full 3000+ line implementation including:
- All 80+ theme definitions
- Complete UI rendering
- Search functionality
- Preview logic
- Theme application
- Accessibility features

### Aether Banner Implementation

AetherLearn includes a "Powered by Aether" banner that appears in the bottom-right corner.

**Features:**
- Displays Aether logo with "Powered by Aether" text
- Adapts to system color scheme (light/dark)
- Links to aether.com
- Anti-removal protection
- Font preloading for smooth appearance
- High z-index to stay on top

**HTML:**
```html
<!-- Banner is auto-injected by the script -->
<a id="aether-banner" href="https://aether.com" target="_blank" rel="noopener noreferrer">
  <img class="aether-logo" src="https://github.com/Aether-Founder/Aether-Assets/blob/main/aether-logo.png?raw=true" alt="Aether">
  <span class="aether-text">Powered by</span>
  <span class="aether-brand">Aether</span>
</a>
```

**CSS (Inline):**
```css
#aether-banner {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--banner-background);
  color: var(--banner-foreground);
  padding: 10px 16px;
  border-radius: 9999px;
  font-family: 'Cormorant Garamond', Georgia, Cambria, serif;
  font-size: 16px;
  font-weight: 500;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  line-height: 1;
  box-shadow: var(--banner-shadow);
  border: 1px solid var(--banner-border);
  z-index: 2147483647;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
}

.aether-logo {
  width: 19px;
  height: 19px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
  border: none;
  align-self: center;
  margin: 0;
}

.aether-text {
  color: var(--banner-muted);
  font-size: 16px;
  font-family: 'Cormorant Garamond', Georgia, Cambria, serif;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  display: inline;
  margin: 0;
}

.aether-brand {
  color: var(--banner-foreground);
  font-size: 21px;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, Cambria, serif;
  margin-left: 2px;
  line-height: 1;
  display: inline;
  margin: 0;
}
```

**Theme Values:**
```javascript
// Light theme
const lightTheme = {
  background: '#E8EEFD',
  foreground: '#020817',
  muted: '#64748B',
  border: 'rgba(2, 8, 23, 0.18)',
  shadow: '0 4px 20px rgba(2, 8, 23, 0.12)'
};

// Dark theme
const darkTheme = {
  background: '#020817',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
  border: '#1E293B',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
};
```

**JavaScript Implementation (Exact):**

The complete banner is implemented in `aether-banner.js`. Key configuration:

```javascript
const CONFIG = {
    brandName: 'Aether',
    logoUrl: 'https://github.com/Aether-Founder/Aether-Assets/blob/main/aether-logo.png?raw=true',
    text: 'Powered by',
    position: 'bottom-right',
    zIndex: '2147483647' // Maximum z-index to stay on top
};

const FONT_FAMILY = "'Cormorant Garamond', Georgia, Cambria, serif";
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap';

// Theme detection
function getTheme() {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark) {
        return {
            background: '#020817',
            foreground: '#F8FAFC',
            muted: '#94A3B8',
            border: '#1E293B',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        };
    }

    return {
        background: '#E8EEFD',
        foreground: '#020817',
        muted: '#64748B',
        border: 'rgba(2, 8, 23, 0.18)',
        shadow: '0 4px 20px rgba(2, 8, 23, 0.12)'
    };
}

// Font preloading
function loadFontStylesheet() {
    return new Promise(function(resolve) {
        const existing = document.querySelector('link[data-aether-font]');
        if (existing) {
            if (existing.sheet) {
                resolve();
            } else {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', resolve, { once: true });
            }
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        link.setAttribute('data-aether-font', 'true');
        link.addEventListener('load', function() { resolve(); }, { once: true });
        link.addEventListener('error', function() { resolve(); }, { once: true });
        document.head.appendChild(link);
    });
}

// Image preloading
function preloadImage(url) {
    return new Promise(function(resolve) {
        const img = new Image();
        img.onload = function() {
            if (img.decode) {
                img.decode().then(resolve).catch(resolve);
            } else {
                resolve();
            }
        };
        img.onerror = function() { resolve(); };
        img.src = url;
    });
}

// System theme change handling
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = function() {
        applyTheme(bannerElement);
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
    }
}
```

**Banner Features:**
- Auto-injected on page load
- Fonts preloaded to prevent FOUC
- Logo preloaded for instant display
- Adapts to system color scheme
- Anti-removal protection (MutationObserver)
- Prevents style manipulation
- Responds to system theme changes
- Maximum z-index (2147483647)

**Complete Implementation File:**
See `aether-banner.js` for the full 389-line implementation including:
- Complete styling logic
- Font and image preloading
- Anti-removal protection
- System theme detection
- MutationObserver for DOM protection
- Accessibility features

### Font Loading

Cormorant Garamond and Inter are loaded from Google Fonts:

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

### Complete Typography Scale

|| Usage | Font | Size | Weight | Line Height | Letter Spacing |
||-------|------|------|--------|-------------|----------------|
|| Display h1 | Cormorant Garamond | 2rem | 700 | normal | -0.01em |
|| Display h2 | Cormorant Garamond | 1.5rem | 700 | normal | -0.01em |
|| Display h3 | Cormorant Garamond | 1.25rem | 700 | normal | -0.01em |
|| Stat value | Cormorant Garamond | 1.875rem (3xl) | 600 | 1 (leading-none) | normal |
|| Stat label | Inter | 0.6875rem (11px) | 500 | normal | 0.14em uppercase |
|| Chip text | Inter | 0.8125rem (13px) | 500 | normal | normal |
|| Body text | Inter | 1rem | 400 | 1.5 | normal |
|| Small text | Inter | 0.875rem | 400 | normal | normal |
|| Button text | Inter | 0.875rem | 500 | normal | normal |
|| Input text | Inter | 0.875rem | 400 | normal | normal |

### Complete Spacing Scale

AetherLearn uses Tailwind's default spacing scale. Common values:

|| Value | Usage |
||-------|-------|
|| 0.25rem | Small gaps, button padding |
|| 0.5rem | Icon spacing, small padding |
|| 0.75rem | Card gaps, grid gaps |
|| 1rem | Standard padding, spacing |
|| 1.5rem | Section margins |
|| 2rem | Large spacing |
|| 2.5rem | Section spacing |
|| 3rem | Major section spacing |
|| 4rem | Page margins |
|| 6rem | Hero section |

### Complete Border Radius Scale

|| Value | Name | Usage |
||-------|------|-------|
|| 0.375rem | Small rounded | Code blocks, small elements |
|| 0.5rem | Medium rounded | Buttons, inputs |
|| 0.75rem | Large rounded | Cards, panels (default) |
|| 999px | Pill | Chips, pills |

### Z-Index Layers

|| Value | Usage |
||-------|-------|
|| 20 | Dropdowns, tooltips |
|| 40 | Mobile menu, sidebar |
|| 50 | Modals, overlays |
|| 9999 | Initial loader |

### Motion Durations

|| Value | Usage |
||-------|-------|
|| 150ms | Fast transitions |
|| 200ms | Dropdown fade |
|| 300ms | Standard transitions |
|| 1.2s | Success animation |
|| 1.25s | Skeleton shimmer |
|| 2.4s | Reflection animation |

### Motion Easing

|| Value | Usage |
||-------|-------|
|| ease-in-out | Standard transitions |
|| ease-out | Confetti fall |
|| ease-in-out | Reflection animation |

### Breakpoints

Tailwind default breakpoints:

|| Value | Usage |
||-------|-------|
|| 640px (sm) | Small tablets |
|| 768px (md) | Tablets |
|| 1024px (lg) | Desktop |
|| 1280px (xl) | Large desktop |

---

## 4. Color System

### Background Colors

**Light theme:**
```css
--background: oklch(0.965 0.011 259); /* Light blue-gray */
```

**Dark theme:**
```css
--background: oklch(0.176 0.031 265); /* Dark navy */
```

**Usage:**
- Page background
- Card background
- Surface backgrounds

### Foreground Colors

**Light theme:**
```css
--foreground: oklch(0.176 0.031 265); /* Dark navy text */
--muted-foreground: oklch(0.573 0.032 254); /* Dimmed text */
```

**Dark theme:**
```css
--foreground: oklch(0.981 0.003 247); /* Light text */
--muted-foreground: oklch(0.712 0.031 254); /* Dimmed text */
```

**Usage:**
- Primary text
- Secondary text
- Labels
- Descriptions

### Primary Colors

**Light theme:**
```css
--primary: oklch(0.176 0.031 265); /* Dark navy */
--primary-foreground: oklch(0.98 0.005 250); /* Light text */
```

**Dark theme:**
```css
--primary: oklch(0.981 0.003 247); /* Light */
--primary-foreground: oklch(0.176 0.031 265); /* Dark navy text */
```

**Usage:**
- Primary buttons
- Active states
- Selected items

### Secondary Colors

**Light theme:**
```css
--secondary: oklch(0.966 0.006 247); /* Light blue-gray */
--secondary-foreground: oklch(0.176 0.031 265); /* Dark navy text */
```

**Dark theme:**
```css
--secondary: oklch(0.297 0.032 261); /* Medium navy */
--secondary-foreground: oklch(0.981 0.003 247); /* Light text */
```

**Usage:**
- Secondary buttons
- Hover states
- Subtle backgrounds

### Status Colors

```css
--success: oklch(0.596 0.16 149); /* Green */
--warning: oklch(0.652 0.152 62); /* Orange/yellow */
--destructive: oklch(0.577 0.222 27.3); /* Red */
--streak: oklch(0.755 0.153 51); /* Streak color */
```

**Usage:**
- Success states
- Warning states
- Error/destructive states
- Streak indicators

### Border Colors

**Light theme:**
```css
--border: oklch(0.85 0.012 258); /* Light border */
--input: oklch(0.85 0.012 258); /* Input border */
```

**Dark theme:**
```css
--border: oklch(0.297 0.032 261); /* Dark border */
--input: oklch(0.297 0.032 261); /* Input border */
```

**Usage:**
- All borders
- Input fields
- Separators

### Ring Colors

**Light theme:**
```css
--ring: oklch(0.573 0.032 254); /* Focus ring */
```

**Dark theme:**
```css
--ring: oklch(0.437 0.03 261); /* Focus ring */
```

**Usage:**
- Focus rings
- Ring indicators

### Color Hierarchy

1. **Background** — Deepest layer (light/dark)
2. **Secondary** — Hover states, subtle backgrounds
3. **Primary** — Interactive elements, buttons
4. **Foreground** — Primary text
5. **Muted-foreground** — Secondary text
6. **Border** — Edge definition
7. **Status colors** — Success, warning, destructive

### Contrast Strategy

- High contrast for primary text on backgrounds
- WCAG AA contrast ratios maintained
- OKLCH color space ensures perceptual uniformity
- Custom themes calculate text color based on background luminance

### Interactive State Colors

**Hover:**
- Background: secondary color
- Border: foreground/40
- Text: foreground

**Focus:**
- Ring: ring color
- Border: foreground/40

**Active:**
- Background: primary color
- Text: primary-foreground

---

## 5. Typography

### Font Families

**Display font (canonical):**
```css
--font-display: 'Cormorant Garamond', Georgia, serif;
```

**UI font (canonical):**
```css
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

**Usage:**
- `--font-display`: All headings (h1-h6), display text, large titles, stat values
- `--font-sans`: Body text, UI labels, buttons, navigation, descriptions, chip text

### Heading Hierarchy

**Workspace headings (when not using display font):**
- Font: Inter
- Weight: 700
- Size: 2rem (h1), 1.5rem (h2), 1.25rem (h3)
- Margin: 1.75rem 0 0.75rem

**Workspace headings (with display font):**
- Font: Cormorant Garamond
- Weight: 600
- Letter-spacing: -0.025em

**Rules:**
- Headings prefer Cormorant Garamond
- Font weight 600-700 for emphasis
- Letter-spacing -0.01em for elegance
- Never use system fonts for headings when display font is available

### Body Text

**Body text:**
- Font: Inter
- Size: 1rem
- Weight: 400
- Line height: 1.5
- Color: foreground

**Small text:**
- Font: Inter
- Size: 0.875rem
- Weight: 400
- Color: foreground or muted-foreground

**Rules:**
- UI text always uses Inter
- Font weight 400 for body content
- Font weight 500-600 for interactive elements
- Always use muted-foreground for secondary text

### Text Transformations

**Uppercase with letter-spacing:**
- Stat labels: uppercase with 0.14em letter-spacing
- HUD labels: uppercase with letter-spacing

**Normal case with letter-spacing:**
- Headings: normal case with -0.01em letter-spacing

**Rules:**
- Never uppercase body text or headings
- Uppercase only for labels and badges
- Letter-spacing adds elegance to uppercase text
- Negative letter-spacing for headings

### Letter Spacing

**Display headings:** -0.01em
**Workspace display headings:** -0.025em
**Uppercase labels:** 0.14em
**Normal text:** normal

### Font Weights

**Cormorant Garamond:** 400, 500, 600, 700
**Inter:** 400, 500, 600, 700

**Usage:**
- 400: Body text, normal headings
- 500: Medium emphasis, labels
- 600: Strong emphasis, buttons
- 700: Very strong emphasis, important headings

### Responsive Typography

- Typography scales with Tailwind's responsive utilities
- No specific scaling rules documented
- Use Tailwind's text-size utilities (text-sm, text-base, text-lg, etc.)

---

## 6. Layout

### Page Container

**Canonical implementation:**
- No fixed max-width on main content
- Uses Tailwind's container utilities where needed
- Responsive padding with Tailwind

### Grid System

**Canonical implementation:**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
gap: 0.75rem;
```

**Usage:**
- Page skeleton grid
- Card grids
- Responsive layout

### Content Alignment

- Left-aligned content is standard
- Center alignment for specific components (hero, stats)
- Flexbox for component layouts
- Grid for card layouts

### Max-Widths

- No fixed max-widths documented
- Uses Tailwind's max-width utilities (max-w-md, max-w-lg, etc.)
- Responsive containers where needed

### Section Spacing

- 2.5rem margin-top for skeleton grid
- 1.75rem margin for workspace headings
- 0.75rem margin-bottom for workspace content
- Consistent vertical rhythm

### Content Density

- Generous spacing throughout
- Cards have padding (p-4, p-6)
- Grid gaps of 0.75rem
- Section margins of 2.5rem+
- Not cramped despite rich functionality

### Whitespace Philosophy

- Whitespace is a design element, not empty space
- Generous margins and padding create breathing room
- Spacing is intentional and consistent
- Never compress spacing to fit more content
- Rhythm creates visual harmony

### Positioning Conventions

**Relative:**
- Main content containers
- Page wrappers
- Content sections

**Absolute:**
- Overlays
- Dropdowns
- Tooltips

**Fixed:**
- Initial loader
- Mobile bottom navigation
- Font size indicator

**Sticky:**
- Table of contents (desktop)
- Sidebars

**Rules:**
- Respect z-index layering
- Relative for content flow
- Absolute for overlays
- Fixed for navigation and loaders

---

## 7. Spacing

### Spacing Scale

AetherLearn uses Tailwind's default spacing scale. Common values:

|| Value | Usage | Context |
||-------|-------|---------|
|| 0.25rem | Small gaps | Button padding, chip padding |
|| 0.5rem | Small spacing | Icon spacing, small padding |
|| 0.75rem | Standard gap | Grid gaps, card spacing |
|| 1rem | Standard padding | Card padding, section padding |
|| 1.5rem | Medium spacing | Section margins |
|| 2rem | Large spacing | Section spacing |
|| 2.5rem | Extra large | Page section spacing |
|| 3rem | Major spacing | Major sections |
|| 4rem | Page margins | Page-level spacing |
|| 6rem | Hero spacing | Hero sections |

### Common Padding Values

**Cards:**
- p-4 (1rem): Standard card padding
- p-6 (1.5rem): Large card padding

**Buttons:**
- px-3.5 py-1.5: Chip/button padding
- px-3 py-2: Navigation link padding

**Inputs:**
- px-3 py-2: Standard input padding
- h-9: Input height

**Panels:**
- p-6: Panel padding

### Common Margins

**Between sections:**
- mt-2.5 (2.5rem): Section spacing
- mb-0.75 (0.75rem): Content margin

**Below headings:**
- mb-1 (1rem): Below section headers
- mb-0.75 (0.75rem): Below workspace headings

### Gap Values

**Grid gap:**
- gap-0.75 (0.75rem): Standard grid gap

**Card internal gap:**
- gap-0.5 (0.5rem): Icon to text gap
- gap-4 (1rem): Larger gaps

**Navigation gap:**
- gap-1 (0.25rem): Navigation item gap

### Section Spacing

- Page skeleton grid: mt-2.5 (2.5rem)
- Workspace content: mb-0.75 (0.75rem)
- Workspace headings: 1.75rem 0 0.75rem

### Component Internal Spacing

**Card:**
- p-4 or p-6 padding
- Internal gap-0.5 or gap-4

**Chip/Button:**
- px-3.5 py-1.5 padding

**Button:**
- px-3 py-2 padding

### Grid Gaps

- Standard grid: gap-0.75 (0.75rem)
- Page skeleton: gap-0.75 (0.75rem)

### Navigation Spacing

- Navigation links: gap-1 (0.25rem)
- Navigation padding: px-3 py-2

### Mobile Spacing

- Touch targets: min-h-44px (44px minimum)
- Safe areas: padding-bottom max(1rem, env(safe-area-inset-bottom))

### Spacing Rules

- Follow Tailwind's spacing scale
- Do not invent arbitrary spacing values
- Use the closest Tailwind utility when uncertain
- Consistent spacing creates rhythm
- Generous spacing is intentional

---

## 8. Shapes and Geometry

### Border Radius Scale

**Canonical values:**
```css
--radius: 0.75rem; /* Default rounded */
```

**Tailwind utilities:**
- rounded-md: 0.375rem (6px)
- rounded: 0.5rem (8px)
- rounded-lg: 0.75rem (12px) — Default
- rounded-full: 999px — Pill

**Usage:**
- rounded-md: Code blocks, small elements
- rounded: Buttons, inputs
- rounded-lg: Cards, panels (default)
- rounded-full: Chips, pills, circular elements

### Corner Styles

**Pill (rounded-full):**
- Chips
- Pills
- Circular buttons
- Round buttons

**Rounded (rounded-lg):**
- Cards
- Panels
- Modals
- Containers

**Medium rounded (rounded):**
- Buttons
- Inputs
- Interactive elements

**Small rounded (rounded-md):**
- Code blocks
- Small elements

**Rules:**
- No sharp corners in the design
- All shapes are symmetric
- Consistent rounding across all elements
- Default is rounded-lg (0.75rem)

### Border Thickness

- Default borders: 1px solid
- No borders thicker than 1px
- Border color always from --border or --input
- Borders are subtle, not prominent

### Divider Styles

**Standard border:**
```css
border-b border-border
```

**Usage:**
- Horizontal dividers
- Section separators
- Card separators
- No vertical dividers unless necessary

### Pills

**Canonical implementation:**
```css
rounded-full border px-3.5 py-1.5
```

**Used for:**
- Chips
- Pills
- Filter buttons
- Category selectors

**Rules:**
- Always with border
- Always with hover state
- rounded-full for pill shape

### Circular Elements

**Round buttons:**
- rounded-full
- Fixed or auto dimensions

**Rules:**
- Perfectly circular for round buttons
- rounded-full for pills

### Square vs Rounded Controls

- Most controls are rounded (rounded-lg or rounded)
- Pills use rounded-full
- No square controls
- No sharp corners anywhere

### Asymmetric Shapes

- Not used in current implementation
- All shapes are symmetric
- Consistent rounding across all elements

### Shape Hierarchy

1. **Pill (rounded-full)** — Chips, pills, round buttons
2. **Rounded-lg (0.75rem)** — Cards, panels, containers (default)
3. **Rounded (0.5rem)** — Buttons, inputs
4. **Rounded-md (0.375rem)** — Small elements, code blocks

**Rules:**
- Respect the hierarchy
- Use appropriate radius for element size
- Consistent rounding creates harmony
- Default is rounded-lg

---

## 9. Elevation and Depth

### Box Shadows

**Dropdown shadow:**
```css
shadow-xl
```

**Usage:**
- Dropdowns
- Popovers
- Floating elements

**Button shadow:**
- No shadows on buttons
- Use border and background for depth

**Rules:**
- Shadows are minimal
- Used only for floating elements
- No shadows on cards or panels
- Border provides edge definition

### Shadow Strength

**Subtle:**
- Used for dropdowns
- Value: shadow-xl

**Rules:**
- No strong shadows
- Consistent shadow strength
- Minimal shadow usage

### Blur

**Backdrop blur:**
- Used for mobile menu: backdrop-blur-sm
- Used for mobile menu overlay: bg-background/80

**Rules:**
- Blur only for overlays
- Minimal blur values
- Not used for glassmorphism

### Surface Layering

**Z-index hierarchy:**
```
20: Dropdowns, tooltips
40: Mobile menu, sidebar
50: Modals, overlays
9999: Initial loader
```

**Usage:**
- Overlays at z-50
- Navigation at z-40
- Dropdowns at z-20
- Initial loader at z-9999
- Always respect this layering

### Borders Used Instead of Shadows

- Borders are always used for edge definition
- 1px border from --border or --input
- Border strengthens on hover
- Shadows only for floating elements

### Background Contrast

**Light theme:**
- Background: oklch(0.965 0.011 259) — Light
- Foreground: oklch(0.176 0.031 265) — Dark
- High contrast

**Dark theme:**
- Background: oklch(0.176 0.031 265) — Dark
- Foreground: oklch(0.981 0.003 247) — Light
- High contrast

**Rules:**
- Always use solid backgrounds
- No transparency for main surfaces
- High contrast maintained
- Custom themes calculate contrast

### Transparency

**Overlays:**
- Mobile menu: bg-background/80 (80% opacity)
- Backdrop blur: backdrop-blur-sm

**Rules:**
- Transparency only for overlays
- No transparency for main surfaces
- Blur with transparency for depth

---

## 10. Components

### Chip/Button

**Purpose:**
Filter buttons, category selectors, pills.

**Canonical implementation:**
```css
rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors
```

**Active state:**
```css
border-foreground bg-foreground text-background
```

**Inactive state:**
```css
border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground
```

**States:**
- Active: Solid background, inverted text
- Inactive: Border only, dimmed text
- Hover: Border brightens, text brightens

### Search Field

**Purpose:**
Search input for content.

**Canonical implementation:**
```css
relative h-9 w-full rounded-md border border-input bg-background px-3
```

**Icon:**
```css
absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground
```

**Input:**
```css
h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

**States:**
- Default: border-border
- Focus: border-foreground/40
- Placeholder: text-muted-foreground

### Flashcard

**Purpose:**
Expandable flashcard component.

**Canonical implementation:**
```css
border-b border-border
```

**Header:**
```css
w-full flex items-start gap-4 p-6 text-left cursor-pointer
```

**Question:**
```css
font-serif text-lg leading-relaxed text-foreground
```

**Answer:**
```css
font-serif text-base leading-relaxed text-muted-foreground
```

**States:**
- Collapsed: Show question only
- Expanded: Show question and answer
- Hover: Cursor pointer
- Focus: Outline

### Button

**Purpose:**
Primary and secondary actions.

**Variants:**
- Default (primary): bg-primary text-primary-foreground
- Outline: border border-border bg-background

**States:**
- Hover: color change
- Focus: ring
- Active: scale or color shift

### Card

**Purpose:**
Content container.

**Canonical implementation:**
```css
border border-border bg-background rounded-lg
```

**Padding:**
- p-4: Standard
- p-6: Large

**States:**
- Hover: No hover on cards (content-based)
- Focus: Outline on interactive elements

### Dropdown

**Purpose:**
Menu dropdown.

**Canonical implementation:**
```css
absolute left-0 top-full z-40 mt-2 w-52 rounded-md border border-border bg-background p-1 shadow-xl
```

**Transition:**
```css
opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
```

**Item:**
```css
rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground
```

**States:**
- Hidden: opacity-0 invisible
- Visible: opacity-100 visible
- Item hover: bg-secondary

### Skeleton

**Purpose:**
Loading placeholder.

**Canonical implementation:**
```css
relative overflow-hidden
```

**Shimmer:**
```css
background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 8%, transparent), transparent)
transform: translateX(-100%)
animation: subject-shimmer 1.25s infinite
```

**States:**
- Loading: Shimmer animation
- Loaded: Replaced with content

---

## 11. Navigation

### Topbar

**Structure:**
- Logo/brand (left)
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

### Mobile Navigation

**Mobile Bottom Nav:**
- Fixed at bottom
- Icon-based
- Active state indicator

**Mobile Menu:**
- Full-screen overlay
- Slide-in panel
- Backdrop blur

### Navigation Hierarchy

**Primary:**
- Home
- Subjects
- Calendar
- Stats

**Secondary:**
- More menu (dropdown)
- Settings
- Profile

---

## 12. Forms and Inputs

### Input Field Pattern

**Structure:**
1. Label (optional)
2. Input field
3. Helper text (optional)
4. Error message (optional)

**Input field:**
```css
h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40
```

**Label:**
- Small text
- muted-foreground color
- Spacing below input

### Button Pattern

**Primary button:**
```css
bg-primary text-primary-foreground rounded-md
```

**Outline button:**
```css
border border-border bg-background rounded-md
```

**States:**
- Hover: color change
- Focus: ring
- Active: scale

---

## 13. Feedback and State Design

### Success

**Color:** success (oklch(0.596 0.16 149))
**Usage:** Success messages, completion states
**Indicator:** Green background tint with success text

### Warning

**Color:** warning (oklch(0.652 0.152 62))
**Usage:** Warning messages, caution states
**Indicator:** Orange/yellow background tint with warning text

### Error/Destructive

**Color:** destructive (oklch(0.577 0.222 27.3))
**Usage:** Error messages, destructive actions
**Indicator:** Red color

### Information

**Color:** primary or accent
**Usage:** Info messages, hints
**Indicator:** Primary color

### Loading

**Skeleton screens**
- Shimmer animation
- 1.25s duration
- Linear gradient shimmer

### Empty

**Centered text**
- muted-foreground color
- No decoration

### Selected

**Chip active state:**
- bg-foreground text-background
- Inverted colors

### Disabled

**Not extensively used**
- Could use opacity
- Could use muted-foreground

### Active

**Chip active:**
- Solid background
- Inverted text

### Focus

**Focus ring:**
- ring color
- border-foreground/40

---

## 14. Responsive Design

### Breakpoints

Tailwind default breakpoints:

- sm: 640px (small tablets)
- md: 768px (tablets)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)

### Desktop (Above 1024px)

**Layout:**
- Full grid layout
- Sidebars visible
- Desktop navigation

**Typography:**
- Full heading sizes
- Full body text sizes

**Components:**
- All spacing full value
- All features visible

### Tablet (768px - 1024px)

**Layout:**
- Adjusted grid
- Sidebars may collapse
- Responsive navigation

**Typography:**
- Full heading sizes
- Full body text sizes

**Components:**
- All spacing full value
- Some features may stack

### Mobile (Below 768px)

**Layout:**
- Single column
- Bottom navigation
- Mobile menu
- Sidebars hidden

**Typography:**
- Full heading sizes
- Full body text sizes

**Components:**
- Full width on mobile
- Touch targets: min-h-44px
- Safe areas for notched phones

### Specific Responsive Rules

**Touch targets:**
```css
@media (max-width: 768px) {
  button, a, input, select, textarea {
    min-height: 44px;
  }
}
```

**Safe areas:**
```css
.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

**Hide on mobile:**
- lg:hidden: Hidden on mobile, visible on desktop
- lg:block: Block on desktop, hidden on mobile

---

## 15. Iconography

### Icon Library

**Primary library:** Lucide React

**Icon style:**
- Stroke-based
- 1.5-2px stroke width
- Rounded line caps
- Standard sizes: h-4 w-4, h-5 w-5, h-6 w-6

### Icon Sizes

**Small:** h-3.5 w-3.5 (14px)
**Standard:** h-4 w-4 (16px)
**Medium:** h-5 w-5 (20px)
**Large:** h-6 w-6 (24px)

### Icon Colors

**Default:** text-muted-foreground
**Active:** text-foreground
**Hover:** text-foreground
**Custom:** Category-specific colors (if used)

### Icon Usage

**Navigation:** h-3.5 w-3.5
**Buttons:** h-4 w-4
**Cards:** h-5 w-5
**Section headers:** h-5 w-5

---

## 16. Motion

### Overview

AetherLearn motion is subtle and functional. The motion language is defined by specific durations, easing functions, and transitions.

### Durations

**Hover duration:** 150-200ms
**Dropdown fade:** 200ms
**Success animation:** 1.2s
**Skeleton shimmer:** 1.25s
**Reflection animation:** 2.4s

### Easing

**Standard:** ease-in-out
**Dropdown:** ease-in-out
**Confetti:** ease-in
**Reflection:** ease-in-out

### Transitions

**Hover:**
```css
transition-colors
```

**Dropdown:**
```css
transition-all duration-200
```

### Animations

**Skeleton shimmer:**
```css
@keyframes subject-shimmer {
  to {
    transform: translateX(100%);
  }
}
```

**Success flash:**
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

**Confetti fall:**
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

**Reflection:**
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

### Reduced Motion

**Not explicitly implemented**
- Should be added for accessibility
- Disable animations when prefers-reduced-motion

---

## 17. Accessibility

### Focus Visibility

**Canonical implementation:**
```css
focus:outline-none
focus-visible:ring-2 ring-ring ring-offset-2
```

**Applied to:**
- All interactive elements
- Buttons
- Inputs
- Links

### Contrast

**WCAG AA compliant:**
- High contrast in both light and dark themes
- OKLCH color space ensures perceptual uniformity
- Custom themes calculate text color based on background luminance

### Touch Targets

**Minimum height:** 44px

**Implementation:**
```css
@media (max-width: 768px) {
  button, a, input, select, textarea {
    min-height: 44px;
  }
}
```

### Keyboard Navigation

- Logical tab order
- All interactive elements keyboard-accessible
- Focus-visible outlines
- Enter/Space for buttons
- Escape for modals

### Non-Color State Communication

**Hover state uses:**
- Background color change
- Border color change
- Text color change

**Focus state uses:**
- Ring outline
- Border color change

### Text Readability

**Minimum body text:** 0.875rem (14px)
**Recommended:** 1rem (16px)

**Line heights:**
- Body: 1.5
- Headings: normal

### Font Families

**Display font:** Cormorant Garamond
**UI font:** Inter

**Why system fonts:**
- Inter is loaded but system-ui fallback included
- Optimized for readability
- Native feel on each platform

### Reduced Motion

**Not explicitly implemented**
- Should be added
- Disable animations when prefers-reduced-motion

---

## 18. Design Principles

### Core Principles

1. **Academic yet modern** — Cormorant Garamond with Inter
2. **Clean and minimal** — No unnecessary decoration
3. **High contrast** — Readable in all themes
4. **Generous spacing** — Room to breathe
5. **Consistent patterns** — Reusable components
6. **Theme support** — Light/dark/custom
7. **Accessible** — WCAG AA compliant

### Do / Don't Rules

**Do:**
- Use Cormorant Garamond for headings
- Use Inter for UI text
- Use OKLCH color space
- Use rounded-lg (0.75rem) for cards
- Use Tailwind spacing scale
- Respect light/dark themes
- Implement focus states
- Ensure touch targets are 44px minimum

**Don't:**
- Use glassmorphism
- Use gradients for backgrounds
- Use arbitrary colors
- Use sharp corners
- Use starfield or animated backgrounds
- Skip focus states
- Compress spacing
- Use inconsistent rounding

### New-Page Construction Rules

When building a new page:

1. Use Cormorant Garamond for headings
2. Use Inter for body text
3. Use rounded-lg for cards
4. Use border-border for borders
5. Use bg-background for backgrounds
6. Use text-foreground for primary text
7. Use text-muted-foreground for secondary text
8. Implement focus states
9. Ensure responsive behavior
10. Test in both light and dark themes

### Design-Token Priority

1. **Exact design tokens** — CSS custom properties (authoritative)
2. **Component-specific rules** — Dimensions, states, behaviors
3. **Layout and interaction rules** — Grids, spacing, responsive patterns
4. **General design principles** — Overall philosophy
5. **Reasonable judgment** — Last resort

---

## 19. Handling Unspecified Decisions

### Decision Framework

When DESIGN.md doesn't specify something:

1. **Reuse the closest existing AetherLearn pattern**
2. **Reuse an existing semantic token**
3. **Reuse the existing spacing/radius/type scale**
4. **Prefer consistency over novelty**
5. **Introduce new only when necessary**
6. **Document genuinely new reusable patterns**

### Examples

**Unspecified button size:**
- Use px-3 py-2 (standard button padding)
- Don't invent new padding

**Unspecified color for a new state:**
- Use primary, secondary, or muted-foreground
- Don't introduce new OKLCH values

**Unspecified spacing:**
- Use Tailwind spacing scale (p-4, p-6, gap-4, etc.)
- Don't invent arbitrary rem values

**Unspecified component:**
- Adapt the closest existing component pattern
- Apply rounded-lg, border-border, bg-background
- Don't create from scratch

---

## 20. Design Drift

### Common Drift Patterns

- Arbitrary new colors (not OKLCH)
- Inconsistent radius (not 0.75rem)
- Random shadows
- Excessive borders
- Generic typography (not Cormorant/Inter)
- Inconsistent spacing
- Missing focus states
- No theme support
- Wrong border colors

### Warnings

**Do not:**
- Introduce arbitrary hex colors
- Use inconsistent border radius
- Skip focus states
- Ignore theme support
- Use generic fonts
- Compress spacing
- Add unnecessary decoration

---

## 21. Source of Truth

### Hierarchy

1. **Existing AetherLearn implementation**
2. **Observed design system**
3. **DESIGN.md**
4. **Supporting references**
5. **Future implementation**

### Maintenance

When AetherLearn UI is intentionally changed:
1. Update DESIGN.md
2. Update relevant reference documents
3. Update implementation notes
4. Version if necessary

---

## 22. Maintenance Model

### Adding a New Token

1. Add to CSS custom properties in globals.css
2. Update DESIGN.md Design Tokens section
3. Add to Tailwind config if needed
4. Document usage

### Changing a Token

1. Update CSS custom properties
2. Update DESIGN.md
3. Search and replace usage
4. Test thoroughly

### Adding a New Component

1. Follow existing patterns
2. Use documented tokens
3. Implement states
4. Add to DESIGN.md Components section
5. Add to components.md reference

### Adding Motion

1. Use documented durations
2. Use documented easing
3. Respect reduced motion
4. Add to motion.md reference

### Approving a New Library

1. Check if existing solution works
2. Check if project already has similar library
3. Verify library fits AetherLearn philosophy
4. Consider performance impact
5. Document in libraries.md

---

## 23. Implementation References

### File Locations

**app/globals.css**
- CSS custom properties
- Base styles
- Animations
- Theme variables

**tailwind.config.ts**
- Tailwind configuration
- Color mapping
- Font configuration

**app/layout.tsx**
- Font loading
- Theme initialization script
- Metadata

**components/AppShell.tsx**
- Navigation components
- Search field
- Dropdowns

**components/Flashcard.tsx**
- Flashcard component
- Expand/collapse behavior

**components/ButtonSection.tsx**
- Button components
- Button variants

---

## 24. Distinctive Details

### What Makes AetherLearn Unique

1. **OKLCH color space** — Modern, perceptually uniform colors
2. **Cormorant Garamond** — Academic display typography
3. **Light/dark/custom themes** — Extensive theme support
4. **MonkeyType integration** — Custom theme capability
5. **Clean, minimal aesthetic** — No unnecessary decoration
6. **Academic context** — Designed for learning
7. **Rounded corners (0.75rem)** — Consistent geometry
8. **High contrast** — Readable in all themes
9. **Tailwind CSS** — Utility-first approach
10. **shadcn/ui** — Component library foundation

### Signature Elements

- Cormorant Garamond headings
- Inter body text
- OKLCH blue-navy palette
- rounded-lg (0.75rem) corners
- Light/dark theme toggle
- Custom theme support
- Skeleton loading states
- Clean borders
- Subtle animations
- Generous spacing
