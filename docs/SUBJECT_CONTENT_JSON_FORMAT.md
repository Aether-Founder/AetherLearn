# Universal Learning Content JSON Format

This documentation describes a **standalone, self-contained JSON format** for creating interactive learning pages. This format is universal and can be used for any subject (mathematics, biology, physics, history, etc.) and any type of content (text, images, diagrams, interactive HTML).

## Purpose

This JSON format is designed to be **completely standalone** - it does not depend on any file paths, directory structures, or external systems. An AI agent can generate a single JSON file based on user input, and that file can be rendered in a web application with full support for:

- **Multi-language content** (English, Dutch, or any other language)
- **Rich text formatting** (Markdown with LaTeX math support)
- **Interactive HTML visuals** (SVG diagrams, charts, animations)
- **Images** (both online URLs and local files)
- **Quiz questions** with multiple choice options
- **Study modes** (explanation, summary, quiz, learn)
- **Export functionality** (transcript, Anki format)

## Use Case

This documentation is intended for **AI agents** that have no prior context about a project or directory access. The typical workflow is:

1. **User provides learning material** (e.g., "Here are my biology notes about cell structure...")
2. **User instructs the AI**: "Format this as a JSON file using this exact documentation..."
3. **AI generates** a single, complete JSON file following this specification
4. **The JSON file** can be loaded into a web application for rendering

---

## JSON Structure Overview

The JSON file contains a single object with the following top-level structure:

```json
{
  "id": "unique-identifier",
  "subject": "Subject Name",
  "siteMetadata": { ... },
  "defaultViewMode": "simple",
  "availableModes": ["simple", "study", "summary", "quiz"],
  "summary": "...",
  "summaryI18n": { ... },
  "summaryContentType": "markdown",
  "buttons": [ ... ],
  "showExportButtons": true,
  "showTranscriptExport": true,
  "showAnkiExport": true,
  "quiz": { ... },
  "sections": [ ... ]
}
```

---

## Complete Field Reference

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the learning page (e.g., "biology-cell-structure") |
| `subject` | string | Yes | Subject name (e.g., "Biology", "Mathematics", "Physics") |
| `siteMetadata` | object | Yes | Page metadata (title, description, etc.) |
| `defaultViewMode` | string | No | Initial view mode: `"simple"`, `"study"`, `"summary"`, or `"quiz"` (default: `"simple"`) |
| `availableModes` | array | No | Which mode tabs to show (default: all modes) |
| `summary` | string | No | Summary content in Markdown format |
| `summaryI18n` | object | No | Translations for summary (see Internationalization section) |
| `summaryContentType` | string | No | `"markdown"` or `"html"` (default: `"markdown"`) |
| `buttons` | array | No | Action buttons (YouTube, external links, etc.) - all buttons are optional and off by default |
| `showExportButtons` | boolean | No | Show export buttons (default: `false`) |
| `showTranscriptExport` | boolean | No | Show transcript export button (default: `false`) |
| `showAnkiExport` | boolean | No | Show Anki export button (default: `false`) |
| `quiz` | object | No | Quiz configuration (see Quiz section) |
| `sections` | array | Yes | Array of learning sections (see Sections section) |

---

### siteMetadata Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Page title (primary language) |
| `titleI18n` | object | No | Title translations (see Internationalization) |
| `description` | string | No | Page subtitle/description |
| `descriptionI18n` | object | No | Description translations |

---

### Sections Array

Each section represents a topic or subtopic within the learning material.

#### Section Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique section identifier (for navigation/anchors) |
| `title` | string | Yes | Section title (primary language) |
| `titleI18n` | object | No | Title translations |
| `goal` | string | No | Learning goal/objective (primary language) |
| `goalI18n` | object | No | Goal translations |
| `contentType` | string | No | `"markdown"`, `"html"`, or `"visual-placeholder"` (default: `"markdown"`) |
| `content` | string | No | Content in Markdown format (if contentType is markdown) |
| `html` | string | No | Raw HTML content (if contentType is html) |
| `visualTag` | string | No | Unique tag for external HTML visual file (if contentType is visual-placeholder) |
| `i18n` | object | No | Translation dictionary for HTML labels (see HTML Visuals section) |
| `questions` | array | No | Practice questions (see Questions section) |

---

### Visual Placeholder Sections

For external HTML visuals stored in separate files, use the `visual-placeholder` content type.

**How it works:**
1. Create a section with `contentType: "visual-placeholder"` and a unique `visualTag` (e.g., `"Visual1-atoms"`)
2. Place this section in the JSON where you want the visual to appear (under the relevant text)
3. Create an HTML file with the exact same name as the visualTag (e.g., `Visual1-atoms.html`)
4. Place the HTML file in a `visuals` folder in the same directory as the JSON file
5. Each subject has its own `visuals` folder

**Directory Structure:**
```
subjects/
  biology/
    cell-structure.json
    visuals/
      Visual1-atoms.html
      Visual2-mitochondria.html
  chemistry/
    atomic-structure.json
    visuals/
      Visual1-orbitals.html
```

**Visual Placeholder Section Example:**
```json
{
  "id": "sec-2",
  "title": "Atomic Structure",
  "contentType": "visual-placeholder",
  "visualTag": "Visual1-atoms"
}
```

**Corresponding HTML File (`visuals/Visual1-atoms.html`):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: var(--font-sans, sans-serif);
      background: var(--background, #fff);
      color: var(--foreground, #000);
    }
    .atom-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    .nucleus {
      width: 40px;
      height: 40px;
      background: var(--primary, #3b82f6);
      border-radius: 50%;
      position: relative;
    }
    .electron {
      width: 10px;
      height: 10px;
      background: var(--foreground, #000);
      border-radius: 50%;
      position: absolute;
      animation: orbit 2s linear infinite;
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
    }
  </style>
</head>
<body>
  <div class="atom-container">
    <div class="nucleus">
      <div class="electron"></div>
    </div>
  </div>
</body>
</html>
```

**Visual HTML File Guidelines:**
- Must be a complete HTML document with `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>`
- Can include inline CSS in `<style>` tags
- Can include inline JavaScript in `<script>` tags
- Can use CSS variables for theme awareness (same as inline HTML content)
- Supports hover effects, animations, and interactivity
- Images can be referenced via URL or relative paths within the visuals folder
- Filename must exactly match the `visualTag` value (case-sensitive)
- One visual per HTML file

**Sandboxed Rendering:**
Visual placeholder HTML files are rendered in a sandboxed iframe:
- **Isolation**: Styles and scripts cannot affect the parent page
- **Interactivity**: Hover effects, clicks, and animations work normally
- **No scrollbar conflicts**: Iframe auto-resizes to fit content
- **Security**: Scripts cannot access parent page data
- **Cross-origin**: Images from any domain are supported

---

### Questions Array

Each section can contain practice questions.

#### Question Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `number` | string | Yes | Question number (e.g., "1", "2", "3") |
| `text` | string | Yes | Question text (primary language) |
| `textI18n` | object | No | Question translations |
| `answer` | string | Yes | Answer text (primary language) |
| `answerI18n` | object | No | Answer translations |

---

### Quiz Object

The quiz object defines multiple-choice quiz questions.

#### Quiz Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questions` | array | Yes | Array of quiz question objects |

#### Quiz Question Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | Question text (primary language) |
| `questionI18n` | object | No | Question translations |
| `options` | array | Yes | Array of answer options (strings) |
| `answer` | string | Yes | Correct answer (must match one of the options) |
| `rationale` | string | No | Explanation for the answer |
| `rationaleI18n` | object | No | Rationale translations |

---

### Buttons Array

Action buttons for external resources (YouTube videos, links, etc.).

#### Button Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | URL to link to |
| `text` | string | Yes | Button label (primary language) |
| `textI18n` | object | No | Button label translations |
| `iconType` | string | No | Icon type: `"youtube"`, `"substack"`, `"external-link"`, `"download"`, `"file"`, `"card"` |
| `variant` | string | No | `"primary"` or `"secondary"` (default: `"secondary"`) |
| `enabled` | boolean | No | Whether the button is shown (default: `true`) |

---

## Content Types

### Markdown Content

For text-based content, use Markdown format with LaTeX math support.

**Supported Markdown:**
- Headers (`#`, `##`, `###`)
- Bold (`**text**`), italic (`*text*`)
- Lists (`- item`, `1. item`)
- Code blocks (```` ``` ````)
- Blockquotes (`> text`)
- Tables
- Links (`[text](url)`)
- Images (`![alt](url)`)

**LaTeX Math:**
- Inline math: `\( E = mc^2 \)`
- Display math: `\[ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} \]`

**Example:**
```json
{
  "id": "sec-1",
  "title": "Introduction to Cells",
  "contentType": "markdown",
  "content": "# Cell Structure\n\nCells are the basic building blocks of life. The cell membrane controls what enters and exits the cell.\n\nThe area of a circle is given by:\n\n\\[ A = \\pi r^2 \\]\n\n**Key components:**\n- Nucleus\n- Mitochondria\n- Ribosomes"
}
```

### HTML Content (Inline Visuals)

For interactive diagrams, charts, or complex visuals embedded directly in the JSON, use inline HTML content.

**HTML Content Features:**
- Renders in a sandboxed iframe (isolated from page styles/scripts)
- Supports inline SVG for diagrams
- Supports CSS animations and transitions
- Supports JavaScript for interactivity
- Supports images via URL or local file paths
- Supports bilingual labels via `data-i18n-key` attributes

**HTML Styling Guidelines:**
Use CSS variables for theme-aware styling:
- `var(--background)` - Page background
- `var(--foreground)` - Text color
- `var(--border)` - Border color
- `var(--muted-foreground)` - Muted text
- `var(--primary)` - Accent color (buttons, highlights)
- `var(--secondary)` - Secondary background
- `var(--code-bg)` - Code background

**Light mode colors:**
- `--background: #E8EEFD`
- `--foreground: #020817`
- `--primary: #3B82F6`
- `--border: rgba(2, 8, 23, 0.18)`

**Dark mode colors:**
- `--background: #020817`
- `--foreground: #F8FAFC`
- `--primary: #F8FAFC`
- `--border: #1E293B`

**HTML Structure:**
```html
<div class="bio-panel">
  <h4>Section Title</h4>
  <div class="bio-sub">Subtitle or description</div>
  <figure class="bio-fig">
    <svg class="bio-diagram">...</svg>
    <figcaption>Caption text</figcaption>
  </figure>
  <div class="bio-legend">
    <div class="bio-legend-item">
      <span class="bio-swatch" style="background: #color;"></span>
      <span class="bio-legend-en" data-i18n-key="labelKey">English Label</span>
    </div>
  </div>
</div>
```

**Images in HTML:**
- Online URL: `<img src="https://example.com/image.png" />`
- Local file: `<img src="image.png" />` (file placed alongside HTML)

**Example HTML Section (Inline):**
```json
{
  "id": "sec-2",
  "title": "Cell Diagram",
  "contentType": "html",
  "html": "<div class=\"bio-panel\">\n  <h4 data-i18n-key=\"title\">Cell Structure</h4>\n  <figure class=\"bio-fig\">\n    <svg class=\"bio-diagram\" viewBox=\"0 0 400 300\">\n      <circle cx=\"200\" cy=\"150\" r=\"100\" fill=\"var(--secondary)\" stroke=\"var(--border)\"/>\n      <circle cx=\"200\" cy=\"150\" r=\"40\" fill=\"var(--primary)\"/>\n    </svg>\n    <figcaption data-i18n-key=\"caption\">A simplified cell diagram</figcaption>\n  </figure>\n</div>",
  "i18n": {
    "en": {
      "title": "Cell Structure",
      "caption": "A simplified cell diagram"
    },
    "nl": {
      "title": "Celstructuur",
      "caption": "Een vereenvoudigd celdiagram"
    }
  }
}
```

---

### Visual Placeholder Sections (External HTML Files)

For complex visuals stored in separate HTML files, use the visual-placeholder system.

**Benefits:**
- Separates visual code from content JSON
- Allows for larger, more complex HTML files
- Easier to maintain and update visuals independently
- One visual per HTML file with clear naming convention

**See the "Visual Placeholder Sections" section above for complete details.**

---

## Internationalization (i18n)

The JSON format supports multiple languages through translation objects.

### Translation Object Structure

Translation objects use language codes as keys (e.g., `"en"`, `"nl"`, `"fr"`).

**Example:**
```json
{
  "title": "Cell Structure",
  "titleI18n": {
    "en": "Cell Structure",
    "nl": "Celstructuur",
    "fr": "Structure cellulaire"
  }
}
```

### Fields That Support i18n

- `siteMetadata.titleI18n`
- `siteMetadata.descriptionI18n`
- `summaryI18n`
- `sections[].titleI18n`
- `sections[].goalI18n`
- `sections[].i18n` (for HTML labels)
- `sections[].questions[].textI18n`
- `sections[].questions[].answerI18n`
- `quiz.questions[].questionI18n`
- `quiz.questions[].rationaleI18n`
- `buttons[].textI18n`

### HTML Label Translation

For HTML content, use `data-i18n-key` attributes on elements that need translation:

```html
<h4 data-i18n-key="sectionTitle">English Title</h4>
<p data-i18n-key="description">English description</p>
```

Then provide translations in the section's `i18n` object:

```json
{
  "i18n": {
    "en": {
      "sectionTitle": "English Title",
      "description": "English description"
    },
    "nl": {
      "sectionTitle": "Nederlandse titel",
      "description": "Nederlandse beschrijving"
    }
  }
}
```

---

## Complete Example

Here is a complete JSON example for a biology lesson about cell structure:

```json
{
  "id": "biology-cell-structure",
  "subject": "Biology",
  "siteMetadata": {
    "title": "Cell Structure and Function",
    "titleI18n": {
      "en": "Cell Structure and Function",
      "nl": "Celstructuur en functie"
    },
    "description": "Learn about the basic components of cells and their functions",
    "descriptionI18n": {
      "en": "Learn about the basic components of cells and their functions",
      "nl": "Leer over de basiscomponenten van cellen en hun functies"
    }
  },
  "defaultViewMode": "simple",
  "availableModes": ["simple", "study", "summary", "quiz"],
  "summary": "# Summary\n\nCells are the fundamental units of life. They contain various organelles that perform specific functions necessary for survival.",
  "summaryI18n": {
    "en": "# Summary\n\nCells are the fundamental units of life. They contain various organelles that perform specific functions necessary for survival.",
    "nl": "# Samenvatting\n\nCellen zijn de fundamentele eenheden van het leven. Ze bevatten verschillende organellen die specifieke functies uitvoeren die noodzakelijk zijn voor overleving."
  },
  "summaryContentType": "markdown",
  "buttons": [
    {
      "url": "https://www.youtube.com/watch?v=example",
      "text": "Watch Video",
      "textI18n": {
        "en": "Watch Video",
        "nl": "Bekijk video"
      },
      "iconType": "youtube",
      "variant": "primary",
      "enabled": true
    }
  ],
  "showExportButtons": false,
  "showTranscriptExport": false,
  "showAnkiExport": false,
  "quiz": {
    "questions": [
      {
        "question": "What is the function of the nucleus?",
        "questionI18n": {
          "en": "What is the function of the nucleus?",
          "nl": "Wat is de functie van de kern?"
        },
        "options": ["Energy production", "Genetic control", "Protein synthesis", "Waste removal"],
        "answer": "Genetic control",
        "rationale": "The nucleus contains DNA and controls cellular activities."
      }
    ]
  },
  "sections": [
    {
      "id": "sec-1",
      "title": "Introduction to Cells",
      "titleI18n": {
        "en": "Introduction to Cells",
        "nl": "Introductie tot cellen"
      },
      "goal": "Understand what cells are and why they are important",
      "goalI18n": {
        "en": "Understand what cells are and why they are important",
        "nl": "Begrijp wat cellen zijn en waarom ze belangrijk zijn"
      },
      "contentType": "markdown",
      "content": "# Introduction to Cells\n\nCells are the basic building blocks of all living organisms. They are the smallest units that can carry out all the processes necessary for life.\n\n**Key characteristics:**\n- Have a membrane\n- Contain genetic material\n- Can reproduce\n\nThe cell theory states that:\n1. All living things are made of cells\n2. Cells are the basic unit of structure and function\n3. New cells are produced from existing cells",
      "questions": [
        {
          "number": "1",
          "text": "What are the three main principles of cell theory?",
          "textI18n": {
            "en": "What are the three main principles of cell theory?",
            "nl": "Wat zijn de drie hoofdbeginselen van de celtheorie?"
          },
          "answer": "1) All living things are made of cells, 2) Cells are the basic unit of structure and function, 3) New cells come from existing cells",
          "answerI18n": {
            "en": "1) All living things are made of cells, 2) Cells are the basic unit of structure and function, 3) New cells come from existing cells",
            "nl": "1) Alle levende dingen bestaan uit cellen, 2) Cellen zijn de basis-eenheid van structuur en functie, 3) Nieuwe cellen komen uit bestaande cellen"
          }
        }
      ]
    },
    {
      "id": "sec-2",
      "title": "Cell Organelles",
      "titleI18n": {
        "en": "Cell Organelles",
        "nl": "Celorganellen"
      },
      "goal": "Learn about the different organelles and their functions",
      "goalI18n": {
        "en": "Learn about the different organelles and their functions",
        "nl": "Leer over de verschillende organellen en hun functies"
      },
      "contentType": "html",
      "html": "<div class=\"bio-panel\">\n  <h4 data-i18n-key=\"title\">Cell Organelles</h4>\n  <div class=\"bio-sub\" data-i18n-key=\"subtitle\">Key components and their functions</div>\n  <figure class=\"bio-fig\">\n    <svg class=\"bio-diagram\" viewBox=\"0 0 400 300\">\n      <circle cx=\"200\" cy=\"150\" r=\"120\" fill=\"var(--secondary)\" stroke=\"var(--border)\" stroke-width=\"2\"/>\n      <circle cx=\"200\" cy=\"150\" r=\"50\" fill=\"var(--primary)\"/>\n      <ellipse cx=\"120\" cy=\"100\" rx=\"30\" ry=\"20\" fill=\"var(--muted)\" stroke=\"var(--border)\"/>\n      <ellipse cx=\"280\" cy=\"100\" rx=\"30\" ry=\"20\" fill=\"var(--muted)\" stroke=\"var(--border)\"/>\n      <rect x=\"180\" y=\"220\" width=\"40\" height=\"30\" fill=\"var(--code-bg)\" stroke=\"var(--border)\"/>\n    </svg>\n    <figcaption data-i18n-key=\"caption\">Simplified diagram of a cell with major organelles</figcaption>\n  </figure>\n  <div class=\"bio-legend\">\n    <div class=\"bio-legend-item\">\n      <span class=\"bio-swatch\" style=\"background: var(--primary);\"></span>\n      <span class=\"bio-legend-en\" data-i18n-key=\"nucleus\">Nucleus</span>\n    </div>\n    <div class=\"bio-legend-item\">\n      <span class=\"bio-swatch\" style=\"background: var(--muted);\"></span>\n      <span class=\"bio-legend-en\" data-i18n-key=\"mitochondria\">Mitochondria</span>\n    </div>\n  </div>\n</div>",
      "i18n": {
        "en": {
          "title": "Cell Organelles",
          "subtitle": "Key components and their functions",
          "caption": "Simplified diagram of a cell with major organelles",
          "nucleus": "Nucleus",
          "mitochondria": "Mitochondria"
        },
        "nl": {
          "title": "Celorganellen",
          "subtitle": "Belangrijke componenten en hun functies",
          "caption": "Vereenvoudigd diagram van een cel met belangrijke organellen",
          "nucleus": "Kern",
          "mitochondria": "Mitochondria"
        }
      },
      "questions": [
        {
          "number": "2",
          "text": "Which organelle is responsible for energy production?",
          "textI18n": {
            "en": "Which organelle is responsible for energy production?",
            "nl": "Welk organelle is verantwoordelijk voor energieproductie?"
          },
          "answer": "Mitochondria",
          "answerI18n": {
            "en": "Mitochondria",
            "nl": "Mitochondria"
          }
        }
      ]
    },
    {
      "id": "sec-3",
      "title": "Interactive Cell Model",
      "titleI18n": {
        "en": "Interactive Cell Model",
        "nl": "Interactief celmodel"
      },
      "contentType": "visual-placeholder",
      "visualTag": "Visual1-interactive-cell"
    }
  ]
}
```

---

## Rendering in Web Applications

### HTML Sandbox

HTML content is rendered in an iframe sandbox for security and isolation:

- **CSS/JS isolation**: Styles and scripts in HTML content cannot affect the parent page
- **No scrollbar conflicts**: The iframe automatically resizes to fit content
- **Security**: Scripts cannot access parent page data
- **Cross-origin**: Images from any domain are supported

### Image Handling

**Online Images:**
```html
<img src="https://example.com/diagram.png" alt="Diagram" />
```

**Local Images:**
```html
<img src="cell-diagram.png" alt="Cell Diagram" />
```
Place the image file in the same directory as the HTML file.

### Theme Support

HTML content automatically adapts to light/dark mode when using CSS variables:

```css
.my-element {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

---

## Export Formats

### Transcript Export (.md)

Exports all content as a single Markdown file:
- Page title and summary
- All section content
- Questions and answers

### Anki Export (.txt)

Exports questions in Anki-compatible format:
```
Question 1	Answer 1
Question 2	Answer 2
```

---

## Best Practices

1. **Always provide primary language content** - The base field (e.g., `title`, `content`) should be in the primary language
2. **Use consistent IDs** - Section IDs should be unique and URL-friendly (kebab-case)
3. **Validate JSON** - Ensure the JSON is valid before use
4. **Escape special characters** - In HTML content, escape quotes and special characters properly
5. **Test HTML visuals** - Ensure HTML content renders correctly in both light and dark modes
6. **Provide complete translations** - If using i18n, provide translations for all translatable fields
7. **Use semantic HTML** - Use proper HTML tags (`<h4>`, `<figure>`, `<figcaption>`) for better accessibility
8. **Keep HTML self-contained** - All CSS and JS should be inline or in `<style>`/`<script>` tags within the HTML
9. **Optimize images** - Use appropriately sized images for better performance
10. **Test quiz options** - Ensure quiz answers exactly match one of the provided options

---

## AI Agent Prompt Template

When instructing an AI agent to generate a JSON file using this format, use this template:

```
Please format the following learning material as a JSON file using the exact specification in the documentation.

The JSON should:
- Be completely standalone (no file paths or directory references for inline content)
- Support bilingual content (English and Dutch)
- Include all sections, questions, and any visual content
- Use proper Markdown formatting for text content
- Use inline HTML with CSS variables for simple diagrams or visuals
- Use visual-placeholder sections for complex external HTML visuals (with unique tags)
- Include a quiz with multiple choice questions if appropriate
- Keep all buttons, icons, and export options off by default (set enabled: false or omit)

Learning material:
[Paste your learning material here]

Return ONLY the valid JSON. No explanation, no markdown code fences.
```
