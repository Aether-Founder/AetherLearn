# Aether Theme Picker

A comprehensive, standalone JavaScript theme picker that can be added to any HTML file with a single script tag. Features 100+ pre-built themes and dark/light mode switching.

## Features

- ✅ **100+ Pre-built Themes**: Extensive collection from MonkeyType and popular color schemes
- ✅ **Dark/Light Mode Toggle**: Automatic mode switching for compatible themes
- ✅ **Persistent Selection**: Theme preferences saved via localStorage
- ✅ **Automatic Contrast**: Smart text color calculation for readability
- ✅ **Easy Integration**: Single script tag addition to any HTML file
- ✅ **Customizable Position**: Configurable placement (top-right, top-left, etc.)
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Programmatic API**: Full JavaScript API for advanced control
- ✅ **CSS Variable Support**: Uses CSS custom properties for theming
- ✅ **No Dependencies**: Pure vanilla JavaScript, no external libraries

## Installation

Add this script tag before the closing `</body>` tag in any HTML file:

```html
<script src="https://your-domain.com/aether-theme-picker.js"></script>
```

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        /* Define your CSS variables */
        :root {
            --background: #f5f5f5;
            --foreground: #020817;
            --primary: #3b82f6;
            --primary-foreground: #ffffff;
            --border: rgba(2, 8, 23, 0.1);
            --muted-foreground: #64748b;
        }

        /* Dark mode styles */
        .dark {
            --background: #020817;
            --foreground: #f8fafc;
            --primary: #3b82f6;
            --primary-foreground: #ffffff;
            --border: rgba(248, 250, 252, 0.1);
            --muted-foreground: #94a3b8;
        }

        /* Custom theme styles */
        [data-theme="custom"] {
            --background: var(--theme-background, #f5f5f5);
            --foreground: var(--theme-text, #020817);
            --primary: var(--theme-main, #3b82f6);
            --primary-foreground: var(--primary-foreground, #ffffff);
            --border: var(--theme-shade-secondary, rgba(2, 8, 23, 0.1));
            --muted-foreground: var(--theme-shade-primary, #64748b);
        }

        body {
            background: var(--background);
            color: var(--foreground);
            transition: background 0.3s, color 0.3s;
        }
    </style>
</head>
<body>
    <h1>My Themed Page</h1>
    <p>This page will use the Aether theme picker!</p>
    
    <script src="aether-theme-picker.js"></script>
</body>
</html>
```

## Configuration

You can customize the theme picker by modifying the `CONFIG` object in the JavaScript file:

```javascript
const CONFIG = {
    storageKey: 'aether-selected-theme',      // localStorage key for theme
    darkModeKey: 'aether-dark-mode',           // localStorage key for dark mode
    position: 'top-right',                     // picker position
    zIndex: '2147483646',                      // z-index for picker
    showThemePicker: true,                     // show/hide theme picker
    showDarkModeToggle: true,                  // show/hide dark mode toggle
    defaultTheme: 'aether',                    // default theme ID
    defaultDarkMode: false,                    // default dark mode state
};
```

### Position Options

- `'top-right'` - Top right corner (default)
- `'top-left'` - Top left corner
- `'bottom-right'` - Bottom right corner
- `'bottom-left'` - Bottom left corner

## CSS Variables

The theme picker sets these CSS variables on the `:root` element:

### Standard Variables
- `--background` - Page background color
- `--foreground` - Main text color
- `--primary` - Primary action color
- `--primary-foreground` - Text color on primary elements
- `--border` - Border color
- `--muted-foreground` - Secondary text color

### Theme-Specific Variables (for custom themes)
- `--theme-background` - Custom theme background
- `--theme-main` - Custom theme primary color
- `--theme-text` - Custom theme text color
- `--theme-shade-primary` - Custom theme shade primary
- `--theme-shade-secondary` - Custom theme shade secondary
- `--primary-foreground` - Calculated foreground for primary elements

## JavaScript API

The theme picker exposes a global `AetherThemePicker` object for programmatic control:

```javascript
// Set theme by ID
AetherThemePicker.setTheme('dracula');

// Toggle dark mode
AetherThemePicker.toggleDarkMode();

// Set dark mode explicitly
AetherThemePicker.setDarkMode(true);

// Get current theme
const currentTheme = AetherThemePicker.getCurrentTheme();
console.log(currentTheme.name); // "Dracula"

// Check if dark mode is active
const isDark = AetherThemePicker.isDarkMode();

// Access all themes
const allThemes = AetherThemePicker.THEMES;

// Access configuration
const config = AetherThemePicker.CONFIG;
```

## Theme Types

### Aether Theme (Default)
- Supports both dark and light mode switching
- Uses system CSS variables for theming
- Compatible with existing dark/light mode implementations

### Single-Mode Themes
- Fixed color schemes (no dark/light switching)
- Override CSS variables with theme-specific colors
- 100+ themes including popular color schemes

## Available Themes

The theme picker includes themes from these categories:

### Popular Themes
- Dracula, Monokai, Nord, Gruvbox (Dark/Light)
- Solarized (Dark/Light/Osaka)
- VS Code, GitHub, Discord
- Catppuccin, Rose Pine (Dawn/Moon)

### Colorful Themes
- Miami, Vaporwave, Aurora, 80s After Dark
- Cyberpunk, Neon, Matrix
- Strawberry, Peaches, Tangerine

### Minimal Themes
- Paper, Dots, Shadow, Dark
- Light, Modern Ink, Rainbow Trail

### Retro Themes
- SNES, DMG, Game Boy inspired
- 80s After Dark, Retro, Retrocast
- Terminal, Matrix

### And Many More...
- 100+ total themes available
- Regularly updated with new themes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Integration Examples

### With Tailwind CSS
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          primary: 'var(--primary)',
        }
      }
    }
  }
</script>
<script src="aether-theme-picker.js"></script>
```

### With Bootstrap
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  :root {
    --bs-body-bg: var(--background);
    --bs-body-color: var(--foreground);
    --bs-primary: var(--primary);
    --bs-primary-color: var(--primary-foreground);
  }
  
  [data-theme="custom"] {
    --bs-body-bg: var(--theme-background);
    --bs-body-color: var(--theme-text);
    --bs-primary: var(--theme-main);
  }
</style>
<script src="aether-theme-picker.js"></script>
```

### With Custom CSS Framework
```css
/* Your framework variables */
:root {
  --bg-color: var(--background);
  --text-color: var(--foreground);
  --accent-color: var(--primary);
}

.dark {
  --bg-color: #020817;
  --text-color: #f8fafc;
}

[data-theme="custom"] {
  --bg-color: var(--theme-background);
  --text-color: var(--theme-text);
  --accent-color: var(--theme-main);
}
```

## Advanced Usage

### Custom Theme Addition
You can add custom themes by modifying the `THEMES` array in the JavaScript file:

```javascript
const THEMES = [
    // ... existing themes
    {
        id: 'my-custom-theme',
        name: 'My Custom Theme',
        supportsModeSwitching: false,
        colors: {
            background: '#1a1a2e',
            main: '#ff6b6b',
            text: '#ffffff',
            shadePrimary: '#4ecdc4',
            shadeSecondary: '#16213e',
        },
    },
];
```

### Event Listeners
Listen for theme changes:

```javascript
// Since the theme picker uses localStorage, you can listen for storage events
window.addEventListener('storage', (e) => {
    if (e.key === 'aether-selected-theme') {
        console.log('Theme changed to:', e.newValue);
    }
});
```

### Initial Theme Detection
Detect system preference on first load:

```javascript
// In your HTML before the theme picker script
<script>
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    localStorage.setItem('aether-dark-mode', 'true');
  }
</script>
<script src="aether-theme-picker.js"></script>
```

## Deployment

1. Upload `aether-theme-picker.js` to your CDN or hosting service
2. Update the script src URL in your HTML files
3. The theme picker will automatically appear on all pages with the script tag

## File Size

- **Minified**: ~15KB
- **Gzipped**: ~5KB
- **No external dependencies**

## License

This theme picker is part of the Aether project and is available for use in any project.

## Support

For issues, questions, or contributions, please refer to the main Aether project repository.