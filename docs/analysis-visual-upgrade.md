# Hybrid OS - Analysis Visual Upgrade

Fecha: 2026-06-18

## Objetivo

Convertir `/analysis` en laboratorio visual y contexto historico. La pantalla no actua como entrenador, no decide que hacer hoy y no prescribe sesiones. Su funcion es mostrar evolucion, distribucion, intensidad, carga muscular, calidad de datos y contexto objetivo para el check diario.

## Nueva estructura

- Actual: resumen visual del periodo, carga reciente, distribucion, running split, intensidad, duracion vs RPE, top musculos, senales objetivas, objetivo, contexto copiable y plan beta.
- Semanas: evolucion semanal, carrera semanal, fatiga, RPE, distribucion por semana, intensidad semanal, consistencia e informes colapsados.
- Meses: sesiones, horas, carrera, peso movido, running mensual, distribucion mensual, intensidad mensual, top musculos e informes colapsados.
- Tendencias: volumen, carrera, carga, fuerza, intensidad, muscular, musculos principales, consistencia y calidad de datos.
- Calidad de datos: completitud visual, pending fields, timeline semanal, cobertura, mejoras de registro, impacto de faltantes y resumen.

## Datasets

Nuevo archivo:

- `lib/analytics/analysis-chart-data.ts`

Funciones principales:

- `buildWeeklyTrainingLoadData(sessions)`
- `buildMonthlyTrainingLoadData(sessions)`
- `buildDisciplineDistributionData(sessions, grain)`
- `buildRunningSplitData(sessions, grain)`
- `buildIntensityDistributionData(sessions, grain)`
- `buildDurationRpeScatterData(sessions, period)`
- `buildMuscleRankingData(sessions, period)`
- `buildMuscleTrendData(sessions)`
- `buildTrainingConsistencyData(sessions, days)`
- `buildDataQualityTimelineData(sessions, grain)`
- `buildAnalysisSummaryData(sessions, period)`

Reglas:

- Usan sesiones reales ya cargadas por la capa actual.
- Filtran planned/cancelled para analisis visual.
- Manejan arrays vacios.
- Devuelven estructuras tipadas y unidades explicitas.
- No tocan Supabase, schema, importador ni `HybridOSAppInput`.

## Componentes nuevos

- `components/charts/stacked-weekly-bars.tsx`: barras apiladas genericas para semanas o meses.
- `components/charts/scatter-card.tsx`: scatter SVG de duracion vs RPE.
- `components/charts/calendar-heatmap.tsx`: matriz diaria responsive de consistencia.
- `components/charts/line-trend-card.tsx`: mini linea para tendencias musculares.
- `components/charts/metric-comparison-card.tsx`: resumen compacto de metricas del periodo.

No se anade libreria externa de charts.

## Reglas de lenguaje

Analysis debe usar lenguaje descriptivo:

- se observa;
- dato relevante;
- senal;
- contexto;
- tendencia;
- dato insuficiente;
- util para check diario.

Evitar lenguaje de entrenador:

- haz;
- evita;
- prioriza;
- deberias;
- decision recomendada.

Las mejoras de registro pueden indicar el impacto de datos faltantes, pero no deben pedir completar todo el historico.

## Limitaciones

- Algunas categorias de calidad de datos se solapan; una sesion puede estar en partial y sin RPE.
- El heatmap mezcla sesiones, duracion y fatiga en un nivel visual simple.
- Los mini trends musculares son orientativos y dependen de `sessionMuscleSummary`.
- Las bandas visuales de objetivo activo quedan para una fase posterior.

## Siguientes pasos

- Usar `/analysis` durante varios checks diarios y anotar que graficas ayudan realmente a interpretar el estado semanal.
- Valorar una visualizacion simple de planificado vs realizado cuando `planned_sessions` tenga mas uso real.
- Anadir targets visuales solo si no convierten Analysis en prescriptor.
