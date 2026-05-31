# Google Auth + Multiusuario

Este documento define una migracion segura desde la app privada single-user con fake login hacia Google Auth con Supabase. No implementa auth, no cambia Supabase y no ejecuta migraciones.

Decision actual:

- Fase 1: Google Auth privado single-user con allow-list de emails.
- Multiusuario abierto: fase posterior, cuando el modelo soporte ids de sesion por usuario.

## Estado actual

Hybrid OS es hoy una app privada single-user con fake login local. Supabase ya contiene datos reales y debe seguir siendo la fuente principal.

Tablas actuales en Supabase:

- `training_sessions`
- `raw_imports`
- `training_exercises`
- `body_checks`
- `nutrition_checks`

Estado del modelo:

- Las tablas actuales no tienen `user_id`.
- `training_sessions.id` es `text primary key`, por tanto el identificador de sesion es global.
- RLS esta activado en el SQL versionado, pero la app usa service role desde servidor.
- El esquema documentado vive en `supabase/training_sessions.sql`.

Datos reales existentes segun diagnostico de solo lectura:

- `training_sessions`: 48
- `raw_imports`: 48
- `training_exercises`: 315
- `body_checks`: 0
- `nutrition_checks`: 0
- `raw_imports` huerfanos detectados: 0

APIs que actualmente usan service role indirectamente a traves de `lib/supabase/training-sessions.ts`:

- `GET /api/training-sessions`
- `PUT /api/training-sessions/:id`
- `DELETE /api/training-sessions/:id`
- `POST /api/imports`
- `GET /api/dashboard-data`

Scripts admin que usan service role y deben seguir siendo tareas de mantenimiento:

- `scripts/import-seed-to-supabase.ts`
- `scripts/backfill-sessions.ts`
- `scripts/replace-existing-session.ts`

Fake login actual:

- Usa cookie local `hybrid-os-authenticated`.
- La pantalla esta en `components/auth/fake-auth-gate.tsx`.
- La constante de cookie esta en `lib/auth/fake-auth.ts`.
- `app/layout.tsx` bloquea la app si no existe esa cookie.

## Objetivo fase 1

La primera fase no abre la app a multiples usuarios reales. El objetivo es reemplazar el fake login por Google Auth privado single-user con allow-list de emails.

Objetivos:

- Configurar Google OAuth en Supabase.
- Crear login real con Supabase Auth.
- Permitir acceso solo a emails autorizados.
- Anadir `user_id` a las tablas de datos.
- Backfillear todos los datos existentes al owner.
- Filtrar todas las APIs normales por `user_id`.
- Guardar nuevos imports con `user_id` en todas las tablas afectadas.
- Mantener service role solo para scripts admin o tareas server-side explicitamente administrativas.
- Preservar el flujo critico: `HybridOSAppInput JSON -> validacion -> preview -> Supabase -> Dashboard/Training Log/Muscle Load`.

## Orden recomendado

1. Configurar Google OAuth en Supabase.
2. Anadir variables publicas/privadas necesarias para Supabase Auth sin exponer service role.
3. Crear `/login`.
4. Crear `/auth/callback`.
5. Crear clientes Supabase separados:
   - browser client con anon key.
   - server client basado en cookies/sesion.
   - admin client con service role solo para scripts/admin.
6. Anadir `user_id` nullable e indices a las tablas.
7. Hacer login con Google usando el email owner permitido.
8. Obtener `OWNER_USER_ID` desde `auth.users`.
9. Backfillear datos existentes al owner.
10. Actualizar APIs normales para exigir usuario autenticado y filtrar por `user_id`.
11. Actualizar importador server-side para guardar `user_id` en:
    - `training_sessions`
    - `raw_imports`
    - `training_exercises`
    - `body_checks`, si existe
    - `nutrition_checks`, si existe
12. Verificar que no quedan filas con `user_id is null`.
13. Poner `user_id not null`.
14. Activar o ajustar RLS policies por usuario.
15. Quitar service role de APIs normales.
16. Mantener scripts admin usando service role de forma explicita y documentada.

## Riesgos

- Si las APIs normales siguen usando service role, pueden saltarse RLS aunque existan policies correctas.
- El duplicate check del importador debe pasar de `session id` global a `user_id + session id`.
- `localStorage` solo debe sincronizar pendientes cuando exista usuario autenticado.
- No se debe activar `user_id not null` antes del backfill y la verificacion.
- No se debe abrir multiusuario real mientras `training_sessions.id` siga siendo primary key global.
- El importador puede romperse si alguna tabla relacionada se guarda sin `user_id`.
- `raw_imports` debe seguir preservando el JSON original.
- `payload` completo y metricas historicas no deben reducirse ni perderse.

## Decision futura

Antes de abrir a varios usuarios reales, migrar el identificador interno de sesiones:

- Anadir `db_id uuid primary key`.
- Renombrar o introducir `session_id text` para el id externo/logico de la sesion.
- Anadir `unique(user_id, session_id)`.
- Ajustar foreign keys para que las relaciones internas usen una clave estable y no colisionen entre usuarios.
- Mantener compatibilidad con el `trainingSession.id` del payload como identidad logica por usuario.

## SQL estimado

### Anadir user_id nullable

```sql
alter table public.training_sessions
  add column if not exists user_id uuid references auth.users(id);

alter table public.raw_imports
  add column if not exists user_id uuid references auth.users(id);

alter table public.training_exercises
  add column if not exists user_id uuid references auth.users(id);

alter table public.body_checks
  add column if not exists user_id uuid references auth.users(id);

alter table public.nutrition_checks
  add column if not exists user_id uuid references auth.users(id);
```

### Indices

```sql
create index if not exists training_sessions_user_date_idx
  on public.training_sessions(user_id, session_date desc);

create index if not exists raw_imports_user_session_idx
  on public.raw_imports(user_id, training_session_id);

create index if not exists training_exercises_user_session_idx
  on public.training_exercises(user_id, training_session_id);

create index if not exists body_checks_user_date_idx
  on public.body_checks(user_id, check_date desc);

create index if not exists nutrition_checks_user_date_idx
  on public.nutrition_checks(user_id, check_date desc);
```

### Obtener owner

```sql
select id, email
from auth.users
where email = '<OWNER_GOOGLE_EMAIL>';
```

### Backfill

```sql
update public.training_sessions
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.raw_imports
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.training_exercises
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.body_checks
set user_id = '<OWNER_USER_ID>'
where user_id is null;

update public.nutrition_checks
set user_id = '<OWNER_USER_ID>'
where user_id is null;
```

### Verificacion antes de NOT NULL

```sql
select count(*) as missing_user_id
from public.training_sessions
where user_id is null;

select count(*) as missing_user_id
from public.raw_imports
where user_id is null;

select count(*) as missing_user_id
from public.training_exercises
where user_id is null;

select count(*) as missing_user_id
from public.body_checks
where user_id is null;

select count(*) as missing_user_id
from public.nutrition_checks
where user_id is null;
```

### Poner NOT NULL

```sql
alter table public.training_sessions
  alter column user_id set not null;

alter table public.raw_imports
  alter column user_id set not null;

alter table public.training_exercises
  alter column user_id set not null;

alter table public.body_checks
  alter column user_id set not null;

alter table public.nutrition_checks
  alter column user_id set not null;
```

### RLS policies

Ejemplo para `training_sessions`:

```sql
create policy "Users can read own training sessions"
on public.training_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert own training sessions"
on public.training_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own training sessions"
on public.training_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own training sessions"
on public.training_sessions
for delete
using (auth.uid() = user_id);
```

Repetir policies equivalentes para:

- `raw_imports`
- `training_exercises`
- `body_checks`
- `nutrition_checks`

## Test plan

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
- Duplicados se detectan por `user_id + session id`.
- `localStorage` pendiente solo se sincroniza con usuario autenticado.
- Scripts admin siguen funcionando con service role.
- `npm run lint`.
- `npm run build`.

## Verification

- No se modifica codigo.
- No se toca Supabase.
- No se ejecutan migraciones.
- No se implementa auth.
- El cambio esperado de este documento es crear o actualizar `docs/auth-multiuser-plan.md`.

## Assumptions

- No hace falta modificar `AGENTS.md`; no hay una regla estructural nueva que deba persistir.
- La documentacion usa ASCII, en linea con el estilo actual de los docs.
- Los conteos de Supabase se documentan como diagnostico observado, no como metrica viva.
