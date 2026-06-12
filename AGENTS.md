# Hybrid OS Codex Instructions

## Project overview

Hybrid OS is a personal app for logging, importing, and analyzing hybrid training history.

Core domains:
- CrossFit
- HYROX
- Running
- Fuerza
- Halterofilia
- Gimnasticos
- Muscle Load Analysis
- Dashboard por periodos
- Comparativas historicas

Be direct and practical. Prefer small, reviewable changes over large rewrites.

## Current architecture

The project uses:
- Next.js
- TypeScript
- Tailwind
- Supabase
- `HybridOSAppInput` importer
- Training routes
- Dashboard
- Historical seed
- Temporary localStorage queue
- A project-specific training data model

Before editing, read the relevant docs and understand the existing flow. Do not rebuild from scratch unless explicitly requested.

## Data source rules

- Supabase is the primary source for real data.
- The real training history has already been migrated to Supabase.
- Historical seed is fallback/development only.
- Do not mix seed data with Supabase data when Supabase already returns real sessions.
- `localStorage` is only a temporary queue for sessions pending synchronization.
- Supabase must remain the primary source when it has real training data.

## Supabase rules

- Never use `SUPABASE_SERVICE_ROLE_KEY` in client code.
- Service role usage must stay server-side only.
- Do not expose secrets in components, client hooks, or public files.
- Do not make destructive SQL changes unless explicitly instructed.
- Do not use `DROP`, `TRUNCATE`, mass `DELETE`, or destructive migrations unless explicitly instructed.
- For schema changes, create incremental migrations.

## Dev auth bypass rules

- A Dev Auth Bypass exists only for local development/Codex review work.
- It must never work in production and must use private server-side environment variables only, never `NEXT_PUBLIC`.
- It must respect `ALLOWED_AUTH_EMAILS` and must not expose service role keys, cookies, tokens, or secrets to the client.
- Use it when Codex needs to access protected routes for screenshots, audits, or review without manual Google OAuth.
- Google Auth remains the real authentication flow for normal use and functional validation.

## Import flow rules

The critical flow is:

`HybridOSAppInput JSON -> validation -> preview -> Supabase -> Dashboard/Training Log/Muscle Load`

Do not break this flow.

Every import must preserve the original raw data. Save:
- `raw_imports`
- `training_sessions`
- `training_exercises`
- `body_checks`, when present
- `nutrition_checks`, when present

Do not delete real sessions or replace them with new ids when they represent the same training session.

## Data model rules

- Do not reduce the model to simple fields.
- Preserve the full `payload`.
- Preserve `raw_imports`.
- Keep historical metrics needed for analysis:
  - running distance
  - duration
  - RPE
  - session muscle summary
  - movement patterns
  - exercises
  - raw import
- Do not lose information needed for historical comparisons.

## Current priorities

v0.2 priority: unify the training data layer.

Priority screens:
- `/`
- `/dashboard`
- `/training`
- `/training/[id]`
- `/training/weekly`
- `/training/running`
- `/muscle-load`
- `/training/import`

Not priority right now:
- `/body`
- `/nutrition`
- `/goals`
- PWA
- Internal AI
- External integrations

Do not add large features without confirmation.

## Period rules

- Week means calendar week from Monday to Sunday.
- Month means calendar month.
- Year means calendar year.
- All means the full training history.
- Do not use "last 7 days" as the main Week period.

## Roadmap

- v0.2: single training data source
- v0.3: Training Log + Training Detail
- v0.4: advanced Muscle Load
- v0.5: improved importer
- v0.6: basic PWA
- v0.7: offline queue/sync

## UI direction

- Keep the dark premium aesthetic.
- Avoid generic admin dashboard styling.
- Avoid fitness cliche visuals.
- Prioritize clarity, visual hierarchy, and a modern product feel.
- Visible UI text should be correct Spanish.
- Keep common sport terms when useful: CrossFit, HYROX, Running, RPE, WOD.

## Quality checklist

- Avoid duplicating logic.
- Create reusable helpers for metrics, periods, and formatting.
- Keep TypeScript strict and maintainable.
- Run `npm run lint` when meaningful changes are made and the command exists.
- Run `npm run build` when changes are large or when build safety matters.
- Summarize modified files and important decisions after each task.

## Commands

```bash
npm run dev
npm run lint
npm run build
```
