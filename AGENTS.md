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
- Historical seed is fallback/development only.
- Do not mix seed data with Supabase data when Supabase already returns real sessions.
- `localStorage` is only a temporary queue for sessions pending synchronization.

## Supabase rules

- Never use `SUPABASE_SERVICE_ROLE_KEY` in client code.
- Service role usage must stay server-side only.
- Do not expose secrets in components, client hooks, or public files.
- Do not make destructive SQL changes unless explicitly instructed.
- Do not use `DROP TABLE`, mass `DELETE`, or destructive migrations unless explicitly instructed.
- For schema changes, create incremental migrations.

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

## Data model rules

- Do not reduce the model to simple fields.
- Preserve the full `payload`.
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

Prioritize:
- Training
- Dashboard
- Running
- Training Log
- Training detail
- Muscle Load

`/body` and `/nutrition` are not a priority right now. They may remain less polished as long as import data is saved correctly.

Do not add large features without confirmation.

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
