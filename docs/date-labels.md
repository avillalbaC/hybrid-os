# Hybrid OS - Date Labels

Fecha: 2026-06-18

## Problema resuelto

Las semanas tecnicas como `2026-W25` o `W25` son correctas para calculo, pero no orientan bien en UI. La etiqueta principal de una semana debe explicar el rango real de fechas.

## Regla principal

- `weekKey` es dato tecnico.
- El label visible debe ser humano.
- En semanas, usar rangos lunes-domingo.

Ejemplos:

- `15-21 jun` para una semana dentro del mismo mes.
- `27 may-2 jun` cuando cruza mes.
- `30 dic 2026-5 ene 2027` cuando cruza ano.

En UI se usa el separador visual `-` o `–` segun el componente, pero el contenido debe mantener dia, mes y ano cuando haga falta.

## Semana actual y anterior

En cards, informes y contexto de periodo:

- Semana actual: `Esta semana · 15-21 jun`.
- Semana anterior: `Semana anterior · 8-14 jun`.
- Otras semanas: `1-7 jun`.

En ejes de graficas, usar solo el rango corto para ahorrar espacio:

- `15-21 jun`
- `8-14 jun`
- `27 may-2 jun`

## Week key tecnico

`W25` o `2026-W25` puede aparecer como dato secundario:

- tooltip;
- badge pequeno;
- texto meta;
- contexto debug o trazabilidad.

No debe ser la etiqueta principal de una card, eje o selector visible.

## Tooltips

Los tooltips pueden combinar label humano y week key:

- `Esta semana · 15-21 jun · W25`
- `15-21 jun · W25`
- `15-21 jun · ISO 2026-W25`

## Graficas

- Eje X semanal: rango humano.
- Tooltip: rango humano + meta ISO si aporta trazabilidad.
- Semana actual: resaltar de forma sutil con borde, tono o marcador discreto.
- No usar `W25` como protagonista visual.

## Helpers

La logica vive en `lib/date/week-labels.ts`.

Funciones principales:

- `getWeekDateRange(weekStart)`
- `formatWeekRangeLabel(weekStart)`
- `formatRelativeWeekLabel(weekStart, currentWeekStart)`
- `formatWeekMetaLabel(weekKey)`
- `getCurrentWeekStartLocal()`

La implementacion usa fechas locales y semana calendario lunes-domingo. Evitar `toISOString().slice(0, 10)` para labels o rangos visibles porque puede introducir desfases por zona horaria.
