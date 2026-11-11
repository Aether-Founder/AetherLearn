# Book Cover Examples

This directory contains HTML examples for book covers for each genre/topic.

## Genre Examples

| Genre | HTML File | Color (oklch) |
|-------|-----------|---------------|
| Self-Improvement | `self-improvement.html` | `oklch(0.65 0.12 240)` |
| Psychology | `psychology.html` | `oklch(0.55 0.15 250)` |
| Business | `business.html` | `oklch(0.60 0.14 245)` |
| Productivity | `productivity.html` | `oklch(0.68 0.11 235)` |
| History | `history.html` | `oklch(0.58 0.13 255)` |
| Science | `science.html` | `oklch(0.62 0.12 248)` |
| Health | `health.html` | `oklch(0.66 0.10 242)` |
| Finance | `finance.html` | `oklch(0.64 0.13 240)` |
| Technology | `technology.html` | `oklch(0.70 0.09 230)` |
| Education | `education.html` | `oklch(0.72 0.08 238)` |

## How to Use

1. Open the HTML file for your book's genre in a browser
2. Copy the inner HTML from the `div` element
3. Replace the placeholder text with your book's title, author, and tagline
4. Paste into your `book.json` file's `cover.html` field

## Example Usage

For a self-improvement book:

```json
{
  "topic": "self-improvement",
  "cover": {
    "type": "html",
    "html": "<div style=\"width: 100%; height: 100%; background: oklch(0.65 0.12 240); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1rem; color: white; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; overflow: hidden;\"><div style=\"font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem; text-align: center; line-height: 1.2;\">Your Book Title</div><div style=\"font-size: 0.875rem; opacity: 0.9; margin-bottom: 1rem;\">Author Name</div><div style=\"width: 40px; height: 3px; background: rgba(255,255,255,0.5); border-radius: 2px;\"></div><div style=\"margin-top: 1rem; font-size: 0.75rem; opacity: 0.8; text-align: center;\">Your tagline<br/>or subtitle</div></div>"
  }
}
```

## Notes

- All covers use the same layout and typography
- Only the background color changes by genre
- Covers are 3:4 aspect ratio (300x400px in examples)
- No gradients, no borders, no shadows in the HTML itself
- All colors are from the Aether blue-navy palette (oklch hue 230-260)
