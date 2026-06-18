# Hybrid OS - Plan semanal / Programaciones

Fecha: 2026-06-17

## Problema que resuelve

Objetivos activos define que se quiere conseguir. Plan semanal define que se pretendia hacer esta semana. La comparacion con sesiones reales permite responder:

- que estaba planificado;
- que se hizo realmente;
- que quedo pendiente;
- que aparecio sin estar previsto;
- que ajustar hoy o el resto de la semana.

## Modelo `planned_sessions`

Tabla nueva: `public.planned_sessions`.

Campos principales:

- `user_id`: propietario de la sesion planificada.
- `goal_block_id`: relacion opcional con el objetivo activo.
- `planned_date`: fecha prevista.
- `title`: nombre visible.
- `type`: tipo alineado con `trainingSession.type`, mas `descanso`.
- `subtypes` y `focus`: arrays flexibles.
- `status`: `planned`, `completed`, `skipped`, `moved` o `cancelled`.
- `priority`: `low`, `normal` o `high`.
- `planned_duration_minutes`, `planned_distance_meters`, `planned_rpe`.
- `notes`.
- `source`: `manual`, `template`, `import` o `suggestion`.
- `matched_training_session_id`: reservado para matching mas avanzado.
- `completed_at`.

La tabla tiene RLS activo y politicas de select, insert, update y delete filtradas por `auth.uid() = user_id`.

## Relacion con otras tablas

- `goal_blocks`: define intencion del bloque.
- `planned_sessions`: define compromiso semanal.
- `training_sessions`: define ejecucion real importada.
- `daily_entries`: define operacion diaria manual.

No se mezclan programaciones dentro de `goal_blocks` y no se escriben sesiones planificadas en `training_sessions`.

## Flujo semanal

1. `/goals` carga objetivo activo, plan semanal y datos reales.
2. El usuario crea sesiones planificadas manualmente.
3. `planned_sessions` guarda la programacion por usuario.
4. `planning-evaluation` compara planificado vs realizado en la semana calendario lunes-domingo.
5. Home, Dashboard y Analysis muestran resumen compacto.

## Reglas planificado vs realizado

Matching MVP:

- misma fecha y mismo tipo;
- movilidad tambien se considera hecha si `daily_entries.mobility_done` es true ese dia;
- descanso se considera cumplido si no hay sesion dura ese dia;
- sesiones reales sin plan similar cuentan como no planificadas.

Desviaciones MVP:

- running planificado pendiente;
- fuerza planificada pendiente;
- movilidad planificada sin marcar;
- intensidad no planificada;
- impacto extra no previsto;
- plan en curso sin desviaciones relevantes.

Si hay objetivo activo, algunas desviaciones se contextualizan:

- descarga + HYROX/intensidad extra sube severidad;
- base running + running pendiente se marca como warning;
- mantenimiento de fuerza + fuerza pendiente se marca como warning;
- recomposicion + movilidad baja e intensidad alta se marca como warning.

## Que no incluye todavia

- Importador automatico de programaciones desde texto.
- Plantillas semanales.
- Drag and drop.
- Google Calendar.
- Notificaciones.
- Recurring templates complejas.
- Planificacion de bloques de 12 semanas.
- Conexion automatica con Daily Plan.

## Siguientes pasos

1. Importador de programaciones desde texto, con preview antes de guardar.
2. Plantillas semanales.
3. Arrastrar o mover sesiones.
4. Conexion manual mas rica con Daily Plan.
5. Calendario.
6. Comparacion por bloques.
