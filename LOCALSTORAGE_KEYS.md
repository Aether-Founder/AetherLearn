# LocalStorage Keys Inventory

Generated during Phase 0.2 of the Development Roadmap

## Overview
This document records all persisted browser keys from localStorage usage across the application.

---

## Theme & UI Preferences

### `aether-selected-theme`
- **Type**: string
- **Values**: 'light', 'dark', 'system'
- **Location**: `app/layout.tsx`
- **Purpose**: User's selected theme preference

### `theme`
- **Type**: string
- **Values**: 'light', 'dark'
- **Location**: `app/layout.tsx`
- **Purpose**: Legacy theme preference

### `aether-theme-colors`
- **Type**: JSON object
- **Structure**: `{ primary: string, secondary: string, ... }`
- **Location**: `app/layout.tsx`
- **Purpose**: Custom theme color configuration

### `THEME_SELECTION_COMPLETED_KEY`
- **Type**: string ('true')
- **Location**: `components/ThemeSelectionModal.tsx`
- **Purpose**: Track if user has completed theme selection

### `THEME_SELECTION_SKIPPED_KEY`
- **Type**: string ('true')
- **Location**: `components/ThemeSelectionModal.tsx`
- **Purpose**: Track if user skipped theme selection

---

## Subject & Course Preferences

### `aether-grade-setup-complete:{userId}`
- **Type**: string ('true')
- **Location**: `app/vakken/page.tsx`
- **Purpose**: Track if user has completed grade/subject setup

### `user_selected_subjects`
- **Type**: JSON array
- **Structure**: `[{ id: string, name: string, ... }]`
- **Location**: `app/vakken/page.tsx`
- **Purpose**: User's selected subjects

### `aether-verified-codes:{userId}`
- **Type**: JSON array
- **Structure**: `['code1', 'code2', ...]`
- **Location**: `app/vakken/page.tsx`
- **Purpose**: Verified secret subject access codes

### `aether-folders`
- **Type**: JSON array
- **Structure**: Folder objects
- **Location**: `components/learning-platform/StandaloneLearningPlatform.tsx`, `old-tw-page/app/leerplatform/vakken/page.tsx`
- **Purpose**: Study set folder organization

### `aether-study-sets`
- **Type**: JSON array
- **Structure**: Study set objects
- **Location**: `components/learning-platform/StandaloneLearningPlatform.tsx`, `old-tw-page/app/leerplatform/**`
- **Purpose**: User's study sets (legacy/local storage based)

---

## Learn Page Preferences

### `viewMode-{pageId}`
- **Type**: string
- **Values**: 'simple', 'book', 'study'
- **Location**: `app/[page]/page.tsx`
- **Purpose**: User's preferred view mode for specific learn page

### `cache-{pageId}`
- **Type**: JSON object
- **Structure**: Cached page content
- **Location**: `app/[page]/page.tsx`
- **Purpose**: Cached learn page content for offline/performance

---

## Workspace & Notes

### `aether_filesystem`
- **Type**: JSON object
- **Structure**: Filesystem snapshot
- **Location**: `lib/filesystem/filesystemService.ts`
- **Purpose**: User's note filesystem structure

### `aether-workspace-header-font`
- **Type**: string
- **Values**: 'display', 'inter'
- **Location**: `app/notities/page.tsx`
- **Purpose**: Header font preference in notes

### `aether-workspace-spellcheck`
- **Type**: string ('true'/'false')
- **Location**: `app/notities/page.tsx`
- **Purpose**: Spellcheck enabled/disabled in notes

### `aether-workspaces`
- **Type**: JSON array
- **Structure**: Workspace objects
- **Location**: `store/useWorkspaceStore.ts`
- **Purpose**: User's workspaces

### `aether-current-workspace`
- **Type**: string (workspace ID)
- **Location**: `store/useWorkspaceStore.ts`
- **Purpose**: Currently selected workspace

---

## Dashboard & Navigation

### `aether_dashboard_view`
- **Type**: string
- **Values**: 'full', 'minimal'
- **Location**: `app/dashboard/page.tsx`
- **Purpose**: Dashboard view preference

### `aether-navbar-visibility`
- **Type**: JSON object
- **Structure**: `{ [section]: boolean }`
- **Location**: `hooks/useNavbarPreferences.ts`
- **Purpose**: Navbar section visibility preferences

### `aether-interactive-greeting:{userId}`
- **Type**: string (date)
- **Location**: `app/page.tsx`
- **Purpose**: Last shown interactive greeting date

---

## Inbox

### `aether-inbox`
- **Type**: JSON array
- **Structure:**
  ```typescript
  [{
    id: string,
    text: string,
    completed: boolean,
    createdAt: string,
    completedAt?: string
  }]
  ```
- **Location**: `app/inbox/page.tsx`
- **Purpose**: Inbox items/tasks

---

## Agenda

### `aether-agenda`
- **Type**: JSON object
- **Structure:** Serialized agenda data
- **Location**: `app/agenda/page.tsx`
- **Purpose**: Agenda events and state

---

## Planner

### `aether-planner`
- **Type**: JSON array
- **Structure:** Planner tasks
- **Location**: `app/planner/page.tsx`
- **Purpose**: Planner task list

---

## Error Log

### `aether-foutenlogboek`
- **Type**: JSON array
- **Structure:**
  ```typescript
  [{
    id: string,
    subject: string,
    description: string,
    date: string,
    resolved: boolean
  }]
  ```
- **Location**: `app/foutenlogboek/page.tsx`
- **Purpose**: Error log entries

---

## Streak & Gamification

### `aether-streak`
- **Type**: string (number)
- **Location**: `components/learning-platform/StandaloneLearningPlatform.tsx`
- **Purpose**: Current study streak count

### `aether-streak-date`
- **Type**: string (date)
- **Location**: `components/learning-platform/StandaloneLearningPlatform.tsx`
- **Purpose**: Last streak activity date

---

## PWA

### `pwa-install-dismissed`
- **Type**: string (ISO date)
- **Location**: `components/InstallPrompt.tsx`
- **Purpose**: PWA install prompt dismissal date

---

## Authentication (Legacy)

### `access_token`
- **Type**: string (JWT token)
- **Location**: `app/testweek/[id]/page.tsx`, `old-tw-page/**`
- **Purpose**: Authentication token (legacy Supabase auth)

### `token`
- **Type**: string (JWT token)
- **Location**: `old-tw-page/**`
- **Purpose**: Authentication token (legacy)

---

## Learning Platform Store Keys

The learning platform store (`store/useLearningPlatformStore.ts`) uses localStorage through the progress-store module:

### Progress Keys (per study set)
- **Pattern**: `aether-progress-{studySetId}`
- **Structure:** Term progress map
- **Location**: `lib/learning-platform/progress-store.ts`
- **Purpose**: Individual term progress (SRS data, mastery, etc.)

### Settings Keys (per study set)
- **Pattern**: `aether-settings-{studySetId}`
- **Structure:** Study settings object
- **Location**: `lib/learning-platform/progress-store.ts`
- **Purpose**: Study mode settings per set

### Session Keys (per study set)
- **Pattern**: `aether-session-{studySetId}`
- **Structure:** Study session data
- **Location**: `lib/learning-platform/progress-store.ts`
- **Purpose**: Current/last study session

---

## Activity Tracking

### `aether-activity:{userId}`
- **Type**: JSON object
- **Structure:** Activity tracking data
- **Location**: `hooks/useActivityTracking.ts`
- **Purpose**: User activity tracking for analytics

---

## Offline Content Cache

### `aether-offline-cache`
- **Type**: JSON object
- **Structure:** Cached content metadata
- **Location**: `lib/offline/contentCache.ts`
- **Purpose**: Offline content cache metadata

---

## Summary by Category

### User Preferences (10 keys)
- Theme preferences: 4 keys
- Subject preferences: 4 keys
- Learn page preferences: 2 keys

### Content & Learning (6 keys)
- Learning platform: 3 keys (per study set patterns)
- Study sets/folders: 2 keys
- View modes: 1 key pattern

### Productivity (5 keys)
- Inbox: 1 key
- Agenda: 1 key
- Planner: 1 key
- Error log: 1 key
- Streak: 2 keys

### Workspace & Notes (5 keys)
- Filesystem: 1 key
- Workspaces: 2 keys
- Note preferences: 2 keys

### Authentication (2 keys)
- Legacy auth tokens

### UI & Navigation (3 keys)
- Dashboard view: 1 key
- Navbar visibility: 1 key
- Greeting: 1 key

### System (2 keys)
- PWA: 1 key
- Activity tracking: 1 key

### Offline (1 key)
- Content cache: 1 key

---

## Migration Notes

1. **Supabase Migration**: Many localStorage keys are being migrated to Supabase (study sets, progress, etc.)
2. **Legacy Code**: Keys in `old-tw-page/**` should be considered deprecated
3. **Per-User Keys**: Some keys include `{userId}` in the key name for multi-user support
4. **Per-Page Keys**: Some keys include `{pageId}` for page-specific preferences

---

## Cleanup Recommendations

1. Remove legacy auth tokens (`access_token`, `token`) once fully migrated to Supabase
2. Consolidate theme keys (`theme` → `aether-selected-theme`)
3. Migrate study sets from localStorage to Supabase completely
4. Consider namespace prefixing all keys with `aether-` for consistency
