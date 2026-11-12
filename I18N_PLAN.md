# AetherLearn i18n Plan — English-first, multi-language

## Architecture (already in place)

- `public/locales/{lang}.json` — one flat JSON file per language, `snake_case_key -> translated string`
- `lib/i18n-client.ts` — client-side loader; fallback chain: **current language → DEFAULT_LANGUAGE → fallback arg → key**
- `lib/i18n-server.ts` — server-side loader (same directory)
- `lib/useTranslation.ts` — `t('key')` / `t('key', 'Fallback')` / `t('key', 'fb', {param})` with `{param}` interpolation
- `lib/i18n-config.ts` — `LANGUAGE_REGISTRY` (19 languages), `DEFAULT_LANGUAGE`, `REGIONAL_DEFAULTS`, RTL via `i18n-rtl.ts`
- Nested keys supported via dot notation (`books.reader.key_concepts`)

## Rules

1. **English is the source of truth.** `en.json` must contain every key. Other languages may be partial — missing keys fall back to English automatically.
2. Keys are stable English `snake_case` IDs — never change a key when rewording English text; add a new key instead.
3. Never hardcode user-visible strings in JSX — always `t('key')`.
4. Adding a language = drop `{code}.json` in `public/locales/` + add to `LANGUAGE_REGISTRY`. Nothing else.

## Workstreams

### WS1 — English completeness — DONE
- [x] Inventory: `nl.json` = 1181 keys (source), `en.json` = 99 keys, other languages = 68 keys each
- [x] Generate complete `en.json` — all 1181 nl keys translated + 2 en-only keys = **1183 keys**
- [x] Set `DEFAULT_LANGUAGE = 'en'` in `lib/i18n-config.ts`
- [x] Update `useTranslation` default from `'nl'` to `'en'`
- [x] Keep `REGIONAL_DEFAULTS` — Dutch users still auto-detect `nl`; everyone else defaults to English

### WS2 — Route & code rename to English — DONE
All Dutch `app/` routes renamed; ~360 internal path references rewritten across 81 files;
permanent redirects added in `next.config.js`; middleware auth prefixes updated.

| Old | New |
|---|---|
| `/vakken` | `/subjects` |
| `/vakken/[subjectId]/toetsen` | `/subjects/[subjectId]/quizzes` |
| `/notities` | `/notes` |
| `/instellingen` | `/settings` |
| `/leersets` | `/study-sets` |
| `/huiswerk` | `/homework` |
| `/statistieken` | `/statistics` |
| `/toetsweek` | `/test-week` |
| `/toetsweekvoorbereiding` | `/test-prep` |
| `/toets-planning` | `/test-planning` |
| `/toegankelijkheid` | `/accessibility` |
| `/foutenlogboek` | `/error-log` |
| `/groepen` | `/groups` |
| `/bibliotheek` | `/library` |
| `/cijfers` | `/grades` |
| `/leer` | `/learn` |
| `/lessen` | `/lessons` |
| `/lessen-notities` | `/lesson-notes` |
| `/studie-modi` | `/study-modes` |
| `/vandaag` | `/today` |
| `/zoeken` | `/search` |
| `/create/leerlijst`, `/edit/leerlijst` | `/create/learning-list`, `/edit/learning-list` |

Note: Supabase `content_buttons.target_path` rows may still hold old Dutch paths —
the next.config redirects cover them until data is updated.

### WS3 — Extract hardcoded Dutch strings (ongoing, page-by-page)
For each page: wrap strings in `t()`, add keys to `en.json`, translate to `nl.json` (and other languages progressively).

Priority order:
1. `components/AppShell.tsx` (nav, header — appears on every page)
2. `app/page.tsx` landing, `app/(auth)/*` login/register
3. `app/subjects/*` (→ subjects), `app/notes` (→ notes), `app/settings` (→ settings)
4. Remaining pages alphabetically

Status tracker (append as pages are done):
- [ ] AppShell / global nav
- [ ] Landing page
- [ ] Auth pages (login, register, reset)
- [ ] Subjects pages
- [ ] Notes page
- [ ] Settings page
- [ ] Dashboard / today
- [ ] Remaining ~70 pages

### WS4 — Additional languages
- [x] nl (complete, 1181 keys — stays as Dutch)
- [ ] en (complete — WS1)
- [ ] fr, ar, zh (user priority) — generate full files after en.json is stable
- [ ] de, es, tr + 13 others — progressive; fallback to English until translated
- [ ] RTL QA for `ar` (provider exists in `i18n-rtl.ts`)
- [ ] CJK font fallback for `zh` (Inter/Cormorant lack CJK glyphs)

## Translation workflow for new strings

1. Add key + English value to `public/locales/en.json`
2. Add Dutch value to `public/locales/nl.json`
3. Use `t('key')` in code
4. Other languages: leave missing → English fallback, translate in batches later

## Notes / gotchas

- `locales/*.csv` at repo root is the OLD system — unused by `i18n-client.ts` (which reads `public/locales/*.json`). Do not add keys there.
- `public/locales/en.csv` / `nl.csv` duplicates also exist — legacy, ignore.
- Translations are fetched for ALL 19 languages on first load (~19 requests). Optimization candidate: fetch only active + fallback languages.
- `i18n_translations` localStorage cache must be versioned/busted when JSONs change — verify cache invalidation on deploy.
