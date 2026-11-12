# Route Matrix

Generated during Phase 0.2 of the Development Roadmap

## Overview
This document covers all pages and features in the application, organized by category.

---

## Authentication Routes

### `/login`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: User login with Supabase
- **File**: `app/(auth)/login/page.tsx`

### `/register`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: User registration with Supabase
- **File**: `app/(auth)/register/page.tsx`

### `/reset-password`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Password reset request
- **File**: `app/(auth)/reset-password/page.tsx`

### `/reset-password/confirm`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Password reset confirmation
- **File**: `app/(auth)/reset-password/confirm/page.tsx`

### `/logout`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: User logout
- **File**: `app/logout/page.tsx`

---

## Core Pages

### `/` (Home)
- **Type**: Page
- **Authentication**: Public (redirects to dashboard if logged in)
- **Purpose**: Landing page with interactive greeting
- **File**: `app/page.tsx`

### `/dashboard`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Main dashboard with daily stats and navigation
- **File**: `app/dashboard/page.tsx`
- **Features**: Daily statistics, quick navigation, greeting

### `/today` (Today)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Today's dashboard with focus on daily tasks
- **File**: `app/today/page.tsx`
- **Features**: Daily stats, streak, study suggestions

### `/settings` (Settings)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: User settings and preferences
- **File**: `app/settings/page.tsx`
- **Features**: Theme, language, notifications, account settings

### `/profile`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: User profile management
- **File**: `app/profile/page.tsx`
- **Features**: Profile editing, avatar, grade information

---

## Learning & Study Routes

### `/subjects` (Subjects)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Subject management and navigation
- **File**: `app/subjects/page.tsx`
- **Features**: Subject list, subject creation, secret subjects

### `/subjects/[subjectId]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Subject detail page
- **File**: `app/subjects/[subjectId]/page.tsx`
- **Features**: Subject overview, content sections

### `/subjects/[subjectId]/[chapterId]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Chapter detail page
- **File**: `app/subjects/[subjectId]/[chapterId]/page.tsx`
- **Features**: Chapter sections, content navigation

### `/subjects/[subjectId]/[chapterId]/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Paragraph/section detail page
- **File**: `app/subjects/[subjectId]/[chapterId]/[id]/page.tsx`
- **Features**: Content view, study mode

### `/learn/[subjectId]/[pageId]`
- **Type**: Page
- **Authentication**: Public (content can be public)
- **Purpose**: Learn page with content display
- **File**: `app/learn/[subjectId]/[pageId]/page.tsx`
- **Features**: Content rendering, view modes (simple/book/study)

### `/study-sets` (Study Sets)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Study sets list and management
- **File**: `app/study-sets/page.tsx`
- **Features**: Study set list, filtering, search

### `/study-sets/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Study set detail
- **File**: `app/study-sets/[id]/page.tsx`
- **Features**: Study set overview, study modes

### `/study-sets/create`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Create new study set
- **File**: `app/study-sets/create/page.tsx`
- **Features**: Study set creation form

### `/study-sets/edit/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Edit existing study set
- **File**: `app/study-sets/edit/[id]/page.tsx`
- **Features**: Study set editing

### `/decks` (Flashcard Decks)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Flashcard deck management
- **File**: `app/decks/page.tsx`
- **Features**: Deck list, deck creation

### `/decks/create`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Create new flashcard deck
- **File**: `app/decks/create/page.tsx`
- **Features**: Deck creation form

### `/decks/edit/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Edit flashcard deck
- **File**: `app/decks/edit/[id]/page.tsx`
- **Features**: Deck editing, card management

### `/study/[deck_id]/[mode]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Study session with specific mode
- **File**: `app/study/[deck_id]/[mode]/page.tsx`
- **Features**: Flashcard, multiple choice, typing, matching modes

### `/spaced-repetition`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Spaced repetition review
- **File**: `app/spaced-repetition/page.tsx`
- **Features**: FSRS-based review session

### `/active-recall`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Active recall practice
- **File**: `app/active-recall/page.tsx`
- **Features**: Active recall exercises

### `/daily-quiz`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Daily quiz challenge
- **File**: `app/daily-quiz/page.tsx`
- **Features**: Daily quiz generation and completion

### `/quiz/daily`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Alternative daily quiz route
- **File**: `app/quiz/daily/page.tsx`
- **Features**: Daily quiz interface

---

## Content Routes

### `/[page]`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Generic content page route
- **File**: `app/[page]/page.tsx`
- **Features**: Content display with view modes, caching

### `/[page]/ai`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: AI assistance for content
- **File**: `app/[page]/ai/page.tsx`
- **Features**: AI chat, content assistance

### `/[page]/copy`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Copy content page
- **File**: `app/[page]/copy/page.tsx`
- **Features**: Content duplication

### `/[page]/raw`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Raw content view
- **File**: `app/[page]/raw/page.tsx`
- **Features**: Raw JSON/Markdown display

### `/lessons` (Lessons)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Lessons overview
- **File**: `app/lessons/page.tsx`
- **Features**: Lesson list, lesson management

### `/library` (Library)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Content library
- **File**: `app/library/page.tsx`
- **Features**: Content browsing, search

---

## Productivity Routes

### `/notes` (Notes)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Note-taking workspace
- **File**: `app/notes/page.tsx`
- **Features**: Rich text editor, visual tools (diagrams, mind maps), filesystem integration

### `/inbox`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Quick notes/tasks inbox
- **File**: `app/inbox/page.tsx`
- **Features**: Quick task capture, checkbox list

### `/planner`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Study planner
- **File**: `app/planner/page.tsx`
- **Features**: Task planning, scheduling

### `/agenda`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Calendar/agenda view
- **File**: `app/agenda/page.tsx`
- **Features**: Calendar display, event management

### `/error-log` (Error Log)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Error tracking and review
- **File**: `app/error-log/page.tsx`
- **Features**: Error logging, categorization, review

---

## Test Week Routes

### `/test-week` (Test Week)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Test week overview
- **File**: `app/test-week/page.tsx`
- **Features**: Test week list, test week management

### `/test-week/[page]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Test week detail
- **File**: `app/test-week/[page]/page.tsx`
- **Features**: Test week subjects, planning

### `/test-prep` (Test Week Preparation)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Test week preparation interface
- **File**: `app/test-prep/page.tsx`
- **Features**: Study planning for test week

### `/test-prep/[page]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Test week preparation detail
- **File**: `app/test-prep/[page]/page.tsx`
- **Features**: Detailed preparation interface

### `/testweek/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Alternative test week route
- **File**: `app/testweek/[id]/page.tsx`
- **Features**: Test week management

---

## Analytics Routes

### `/statistics` (Statistics)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: User statistics dashboard
- **File**: `app/statistics/page.tsx`
- **Features**: Study stats, progress charts, performance metrics

### `/analytics`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Analytics dashboard
- **File**: `app/analytics/page.tsx`
- **Features**: Advanced analytics, insights

### `/analytics/fsrs`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: FSRS algorithm analytics
- **File**: `app/analytics/fsrs/page.tsx`
- **Features**: Spaced repetition analytics

### `/grades` (Grades)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Grade tracking
- **File**: `app/grades/page.tsx`
- **Features**: Grade overview, subject grades

### `/grades/[subject]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Subject-specific grades
- **File**: `app/grades/[subject]/page.tsx`
- **Features**: Detailed grade information per subject

---

## Admin Routes

### `/admin`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Admin portal dashboard
- **File**: `app/admin/page.tsx`
- **Features**: Admin dashboard, navigation to admin tools

### `/admin/analytics`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Admin analytics dashboard
- **File**: `app/admin/analytics/page.tsx`
- **Features**: Platform-wide analytics

### `/admin/subjects`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Subject management
- **File**: `app/admin/subjects/page.tsx`
- **Features**: CRUD for subjects

### `/admin/subject-buttons`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Subject button management
- **File**: `app/admin/subject-buttons/page.tsx`
- **Features**: Button configuration

### `/admin/secret-subjects`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Secret subject management
- **File**: `app/admin/secret-subjects/page.tsx`
- **Features**: Secret subjects, access requests

### `/admin/lessons`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Lesson management
- **File**: `app/admin/lessons/page.tsx`
- **Features**: Lesson CRUD

### `/admin/leerset-pages`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Learning set page management
- **File**: `app/admin/leerset-pages/page.tsx`
- **Features**: Learning set page configuration

### `/admin/agenda-events`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Agenda event management
- **File**: `app/admin/agenda-events/page.tsx`
- **Features**: Event CRUD for agenda

### `/admin/buttons`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Button management
- **File**: `app/admin/buttons/page.tsx`
- **Features**: Global button configuration

### `/admin/artisan`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: Artisan ingestion dashboard
- **File**: `app/admin/artisan/page.tsx`
- **Features**: File upload monitoring, processing queue

### `/admin/json-builder`
- **Type**: Page
- **Authentication**: Admin session
- **Purpose**: No-code JSON content builder
- **File**: `app/admin/json-builder/page.tsx`
- **Features**: Visual content page builder

---

## AI & Research Routes

### `/tutor`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: AI tutor interface
- **File**: `app/tutor/page.tsx`
- **Features**: AI chat, learning assistance

### `/research`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Research topics overview
- **File**: `app/research/page.tsx`
- **Features**: Research topic list

### `/research/[slug]`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Research topic detail
- **File**: `app/research/[slug]/page.tsx`
- **Features**: Research content display

---

## Utility Routes

### `/search` (Search)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Global search
- **File**: `app/search/page.tsx`
- **Features**: Search across content, study sets, notes

### `/groups` (Groups)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Group/class management
- **File**: `app/groups/page.tsx`
- **Features**: Class management, member management

### `/accessibility` (Accessibility)
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Accessibility settings
- **File**: `app/accessibility/page.tsx`
- **Features**: Accessibility preferences

### `/landing`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Landing page
- **File**: `app/landing/page.tsx`
- **Features**: Marketing, feature showcase

### `/learning-platform`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Learning platform interface
- **File**: `app/learning-platform/page.tsx`
- **Features**: Standalone learning platform

### `/standalone/[file]`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Standalone file viewer
- **File**: `app/standalone/[file]/page.tsx`
- **Features**: File viewing

### `/canvas`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Canvas/drawing tool
- **File**: `app/canvas/page.tsx`
- **Features**: Drawing canvas

### `/graph`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Graph visualization
- **File**: `app/graph/page.tsx`
- **Features**: Data visualization

### `/record`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Recording tool
- **File**: `app/record/page.tsx`
- **Features**: Audio/video recording

---

## Artisan Routes

### `/artisan`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Artisan ingestion interface
- **File**: `app/artisan/page.tsx`
- **Features**: File upload, content ingestion

### `/artisan-hub`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Artisan hub/dashboard
- **File**: `app/artisan-hub/page.tsx`
- **Features**: Artisan management

---

## Learn List Management

### `/create/learning-list`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Create learning list
- **File**: `app/create/learning-list/page.tsx`
- **Features**: Learning list creation

### `/edit/learning-list/[id]`
- **Type**: Page
- **Authentication**: Required
- **Purpose**: Edit learning list
- **File**: `app/edit/learning-list/[id]/page.tsx`
- **Features**: Learning list editing

---

## Legal Routes

### `/privacy`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Privacy policy (Dutch)
- **File**: `app/privacy/page.tsx`
- **Features**: Privacy policy content

### `/terms`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Terms of service (Dutch)
- **File**: `app/terms/page.tsx`
- **Features**: Terms of service content

### `/nl/privacy`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Privacy policy (Dutch)
- **File**: `app/nl/privacy/page.tsx`
- **Features**: Privacy policy content

### `/nl/terms`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Terms of service (Dutch)
- **File**: `app/nl/terms/page.tsx`
- **Features**: Terms of service content

### `/en/privacy`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Privacy policy (English)
- **File**: `app/en/privacy/page.tsx`
- **Features**: Privacy policy content

### `/en/terms`
- **Type**: Page
- **Authentication**: Public
- **Purpose**: Terms of service (English)
- **File**: `app/en/terms/page.tsx`
- **Features**: Terms of service content

---

## Summary

### Total Pages: 80+

### By Category:
- **Authentication**: 5 pages
- **Core Pages**: 5 pages
- **Learning & Study**: 19 pages
- **Content**: 9 pages
- **Productivity**: 5 pages
- **Test Week**: 5 pages
- **Analytics**: 4 pages
- **Admin**: 11 pages
- **AI & Research**: 3 pages
- **Utility**: 9 pages
- **Artisan**: 2 pages
- **Learn List Management**: 2 pages
- **Legal**: 6 pages

### Authentication Requirements:
- **Public**: 16 pages (landing, auth, legal, some content)
- **Required**: 60+ pages (most features)
- **Admin**: 11 pages (admin-specific)

### Dynamic Routes:
- `/[page]` - Generic content pages
- `/[page]/ai`, `/[page]/copy`, `/[page]/raw` - Content sub-pages
- `/subjects/[subjectId]` - Subject pages
- `/subjects/[subjectId]/[chapterId]` - Chapter pages
- `/subjects/[subjectId]/[chapterId]/[id]` - Paragraph pages
- `/learn/[subjectId]/[pageId]` - Learn pages
- `/study-sets/[id]` - Study set pages
- `/decks/edit/[id]` - Deck editing
- `/study/[deck_id]/[mode]` - Study sessions
- `/test-week/[page]` - Test week pages
- `/test-prep/[page]` - Test week preparation
- `/testweek/[id]` - Alternative test week
- `/grades/[subject]` - Subject grades
- `/research/[slug]` - Research topics
- `/standalone/[file]` - File viewer
- `/edit/learning-list/[id]` - Learning list editing
