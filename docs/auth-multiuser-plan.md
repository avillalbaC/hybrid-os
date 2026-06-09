# Google Auth + Multiusuario

Este documento define el estado y plan de Hybrid OS tras migrar desde la app privada single-user con fake login hacia Google Auth con Supabase.

Decision actual:

- Hybrid OS ya esta desplegado y funcionando en produccion privada en https://hybrid.alvarovillalba.es.
- El portfolio publico sigue en https://alvarovillalba.es; Hybrid OS vive en subdominio separado.
- Google Auth privado single-user con allow-list de emails ya funciona.
- `user_id`, backfill y RLS ya estan activos.
- La app es privada, no multiusuario abierto.
- Multiusuario real sigue como fase posterior, no como estado actual.
- No tocar primary keys todavia.
- Antes de abrir varios usuarios reales hay que resolver `db_id` interno y `session_id` logico por usuario.

## Estado actual

Hybrid OS es una app privada con Google Auth y Supabase Auth. Supabase contiene datos reales y sigue siendo la fuente principal.

Produccion privada:

- URL: https://hybrid.alvarovillalba.es.
- Google Auth privado funciona.
- Allow-list activa.
- Acceso limitado al usuario autorizado.
- No es una app multiusuario abierta.
- El portfolio sigue separado en https://alvarovillalba.es.

Tablas principales en Supabase:

- `training_sessions`
- `raw_imports`
- `training_exercises`
- `body_checks`
- `nutrition_checks`

Estado del modelo:

- Las tablas principales ya tienen `user_id`.
- Los datos existentes ya fueron backfilleados al usuario owner.
- RLS esta activo.
- Las APIs privadas estan protegidas y operan con usuario autenticado.
- El importador guarda datos con `user_id`.
- `training_sessions.id` sigue siendo `text primary key`, por tanto el identificador de sesion sigue siendo global.
- El esquema documentado vive en `supabase/training_sessions.sql`.

Datos reales existentes segun diagnostico historico de solo lectura:

- `training_sessions`: 48
- `raw_imports`: 48
- `training_exercises`: 315
- `body_checks`: 0
- `nutrition_checks`: 0
- `raw_imports` huerfanos detectados: 0

Estos conteos son snapshot historico, no metrica viva.

## Fases

### Fase 1A - Google Auth privado

Estado: completada.

Objetivo:

- Reemplazar fake login por Google Auth privado.
- Permitir acceso solo al email owner autorizado.
- Proteger rutas privadas de la app.
- Mantener la app cerrada, sin multiusuario real.

Resultado:

- Google Auth privado funciona.
- Allow-list activa.
- Las rutas privadas requieren sesion valida.
- La app no esta abierta a varios usuarios reales.
- Produccion privada disponible en https://hybrid.alvarovillalba.es.

### Fase 1B - `user_id` y backfill

Estado: completada.

Objetivo:

- Anadir `user_id` a tablas principales.
- Obtener el usuario owner desde Supabase Auth.
- Backfillear datos reales existentes al owner.
- Mantener raw imports y payload completos.

Resultado:

- `user_id` esta anadido.
- El backfill esta hecho.
- Los datos reales siguen en Supabase.
- No se han tocado primary keys.

### Fase 1C - APIs privadas y RLS

Estado: completada segun el contexto actual proporcionado.

Objetivo:

- Proteger APIs privadas con usuario autenticado.
- Filtrar lecturas y escrituras por usuario.
- Guardar nuevos imports con `user_id` en todas las tablas afectadas.
- Activar RLS.
- Evitar que las APIs normales dependan de acceso administrativo para saltarse RLS.

Resultado:

- RLS esta activo.
- Las APIs privadas estan protegidas.
- El importador funciona con `user_id`.
- Supabase sigue siendo fuente principal.

## APIs privadas

APIs normales que deben requerir usuario autenticado y respetar datos propios:

- `GET /api/training-sessions`
- `PUT /api/training-sessions/:id`
- `DELETE /api/training-sessions/:id`
- `POST /api/imports`
- `GET /api/dashboard-data`

El importador debe guardar `user_id` en:

- `training_sessions`
- `raw_imports`
- `training_exercises`
- `body_checks`, si existe
- `nutrition_checks`, si existe

## Riesgos actuales

- No se debe abrir multiusuario real mientras `training_sessions.id` siga siendo primary key global.
- El duplicate check del importador debe mantenerse por usuario y session id.
- `localStorage` solo debe sincronizar pendientes cuando exista usuario autenticado.
- El importador puede romperse si alguna tabla relacionada se guarda sin `user_id`.
- `raw_imports` debe seguir preservando el JSON original.
- `payload` completo y metricas historicas no deben reducirse ni perderse.
- La service role key no debe exponerse en componentes, hooks cliente ni archivos publicos.

## Decision futura: multiusuario real

Antes de abrir a varios usuarios reales, migrar el identificador interno de sesiones:

- Anadir `db_id uuid primary key`.
- Renombrar o introducir `session_id text` para el id externo/logico de la sesion.
- Anadir `unique(user_id, session_id)`.
- Ajustar foreign keys para que las relaciones internas usen una clave estable y no colisionen entre usuarios.
- Mantener compatibilidad con el `trainingSession.id` del payload como identidad logica por usuario.

Hasta que esto exista:

- No abrir registro publico.
- No permitir varios usuarios reales operando con ids de sesion potencialmente colisionables.
- No tocar primary keys sin una migracion incremental planificada.

## Test plan vigente

- Login con email permitido entra correctamente.
- Login con email no permitido queda bloqueado.
- Sin sesion, las paginas privadas redirigen a login o muestran login.
- Sin sesion, las APIs normales devuelven `401`.
- Dashboard muestra solo datos del usuario autenticado.
- Training Log, Training Detail, Weekly, Running y Muscle Load leen solo datos propios.
- Importador guarda `user_id` en `training_sessions`.
- Importador guarda `user_id` en `raw_imports`.
- Importador guarda `user_id` en `training_exercises`.
- Importador guarda `user_id` en `body_checks` cuando existe body check.
- Importador guarda `user_id` en `nutrition_checks` cuando existe nutrition check.
- Duplicados se detectan por usuario y session id.
- `localStorage` pendiente solo se sincroniza con usuario autenticado.
- Scripts admin siguen funcionando con service role.
- `npm run lint`.
- `npm run build`.

## Verification documental

- Este documento refleja estado actual tras Google Auth, `user_id`, backfill y RLS.
- No modifica codigo.
- No toca Supabase.
- No ejecuta migraciones.
- Mantiene multiusuario real como fase posterior.

## Assumptions

- No hace falta modificar `AGENTS.md`; no hay una regla estructural nueva que deba persistir.
- La documentacion usa ASCII, en linea con el estilo actual de los docs.
- Los conteos de Supabase se documentan como diagnostico observado, no como metrica viva.
