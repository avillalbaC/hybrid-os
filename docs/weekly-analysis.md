# Weekly Analysis

Documento operativo para la pestaña Semana de `/analysis`.

## Objetivo

El informe semanal resume una semana calendario de entrenamiento con datos registrados, planificación disponible y señales objetivas útiles para el check diario. No decide el entrenamiento siguiente ni usa lenguaje prescriptivo.

Debe responder:

- qué se hizo esa semana;
- qué disciplinas aparecen;
- qué se completó frente a lo esperado, si existía planificación;
- qué datos mejoran solo cuando hay comparación fiable;
- qué carga e intensidad se acumularon;
- qué datos faltan para leer mejor la semana.

## Periodos Semanales

La semana siempre va de lunes a domingo.

La última semana cerrada es la semana completa anterior a la semana en curso. En lunes, la pestaña Semana usa por defecto esa última semana cerrada, porque la semana en curso acaba de empezar.

La semana en curso es la semana real del lunes al domingo que contiene la fecha de hoy.

El rango principal se muestra con etiqueta humana, por ejemplo `15-21 jun`, y no con `W25` como etiqueta principal.

## Labels

El informe semanal usa una única fuente de verdad para:

- `selectedWeekMode`;
- `selectedWeekStart`;
- `selectedWeekEnd`;
- `selectedWeekLabel`.

Labels visibles:

- `last_closed_week`: `Última semana cerrada · 15-21 jun`.
- `current_week`: `Semana en curso · 22-28 jun`.
- `custom_week`: `Semana seleccionada · 8-14 jun`.

No usar `Semana actual` dentro del informe semanal si se está mostrando la semana cerrada anterior.

La UI permite alternar entre:

- Última semana cerrada.
- Semana en curso.

Si se selecciona `current_week` y aún no hay sesiones, el empty state debe decir:

`Sin sesiones registradas en la semana en curso.`

No se arrastran datos de la semana anterior al modo `current_week`.

## Realizado vs esperado

La comparación usa solo fuentes de intención ya existentes:

- `planned_sessions`;
- `programming_sessions`.

No se inventan expectativas. Si una semana no tiene sesiones planificadas ni programaciones, se muestra:

`Sin programación semanal definida. La lectura se basa solo en sesiones registradas.`

Una sesión esperada cuenta como completada cuando:

- está marcada como completada en la fuente de planificación;
- o existe una sesión real el mismo día con disciplina compatible.

Las sesiones saltadas o canceladas no se convierten en entrenamiento real. El cumplimiento por disciplina agrupa por las categorías del informe: running, hyrox, crossfit, fuerza, halterofilia, gimnásticos, movilidad y mixed/other.

## Reglas de Comparación

El informe no declara PR. Usa etiquetas descriptivas:

- `Mejor dato registrado`;
- `Mejora frente a última referencia`;
- `Sin comparación suficiente`.

Running:

- compara ritmo solo cuando existe distancia y duración;
- exige una referencia previa con distancia comparable;
- si no hay referencia equivalente, muestra `Sin comparación suficiente`.

Fuerza y halterofilia:

- usa la mayor carga por movimiento cuando el ejercicio tiene `loadKg`;
- compara contra el mismo movimiento normalizado si existe histórico previo;
- si no hay histórico previo, el dato puede aparecer como `Mejor dato registrado`, no como PR.

Gimnásticos y programaciones:

- muestra bloques completados y `final_log` si existen;
- esos datos son descriptivos salvo que haya una métrica previa equivalente.

Benchmarks y metcons:

- solo compara si coinciden título y tipo de resultado;
- en resultados de tiempo, menor tiempo es mejora;
- sin mismo título y métrica comparable, la etiqueta es `Sin comparación suficiente`.

## Lenguaje Permitido

La pestaña Semana debe usar lenguaje objetivo:

- se observa;
- dato relevante;
- señal de contexto;
- útil para check diario;
- datos insuficientes.

Evitar lenguaje prescriptivo de entrenamiento:

- haz;
- evita;
- prioriza;
- deberías.

## Limitaciones

- La planificación depende de que existan `planned_sessions` o `programming_sessions`.
- Las métricas de ritmo dependen de distancia y duración disponibles.
- Las cargas máximas dependen de `loadKg` por ejercicio.
- La carga muscular depende de `session_muscle_summary` o del cálculo derivado desde ejercicios.
- Con pocas sesiones, muchas conclusiones deben quedar como datos insuficientes.
- El informe no persiste nada en Supabase y no modifica schema.
