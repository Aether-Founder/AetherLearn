# AetherLearn Book Library Integration Plan

## Executive Summary

Transform AetherLearn into a unified learning platform that combines a Blinkist-style book library with existing flashcard and study functionality. Books become knowledge sources, while existing learning tools become the practice and retention engine.

**Core Principle:** Every book should become part of a user's personal learning system.

---

## Product Vision

### Three Connected Activities

1. **Discover & Read** - Explore books, read concise/detailed summaries, learn from chapters
2. **Understand & Practice** - Create flashcards, quizzes, notes from the knowledge
3. **Remember & Progress** - Schedule learning, complete revision, follow learning paths

### Key Integration Rule

**DO NOT duplicate functionality.** Reuse existing:
- Flashcard system (learning sets)
- Study modes (flip cards, written answer, multiple choice)
- Spaced repetition scheduling
- Agenda/planner
- Learning-set creation workflow

Books should be a new **content source** for the existing learning engine.

---

## Navigation Structure

### Primary Navigation

| Route | Purpose | Priority |
|-------|---------|----------|
| `/` | Unified home dashboard | P0 |
| `/explore` | Books, subjects, collections, learning paths | P0 |
| `/my-library` | Saved books, reading progress, highlights, notes | P0 |
| `/books` | Netflix-style book library | P0 |
| `/books/[slug]` | Book details and summary options | P0 |
| `/books/[slug]/read` | Book summary reader | P0 |
| `/books/[slug]/study` | Turn chapters into study material | P1 |
| `/learning-paths` | Browse structured learning paths | P1 |
| `/learning-paths/[id]` | Detailed learning path | P1 |
| `/flashcards` | Existing learning-set library | Existing |
| `/study/[id]` | Existing flashcard study experience | Existing |
| `/agenda` | Unified agenda (books + existing tasks) | P1 |
| `/notes` | Highlights and personal notes | P1 |
| `/admin/books` | Admin catalog management | P2 |
| `/admin/processing` | AI-processing queue | P2 |
| `/admin/learning-paths` | Learning-path editor | P2 |

**Header:** Global search, notifications, profile menu, prominent "Create" action

---

## Phase 1: Foundation & Reading Experience (MVP)

### Goal
Deliver end-to-end book discovery, reading, and progress tracking.

### Features

#### 1.1 Book Library (`/books`)

**Layout:** Netflix-style horizontal scrolling rows

**Features:**
- Search by title, author, topic, concept
- Category filters (Psychology, Business, Science, History, Philosophy, etc.)
- Language filter
- Reading-time filter (15 min, 30 min, 1 hour)
- Detail level filter (Concise, Detailed, Both)
- Progress filter (Unread, In Progress, Completed, Saved)
- Curated collections (shelves)
- Sorting (Recommended, Recently Added, Alphabetical, Popular)
- Bookmarks (save to My Library)

**Collections:**
- Essential Books for Personal Growth
- Psychology and Human Behaviour
- Business and Entrepreneurship
- Science Explained
- Philosophy and Big Ideas
- Study Smarter
- Books for Beginners
- Recently Added

**Book Card:**
- Custom artwork (not publisher covers)
- Title, author
- Reading time estimate
- Available languages
- Detail level badges
- Progress indicator (if started)

#### 1.2 Book Detail Page (`/books/[slug]`)

**Sections:**
- Book overview (title, author, artwork, description, topic, source/edition, languages, reading time)
- Learning outcomes (main ideas user will understand)
- Available formats (concise, detailed, chapters)
- Table of contents (chapter titles, available summary versions)
- Personal activity (reading progress, notes, saved state, previous study material)
- Related content (other books, learning sets, learning paths)

**Learning Options:**
- Concise summary
- Detailed summary
- Choose chapters (select any combination)
- Build a study pack (create flashcards/quizzes)

#### 1.3 Book Reader (`/books/[slug]/read`)

**Layout:**
- Comfortable reading area
- Chapter sidebar (desktop) / drawer (mobile)
- Compact reading toolbar

**Features:**
- Concise/detailed toggle
- Chapter navigation (prev/next, progress tracking)
- Language selection
- Search within book
- Adjustable text size
- Bookmarks & last-read position
- Text highlights & personal notes
- Links to definitions & related concepts
- "Study this" menu (create learning resources)

**Study Actions Menu:**
- Highlight (save to notes)
- Create flashcards (turn ideas into learning set)
- Create quiz (practice understanding)
- Add to learning path
- Schedule session (add to agenda)

**Progress Tracking:**
- Server-side saving (not just browser)
- Current chapter, position, progress %
- Selected language, last-opened time, completion status
- Cross-device sync
- Separate "reading progress" vs "mastery progress"

#### 1.4 My Library (`/my-library`)

**Sections:**
- Continue Reading (unfinished books, last chapter)
- Saved Books (bookmarks)
- Completed Books
- My Study Sets (generated from books)
- Highlights and Notes (filterable by book/chapter)
- My Learning Paths

**Features:**
- Search, filter, sort
- Distinction from public catalog (user-specific data)
- Separate from JSON (user data in Supabase, shared content in JSON)

#### 1.5 JSON Content Structure

**File:** `content/books/index.json` (catalog metadata)

```json
{
  "version": "1.0",
  "lastUpdated": "2024-01-20",
  "books": [
    {
      "id": "psychology-101",
      "slug": "psychology-101",
      "title": "Psychology 101",
      "author": "Example Author",
      "description": "A comprehensive introduction to psychology",
      "topic": "psychology",
      "languages": ["en", "nl"],
      "formats": ["concise", "detailed"],
      "readingTime": {
        "concise": 15,
        "detailed": 45
      },
      "cover": {
        "primaryColor": "#3b82f6",
        "secondaryColor": "#8b5cf6",
        "icon": "brain"
      },
      "collections": ["psychology", "beginners"],
      "publishedAt": "2024-01-15"
    }
  ]
}
```

**File:** `content/books/[slug]/content.json` (book content)

```json
{
  "id": "psychology-101",
  "title": "Psychology 101",
  "author": "Example Author",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Introduction to Psychology",
      "order": 1,
      "summaries": {
        "en": {
          "concise": "Concise summary text...",
          "detailed": "Detailed summary text with explanations..."
        },
        "nl": {
          "concise": "Korte samenvatting...",
          "detailed": "Gedetailleerde samenvatting..."
        }
      },
      "keyConcepts": ["consciousness", "perception", "memory"],
      "learningOutcomes": ["Understand basic psychology", "Learn key terms"]
    }
  ]
}
```

#### 1.6 Database Schema (Phase 1)

**New Tables:**

```sql
-- Books catalog metadata
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  languages TEXT[] DEFAULT ARRAY['en'],
  formats TEXT[] DEFAULT ARRAY['concise'],
  reading_time_concise INTEGER,
  reading_time_detailed INTEGER,
  cover_config JSONB,
  collections TEXT[],
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User book progress
CREATE TABLE user_book_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  current_chapter_id TEXT,
  progress_percent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  selected_language TEXT DEFAULT 'en',
  selected_format TEXT DEFAULT 'concise',
  is_completed BOOLEAN DEFAULT FALSE,
  last_opened_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- User saved books (bookmarks)
CREATE TABLE user_saved_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Book highlights
CREATE TABLE book_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id TEXT,
  text TEXT NOT NULL,
  position INTEGER,
  color TEXT DEFAULT '#fbbf24',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book notes
CREATE TABLE book_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id TEXT,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_books_topic ON books(topic);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_user_book_progress_user ON user_book_progress(user_id);
CREATE INDEX idx_user_book_progress_book ON user_book_progress(book_id);
CREATE INDEX idx_user_saved_books_user ON user_saved_books(user_id);
CREATE INDEX idx_book_highlights_user_book ON book_highlights(user_id, book_id);
CREATE INDEX idx_book_notes_user_book ON book_notes(user_id, book_id);

-- RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Books are publicly readable" ON books FOR SELECT USING (true);
CREATE POLICY "Users manage own book progress" ON user_book_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved books" ON user_saved_books FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own highlights" ON book_highlights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON book_notes FOR ALL USING (auth.uid() = user_id);
```

#### 1.7 Components to Create

**New Components:**
- `components/books/BookLibrary.tsx` - Netflix-style library
- `components/books/BookCard.tsx` - Individual book card
- `components/books/BookDetail.tsx` - Book detail page
- `components/books/BookReader.tsx` - Reading interface
- `components/books/ChapterSidebar.tsx` - Chapter navigation
- `components/books/StudyActionsMenu.tsx` - Study actions dropdown
- `components/books/BookFilters.tsx` - Filter controls
- `components/books/CollectionShelf.tsx` - Curated collection row
- `components/my-library/MyLibrary.tsx` - Personal library
- `components/my-library/ContinueReading.tsx` - Continue reading section
- `components/my-library/MyStudySets.tsx` - Generated study sets
- `components/my-library/MyNotes.tsx` - Personal notes

**Pages:**
- `app/books/page.tsx` - Book library
- `app/books/[slug]/page.tsx` - Book detail
- `app/books/[slug]/read/page.tsx` - Book reader
- `app/my-library/page.tsx` - My library

**Lib Files:**
- `lib/books/catalog.ts` - Load and parse book catalog
- `lib/books/content.ts` - Load book content from JSON
- `lib/books/progress.ts` - Manage reading progress
- `lib/books/highlights.ts` - Manage highlights
- `lib/books/notes.ts` - Manage notes

---

## Phase 2: Connect Books to Learning Sets

### Goal
Allow users to generate learning sets from books using existing infrastructure.

### Features

#### 2.1 Study from Book Page (`/books/[slug]/study`)

**Controls:**
- Source material (entire book, selected chapters, current chapter)
- Output (flashcards, quiz, test, study notes)
- Number of questions (user-selected or automatic)
- Difficulty (beginner, intermediate, advanced)
- Question style (definitions, explanations, applications, mixed)
- Language
- Destination (new learning set, existing set, learning path)

**Example Flow:**
1. User selects chapters 2, 3, 5
2. Chooses 20 flashcards in Dutch
3. Creates learning set: "Psychology — Chapters 2, 3, 5"
4. Platform generates draft
5. User previews and edits cards
6. Saves using existing learning-set workflow

#### 2.2 Learning Set Enhancement

**Add source metadata to existing learning_sets table:**

```sql
ALTER TABLE learning_sets
ADD COLUMN source_type TEXT CHECK (source_type IN ('manual', 'book', 'upload', 'path'));
ADD COLUMN source_book_id UUID REFERENCES books(id);
ADD COLUMN source_chapters TEXT[];
ADD COLUMN source_language TEXT;
```

**Existing learning-set flow:**
- Reuse existing creation UI
- Reuse existing card editor
- Reuse existing study modes (flip, written, multiple choice)
- Reuse existing spaced repetition
- Reuse existing review scheduling

**Critical Rule:** Book-generated flashcards must be normal AetherLearn learning sets. No separate "book flashcards" system.

#### 2.3 AI Generation (Placeholder)

For MVP, can be manual or simple rule-based. Full AI generation is P2.

**Manual Generation (MVP):**
- Pre-defined key concepts from book JSON
- Template-based card generation
- User edits before saving

**AI Generation (P2):**
- Use existing Artisan workflow
- Send book/chapter content to AI
- Generate Q&A pairs
- Return draft for review

#### 2.4 Components to Create

**New Components:**
- `components/books/StudyFromBook.tsx` - Study creation interface
- `components/books/ChapterSelector.tsx` - Multi-select chapters
- `components/books/StudyOptions.tsx` - Output, difficulty, style options
- `components/books/PreviewCards.tsx` - Preview generated cards

**Modified Components:**
- Update existing learning-set creation to accept book source
- Update card editor to show source reference

---

## Phase 3: Unified Dashboard & Agenda

### Goal
Combine book learning with existing learning activities in one dashboard.

### Features

#### 3.1 Enhanced Home Dashboard (`/`)

**Sections:**
- Continue Learning (books, flashcard sets, other activities)
- Up Next (scheduled revisions, reading sessions, incomplete tasks)
- Your Learning Paths (ongoing curricula)
- Recommended Books (based on interests, reading history)
- Continue Your Subjects (existing school material)
- Recently Saved (bookmarked resources)
- Discover Something New (Netflix-style collections)

**Logic:**
- Prioritize in-progress content over random popular content
- Combine book progress with study-set progress
- Show next recommended action for each activity

#### 3.2 Unified Agenda (`/agenda`)

**Extend existing agenda to include:**
- Read Chapter 4 (from book reader)
- Revise 18 due flashcards (existing review)
- Complete psychology quiz (book-generated set)
- Study school learning set (existing)
- Continue learning path (path module)

**Scheduling:**
- User adds reading sessions manually (MVP)
- Choose estimated session length, date, time
- Track planned session separately from actual progress
- Existing spaced-repetition logic unchanged
- Reading sessions ≠ mastery

#### 3.3 Components to Modify

**Modified Components:**
- `components/dashboard/DashboardOverview.tsx` - Add book sections
- `components/agenda/Agenda.tsx` - Add book sessions
- Update task types to include reading sessions

---

## Phase 4: Learning Paths & Personal Knowledge

### Goal
Organize books and learning sets into structured curricula.

### Features

#### 4.1 Learning Paths (`/learning-paths`)

**Structure:**
```
Learning Path
├── Title, description, topic
├── Estimated duration
├── Creator (admin or user)
└── Modules
    ├── Module 1
    │   ├── Title, description
    │   └── Items (ordered)
    │       ├── Book (entire or chapters)
    │       ├── Learning set
    │       ├── Quiz
    │       └── Revision task
    ├── Module 2
    └── ...
```

**Example Path: "Learn Psychology from the Ground Up"**
- Module 1: Introduction (Book + flashcards)
- Module 2: Cognitive Psychology (Book chapters + quiz)
- Module 3: Apply Concepts (Test + review)
- Module 4: Final Revision (Review + assessment)

**Features:**
- Discover ready-made paths
- Create personal paths
- Ordered items
- Progress tracking per user
- Recommended activities appear in My Learning
- Add to agenda

#### 4.2 Database Schema (Phase 4)

```sql
-- Learning paths
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  creator_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  estimated_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning path modules
CREATE TABLE learning_path_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning path items
CREATE TABLE learning_path_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES learning_path_modules(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('book', 'book_chapters', 'learning_set', 'quiz', 'revision')),
  item_id TEXT NOT NULL,
  title TEXT,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User learning path progress
CREATE TABLE user_learning_path_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  current_module_id UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_id)
);

-- User item progress
CREATE TABLE user_learning_item_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path_item_id UUID REFERENCES learning_path_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_item_id)
);

-- Indexes
CREATE INDEX idx_learning_paths_topic ON learning_paths(topic);
CREATE INDEX idx_learning_paths_creator ON learning_paths(creator_id);
CREATE INDEX idx_learning_path_modules_path ON learning_path_modules(path_id);
CREATE INDEX idx_learning_path_items_module ON learning_path_items(module_id);
CREATE INDEX idx_user_path_progress_user ON user_learning_path_progress(user_id);
CREATE INDEX idx_user_item_progress_user ON user_learning_item_progress(user_id);

-- RLS
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_item_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public paths are readable" ON learning_paths FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Users manage own paths" ON learning_paths FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Users manage own path progress" ON user_learning_path_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own item progress" ON user_learning_item_progress FOR ALL USING (auth.uid() = user_id);
```

#### 4.3 Components to Create

**New Components:**
- `components/learning-paths/LearningPaths.tsx` - Browse paths
- `components/learning-paths/LearningPathDetail.tsx` - Path detail view
- `components/learning-paths/ModuleList.tsx` - Module display
- `components/learning-paths/ItemList.tsx` - Items within module
- `components/learning-paths/ProgressTracker.tsx` - Progress visualization
- `components/learning-paths/CreatePath.tsx` - Path creation (admin/user)

**Pages:**
- `app/learning-paths/page.tsx` - Browse paths
- `app/learning-paths/[slug]/page.tsx` - Path detail

---

## Phase 5: Admin & Artisan Pipeline

### Goal
Admin interface for catalog management and private document processing.

### Features

#### 5.1 Admin Book Catalog (`/admin/books`)

**Capabilities:**
- View, search, filter books
- Add/edit book metadata
- Track rights status, source/edition details
- See available languages and summary types
- Upload/publish validated JSON content
- Preview book detail page and reader
- Manage status (draft, under review, published, withdrawn)
- Manage custom artwork and source references
- Track content versions
- Reprocess book without losing history

**Validation Rule:** Book never becomes public just because AI generated JSON. Must pass validation + editorial + rights checks.

#### 5.2 Admin Processing Queue (`/admin/processing`)

**Manages Artisan workflow:**
- Queue with job status
- Submission details
- Download state
- Processing history
- Errors
- Retry failed downloads
- Record manual AI processing complete
- Upload generated output
- Review and mark complete

**Separate status types:**
- Technical status (file generated?)
- Review status (quality approved?)

#### 5.3 Admin Learning Path Editor (`/admin/learning-paths`)

**Capabilities:**
- Build curated paths
- Add books, chapters, learning sets, quizzes
- Define order
- Reuse existing learning-set references
- Avoid duplicate content

#### 5.4 Notifications

**Event Types:**
- Processing (document ready, needs attention)
- Learning (scheduled session due, review due)
- Content (saved book has update)

**Delivery:**
- Stored in database (source of truth)
- In-app notifications
- Email (separate channel, optional)

#### 5.5 Database Schema (Phase 5)

```sql
-- Book processing jobs
CREATE TABLE book_processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_url TEXT,
  source_file_path TEXT,
  requested_outputs JSONB,
  technical_status TEXT DEFAULT 'pending' CHECK (technical_status IN ('pending', 'downloading', 'processing', 'completed', 'failed')),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'under_review', 'approved', 'rejected')),
  progress_logs JSONB DEFAULT '[]'::jsonb,
  result_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('processing', 'learning', 'content')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_book_jobs_user ON book_processing_jobs(user_id);
CREATE INDEX idx_book_jobs_status ON book_processing_jobs(technical_status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- RLS
ALTER TABLE book_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own jobs" ON book_processing_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
```

#### 5.6 Components to Create

**New Components:**
- `components/admin/BookCatalog.tsx` - Catalog management
- `components/admin/BookEditor.tsx` - Add/edit book
- `components/admin/ProcessingQueue.tsx` - Job queue
- `components/admin/JobDetail.tsx` - Job detail view
- `components/admin/LearningPathEditor.tsx` - Path editor
- `components/notifications/NotificationCenter.tsx` - Notification bell
- `components/notifications/NotificationList.tsx` - Notification dropdown

**Pages:**
- `app/admin/books/page.tsx` - Catalog management
- `app/admin/processing/page.tsx` - Processing queue
- `app/admin/learning-paths/page.tsx` - Path editor

---

## Phase 6: Universal Search

### Goal
Search across entire platform (books, chapters, learning sets, paths, notes).

### Features

**Search Categories:**
- Books
- Chapters and concepts
- Learning sets
- Learning paths
- Personal notes

**Search Scope:**
- Public content (books, paths)
- User's private content (notes, private sets)
- Privacy: user only sees their own private results

**Implementation:**
- MVP: Search book metadata (title, author, topic)
- P2: Database/index-based search for broader queries
- P2: Chapter-level concept search (index terms, not full text)
- P2: Semantic search across summaries

**Result Behavior:**
- Click book → book detail page
- Click chapter → reader at that chapter
- Click learning set → existing study page
- Click note → note editor

---

## User Flows to Test

### Flow A: Discover, Read, Study, Remember
1. Home/Explore → discover book
2. Book detail → select summary type/chapters
3. Reader → read, bookmark, highlight, take notes
4. Study from Book → create flashcards/quiz
5. Existing learning-set flow → review/edit, save
6. Existing study page → practice with normal modes
7. Agenda/reviews → scheduled sessions appear
8. Home → book, study material, next action connected

### Flow B: Learn Topic Systematically
1. Explore → choose learning path → start
2. Path has sequence of books, chapters, sets, assessments
3. After each activity → progress saved
4. Next recommended item shown on path, home, agenda
5. Finish module → path shows completion
6. NOT auto-mark every concept as mastered

### Flow C: Return to Unfinished Learning
1. User returns after few days
2. Dashboard shows unfinished reading, upcoming revision, active paths
3. Open book → restore previous position
4. Open learning set → existing study flow
5. Open agenda item → direct to resource

### Flow D: Upload via Artisan
1. Open private processing page
2. Upload documents, select output, submit
3. System shows processing status
4. Local worker downloads, manual AI processing
5. After processing + review → result available privately
6. User can read, create study material, use revision features
7. Private uploads NOT auto-enter public catalog
8. Publishing → separate authorization + approval

---

## Technical Architecture

### Data Separation

| Data Type | Storage | Notes |
|-----------|---------|-------|
| Published book summaries | JSON files | Versioned, content/ |
| User progress/notes | Supabase | Row-level security |
| Learning sets | Supabase (existing) | Add source metadata |
| Learning paths | Supabase | New tables |
| Processing jobs | Supabase | Private uploads |
| Catalog metadata | Supabase or JSON | Start with JSON index |

### Security

- Row-level security for all user-specific tables
- Server enforces permissions (not just frontend)
- Private uploads separate from public catalog
- Personal notes never in public JSON

### Performance

- Load book content on-demand (not full catalog)
- Compact catalog index
- Chapter-level indexing (not full text search)
- Lazy loading for large content

---

## Implementation Roadmap Summary

| Phase | Duration | Key Deliverables | Success Criteria |
|-------|----------|------------------|-----------------|
| **1** | 2-3 weeks | Book library, detail, reader, My Library, progress tracking | Can discover, read, resume book |
| **2** | 1-2 weeks | Study from Book, generate learning sets | Can create set from book, study with existing modes |
| **3** | 1 week | Unified dashboard, agenda integration | Books appear in dashboard, sessions in agenda |
| **4** | 2 weeks | Learning paths, search | Can follow path, search across platform |
| **5** | 2 weeks | Admin pages, processing queue, notifications | Can manage catalog, process uploads |
| **6** | 1 week | Advanced search | Semantic search, concept-level results |

**Total:** 9-12 weeks for full implementation

**MVP (Phases 1-2):** 3-5 weeks to prove core loop

---

## MVP Success Tests

Before expanding catalog, verify:

| Test | Success Condition |
|------|-------------------|
| Read a book | Can open, switch summary types, resume later |
| Save a book | Appears in My Library, not duplicated |
| Take notes | Persist, private, link to correct location |
| Generate flashcards | Draft created, can review/edit, opens in existing study |
| Revise a set | Existing review scheduling works |
| Use learning path | Completing item updates path progress |
| Schedule reading | Session appears in agenda, links to reader |
| Process upload | User sees statuses, only sees own results |
| Publish book | Passes validation, rights, editorial approval |

**Most Important Test:**
Read chapter → create learning set → study it → revise later → see progress on dashboard

---

## What to Deliberately Postpone

For first release, avoid:
- AI tutor across entire catalog
- Automatic personalized curricula
- Audio narration for every book
- Social features
- Live AI summarization for every request
- Complicated adaptive scheduling

These can be valuable later but add cost/complexity before validating core loop.

---

## Final Recommendation

**Treat the book library as a new content source for AetherLearn's existing learning engine.**

- Books provide knowledge
- Reader makes it understandable
- Existing learning-set system turns knowledge into practice
- Agenda and revision system help users retain it
- Learning paths organize everything into curriculum

**First release focus:**
1. Book library
2. Book detail pages
3. Quality reader
4. Creating learning sets from books
5. Unified reading/revision progress

This creates foundation for everything else without duplicating existing functionality.
