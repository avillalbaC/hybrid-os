# Hybrid OS - Daily Plan

Fecha: 2026-06-17

## Objetivo

Daily Plan es el MVP de planificacion diaria dentro de Home. Su funcion es responder rapido:

- que toca hoy;
- cuales son las tres prioridades principales;
- si se ha hecho movilidad;
- que accion recomienda Hybrid OS como contexto.

No sustituye a Dashboard ni a Analysis. Home mantiene una lectura corta y operativa.

## Tabla `daily_entries`

`public.daily_entries` guarda una entrada unica por usuario y fecha.

Campos principales:

- `user_id`: propietario de la entrada.
- `entry_date`: fecha del plan.
- `priorities`: hasta tres prioridades visibles en Home.
- `mobility_done`: movilidad hecha o no.
- `mobility_minutes`: minutos de movilidad, opcional y no negativo.
- `mobility_focus`: focos seleccionables como hombro, cadera, tobillo, espalda, core o general.
- `daily_note`: nota rapida del dia.
- `source`: `manual` por defecto.

La tabla tiene RLS activo y politicas de select, insert, update y delete filtradas por `auth.uid() = user_id`.

## Flujo Home

1. Home calcula la fecha local del navegador.
2. `DailyPlanCard` llama a `GET /api/daily-entry?date=YYYY-MM-DD`.
3. Si no existe entrada, muestra formulario vacio.
4. Al guardar, llama a `PUT /api/daily-entry`.
5. La API valida el payload y fuerza `user_id` desde `requireAllowedUser()`.
6. Supabase guarda con `upsert` por `(user_id, entry_date)`.
7. Al recargar Home, la entrada persiste.

La accion recomendada de Hybrid OS se muestra como contexto junto al plan, pero no se copia como tarea automatica.

## Que no incluye todavia

- Ruta dedicada `/daily`.
- Revision semanal de planes.
- Parser de checks pegados.
- Conexion con Google Drive.
- Objetivos activos.
- IA runtime.
- Integracion con `training_sessions` o contratos JSON de entrenamiento.

## Proximos pasos

1. Crear `/daily` para historico y edicion semanal.
2. Conectar check diario/bodyCheck cuando Body/Nutrition vuelva a ser prioridad.
3. Definir parser de check pegado.
4. Preparar importacion Google Drive.
5. Crear revision semanal de cumplimiento y movilidad.
