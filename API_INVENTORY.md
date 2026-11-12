# API Route Inventory

Generated during Phase 0.2 of the Development Roadmap

## Overview
This document inventories all API routes in `app/api/**`, documenting caller, authentication method, storage backend, and response contract.

---

## Admin Routes

### `/api/admin/auth`
- **Methods**: POST
- **Caller**: Admin portal login page (`/admin`)
- **Authentication**: None (login endpoint)
- **Storage Backend**: Environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
- **Request Body**: `{ email: string, password: string }`
- **Response Contract**:
  - Success (200): `{ success: true, message: string }` + sets HTTP-only cookie
  - Error (401): `{ error: string }`
  - Error (500): `{ error: string }` (if env vars not configured)

### `/api/admin/content-pages`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin portal, subject pages
- **Authentication**: Admin session cookie
- **Storage Backend**: Supabase (content_pages table)
- **Request Body (POST)**: Content page metadata
- **Response Contract**: JSON array of content pages or single page object

### `/api/admin/curriculum`
- **Methods**: GET
- **Caller**: Admin portal, content explorer
- **Authentication**: Admin session cookie
- **Storage Backend**: Supabase (subjects, chapters, paragraphs tables)
- **Response Contract**: `{ subjects: [], chapters: [], paragraphs: [] }`

### `/api/admin/events`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin agenda events page
- **Authentication**: Admin session cookie
- **Storage Backend**: JSON file (`admin-events.json`)
- **Response Contract**: `{ events: Event[], lastUpdated: string }`

### `/api/admin/lessons`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin lessons page
- **Authentication**: Admin session cookie
- **Storage Backend**: Supabase (lessons table)
- **Response Contract**: JSON array of lessons

### `/api/admin/secret-subjects`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin secret subjects page
- **Authentication**: Admin session cookie
- **Storage Backend**: JSON file (`secret-subjects.json`)
- **Response Contract**: `{ secretSubjects: [] }`

### `/api/admin/study-sets`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin portal
- **Authentication**: Admin session cookie
- **Storage Backend**: Supabase (study_sets table)
- **Response Contract**: JSON array of study sets

### `/api/admin/subject-buttons`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin subject buttons page
- **Authentication**: Admin session cookie
- **Storage Backend**: JSON file (`subject-buttons.json`)
- **Response Contract**: JSON array of subject buttons

### `/api/admin/subjects`
- **Methods**: GET, POST, DELETE
- **Caller**: Admin subjects page
- **Authentication**: Admin session cookie
- **Storage Backend**: Supabase (subjects table)
- **Response Contract**: JSON array of subjects

---

## Content Routes

### `/api/content`
- **Methods**: GET
- **Caller**: Learn pages, subject pages
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (content table)
- **Response Contract**: JSON array of content items

### `/api/content/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Learn pages, content editor
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (content table)
- **Response Contract**: Single content object

### `/api/content/page/[page]`
- **Methods**: GET
- **Caller**: Learn pages (`/learn/[subjectId]/[pageId]`)
- **Authentication**: None (public content)
- **Storage Backend**: Filesystem (JSON files in public/content/)
- **Response Contract**: JSON page content with sections

### `/api/content/page/[page]/raw`
- **Methods**: GET
- **Caller**: Learn pages (raw view)
- **Authentication**: None (public content)
- **Storage Backend**: Filesystem (JSON files)
- **Response Contract**: Raw JSON string

### `/api/content/page/[page]/txt`
- **Methods**: GET
- **Caller**: Learn pages (text view)
- **Authentication**: None (public content)
- **Storage Backend**: Filesystem (JSON files)
- **Response Contract**: Plain text content

### `/api/content/subjects/[subjectId]`
- **Methods**: GET
- **Caller**: Subject pages
- **Authentication**: None (public content)
- **Storage Backend**: Filesystem (JSON files)
- **Response Contract**: JSON subject content

### `/api/content/visual/[pageId]/[visualTag]`
- **Methods**: GET, POST, DELETE
- **Caller**: Notes editor, visual tools
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (visual_artifacts table)
- **Response Contract**: Visual artifact data (diagram, mind map, drawing)

### `/api/check-local-content`
- **Methods**: GET
- **Caller**: Artisan ingestion
- **Authentication**: None
- **Storage Backend**: Filesystem
- **Response Contract**: `{ hasLocalContent: boolean }`

---

## Study Routes

### `/api/studysets`
- **Methods**: GET, POST
- **Caller**: Decks page, study pages
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sets table)
- **Response Contract**: JSON array of study sets

### `/api/studysets/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Study pages, deck editor
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sets table)
- **Response Contract**: Single study set object

### `/api/studysets/[id]/cards`
- **Methods**: GET, POST, PUT, DELETE
- **Caller**: Study pages, card editor
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (flashcards table)
- **Response Contract**: JSON array of cards

### `/api/decks/rate`
- **Methods**: POST
- **Caller**: Study pages (after card review)
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (card_reviews table)
- **Request Body**: `{ cardId: string, rating: number }`
- **Response Contract**: Success/error message

### `/api/progress`
- **Methods**: GET, POST
- **Caller**: Dashboard, statistics
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sessions table)
- **Response Contract**: Progress statistics

---

## Calendar Routes

### `/api/calendar`
- **Methods**: GET, POST
- **Caller**: Calendar page, agenda
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (calendar_events table)
- **Response Contract**: JSON array of events

### `/api/calendar/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Calendar page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (calendar_events table)
- **Response Contract**: Single event object

### `/api/agenda/admin-events`
- **Methods**: GET
- **Caller**: Agenda page
- **Authentication**: Supabase user session
- **Storage Backend**: JSON file (admin-events.json)
- **Response Contract**: Admin events for user's agenda

---

## Test Week Routes

### `/api/testweeks`
- **Methods**: GET, POST
- **Caller**: Test week pages
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (test_weeks table)
- **Response Contract**: JSON array of test weeks

### `/api/testweeks/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Test week pages
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (test_weeks table)
- **Response Contract**: Single test week object

### `/api/testweeks/[id]/subjects`
- **Methods**: GET, POST, PUT, DELETE
- **Caller**: Test week pages
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (test_week_subjects table)
- **Response Contract**: JSON array of subjects in test week

---

## Homework Routes

### `/api/homework`
- **Methods**: GET, POST
- **Caller**: Planner, homework tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (homework table)
- **Response Contract**: JSON array of homework assignments

### `/api/homework/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Planner, homework tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (homework table)
- **Response Contract**: Single homework assignment

---

## Study Plans Routes

### `/api/studyplans`
- **Methods**: GET, POST
- **Caller**: Planner, study tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_plans table)
- **Response Contract**: JSON array of study plans

### `/api/studyplans/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Planner, study tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_plans table)
- **Response Contract**: Single study plan object

### `/api/studyplans/[id]/sessions`
- **Methods**: GET, POST
- **Caller**: Planner, study tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sessions table)
- **Response Contract**: JSON array of study sessions

### `/api/studyplans/[id]/sessions/[sessionId]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Planner, study tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sessions table)
- **Response Contract**: Single study session object

---

## Classes Routes

### `/api/classes`
- **Methods**: GET, POST
- **Caller**: Groups page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (classes table)
- **Response Contract**: JSON array of classes

### `/api/classes/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Groups page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (classes table)
- **Response Contract**: Single class object

### `/api/classes/[id]/members`
- **Methods**: GET, POST, DELETE
- **Caller**: Groups page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (class_members table)
- **Response Contract**: JSON array of class members

### `/api/classes/[id]/assignments`
- **Methods**: GET, POST
- **Caller**: Groups page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (assignments table)
- **Response Contract**: JSON array of assignments

### `/api/classes/[id]/assignments/[assignmentId]`
- **Methods**: GET, PUT, DELETE
- **Caller**: Groups page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (assignments table)
- **Response Contract**: Single assignment object

---

## Analytics Routes

### `/api/analytics`
- **Methods**: GET
- **Caller**: Statistics page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (analytics aggregation)
- **Response Contract**: Overall analytics data

### `/api/analytics/dashboard`
- **Methods**: GET
- **Caller**: Statistics page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (analytics aggregation)
- **Response Contract**: Dashboard analytics

### `/api/analytics/sessions`
- **Methods**: GET
- **Caller**: Statistics page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (study_sessions table)
- **Response Contract**: Session analytics

### `/api/analytics/subjects`
- **Methods**: GET
- **Caller**: Statistics page
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (subject_analytics view)
- **Response Contract**: Subject-specific analytics

### `/api/analytics/track`
- **Methods**: POST
- **Caller**: Study pages (for tracking)
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (analytics_events table)
- **Request Body**: Analytics event data
- **Response Contract**: Success/error message

---

## User Routes

### `/api/users/preferences`
- **Methods**: GET, PUT
- **Caller**: Settings page, various components
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (users table, preferences column)
- **Response Contract**: User preferences object

---

## AI Routes

### `/api/ai/chat`
- **Methods**: POST
- **Caller**: Tutor page
- **Authentication**: Supabase user session
- **Storage Backend**: OpenAI API (optional feature)
- **Request Body**: `{ message: string, context?: any }`
- **Response Contract**: AI response

### `/api/ai/generate-questions`
- **Methods**: POST
- **Caller**: Content creation tools
- **Authentication**: Supabase user session
- **Storage Backend**: OpenAI API (optional feature)
- **Request Body**: Content data
- **Response Contract**: Generated questions

### `/api/llm/[page]`
- **Methods**: GET
- **Caller**: Learn pages (LLM assistance)
- **Authentication**: Supabase user session
- **Storage Backend**: OpenAI API (optional feature)
- **Response Contract**: LLM-generated content

---

## Achievement Routes

### `/api/achievements`
- **Methods**: GET, POST
- **Caller**: Dashboard, statistics
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (achievements table)
- **Response Contract**: JSON array of achievements

---

## Streak Routes

### `/api/streaks`
- **Methods**: GET, POST
- **Caller**: Dashboard, statistics
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (streaks table)
- **Response Contract**: Streak data

---

## Research Routes

### `/api/research`
- **Methods**: GET
- **Caller**: Research page
- **Authentication**: None (public)
- **Storage Backend**: Filesystem (JSON files)
- **Response Contract**: JSON array of research topics

### `/api/research/[slug]`
- **Methods**: GET
- **Caller**: Research page
- **Authentication**: None (public)
- **Storage Backend**: Filesystem (JSON files)
- **Response Contract**: Single research topic

---

## Subject Routes

### `/api/subjects`
- **Methods**: GET
- **Caller**: Subject pages, global data
- **Authentication**: None (public)
- **Storage Backend**: Supabase (subjects table)
- **Response Contract**: JSON array of subjects

---

## Button Routes

### `/api/buttons`
- **Methods**: GET, POST
- **Caller**: ButtonSection component
- **Authentication**: None (public)
- **Storage Backend**: JSON file (buttons.json)
- **Response Contract**: JSON array of buttons

### `/api/buttons/[id]`
- **Methods**: GET, PUT, DELETE
- **Caller**: ButtonSection component
- **Authentication**: None (public)
- **Storage Backend**: JSON file (buttons.json)
- **Response Contract**: Single button object

---

## Utility Routes

### `/api/health`
- **Methods**: GET
- **Caller**: Health checks, monitoring
- **Authentication**: None
- **Storage Backend**: None
- **Response Contract**: `{ status: 'ok' }`

### `/api/errors`
- **Methods**: POST
- **Caller**: Error boundary, error tracking
- **Authentication**: Supabase user session
- **Storage Backend**: Supabase (errors table)
- **Request Body**: Error details
- **Response Contract**: Success/error message

### `/api/export-notes`
- **Methods**: POST
- **Caller**: Notes page (export functionality)
- **Authentication**: Supabase user session
- **Storage Backend**: Filesystem generation
- **Request Body**: Notes data and format
- **Response Contract**: Exported file (PDF, TXT, image)

---

## Storage Backends Summary

1. **Supabase Tables**:
   - users, subjects, study_sets, flashcards, card_reviews
   - study_sessions, study_plans, homework, classes
   - calendar_events, test_weeks, test_week_subjects
   - achievements, streaks, content_pages, visual_artifacts
   - analytics_events, errors

2. **Filesystem (JSON Files)**:
   - admin-events.json
   - secret-subjects.json
   - subject-buttons.json
   - buttons.json
   - public/content/** (learn page content)

3. **Environment Variables**:
   - ADMIN_EMAIL, ADMIN_PASSWORD (admin auth)

4. **External APIs**:
   - OpenAI API (optional AI features)

---

## Authentication Methods

1. **Admin Session Cookie**: Admin routes (HTTP-only, 8-hour expiry)
2. **Supabase User Session**: Most user-facing routes (JWT token)
3. **Public Access**: Content pages, research, subjects (no auth required)
4. **None**: Health checks, utility routes

---

## Summary

- **Total API Routes**: 61
- **Admin Routes**: 9
- **Content Routes**: 8
- **Study Routes**: 4
- **Calendar Routes**: 2
- **Test Week Routes**: 3
- **Homework Routes**: 2
- **Study Plans Routes**: 4
- **Classes Routes**: 5
- **Analytics Routes**: 5
- **User Routes**: 1
- **AI Routes**: 3
- **Achievement Routes**: 1
- **Streak Routes**: 1
- **Research Routes**: 2
- **Subject Routes**: 1
- **Button Routes**: 2
- **Utility Routes**: 3
