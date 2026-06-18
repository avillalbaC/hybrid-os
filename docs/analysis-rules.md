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
6. Contexto de objetivo: cuando existe objetivo activo, las lecturas comparan metricas contra targets del bloque.
   - sin objetivo activo, la lectura debe ser descriptiva y evitar recomendaciones demasiado prescriptivas;
   - con objetivo activo, la lectura puede marcar desviaciones de minimos, maximos y senales a vigilar.
7. Planificado vs realizado: compara `planned_sessions` con `training_sessions` y `daily_entries`.
   - objetivo activo define intencion;
   - planned sessions define compromiso semanal;
   - training sessions define ejecucion;
   - daily entries define operacion diaria.
8. Contexto para check diario: prepara evidencia objetiva para que la decision diaria se tome fuera de la app.
   - la app no adopta rol de entrenador;
   - las recomendaciones prescriptivas se reservan para el check diario con ChatGPT;
   - Hybrid OS produce contexto, senales y evidencia;
   - evitar lenguaje imperativo salvo acciones tecnicas de UI.
   - todo bloque de contexto debe poder copiarse;
   - los datos insuficientes deben mostrarse de forma explicita;
   - el texto copiable debe separar senales, evidencia y huecos de datos.

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
- `lib/analytics/goal-evaluation.ts`: evaluacion determinista contra el objetivo activo.
- `lib/analytics/planning-evaluation.ts`: evaluacion determinista de planificado vs realizado.
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
- Todo warning visible debe incluir evidencia concreta y contexto de revision; evitar copy alarmista sin contexto.

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
- Puede combinar senales del objetivo con el Plan diario como contexto operativo.
- El Plan diario no debe duplicar Dashboard ni convertir recomendaciones en tareas automaticas todavia.
- Si hay objetivo activo, muestra solo resumen compacto, una senal a favor y una senal en contra; si no hay, CTA discreto a `/goals`.
- Si hay plan semanal, muestra resumen compacto del plan y la desviacion principal; si no hay plan, no debe sonar a alarma.

Dashboard:

- Panel de estado del periodo actual.
- KPIs principales: sesiones, carrera total, duracion, RPE medio y fatiga/carga.
- Debe mostrar graficos clave del periodo: carrera, duracion, fatiga y peso movido.
- Cada grafico clave debe incluir valor actual, media/cambio o estado si la tendencia existe.
- Lectura del periodo con maximo 3 evidencias.
- Maximo 2-3 riesgos principales.
- Contexto para decision con evidencia, sin ordenar que hacer.
- Tendencias clave, no todas.
- Preview de informes, no informes largos completos.
- Enlace claro a Analysis para profundidad.
- Debe mostrar una lectura breve segun objetivo activo cuando exista, sin duplicar toda la pagina `/goals`.
- Debe mostrar una lectura breve planificado vs realizado, sin duplicar lista semanal ni formulario.

Analysis:

- Analisis completo.
- Debe priorizar graficos y usar insights como interpretacion de esos datos.
- Todos los insights agrupados.
- Informes semanales y mensuales colapsados por defecto.
- Tendencias completas agrupadas por volumen, carrera, carga, fuerza, intensidad y muscular.
- Cada bloque de tendencias debe tener descripcion corta y evitar cards solitarias estiradas innecesariamente.
- Calidad de datos historica e informativa.
- Calidad de datos debe proponer maximo 3 mejoras de registro; no pedir completar todo el historico.
- Calidad de datos debe explicar el impacto de cada falta principal: resultado, RPE, duracion, partial y zapatillas.
- No persiste informes ni toca Supabase.
- En Actual debe mostrar contexto de objetivo: evaluacion global, principales senales y enlace a `/goals`.
- En Actual debe mostrar contexto para check diario con boton de copiar.
- En Actual debe mostrar Cumplimiento del plan: resumen semanal, principales desviaciones y enlace a `/goals`.

Running:

- Solo carrera: exposicion total, running estructurado, carrera mixta, HYROX sin running estructurado y zapatillas.
- Debe mostrar arriba "Carga semanal y carrera" para comparar kilometros de carrera con carga no-running normalizada.
- La carga no-running debe mostrarse como indice relativo o sombreado; no equivale a kilometros y no comparte unidad con el eje Y.
- Debe mostrar carrera por semana y separar visualmente running estructurado de carrera mixta.
- Debe explicar que la carrera mixta cuenta como impacto, pero no como running tecnico.
- La lectura debe preparar contexto objetivo para check diario: senal principal, evidencia, contexto no-running y datos insuficientes.
- No debe usar ordenes de entrenamiento ni lenguaje prescriptivo en la lectura de carrera.
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
- No marcar baja carrera como problema si el periodo es claramente de fuerza, salvo que el objetivo activo defina un minimo de running.
- No hacer recomendaciones prescriptivas fuertes si no hay objetivo activo.
- No ignorar targets activos cuando existen: maximos de descarga, minimos de fuerza y rangos de running deben contextualizar la lectura.
- No mezclar intencion, plan y ejecucion como si fueran la misma capa.
- No tratar ausencia de plan semanal como incumplimiento; debe ser estado informativo.
- No marcar planned sessions como training sessions reales.
- No usar IA/LLM runtime.
- No persistir informes.
- No tocar Supabase schema.
- No mezclar seed con Supabase si hay datos reales.
- No convertir todo warning en alarma.
- No cerrar la decision diaria dentro de Hybrid OS; la app prepara contexto objetivo para pegar en el check diario.
- No ocultar datos insuficientes cuando afectan a la lectura del periodo.

## Limitaciones conocidas

- Los objetivos activos y plan semanal cubren el MVP, pero todavia no existe importador de programaciones desde texto ni plantillas.
- `partial` aparece mucho en historico y puede hacer que calidad de datos sea repetitiva.
- Body/nutrition estan en pipeline pero actualmente no aportan senales reales.
- Sin test framework formal; los fixtures actuales son manuales e importables.
