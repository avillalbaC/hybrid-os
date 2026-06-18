# Hybrid OS - Objetivos activos

Fecha: 2026-06-17

## Definicion actual

Goals es seguimiento del objetivo activo.

No es un entrenador, no prescribe que hacer hoy y no sustituye el check diario con ChatGPT. Su funcion es ordenar evidencia objetiva para responder:

- si el objetivo parece mas cerca, estable o mas lejos;
- que senales estan sumando;
- que senales estan restando;
- que datos faltan para leer mejor el bloque;
- que contexto conviene copiar al check diario.

La decision diaria vive fuera de Hybrid OS. La app registra datos, visualiza progreso y prepara contexto.

## Modelo `goal_blocks`

Tabla: `public.goal_blocks`.

Campos principales:

- `user_id`: propietario del bloque.
- `title`: nombre visible del objetivo.
- `profile`: perfil del bloque.
- `status`: `active`, `paused`, `completed` o `archived`.
- `start_date` y `end_date`: ventana del bloque.
- `targets`: JSONB con targets semanales, body, recovery y senales a vigilar.
- `notes`: contexto manual.

La tabla tiene RLS activo con politicas por `auth.uid() = user_id`. Las APIs privadas usan `requireAllowedUser()` y fuerzan `user_id` en servidor.

## Perfiles disponibles

- `recomposition`: recomposicion / definicion.
- `running_base`: base de running.
- `hyrox_build`: construccion HYROX.
- `strength_maintenance`: mantenimiento de fuerza.
- `deload`: descarga / recuperacion.
- `custom`: objetivo personalizado.

Cada perfil carga targets semanales por defecto y senales musculares a vigilar. Cambiar de perfil en la UI actualiza esos targets.

## Evaluacion de progreso

`lib/analytics/goal-progress.ts` genera la lectura principal de Goals.

Fuentes usadas:

- sesiones reales de entrenamiento;
- exposicion de carrera estructurada y mixta;
- RPE, duracion, carga muscular y calidad de datos;
- `daily_entries` para movilidad y soporte diario;
- `body_checks`, cuando existan;
- `nutrition_checks`, cuando existan;
- `planned_sessions` solo como contexto beta/opcional.

Salidas principales:

- `progressItems`: progreso corporal, entrenamiento, habitos/soporte y calidad de datos.
- `positiveSignals`: lo que esta sumando.
- `negativeSignals`: lo que esta restando.
- `insufficientData`: huecos de datos.
- `checkInContext`: texto plano copiable para el check diario.

Si faltan datos, la app no inventa conclusiones. Muestra datos insuficientes.

## Contexto para check diario

`lib/analytics/check-in-context.ts` construye texto plano con:

- objetivo activo;
- periodo;
- sesiones, duracion, RPE y carrera;
- running estructurado frente a carrera mixta;
- fuerza/Haltero y HYROX/CrossFit;
- carga muscular principal;
- movilidad y prioridades del Daily Plan;
- senales a favor;
- senales en contra;
- datos insuficientes.

El boton `Copiar contexto` usa el portapapeles del navegador. No envia nada a servicios externos y no usa IA runtime.

## Estructura de `/goals`

Orden actual:

1. Header: `Objetivos`.
2. Objetivo activo: titulo, perfil, fechas, notas y edicion.
3. Progreso hacia el objetivo.
4. Lo que esta sumando.
5. Lo que esta restando.
6. Datos insuficientes.
7. Contexto para check diario.
8. Plan semanal beta.

La planificacion semanal sigue existiendo, pero baja de protagonismo.

## Plan semanal beta

`planned_sessions` define sesiones previstas de la semana, pero no es la fuente principal del objetivo.

En `/goals` aparece como:

- `Plan semanal beta`;
- opcional;
- pensado para comparar intencion semanal con ejecucion real;
- valido aunque este vacio;
- separado de `training_sessions`.

No se mezcla programacion dentro de `goal_blocks` y no se escriben sesiones planificadas en `training_sessions`.

## Integracion UI

- Home: mantiene Daily Plan como protagonista y muestra objetivo activo con una senal a favor, una senal en contra y enlace a `/goals`.
- Dashboard: muestra lectura breve de objetivo y contexto del periodo, sin ordenes.
- Analysis: muestra contexto de objetivo y tarjeta copiable para check diario, sin duplicar toda la pagina Goals.

## Que no incluye

- No toca `training_sessions`, `raw_imports`, `training_exercises` ni contratos JSON.
- No implementa importador de programaciones.
- No implementa dieta, Google Drive ni IA runtime.
- No decide que hacer hoy.
