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
- `components/charts/stacked-weekly-bars.tsx`: barras apiladas genericas para semanas o meses, usadas en disciplinas, intensidad, running split y calidad.
- `components/charts/scatter-card.tsx`: scatter SVG simple para duracion vs RPE.
- `components/charts/calendar-heatmap.tsx`: matriz diaria responsive para consistencia de registro.
- `components/charts/line-trend-card.tsx`: mini linea para evolucion muscular.
- `components/charts/metric-comparison-card.tsx`: tarjeta compacta de metrica actual y referencia.
- `components/charts/chart-utils.ts`: utilidades de porcentajes, tonos y paths SVG.
- `components/calendar/*`: calendario mensual de adherencia con grid lunes-domingo, badges por disciplina, intensidad visual y detalle de dia.

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

`lib/analytics/analysis-chart-data.ts` anade datasets especificos para `/analysis`:

- carga semanal y mensual;
- distribucion de disciplinas semanal/mensual;
- running estructurado vs carrera mixta semanal/mensual;
- intensidad por RPE semanal/mensual;
- scatter de duracion vs RPE;
- ranking y tendencia muscular;
- consistencia diaria;
- calidad de datos por semana/mes;
- resumen visual del periodo.

## Uso por pantalla

Dashboard:

- Panel `Evolucion clave`.
- Graficos: carrera total apilada, duracion semanal, fatiga semanal y peso movido.
- Cada card debe incluir valor actual, media reciente/cambio cuando exista, estado e insight corto.
- KPIs compactos pueden usar sparkline cuando no tienen bloque de comparativa largo.

Analysis:

- Actual: resumen visual del periodo, carga semanal, distribucion, running split, intensidad, duracion vs RPE, top musculos y contexto copiable.
- Semanas: evolucion semanal, distribucion por disciplina, intensidad, consistencia e informes colapsados.
- Meses: volumen mensual, running mensual, distribucion mensual, intensidad mensual, top musculos e informes colapsados.
- Tendencias: tarjetas por bloque, mini tendencias musculares, consistencia y calidad semanal.
- Calidad de datos: completitud, pending fields, timeline de calidad, mejoras de registro e impacto de faltantes.

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

Calendar:

- Vista mensual como visualizacion de consistencia y adherencia.
- Usa `training_sessions` como fuente principal y `daily_entries` para movilidad/contexto del dia.
- Muestra intensidad diaria como clasificacion simple, no como prescripcion.
- No muestra planificado vs realizado en el MVP.

## Reglas visuales

- Fondo oscuro y estetica premium existente.
- Cyan/aquamarina como color principal.
- Ambar para carrera mixta, warning o datos pendientes.
- Sin pie charts, sin 3D, sin libreria pesada.
- No hay scroll horizontal nativo en las rutas revisadas.
- Cada grafico debe tener titulo, descripcion, unidad visible e insight o footer cuando aporte contexto.
- Los graficos importantes deben mostrar valor actual, media reciente/cambio y estado cuando esa referencia exista.
- Las graficas semanales deben usar rangos humanos como label principal (`15-21 jun`) y dejar `W25` o `2026-W25` solo como meta, badge o tooltip.
- La semana actual debe poder identificarse con un marcador sutil, sin colores agresivos.

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
