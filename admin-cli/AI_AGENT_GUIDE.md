# Aether Admin CLI - AI Agent Guide

This guide provides detailed instructions for AI agents to programmatically create, update, and delete learning content in the Aether platform using the Admin CLI tool.

## Overview

The Aether Admin CLI is a Node.js/TypeScript command-line tool that allows programmatic creation of learning content without requiring admin portal authentication. It uses the Supabase SERVICE_ROLE_KEY for direct database access.

## Location

The CLI tool is located at: `c:\Users\Mohammed\Documents\learning-platform\updated-lp-11-8-16-43\admin-cli\`

## Prerequisites

1. **Environment Configuration**: Ensure `.env` file exists with valid Supabase credentials
2. **Built Tool**: The tool must be built (`npm run build`) before use
3. **JSON Files**: Content must be provided as JSON files

## Command Structure

### Basic Syntax

```
node dist/index.js <command> [id] <json-file>
```

### Command Patterns

- **Create**: `create-<type> <json-file>` - Creates new content
- **Update**: `update-<type> <id> <json-file>` - Updates existing content
- **Delete**: `delete-<type> <id>` - Deletes content

## Available Content Types

### 1. Subjects (`subject`)

**Purpose**: Create top-level subjects (e.g., Physics, Biology, Mathematics)

**Create Command**:

```
node dist/index.js create-subject subject.json
```

**JSON Schema**:

```json
{
  "name": "string (required) - Subject name",
  "description": "string (required) - Subject description",
  "color": "string (optional) - Hex color code",
  "icon": "string (optional) - Icon name"
}
```

**Update Command**:

```
node dist/index.js update-subject <subject-id> subject.json
```

**Delete Command**:

```
node dist/index.js delete-subject <subject-id>
```

**Example**:

```json
{
  "name": "Natuurkunde",
  "description": "De studie van materie, energie en hun interacties",
  "color": "#3b82f6",
  "icon": "atom"
}
```

---

### 2. Chapters (`chapter`)

**Purpose**: Create chapters within subjects (e.g., "Mechanics", "Thermodynamics" within Physics)

**Create Command**:

```
node dist/index.js create-chapter chapter.json
```

**JSON Schema**:

```json
{
  "subject_id": "string (required) - UUID of parent subject",
  "title": "string (required) - Chapter title",
  "description": "string (required) - Chapter description",
  "order": "number (optional) - Display order"
}
```

**Update Command**:

```
node dist/index.js update-chapter <chapter-id> chapter.json
```

**Delete Command**:

```
node dist/index.js delete-chapter <chapter-id>
```

**Example**:

```json
{
  "subject_id": "uuid-of-natuurkunde-subject",
  "title": "Mechanica",
  "description": "De studie van beweging en krachten",
  "order": 1
}
```

---

### 3. Learning Sets (`learningset`)

**Purpose**: Create flashcard decks with cards for spaced repetition

**Create Command**:

```
node dist/index.js create-learningset learningset.json
```

**JSON Schema**:

```json
{
  "subject_id": "string (required) - UUID of subject",
  "chapter_id": "string (optional) - UUID of chapter",
  "title": "string (required) - Learning set title",
  "description": "string (required) - Learning set description",
  "cards": "array (required) - Array of flashcard objects",
  "cards[].front": "string (required) - Question/prompt",
  "cards[].back": "string (required) - Answer",
  "cards[].source_text": "string (optional) - Source reference"
}
```

**Update Command**:

```
node dist/index.js update-learningset <learningset-id> learningset.json
```

**Delete Command**:

```
node dist/index.js delete-learningset <learningset-id>
```

**Example**:

```json
{
  "subject_id": "uuid-of-natuurkunde-subject",
  "chapter_id": "uuid-of-mechanica-chapter",
  "title": "Krachten en Beweging",
  "description": "Flashcards over Newton's wetten en beweging",
  "cards": [
    {
      "front": "Wat is de eerste wet van Newton?",
      "back": "Een object in rust blijft in rust en een object in beweging blijft in beweging met constante snelheid, tenzij een uitwendige kracht daarop werkt",
      "source_text": "Natuurkunde hoofdstuk 3, pagina 45"
    },
    {
      "front": "Wat is de formule voor kracht?",
      "back": "F = m × a (Kracht = massa × versnelling)"
    }
  ]
}
```

---

### 4. Quizzes (`quiz`)

**Purpose**: Create interactive quizzes with multiple choice and open questions

**Create Command**:

```
node dist/index.js create-quiz quiz.json
```

**JSON Schema**:

```json
{
  "subject_id": "string (required) - UUID of subject",
  "chapter_id": "string (optional) - UUID of chapter",
  "title": "string (required) - Quiz title",
  "description": "string (required) - Quiz description",
  "questions": "array (required) - Array of question objects",
  "questions[].type": "string (required) - 'multiple_choice' or 'open'",
  "questions[].question": "string (required) - The question text",
  "questions[].options": "array (optional) - Answer options for multiple choice",
  "questions[].correct_answer": "number (optional) - Index of correct answer (0-based)",
  "questions[].model_answer": "string (optional) - Model answer for open questions",
  "questions[].explanation": "string (optional) - Explanation of the answer"
}
```

**Update Command**:

```
node dist/index.js update-quiz <quiz-id> quiz.json
```

**Delete Command**:

```
node dist/index.js delete-quiz <quiz-id>
```

**Example**:

```json
{
  "subject_id": "uuid-of-natuurkunde-subject",
  "chapter_id": "uuid-of-mechanica-chapter",
  "title": "Mechanica Quiz",
  "description": "Test je kennis van krachten en beweging",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Wat is de eenheid van kracht?",
      "options": ["Joule", "Newton", "Watt", "Pascal"],
      "correct_answer": 1,
      "explanation": "Kracht wordt gemeten in Newton (N)"
    },
    {
      "type": "open",
      "question": "Beschrijf het verschil tussen massa en gewicht",
      "model_answer": "Massa is de hoeveelheid materie in kg, gewicht is de kracht die zwaartekracht uitoefent op die massa in Newton",
      "explanation": "Gewicht = massa × zwaartekrachtversnelling"
    }
  ]
}
```

---

### 5. Summaries (`summary`)

**Purpose**: Create text summaries with markdown formatting

**Create Command**:

```
node dist/index.js create-summary summary.json
```

**JSON Schema**:

```json
{
  "subject_id": "string (required) - UUID of subject",
  "chapter_id": "string (optional) - UUID of chapter",
  "title": "string (required) - Summary title",
  "content": "string (required) - Content (supports markdown)",
  "tags": "array (optional) - Array of tags",
  "difficulty": "string (optional) - 'beginner', 'intermediate', or 'advanced'"
}
```

**Update Command**:

```
node dist/index.js update-summary <summary-id> summary.json
```

**Delete Command**:

```
node dist/index.js delete-summary <summary-id>
```

**Example**:

```json
{
  "subject_id": "uuid-of-natuurkunde-subject",
  "chapter_id": "uuid-of-mechanica-chapter",
  "title": "Samenvatting Mechanica",
  "content": "# Mechanica\n\nMechanica is de tak van natuurkunde die zich bezighoudt met de beweging van objecten en de krachten die die beweging veroorzaken.\n\n## Belangrijkste concepten\n\n### Kracht\nKracht is een vectorgrootheid die een object kan versnellen, vertragen of van richting laten veranderen.\n\n### Newton's Wetten\n1. Eerste wet: Inertiewet\n2. Tweede wet: F = ma\n3. Derde wet: Actie en reactie",
  "tags": ["mechanica", "krachten", "newton"],
  "difficulty": "intermediate"
}
```

---

### 6. Practice Tests (`practicetest`)

**Purpose**: Create timed practice tests with scoring

**Create Command**:

```
node dist/index.js create-practicetest practicetest.json
```

**JSON Schema**:

```json
{
  "subject_id": "string (required) - UUID of subject",
  "chapter_id": "string (optional) - UUID of chapter",
  "title": "string (required) - Practice test title",
  "description": "string (required) - Practice test description",
  "duration_minutes": "number (required) - Time limit in minutes",
  "passing_score": "number (required) - Minimum score to pass (0-100)",
  "questions": "array (required) - Array of question objects",
  "questions[].type": "string (required) - Question type",
  "questions[].question": "string (required) - The question",
  "questions[].options": "array (optional) - Answer options",
  "questions[].correct_answer": "number (optional) - Correct answer index",
  "questions[].points": "number (required) - Points for this question"
}
```

**Update Command**:

```
node dist/index.js update-practicetest <practicetest-id> practicetest.json
```

**Delete Command**:

```
node dist/index.js delete-practicetest <practicetest-id>
```

**Example**:

```json
{
  "subject_id": "uuid-of-natuurkunde-subject",
  "chapter_id": "uuid-of-mechanica-chapter",
  "title": "Mechanica Oefentoets",
  "description": "Complete oefentoets over mechanica",
  "duration_minutes": 45,
  "passing_score": 70,
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Wat is de versnelling van een object met massa 10kg bij een kracht van 50N?",
      "options": ["5 m/s²", "10 m/s²", "0.2 m/s²", "500 m/s²"],
      "correct_answer": 0,
      "points": 5
    },
    {
      "type": "multiple_choice",
      "question": "Welke grootheid wordt gemeten in Joule?",
      "options": ["Kracht", "Energie", "Vermogen", "Druk"],
      "correct_answer": 1,
      "points": 5
    }
  ]
}
```

## AI Agent Workflow

### Step 1: Create Subject

```bash
node dist/index.js create-subject natuurkunde.json
```

Save the returned UUID for subsequent operations.

### Step 2: Create Chapters

```bash
node dist/index.js create-chapter mechanica.json
node dist/index.js create-chapter thermodynamica.json
```

Use the subject UUID from Step 1.

### Step 3: Create Learning Sets

```bash
node dist/index.js create-learningset krachten.json
node dist/index.js create-learningset energie.json
```

Use subject and chapter UUIDs.

### Step 4: Create Quizzes

```bash
node dist/index.js create-quiz mechanica-quiz.json
```

### Step 5: Create Summaries

```bash
node dist/index.js create-summary mechanica-summary.json
```

### Step 6: Create Practice Tests

```bash
node dist/index.js create-practicetest mechanica-test.json
```

## Update Operations

To update existing content, use the update commands with the content ID:

```bash
node dist/index.js update-learningset <learningset-id> updated-learningset.json
```

Only include the fields you want to change in the JSON file.

## Delete Operations

To delete content, use the delete commands with the content ID:

```bash
node dist/index.js delete-learningset <learningset-id>
```

**Warning**: Deleting a learning set will also delete all associated cards. Deleting a subject will not automatically delete associated chapters - you must delete them separately.

## Error Handling

The CLI will:

- Return exit code 1 on errors
- Display error messages in red
- Validate JSON syntax before processing
- Check for required fields
- Validate UUIDs where applicable

## Best Practices for AI Agents

1. **Save IDs**: Always save returned UUIDs for creating related content
2. **Validate JSON**: Ensure JSON is valid before running commands
3. **Order Matters**: Create subjects before chapters, chapters before content
4. **Use Descriptive Names**: Use clear, descriptive titles for content
5. **Test Content**: Create test content first before大规模 production
6. **Backup IDs**: Keep a record of all content IDs for future updates
7. **Incremental Creation**: Create content incrementally to track progress

## Content Relationships

```
Subject (Vak)
  ├─ Chapter (Hoofdstuk)
  │   ├─ Learning Set (Leerset)
  │   ├─ Quiz
  │   ├─ Summary
  │   └─ Practice Test
  └─ (Can have multiple chapters)
```

## Security Notes

- Uses SERVICE_ROLE_KEY for admin-level access
- All content created is global (user_id: null)
- No authentication required for CLI operations
- Only works when run from the designated folder
- Credentials stored in local .env file

## Troubleshooting

**Error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"**

- Ensure .env file exists in the admin-cli directory
- Verify credentials are correctly formatted

**Error: "Failed to create [content type]"**

- Check JSON syntax is valid
- Verify required fields are present
- Ensure referenced UUIDs exist (e.g., subject_id for chapters)

**Error: "Unknown command"**

- Check command syntax matches expected pattern
- Use `help` command to see all available commands

## Help Command

For a complete list of commands:

```bash
node dist/index.js help
```
