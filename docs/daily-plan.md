# Hybrid OS - Daily Plan

Fecha: 2026-06-17

## Objetivo

Daily Plan es el MVP de planificacion diaria dentro de Home. Su funcion es responder rapido:

- que toca hoy;
- cuales son las tres prioridades principales;
- si se ha hecho movilidad;
- que contexto de Hybrid OS puede ayudar al check diario.

No sustituye a Dashboard ni a Analysis. Home mantiene una lectura corta y operativa.
Tampoco se convierte en un gestor completo de tareas: funciona como bullet journal diario simple.

## Tabla `daily_entries`

`public.daily_entries` guarda una entrada unica por usuario y fecha.

Campos principales:

- `user_id`: propietario de la entrada.
- `entry_date`: fecha del plan.
- `priorities`: prioridades del dia como JSONB. Home mantiene tres slots activos principales, pero el JSON puede conservar tareas cerradas o pendientes extra.
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

Hybrid OS puede mostrar contexto junto al plan, pero no lo copia como tarea automatica ni decide que hacer hoy.

Las sesiones planificadas de `planned_sessions` pueden servir como contexto o CTA manual, pero no rellenan automaticamente las tres prioridades del dia sin confirmacion.

## Prioridades

Cada prioridad admite estos estados:

- `pending`: tarea activa.
- `completed`: tarea completada.
- `discarded`: tarea descartada.
- `postponed`: tarea movida a otra fecha.

Compatibilidad:

- Las prioridades antiguas pueden tener solo `{ id, text, done }`.
- Al leer, si `status` existe se usa como fuente principal.
- Si no hay `status`, `done: true` se interpreta como `completed`.
- Si no hay `status` y `done` no es `true`, se interpreta como `pending`.
- Al guardar, se persiste `status` y se mantiene `done = status === "completed"` como compatibilidad temporal.

Reglas de UI:

- Home muestra hasta tres prioridades activas principales.
- Al completar, descartar o posponer una prioridad, queda registrada en `Cerradas hoy` y libera un slot activo.
- Las prioridades cerradas no se borran al guardar.
- Si una fecha acumula mas de tres prioridades pendientes, Home muestra las tres primeras y lista el resto como `Mas tareas pendientes`.

## Acciones

Completar:

- Se guarda con `status: "completed"`.
- `done` queda en `true`.
- La tarea aparece tachada en `Cerradas hoy`.

Descartar:

- Se guarda con `status: "discarded"`.
- `done` queda en `false`.
- La tarea aparece atenuada en `Cerradas hoy`.

Posponer:

- La UI abre un modal simple con `input type="date"`.
- La fecha por defecto es manana.
- No se permite elegir el mismo dia.
- La prioridad original queda con `status: "postponed"`, `done: false` y `postponedToDate`.
- Se crea una copia pendiente en la fecha destino con `postponedFromDate` y `originalPriorityId`.

## Revision de pendientes de ayer

Home revisa la entrada del dia anterior y, si quedaron prioridades abiertas, muestra una tarjeta compacta `Pendientes de ayer`.

Una prioridad de ayer cuenta como pendiente si:

- tiene texto no vacio;
- su `status` es `pending`;
- o no tiene `status` y `done` no es `true`.

No cuenta como pendiente si esta `completed`, `discarded` o `postponed`.

La compatibilidad legacy se mantiene asi:

- `{ id, text, done: false }` se interpreta como `pending`.
- `{ id, text, done: true }` se interpreta como `completed`.

La app no mueve tareas automaticamente. Cada tarea necesita confirmacion del usuario:

- `Completar`: marca la prioridad original como `completed` y `done: true`.
- `Pasar a hoy`: marca la prioridad original como `postponed`, guarda `postponedToDate` y crea una copia `pending` en la entrada de hoy con `postponedFromDate` y `originalPriorityId`.
- `Posponer`: permite elegir una fecha con calendario, marca la prioridad original como `postponed`, guarda `postponedToDate` y crea una copia `pending` en la fecha elegida.
- `Descartar`: marca la prioridad original como `discarded` y no crea copia en hoy.

Tambien existen acciones en lote para pasar o descartar todos los pendientes visibles.

Si hoy ya tiene una tarea pendiente claramente duplicada, no se crea otra copia y se devuelve un warning seguro desde la API.

## API

Endpoints existentes:

- `GET /api/daily-entry?date=YYYY-MM-DD`: devuelve la entrada propia o `null`.
- `PUT /api/daily-entry`: crea o actualiza la entrada propia. Tambien guarda cambios de `pending`, `completed` y `discarded`.
- `GET /api/daily-entry/range?start=YYYY-MM-DD&end=YYYY-MM-DD`: devuelve entradas propias para un rango.

Endpoint de posponer:

- `POST /api/daily-entry/priorities/postpone`
- Body: `{ "fromDate": "YYYY-MM-DD", "toDate": "YYYY-MM-DD", "priorityId": "..." }`
- No acepta `user_id` del cliente.
- Usa el usuario autenticado con `requireAllowedUser()`.
- Actualiza la entrada origen y crea o actualiza la entrada destino.
- Evita duplicados obvios si la fecha destino ya tiene una prioridad pendiente con el mismo texto y `postponedFromDate`.

Endpoints de revision de ayer:

- `GET /api/daily-entry/pending-review?date=YYYY-MM-DD`
  - Recibe la fecha actual.
  - Calcula ayer con fecha local.
  - Devuelve solo prioridades pendientes reales de ayer.
  - Devuelve lista vacia si no existe entrada de ayer.
- `POST /api/daily-entry/pending-review/resolve`
  - Body: `{ "fromDate": "YYYY-MM-DD", "toDate": "YYYY-MM-DD", "actions": [{ "priorityId": "...", "action": "carry_over" | "complete" | "discard" | "postpone", "toDate": "YYYY-MM-DD" }] }`.
  - No acepta `user_id`.
  - Usa `requireAllowedUser()` y helper server-side de Supabase.
  - Actualiza la entrada origen y, si procede, la entrada destino.

Cuando la entrada destino no existe, se crea con:

- `priorities`: nueva tarea pendiente.
- `mobility_done`: `false`.
- `mobility_minutes`: `null`.
- `mobility_focus`: `[]`.
- `daily_note`: `null`.
- `source`: `manual`.

## Que no incluye todavia

- Ruta dedicada `/daily`.
- Revision semanal de planes.
- Parser de checks pegados.
- Conexion con Google Drive.
- IA runtime.
- Integracion con `training_sessions` o contratos JSON de entrenamiento.
- Autocompletar prioridades desde `planned_sessions`.
- Reordenar o gestionar tareas como proyecto avanzado.
- Garantia transaccional SQL multi-entry para posponer; el MVP guarda ambas entradas desde la API server-side.

## Proximos pasos

1. Crear `/daily` para historico y edicion semanal.
2. Conectar check diario/bodyCheck cuando Body/Nutrition vuelva a ser prioridad.
3. Definir parser de check pegado.
4. Preparar importacion Google Drive.
5. Crear revision semanal de cumplimiento y movilidad.
