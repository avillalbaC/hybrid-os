# Hybrid OS - Visual Analytics

Fecha: 2026-06-14

Primera capa visual de analitica para pasar de lectura textual a graficos + insights. La capa queda pulida para que las cards principales muestren dato actual, referencia compacta y estado cuando existe.

## Decision tecnica

- No se anadio libreria de charts.
- La implementacion usa componentes propios con CSS/SVG ligero.
- Motivo: el repo no tenia una libreria ligera instalada y las necesidades actuales son barras, sparklines, stacked bars y rankings.
- Los componentes reciben datos por props y no leen datos remotos directamente.

## Componentes

- `components/charts/chart-card.tsx`: contenedor consistente para titulo, descripcion, unidad, estado, valor actual, referencias compactas, loading, empty state, modo compacto y footer/insight.
- `components/charts/metric-sparkline.tsx`: sparkline SVG compacto para KPIs.
- `components/charts/weekly-bar-chart.tsx`: barras verticales para series semanales o mensuales.
- `components/charts/stacked-run-bars.tsx`: barras apiladas para running estructurado frente a carrera mixta.
- `components/charts/horizontal-ranking-chart.tsx`: rankings horizontales para musculos, disciplinas, zapatillas y pending fields.
- `components/charts/discipline-distribution-chart.tsx`: distribucion de disciplinas sobre ranking horizontal.
- `components/charts/data-quality-bars.tsx`: completitud de RPE, duracion, resultado y estado complete/partial.
- `components/charts/trend-card-chart.tsx`: tarjeta visual de tendencia con metrica, referencia, barras e insight.
- `components/charts/chart-utils.ts`: utilidades de porcentajes, tonos y paths SVG.

## Datasets

`lib/analytics/chart-data.ts` expone:

- `getWeeklyChartData(sessions)`: semanas con sesiones, duracion, carrera total, running estructurado, carrera mixta, fatiga, impacto, peso movido, RPE y cargas cardio/fuerza/tecnica.
- `getMonthlyChartData(sessions)`: meses con sesiones, duracion, carrera, fatiga, impacto, peso movido y RPE.
- `getDisciplineDistributionData(sessions, period)`: sesiones, duracion, fatiga y porcentaje por disciplina.
- `getRunExposureChartData(sessions)`: running estructurado, carrera mixta y total por semana.
- `getMuscleRankingChartData(sessions, period)`: top musculos con carga y porcentaje relativo.
- `getDataQualityChartData(sessions)`: completitud, parciales, running sin zapatillas y pending fields frecuentes.

La capa reutiliza:

- `getWeekBuckets` de `lib/analytics/trends.ts`.
- `getRunningBreakdown` de `lib/domain/training/run-exposure.ts`.
- `calculateMuscleSummary` y `getTopMuscles` de `lib/domain/training/muscle-load.ts`.
- `filterSessionsByPeriod` de `lib/domain/dashboard/periods.ts`.

## Uso por pantalla

Dashboard:

- Panel `Evolucion clave`.
- Graficos: carrera total apilada, duracion semanal, fatiga semanal y peso movido.
- Cada card debe incluir valor actual, media reciente/cambio cuando exista, estado e insight corto.
- KPIs compactos pueden usar sparkline cuando no tienen bloque de comparativa largo.

Analysis:

- Actual: evolucion semanal, distribucion por disciplina, carrera estructurada/mixta y top musculos.
- Semanas: resumen visual semanal antes de informes y mini graficos dentro de cada informe.
- Meses: sesiones, horas, carrera y peso movido por mes.
- Tendencias: tarjetas visuales reutilizables por bloque.
- Tendencias: bloques con descripcion corta y ancho razonable cuando hay una o dos cards.
- Calidad de datos: barras de completitud y ranking de pending fields.
- Calidad de datos: mejoras de registro e impacto de datos faltantes.

Running:

- Carga semanal y carrera como grafica full-width superior.
- Eje Y solo para kilometros de carrera.
- Barras cyan/teal para running estructurado y carrera mixta.
- Sombreado ambar para carga no-running normalizada dentro del rango visible.
- Copy obligatorio: la carga no-running relativa no equivale a kilometros.
- Carrera por semana con running estructurado frente a carrera mixta.
- Running estructurado por semana.
- Ritmo medio cuando hay distancia y duracion.
- Zapatillas como ranking horizontal.
- Copy obligatorio: la carrera mixta cuenta como impacto, pero no como running tecnico.

Muscle Load:

- Top musculos con barras horizontales.
- Ratios principales existentes.
- Sesiones clave con mini barras por musculo.
- Mapa corporal queda documentado como futura seccion superior, no implementado.
- El slot de BodyMap debe ser discreto hasta existir asset real.

Home:

- Solo mini sparklines en KPIs del hero.
- No se anadieron graficos grandes.

## Reglas visuales

- Fondo oscuro y estetica premium existente.
- Cyan/aquamarina como color principal.
- Ambar para carrera mixta, warning o datos pendientes.
- Sin pie charts, sin 3D, sin libreria pesada.
- No hay scroll horizontal nativo en las rutas revisadas.
- Cada grafico debe tener titulo, descripcion, unidad visible e insight o footer cuando aporte contexto.
- Los graficos importantes deben mostrar valor actual, media reciente/cambio y estado cuando esa referencia exista.

## Integracion con objetivos y plan semanal

Objetivos activos y plan semanal ya tienen una primera integracion textual en Home, Dashboard y Analysis.

Los componentes y datasets deberian poder recibir en una fase posterior:

- `targetValue`
- `targetRange`
- `goalContext`
- `goalStatus`

Ejemplos futuros:

- Carrera semanal objetivo: 18-24 km.
- Fuerza minima: 1 sesion pesada.
- Running estructurado objetivo: 2 sesiones.

Regla vigente:

- El objetivo activo debe explicar si una tendencia que sube es deseable, neutra o arriesgada.
- Los graficos deben mostrar el objetivo como contexto, no como sustituto de la lectura determinista.
- Planificado vs realizado debe aparecer como resumen textual compacto antes de implementar bandas visuales complejas.

## Pendiente

- Anadir contexto visual de targets y plan semanal en graficos clave cuando sea simple.
- Mapa corporal asset-based para Muscle Load.
- Mayor detalle por zapatilla cuando v1.1 tenga mas datos reales.
- Tests automaticos si se incorpora framework de test.
