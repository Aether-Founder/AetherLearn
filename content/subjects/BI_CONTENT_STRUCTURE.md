# AetherLearn - Subject Content Directory Structure

## Overview
This document explains the correct directory structure and location for subject content JSON files in the AetherLearn project.

## Directory Structure

```
content/
└── subjects/
    ├── index.json                    # Main index file listing all subjects
    ├── biologie/                     # Biology subject folder
    │   ├── inleiding-in-de-biologie.json  # Existing biology content file
    │   ├── biologie-hoofdstuk-1.json     # NEW: Biology Chapter 1 content (this file)
    │   └── visuals/                  # Folder for HTML visual files
    │       └── [visual files].html   # External HTML visuals referenced in JSON
    ├── natuurkunde/                  # Physics subject folder
    │   ├── subject.json
    │   └── chapters/
    │       └── beweging/
    │           ├── chapter-full.json
    │           ├── chapter.json
    │           └── paragraphs/
    │               └── [paragraph files].json
    ├── wiskunde-a/                   # Mathematics A subject folder
    ├── wiskunde-b/                   # Mathematics B subject folder
    ├── wiskunde-d/                   # Mathematics D subject folder
    ├── scheikunde/                   # Chemistry subject folder
    ├── nederlands/                   # Dutch subject folder
    ├── engels/                       # English subject folder
    ├── frans/                        # French subject folder
    ├── duits/                        # German subject folder
    ├── geschiedenis/                 # History subject folder
    ├── aardrijkskunde/               # Geography subject folder
    ├── economie/                     # Economics subject folder
    ├── informatica/                  # Computer Science subject folder
    ├── bewegen-sport-en-maatschappij/  # Physical Education subject folder
    ├── culturele-en-kunstzinnige-vorming/  # Arts subject folder
    ├── kunst-beeldende-vorming/      # Visual Arts subject folder
    ├── kunst-muziek/                 # Music subject folder
    ├── levensbeschouwing/            # Life Philosophy subject folder
    ├── lichamelijke-opvoeding/       # Physical Education subject folder
    ├── mentoraat/                    # Mentorship subject folder
    ├── decanaat/                     # Dean's office subject folder
    └── [other subjects...]
```

## File Naming Conventions

### JSON Content Files
- Use lowercase with hyphens for file names
- Use descriptive names based on the content
- Examples:
  - `biologie-hoofdstuk-1.json`
  - `inleiding-in-de-biologie.json`
  - `celstructuur.json`

### Visual HTML Files
- Use the format: `Visual[Number]-[descriptive-name].html`
- The visualTag in the JSON must exactly match the filename (without .html)
- Examples:
  - `Visual1-cell-membrane.html`
  - `Visual2-mitochondria.html`
  - `Visual3-osmosis.html`

## JSON Content Format

Each JSON file should follow the Universal Learning Content JSON Format specification (see `docs/SUBJECT_CONTENT_JSON_FORMAT.md`).

Key structure:
```json
{
  "id": "unique-identifier",
  "subject": "Subject Name",
  "siteMetadata": {
    "title": "Page Title",
    "description": "Page Description"
  },
  "defaultViewMode": "simple",
  "availableModes": ["simple", "study", "summary", "quiz"],
  "summary": "Summary content in Markdown",
  "sections": [
    {
      "id": "section-id",
      "title": "Section Title",
      "contentType": "markdown",
      "content": "Content in Markdown format",
      "questions": [...]
    }
  ]
}
```

## Important Notes

1. **Do not delete existing files** - When adding new content, create new JSON files rather than replacing existing ones
2. **Preserve visuals folder** - The `visuals` folder contains HTML visual files that are referenced by JSON files
3. **Use exact content** - When creating content from source materials, use the exact text without modification
4. **Follow the JSON format** - Ensure all JSON files follow the specification in `docs/SUBJECT_CONTENT_JSON_FORMAT.md`
5. **Bilingual support** - The format supports multiple languages through i18n fields
6. **Visual placeholders** - For complex visuals, use `contentType: "visual-placeholder"` and create corresponding HTML files in the visuals folder

## Creating New Content

When creating new subject content:

1. Navigate to the appropriate subject folder (e.g., `content/subjects/biologie/`)
2. Create a new JSON file with a descriptive name
3. If needed, create a `visuals` folder (if it doesn't exist)
4. Add any HTML visual files to the `visuals` folder
5. Reference visuals in the JSON using the `visualTag` field
6. Update the subject's index.json if needed

## Example: Adding Biology Chapter 1

To add Biology Chapter 1 content from BI.txt:

1. File location: `content/subjects/biologie/biologie-hoofdstuk-1.json`
2. Content structure based on BI.txt:
   - Hoofdstuk 1: Inleiding in de biologie
   - Paragrafen: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
   - Extra onderdelen (as separate sections or integrated)
3. Visuals: Place any HTML diagrams in `content/subjects/biologie/visuals/`
4. Follow the JSON format specification for structure

## Reference Documentation

- `docs/SUBJECT_CONTENT_JSON_FORMAT.md` - Complete JSON format specification
- `content/subjects/index.json` - Main subjects index
- Existing JSON files in subject folders - Examples of proper formatting

## Subject Prefix to Folder Mapping

When processing source files from the Context directory, use the following mapping:

| Source File Prefix | Subject Folder | Subject Name |
|---|---|---|
| BI | biologie | Biologie |
| CKV | culturele-en-kunstzinnige-vorming | Culturele en Kunstzinnige Vorming |
| EN | engels | Engels |
| FA | frans | Frans |
| NA | natuurkunde | Natuurkunde |
| NE | nederlands | Nederlands |
| SK | scheikunde | Scheikunde |
| WISB | wiskunde-b | Wiskunde B |
| WISD | wiskunde-d | Wiskunde D |

## Processed Files

The following source files have been copied and converted to JSON learnpages:

1. **BI.txt** → `content/subjects/biologie/biologie-hoofdstuk-1-complete.json` (already completed)
2. **CKV.txt** → `content/subjects/culturele-en-kunstzinnige-vorming/ckv-architectuur.json`
3. **EN.txt** → `content/subjects/engels/engels-grammatica.json`
4. **FA.txt** → `content/subjects/frans/frans-grammatica.json`
5. **NA.txt** → `content/subjects/natuurkunde/natuurkunde-beweging-elektriciteit.json`
6. **NE.txt** → `content/subjects/nederlands/nederlands-literaire-termen.json`
7. **SK.txt** → `content/subjects/scheikunde/scheikunde-microstructuren.json`
8. **WISB.txt** → `content/subjects/wiskunde-b/wiskunde-b-kwadratische-formules.json`
9. **WISD.txt** → `content/subjects/wiskunde-d/wiskunde-d-combinatoriek.json`

**Excluded:** `alles.txt` (not processed as per instructions)

## Source File Copies

The original source text files have been copied to the project root for reference:
- `BI.txt` → `C:\Users\Mohammed\Documents\AetherLearn\BI.txt`
- `CKV.txt` → `C:\Users\Mohammed\Documents\AetherLearn\CKV.txt`
- `EN.txt` → `C:\Users\Mohammed\Documents\AetherLearn\EN.txt`
- `FA.txt` → `C:\Users\Mohammed\Documents\AetherLearn\FA.txt`
- `NA.txt` → `C:\Users\Mohammed\Documents\AetherLearn\NA.txt`
- `NE.txt` → `C:\Users\Mohammed\Documents\AetherLearn\NE.txt`
- `SK.txt` → `C:\Users\Mohammed\Documents\AetherLearn\SK.txt`
- `WISB.txt` → `C:\Users\Mohammed\Documents\AetherLearn\WISB.txt`
- `WISD.txt` → `C:\Users\Mohammed\Documents\AetherLearn\WISD.txt`
