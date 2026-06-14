# Hybrid OS - Analysis Rules

Fecha: 2026-06-13

Documento operativo para mantener la capa de analisis determinista. No describe schema ni persistencia.

## Arquitectura conceptual

1. Metricas: numeros puros agregados desde sesiones.
   - sesiones, duracion, carrera total, running estructurado, carrera mixta, RPE, fatiga, impacto, carga cardio, carga fuerza, peso movido y carga muscular.
2. Tendencias: evolucion frente a referencia reciente.
   - sube, baja, estable, subida brusca, descarga o historico insuficiente.
3. Insights: interpretacion determinista con evidencia.
   - ejemplo: carrera total sube, pero gran parte viene de sesiones mixtas.
4. Informes: conclusion de periodo.
   - resumen semanal o mensual generado dinamicamente desde sesiones.
5. Visualizaciones: graficos ligeros que muestran los datos antes de la explicacion.
   - los insights explican los graficos; no sustituyen graficos.
   - cada grafico importante debe mostrar unidad, valor actual y referencia compacta cuando exista.

Las tendencias no sustituyen a informes. Los informes usan metricas + tendencias + insights.

## Archivos principales

- `lib/analytics/data-insights.ts`: motor determinista de insights.
- `lib/analytics/insight-surface.ts`: distribucion de insights por superficie.
- `lib/analytics/trends.ts`: buckets y tendencias semanales.
- `lib/analytics/period-reports.ts`: informes semanales/mensuales.
- `components/analytics/data-insights-panel.tsx`: UI de Home, Dashboard, Running y Muscle Load.
- `components/analysis/*`: cards/listas de informes.
- `components/charts/*`: capa visual reutilizable para barras, rankings, sparklines y calidad de datos.
- `lib/analytics/chart-data.ts`: datasets visuales derivados de sesiones, trends, running exposure y muscle load.
- `lib/analytics/__fixtures__/analysis-fixtures.ts`: fixtures manuales sin framework.
- `lib/analytics/analysis-debug.ts`: helper para revisar outputs de fixtures.

## Categorias

- `load`: fatiga, impacto y acumulacion global.
- `running`: carrera total, estructurada y mixta.
- `muscle`: carga muscular, ratios y desbalances.
- `intensity`: RPE alto y relacion volumen/intensidad.
- `volume`: volumen temporal.
- `discipline`: orientacion de la semana por deporte o estimulo.
- `recovery`: recuperacion/movilidad cuando hay carga relevante.
- `consistency`: periodo estable.
- `data_quality`: partial, pending fields, RPE, duracion o zapatillas.

## Severidades

- `info`: descriptivo o precision limitada; no debe sonar alarmista.
- `positive`: senal favorable real, no motivacion vacia.
- `warning`: accionable; requiere revisar la siguiente decision.
- `critical`: raro; solo combinaciones claras de carga, impacto, RPE o subida extrema.
- Todo warning visible debe incluir evidencia concreta y una accion siguiente; evitar copy alarmista sin contexto.

## Thresholds actuales

- Fatiga semanal:
  - warning si `fatigueCost` sube `>= 25%` vs media reciente.
  - critical solo si sube `>= 60%`, RPE medio `>= 8` e impacto `>= 220`.
- Impacto:
  - warning si `impactScore` sube `>= 25%`.
  - critical solo si sube `>= 60%`, impacto `>= 260` y al menos 50% de sesiones tienen RPE alto.
- Carrera total:
  - warning si `totalRunExposureMeters` sube `>= 25%`.
  - critical solo si sube `>= 80%`, impacto `>= 260`, RPE medio `>= 8` y gemelos estan en top 5.
- Volumen bajo + intensidad:
  - warning si duracion baja `> 20%` y RPE medio `>= 8`, o si duracion del periodo `<= 120 min` y RPE medio `>= 8`.
- Running estructurado:
  - warning/info si `structuredRunMeters === 0` y `mixedRunMeters > 0`.
  - info si `mixedRunMeters / totalRunExposureMeters >= 0.6`.
- Fuerza:
  - warning si carga externa y fatiga suben juntas `>= 20%`.
  - info si baja carga externa y sube cardio.
  - positive si semana con fuerza dominante: fuerza/halterofilia `>= 2`, peso movido `>= 6000 kg` y carrera `< 1000 m`.
- Musculo:
  - concentracion top 3 si top 3 `>= 45%` y carga muscular total `>= 500`.
  - sesgo tren inferior solo si hay sesiones principales no-running y tren inferior supera a tren superior por `25%`.
  - gemelos warning si carrera total `>= 5000 m` y gemelos top 5.
  - core/lumbar warning si core/lumbar `< 15%` con impacto `>= 120` o carrera `>= 5000 m`.
- Disciplina:
  - HYROX `>= 2` y running estructurado `0` genera warning.
  - actividad secundaria con fatiga relevante genera info.
- Calidad de datos:
  - partial si `>= 30%` de sesiones del periodo son partial.
  - missing RPE si `>= 40%` de sesiones no tienen RPE.
  - running sin zapatillas aparece como info, nunca como bloqueo.

## Reglas por pantalla

Home:

- 1 headline.
- Maximo 2-3 senales.
- Maximo 1 accion.
- No informes ni listas largas.

Dashboard:

- Centro de decision del periodo actual.
- KPIs principales: sesiones, carrera total, duracion, RPE medio y fatiga/carga.
- Debe mostrar graficos clave del periodo: carrera, duracion, fatiga y peso movido.
- Cada grafico clave debe incluir valor actual, media/cambio o estado si la tendencia existe.
- Lectura del periodo con maximo 3 evidencias.
- Maximo 2-3 riesgos principales.
- Una decision recomendada con accion principal, por que, priorizar y evitar.
- Tendencias clave, no todas.
- Preview de informes, no informes largos completos.
- Enlace claro a Analysis para profundidad.

Analysis:

- Analisis completo.
- Debe priorizar graficos y usar insights como interpretacion de esos datos.
- Todos los insights agrupados.
- Informes semanales y mensuales colapsados por defecto.
- Tendencias completas agrupadas por volumen, carrera, carga, fuerza, intensidad y muscular.
- Cada bloque de tendencias debe tener descripcion corta y evitar cards solitarias estiradas innecesariamente.
- Calidad de datos historica e informativa.
- Calidad de datos debe proponer maximo 3 acciones priorizadas; no pedir completar todo el historico.
- Calidad de datos debe explicar el impacto de cada falta principal: resultado, RPE, duracion, partial y zapatillas.
- No persiste informes ni toca Supabase.

Running:

- Solo carrera: exposicion total, running estructurado, carrera mixta, HYROX sin running estructurado y zapatillas.
- Debe mostrar carrera por semana y separar visualmente running estructurado de carrera mixta.
- Debe explicar que la carrera mixta cuenta como impacto, pero no como running tecnico.
- No mostrar core/lumbar, partial o recovery dentro de `Lectura de carrera`.
- Puede enlazar a Analysis para ver contexto global.

Muscle Load:

- Solo musculo: dominantes, desbalances, gemelos, aductores, core/lumbar, empuje/traccion.
- Debe mostrar barras de top musculos, ratios principales y sesiones clave con mini barras.
- Puede reservar un slot discreto para BodyMap futuro, sin implementar mapa corporal hasta tener asset real.
- No mostrar calidad de datos ni recovery en `Lectura muscular avanzada`.
- Puede enlazar a Analysis para ver contexto global.

Informes:

- Cierran periodo.
- Distinguen periodo abierto/cerrado.
- No guardan nada en Supabase.

## Que no debe hacer el motor

- No inventar progreso por subir carga.
- No llamar descarga a falta de datos.
- No marcar baja carrera como problema si el periodo es claramente de fuerza.
- No usar IA/LLM runtime.
- No persistir informes.
- No tocar Supabase schema.
- No mezclar seed con Supabase si hay datos reales.
- No convertir todo warning en alarma.

## Limitaciones conocidas

- No existe objetivo activo del bloque; algunas recomendaciones usan lenguaje condicional.
- `partial` aparece mucho en historico y puede hacer que calidad de datos sea repetitiva.
- Body/nutrition estan en pipeline pero actualmente no aportan senales reales.
- Sin test framework formal; los fixtures actuales son manuales e importables.
