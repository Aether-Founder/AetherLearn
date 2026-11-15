# _archive_legacy_code

> **ARCHIVED — DO NOT IMPORT FROM THIS DIRECTORY.**
> This folder is excluded from the Next.js build (`tsconfig.json` → `exclude`) and from App Router routing (it lives outside `app/`). It exists for historical reference only.

## Why this code was archived

AetherLearn is being prepared for public launch on **Vercel (serverless)**. Two legacy systems were incompatible with that target and have been moved here intact (nothing was deleted):

### 1. Legacy SQLite-backed backend (`local-db/`, `routes/api/`)

The original platform stored user data in a local SQLite file (`data/learning-platform.db`) via `better-sqlite3`, wrapped by `lib/db.ts` and a set of `lib/*.ts` data-access modules. On Vercel the filesystem is read-only and ephemeral, so this backend could never work in production.

**Moved here:**

- `local-db/data/learning-platform.db{,-shm,-wal}` — the SQLite database file(s)
- `local-db/db.ts` — the `better-sqlite3` connection (WAL mode, `SQLITE_DB_PATH` override)
- `local-db/libs/*.ts` — SQLite data-access modules:
  `achievements`, `auth` (custom JWT+bcrypt auth — **not** Supabase Auth), `calendar-events`, `classes`, `content`, `data-migration`, `data-sync`, `homework`, `streaks`, `studyplans`, `studysets`, `testweeks`, `analytics-aggregation`
- `local-db/libs/__tests__/` — the Vitest suites for the above
- `local-db/repositories/` — `lib/repositories/` (legacy-adapter + types), dead code that only served the SQLite backend
- `local-db/test-utils/` — `test-utils/auth.ts` + `test-utils/db.ts` helpers for the archived backend's tests (`test-utils/setup.ts` remains — it only sets env vars/mocks)
- `routes/api/` — the 24 API route handlers that exclusively served this backend:
  - `achievements`, `streaks`, `studysets` (+ `[id]`, `[id]/cards`), `homework` (+ `[id]`),
    `classes` (+ `[id]`, assignments, members), `studyplans` (+ sessions), `testweeks` (+ subjects),
    `content` (`route.ts`, `[id]`), `analytics` (`route.ts`, `sessions`, `subjects`)

**Still active (Supabase-backed, intentionally NOT archived):**
`/api/analytics/track`, `/api/analytics/dashboard` (being migrated off `fs` writes — see Task 1),
`/api/content/page/*`, `/api/content/subjects/*`, `/api/content/visual/*`, `/api/calendar`,
`/api/progress`, and all other `app/api/*` routes.

### 2. Legacy learning-platform route (`routes/learning-platform/`)

`app/learning-platform/page.tsx` — the old standalone "lijsten" UI. Superseded by the integrated
book learn flow at `/books/[slug]/learn` (which reuses `components/learning-platform/` —
those components remain active and were **not** moved). The `/vakken/*` routes referenced in
the task no longer exist (already renamed/removed during the i18n migration).

### 3. Abandoned Notion integration (`integrations/notion/`)

The `notion_*` tables (`notion_databases`, `notion_entries`, `notion_properties`,
`notion_property_values`, `notion_views`) exist only in early migrations and `lib/dev-commands.ts`
table lists. No active code reads or writes them — see `integrations/notion/README.md`.
Migrations were left untouched (SQL history is append-only).

## Known runtime impact

UI components that `fetch()` the archived endpoints (e.g. `HomeworkWidget`, `ClassJoin`,
`StudyPlanWizard`, `Achievements`, `FolderSystem`, `PublicStudySetBrowser`, analytics widgets)
will receive 404s. On Vercel these endpoints were already non-functional (no writable SQLite),
so production behavior is unchanged. Replacements are tracked under the cloud-sync migration
to Supabase tables.
