# Hybrid OS - Data and Metrics State

Fecha: 2026-06-11

Auditoria tecnica ligera, solo lectura. Datos obtenidos via APIs locales con Dev Auth Bypass activo.

## Fuentes de datos actuales

- Supabase: fuente primaria para datos reales. Las APIs privadas filtran por `user_id` obtenido de `requireAllowedUser()`.
- Seed fallback: `src/data/training-source.ts` usa `realTrainingSessions` y cae a mock si no hay seed real. Los hooks solo lo muestran cuando Supabase no devuelve datos remotos.
- localStorage: cola temporal en `lib/storage/training-storage.ts`, usada para sesiones pendientes, eliminaciones locales y backup; no es fuente primaria.

Estado observado por API:

- `training_sessions`: 58 sesiones.
- `body_checks`: 0.
- `nutrition_checks`: 0.
- Conteo por tipo: HYROX 21, CrossFit 15, Running 9, Mixed 5, actividad funcional 3, Fuerza 2, Halterofilia 2, Gimnasticos 1.

## APIs implicadas

- `GET /api/dashboard-data`: devuelve sesiones, body checks y nutrition checks del usuario autorizado.
- `GET /api/training-sessions`: devuelve sesiones propias desde Supabase.
- `PUT /api/training-sessions/:id`: guarda una sesion propia; no usado en esta auditoria.
- `DELETE /api/training-sessions/:id`: elimina una sesion propia; no usado en esta auditoria.
- `POST /api/imports`: importa appInputs; no usado para guardar.
- `POST /api/imports?dryRun=true`: simula importacion sin escribir; usado para captura de dry-run.

## Hooks y helpers relevantes

- Home: `app/page.tsx`, `components/home/home-view.tsx`, `components/home/training-mix-card.tsx`, `lib/storage/use-dashboard-data.ts`, `lib/analytics/trends.ts`.
- Dashboard: `app/dashboard/page.tsx`, `components/dashboard/dashboard-view.tsx`, `components/dashboard/trends-section.tsx`, `components/dashboard/disciplines-overview.tsx`, `lib/domain/dashboard/metrics.ts`, `lib/domain/dashboard/periods.ts`.
- Training Log: `app/training/page.tsx`, `components/training/training-log-view.tsx`, `lib/storage/use-training-sessions.ts`, `lib/storage/training-storage.ts`.
- Running: `app/training/running/page.tsx`, `components/training/running-training-view.tsx`, `lib/domain/training/running.ts`, `lib/domain/training/run-exposure.ts`, `lib/domain/training/session-kind.ts`.
- Muscle Load: `app/muscle-load/page.tsx`, `components/muscle-load/muscle-load-view.tsx`, `components/muscle-load/muscle-load-list.tsx`, `components/muscle-load/body-heatmap.tsx`, `lib/domain/training/muscle-load.ts`, `lib/selectors/training.ts`.
- Trends: `lib/analytics/trends.ts`.
- Periods: `lib/domain/dashboard/periods.ts`.
- Aggregations: `lib/selectors/training.ts`, `lib/domain/dashboard/metrics.ts`, `lib/domain/training/run-exposure.ts`, `lib/domain/training/muscle-load.ts`.

## Metricas actuales disponibles

- `sessionsCount`: en buckets semanales de `lib/analytics/trends.ts`; completadas/parciales tambien se separan.
- `durationMinutes`: suma por periodo en dashboard, training log y trends.
- RPE medio: media de sesiones con RPE numerico mayor que 0.
- Running/carrera: `getSessionRunMeters()`, `getStructuredRunningMeters()`, `getMixedRunningMeters()` y `getTotalRunExposureMeters()`.
- `structuredRunMeters`: carrera de sesiones `type === "running"`.
- `mixedRunMeters`: carrera detectada en sesiones no running.
- `totalRunMeters` / exposicion total: suma de estructurado + mixto; en trends se alinea con `totalRunExposureMeters`.
- `cardioLoad`, `fatigueCost`, `impactScore`, `strengthLoad`, `technicalLoad`: sumas desde `session.sessionMetrics`.
- `totalExternalLoadKg`, `totalBarbellReps`, `totalDumbbellReps`, `totalKettlebellReps`, `hardSetsEstimate`: sumas desde `session.sessionMetrics`.
- `sessionMuscleSummary` agregado: suma por musculo desde payload; si una sesion no trae resumen, Muscle Load puede recalcular desde ejercicios.
- `disciplineCounts`: conteo semanal por tipo, con agrupacion `secondary_activity` para actividad funcional/movilidad/tags secundarios.
- Ratios/insights de muscle load: grupos musculares, push/pull, anterior/posterior, rodilla/cadera, alertas e infrautilizados en `lib/domain/training/muscle-load.ts`.
- Tendencias: ventana semanal en `lib/analytics/trends.ts`, con media reciente y media previa.

## Running

Calculo actual:

- Running estructurado: sesiones puras `type === "running"`, usando `session.sessionMetrics.totalRunMeters` si existe.
- Carrera dentro de sesiones mixtas: sesiones no running, usando `totalRunMeters` si existe; si no, suma ejercicios con `movementPattern === "run"`, bloque `format === "running"` o nombres tipo `run`, `running`, `shuttle run`, `carrera`.
- Volumen total de carrera: `structuredRunMeters + mixedRunMeters`.
- `running_distance_meters`: columna analitica Supabase alimentada desde `session.sessionMetrics.totalRunMeters`.
- `sessionMetrics.totalRunMeters`: fuente principal en payload para distancia de carrera de la sesion.
- Volumen por zapatilla: `getRunningShoeVolumes()` solo usa filas de running puro y agrupa por `session.equipment?.shoes`, con fallback `Sin zapatilla registrada`.

Estado observado:

- Running estructurado: 63.09 km.
- Carrera en sesiones mixtas: 49.2 km.
- Exposicion total de carrera: 112.29 km.
- Zapatillas: 58.05 km sin zapatilla registrada en 8 sesiones; 5.04 km con `more v3 trail` en 1 sesion.

## Muscle Load

Calculo actual:

- Ranking: suma `sessionMuscleSummary` por musculo y ordena de mayor a menor.
- Infrautilizados: musculos con carga cero o por debajo del 20% del maximo del periodo.
- Ratios: grupos definidos en `muscleGroupDefinitions` y porcentajes sobre carga total.
- Alertas: dominancia inferior, tren superior bajo, push/pull, gemelos altos, core/lumbar y concentracion de carga.
- Sesiones clave: se muestran desde sesiones del periodo en `components/muscle-load/muscle-load-view.tsx`.
- Periodos: usa reglas de `lib/domain/dashboard/periods.ts`, con semana lunes-domingo.

Estado observado en histórico completo:

- Carga muscular total: 22471 puntos.
- Top: core 2738, glutes 2547, quadriceps 2470, hamstrings 1936, calves 1632.
- Ratios: tren inferior 46%, tren superior 38%, core 16%, empuje 25%, traccion 44%.
- Alertas: empuje bajo respecto a traccion; gemelos con carga alta.

## Tendencias

Helper principal: `lib/analytics/trends.ts`.

- Buckets por semana calendario lunes-domingo.
- Ventana actual: semana en curso.
- Media reciente: ultimas 4 semanas completas, escalada por progreso esperado de la semana actual.
- Media previa: 4 semanas anteriores a la ventana reciente.
- Comparacion de semana actual incompleta: se usa `getPeriodProgress("week")` para calcular expected-to-date en volumen, fatiga, impacto y carga.
- Estados: `subiendo`, `estable`, `bajando`, `estancado`, `subida_brusca`, `descarga`, `referencia_insuficiente`.

Semana actual observada:

- Semana: 2026-W23, 2026-06-07 a 2026-06-13.
- Sesiones: 2 HYROX.
- Carrera: 7.8 km total, 0 km estructurado, 7.8 km mixto.
- Duracion: 105 min.
- Fatiga: 177.
- Impacto: 170.
- Peso movido: 5130 kg.
- RPE medio: 8.

Tendencias clave observadas:

- Carrera total: 7800 m, estado `subida_brusca`, +37.6% vs media reciente esperada.
- Duracion: 105 min, estado `descarga`.
- Fatiga: 177, estado `bajando`.
- Impacto: 170, estado `estable`.
- Peso movido: 5130 kg, estado `estable`.
- RPE medio: 8, estado `subiendo`.

## Diagnostico tecnico ligero

- Conteo por tipo ejecutado via `GET /api/training-sessions`, solo lectura.
- Ultimas semanas con datos incluyen 2026-W20, 2026-W21, 2026-W22 y 2026-W23.
- Existen metricas separadas de carrera estructurada y mixta.
- Pipeline dashboard observado: page seed -> `useDashboardData()` -> `/api/dashboard-data` -> Supabase admin server-side filtrado por `user_id` -> UI remota cuando hay datos.
- El dashboard no mezcla seed con Supabase cuando la API devuelve datos reales.

## Observaciones

- Claras: sesiones, duracion, RPE, distancia total de carrera, breakdown running/mixto, carga muscular por grupos.
- Ambiguas: `totalRunMeters` puede significar distancia de sesion o exposicion total segun contexto; la UI ya empieza a distinguirlo como carrera total.
- Mezclan conceptos: `fatigueCost`, `impactScore`, `cardioLoad`, `strengthLoad` y `technicalLoad` son scores utiles pero no tienen escala visible universal.
- Huecos: body/nutrition estan en pipeline pero sin datos remotos actuales; zapatillas solo aparece en una sesion running; la comparacion de semana actual depende mucho de que la semana este incompleta.
