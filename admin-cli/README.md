# Aether Admin CLI

Programmatic CLI tool for creating Aether learning content without requiring admin portal authentication. This tool uses the Supabase SERVICE_ROLE_KEY to bypass authentication and directly insert content into the database.

## Features

- **No Authentication Required**: Uses SERVICE_ROLE_KEY for direct database access
- **Local Execution**: Runs from your C drive folder
- **All Content Types**: Supports subjects, chapters, learning sets, quizzes, summaries, and practice tests
- **JSON-Based**: Create content using simple JSON files
- **Same as Admin Portal**: Creates identical content as the web admin portal

## Installation

1. Navigate to the admin-cli directory:

```bash
cd admin-cli
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment template:

```bash
copy env.example .env
```

4. Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://zbppznuwwcjdbdbkexyq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Use the same `SERVICE_ROLE_KEY` from your artisan-daemon `.env` file.

## Build

```bash
npm run build
```

## Usage

### Command Syntax

```bash
node dist/index.js <command> <json-file>
```

### Available Commands

- `subject` - Create a new subject
- `chapter` - Create a new chapter
- `learningset` - Create a new learning set (deck with cards)
- `quiz` - Create a new quiz
- `summary` - Create a new summary
- `practicetest` - Create a new practice test
- `help` - Show help message

### Examples

```bash
# Create a subject
node dist/index.js subject examples/subject.json

# Create a chapter
node dist/index.js chapter examples/chapter.json

# Create a learning set
node dist/index.js learningset examples/learningset.json

# Create a quiz
node dist/index.js quiz examples/quiz.json

# Create a summary
node dist/index.js summary examples/summary.json
```

## JSON File Examples

### Subject (subject.json)

```json
{
  "name": "Biologie",
  "description": "Leer over levende organismen en hun processen",
  "color": "#22c55e",
  "icon": "flask"
}
```

### Chapter (chapter.json)

```json
{
  "subject_id": "uuid-of-subject",
  "title": "Celbiologie",
  "description": "Inleiding tot cellen en hun functies",
  "order": 1
}
```

### Learning Set (learningset.json)

```json
{
  "subject_id": "uuid-of-subject",
  "chapter_id": "uuid-of-chapter",
  "title": "Celstructure Flashcards",
  "description": "Flashcards over celstructuren",
  "cards": [
    {
      "front": "Wat is de functie van de celkern?",
      "back": "De celkern bevat het DNA en controleert alle celactiviteiten",
      "source_text": "Biologie tekstboek pagina 45"
    },
    {
      "front": "Wat zijn ribosomen?",
      "back": "Ribosomen zijn verantwoordelijk voor eiwitsynthese"
    }
  ]
}
```

### Quiz (quiz.json)

```json
{
  "subject_id": "uuid-of-subject",
  "chapter_id": "uuid-of-chapter",
  "title": "Celbiologie Quiz",
  "description": "Test je kennis over cellen",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Wat is de functie van mitochondria?",
      "options": ["Eiwitsynthese", "Energieproductie", "DNA opslag", "Celdeling"],
      "correct_answer": 1,
      "explanation": "Mitochondria staan bekend als de energiecentrales van de cel"
    }
  ]
}
```

### Summary (summary.json)

```json
{
  "subject_id": "uuid-of-subject",
  "chapter_id": "uuid-of-chapter",
  "title": "Samenvatting Celbiologie",
  "content": "# Celbiologie\\n\\nCellen zijn de basisbouwstenen van alle levende organismen...",
  "tags": ["cel", "biologie", "basis"],
  "difficulty": "beginner"
}
```

## How to Access Admin Portal

To access the web admin portal:

1. Navigate to `/admin` in your browser
2. Enter admin credentials (set via environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
3. Use the JSON examples from the admin portal as templates for the CLI

## Security

- Uses `SERVICE_ROLE_KEY` for admin-level database access
- Never hardcodes credentials
- Loads from local `.env` file
- Only works when run from this physical folder on your C drive

## Notes

- All content created via CLI is marked as global (user_id: null)
- This means it's available to all users, not tied to a specific user
- The CLI bypasses RLS policies using the service role key
- IDs returned from commands can be used in subsequent commands (e.g., create a chapter after creating a subject)
