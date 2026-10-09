# Aether Attribution Banner

A non-removable, sticky attribution banner for "Powered by Aether" branding.

## Features

- ✅ **Non-removable**: Anti-removal protection prevents deletion or hiding
- ✅ **Fixed Position**: Stays at bottom-right corner during scrolling
- ✅ **Maximum Visibility**: Uses maximum z-index to stay on top of all content
- ✅ **Modern Design**: Glassmorphism effect with blur backdrop
- ✅ **Brand Link**: Clickable banner links to Aether website
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Easy Integration**: Single script tag addition

## Installation

Add this script tag before the closing `</body>` tag in any HTML file:

```html
<script src="https://your-domain.com/aether-banner.js"></script>
```

## Configuration

The banner can be customized by modifying the `CONFIG` object in `aether-banner.js`:

```javascript
const CONFIG = {
    brandName: 'Aether',
    logoText: '⚡', // Lightning bolt as Aether symbol
    text: 'Powered by',
    position: 'bottom-right',
    backgroundColor: 'rgba(10, 10, 20, 0.95)',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    zIndex: '2147483647', // Maximum z-index
    size: 'medium'
};
```

## Anti-Removal Features

The banner includes multiple layers of protection:

1. **Mutation Observers**: Detects and prevents style/class changes
2. **DOM Monitoring**: Re-adds banner if removed from DOM
3. **Event Prevention**: Blocks right-click, drag, and deletion attempts
4. **Override Protection**: Prevents JavaScript removal methods

## Demo

Open `aether-banner-demo.html` to see the banner in action.

## Deployment

1. Upload `aether-banner.js` to your CDN or hosting service
2. Update the script src URL in your HTML files
3. The banner will automatically appear on all pages with the script tag

## Customization Options

### Colors
- `backgroundColor`: Banner background color
- `textColor`: Main text color
- `accentColor`: Logo and accent color

### Position
- Currently fixed to `bottom-right`
- Can be modified to other positions by changing CSS

### Size
- `size`: 'small', 'medium', or 'large'
- Adjusts padding and font sizes accordingly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This banner script is for Aether branding and attribution purposes.