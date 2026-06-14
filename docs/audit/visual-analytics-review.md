# Visual Analytics Review

Fecha: 2026-06-14

## Diagnostico previo

La app ya tenia buena arquitectura determinista, informes e insights, pero muchas secciones dependian demasiado de texto. El usuario podia leer conclusiones, pero no ver suficientemente la evolucion, distribucion o comparativas.

No habia libreria de charts instalada en `package.json`. Se decidio no anadir dependencia nueva y crear componentes ligeros con CSS/SVG.

## Graficos anadidos

- Dashboard: carrera total apilada, duracion semanal, fatiga semanal y peso movido.
- Analysis Actual: evolucion semanal, distribucion por disciplina, carrera estructurada/mixta y top musculos.
- Analysis Semanas: resumen visual semanal y graficos dentro de informes expandibles.
- Analysis Meses: sesiones, horas, carrera y peso movido por mes.
- Analysis Tendencias: tarjetas visuales reutilizables para cada tendencia.
- Analysis Calidad de datos: barras de completitud y ranking de pending fields.
- Running: carrera por semana, running estructurado, ritmo medio y zapatillas.
- Muscle Load: top musculos, placeholder futuro de mapa corporal y mini barras en sesiones clave.
- Home: mini sparklines en KPIs del hero.

## Datos usados

- Semanas y tendencias: `getWeekBuckets` / `getWeeklyTrendMetrics`.
- Carrera: `getRunningBreakdown` y running exposure estructurado/mixto.
- Musculo: `calculateMuscleSummary` y `getTopMuscles`.
- Periodos: `filterSessionsByPeriod`.
- Calidad: RPE, duracion, resultado, `dataQuality`, `status`, `pendingFields` y zapatillas en running.

## Pantallas cambiadas

- `/`
- `/dashboard`
- `/analysis`
- `/training/running`
- `/muscle-load`

No se modificaron:

- Supabase schema.
- Auth, RLS o `user_id`.
- Contratos JSON.
- Importador, salvo que sigue navegando igual.
- Mapa corporal.
- Objetivos activos.
- IA/LLM runtime.

## Capturas generadas

Directorio: `docs/audit/screenshots/visual-analytics/`

Desktop:

- `dashboard-visual-desktop.png`
- `analysis-current-visual-desktop.png`
- `analysis-trends-visual-desktop.png`
- `analysis-quality-visual-desktop.png`
- `running-visual-desktop.png`
- `muscle-load-visual-desktop.png`

Mobile:

- `dashboard-visual-mobile.png`
- `analysis-visual-mobile.png`
- `running-visual-mobile.png`
- `muscle-load-visual-mobile.png`

## Validacion

- `npm run lint`: pasa.
- `npm run build`: pasa.
- Revision DOM de overflow horizontal:
  - Desktop 1440 x 1100: sin overflow en `/`, `/dashboard`, `/analysis`, tabs de Analysis, `/training/running`, `/muscle-load`, `/training` y `/training/import`.
  - Mobile 390 x 844: sin overflow en las mismas rutas.
- Capturas generadas con Chrome headless local porque la captura del navegador in-app fallaba por timeout CDP. El navegador in-app si se uso para navegar y comprobar overflow.

## Limitaciones

- Los graficos son intencionadamente simples; no hay tooltips interactivos avanzados.
- Las tabs de Analysis aceptan `?tab=` como estado inicial para capturas/enlaces, pero no sincronizan cada click con la URL.
- Los ritmos de Running dependen de sesiones con distancia y duracion.
- El mapa corporal sigue pendiente hasta tener asset real.

## Siguiente recomendacion de producto

La siguiente iteracion deberia conectar objetivos activos. Con objetivo de bloque, los graficos podran distinguir mejor entre "sube y conviene" frente a "sube y hay que vigilar".
