# Archived: Notion integration

## What this was

An abandoned mirror of a Notion workspace inside Postgres. The schema lives in the early
migrations (tables prefixed `notion_`):

- `notion_databases`
- `notion_entries`
- `notion_properties`
- `notion_property_values`
- `notion_views`

## Status

No active application code reads from or writes to these tables. The only code references
are table-name strings inside `lib/dev-commands.ts` (a dev utility allowlist).

The `components/notion/` UI components (`CalendarView`, `KanbanView`, `TableView`) are generic
view components and were intentionally left in `components/` — verify usage before assuming
they are dead.

## Notes for future cleanup

- Do **not** delete the migrations — SQL migration history is append-only.
- If the tables are confirmed unused in production, a future migration can `DROP TABLE`
  them safely.
