# Hybrid OS - Contexto para check diario

Fecha: 2026-06-18

## Objetivo

`lib/analytics/check-in-context.ts` centraliza un resumen objetivo y copiable del estado reciente de Hybrid OS.

La app no decide que hacer hoy y no actua como entrenador. Hybrid OS registra datos, ordena evidencia y prepara contexto. La interpretacion cualitativa y la decision diaria viven fuera de la app, en el check diario con ChatGPT.

## Fuentes de datos

El contexto se construye desde datos ya disponibles:

- `training_sessions`, como fuente real de entrenamiento.
- `daily_entries`, para Daily Plan, prioridades y movilidad marcada.
- `goal_blocks`, para objetivo activo y perfil.
- `planned_sessions`, solo como senal beta de intencion semanal.
- `body_checks`, si existen.
- `nutrition_checks`, si existen.
- Analitica determinista existente de running, carga muscular, objetivos y calidad de datos.

No crea tablas nuevas, no llama a OpenAI, no usa Google Drive y no toca el importador.

## Periodo

La v1 usa la semana calendario actual, de lunes a domingo, alineada con Dashboard, Goals y Analysis.

El periodo aparece siempre en el texto copiable con fecha inicial y final. Si una pantalla ya ha cargado datos reales desde Supabase, no se mezcla seed como fuente equivalente.

## Formato

El modulo exporta:

- `buildCheckInContextData(input)`: devuelve `CheckInContextData` tipado.
- `buildCheckInContextText(context)`: devuelve texto plano completo.
- `buildCompactCheckInContextText(context)`: devuelve resumen breve para superficies compactas.

El texto incluye:

- objetivo activo o ausencia de objetivo;
- entrenamiento de la semana;
- running estructurado separado de carrera mixta;
- fuerza/halterofilia, HYROX/CrossFit y movilidad como sesion;
- carga muscular y senales locales;
- Daily Plan, movilidad y prioridades;
- body/nutrition cuando hay datos;
- calidad de datos;
- senales que suman;
- senales que restan;
- datos insuficientes.

## Lenguaje permitido

El contexto debe usar lenguaje descriptivo:

- "Se observa..."
- "Dato disponible..."
- "Senal a favor..."
- "Senal en contra..."
- "Dato insuficiente..."
- "Util para valorar en el check diario..."

No debe usar lenguaje prescriptivo de entrenador:

- "haz esto";
- "evita esto";
- "prioriza esto";
- "deberias";
- "decision recomendada";
- "accion recomendada".

## UI

`components/check-in/check-in-context-card.tsx` muestra:

- titulo configurable;
- periodo;
- resumen compacto;
- boton `Copiar contexto`;
- estado `Copiado`;
- fallback manual si falla el portapapeles;
- detalle expandible cuando la superficie lo permite.

Integracion v1:

- `/goals`: contexto completo despues de senales y datos insuficientes.
- `/analysis`: contexto completo en tab Actual, sin duplicar cards de contexto.
- `/dashboard`: version compacta `Contexto de la semana`.
- `/`: version compacta y ligera bajo objetivo activo, manteniendo Daily Plan como protagonista.

## Limitaciones

- No interpreta molestias cualitativas si no estan estructuradas.
- Body/Nutrition aportan solo si existen checks disponibles.
- Planned sessions se tratan como beta y no como entrenamiento real.
- La calidad del texto depende de la calidad del registro semanal.
- Conviene usar la salida durante 7 dias antes de anadir nuevas features.
