# Hybrid OS Current State

Fecha de auditoria: 2026-05-27

## Estado general

Hybrid OS ya tiene una base funcional para el flujo de entrenamiento real:

- El importador acepta `HybridOSAppInput` JSON, valida el contrato, muestra preview y guarda en Supabase.
- Supabase ya se usa desde servidor con service role, no desde el cliente con anon key.
- El Dashboard tiene una ruta de datos propia que lee Supabase como fuente principal.
- El seed historico sigue en el repo y todavia se usa en varias pantallas como base o fallback.
- `localStorage` sigue existiendo como respaldo temporal para entrenamientos pendientes cuando falla Supabase.

La app no esta todavia unificada alrededor de una sola fuente de datos. Hay dos estrategias activas:

- `useDashboardData`: Supabase primero, seed solo si Supabase falla o no devuelve datos.
- `useTrainingSessions`: mezcla seed + remoto + localStorage y deduplica por `id`.

## Rutas

### UI

- `/`: Home ejecutiva. Usa `HomeView`.
- `/dashboard`: Dashboard analitico. Usa `DashboardView`.
- `/training`: Training Log. Usa `TrainingLogView`.
- `/training/import`: Importador JSON. Usa `JsonImportForm`.
- `/training/[id]`: Detalle de entrenamiento. Usa `TrainingDetailView`.
- `/training/weekly`: Vista semanal de entrenamiento. Usa `WeeklyTrainingView`.
- `/training/running`: Vista de running. Usa `RunningTrainingView`.
- `/muscle-load`: Analisis de carga muscular. Usa `MuscleLoadView`.
- `/body`: Body Check. Actualmente mock/seed.
- `/nutrition`: Nutricion. Actualmente mock/seed.
- `/goals`: Objetivos. Actualmente mock/seed.

### API

- `GET /api/training-sessions`
  - Devuelve entrenamientos desde Supabase.
  - Requiere cookie de login privado.

- `PUT /api/training-sessions/:id`
  - Valida una `TrainingSession`.
  - Guarda o actualiza una sesion en Supabase.
  - Requiere que el `id` de ruta coincida con el `id` del body.

- `DELETE /api/training-sessions/:id`
  - Elimina una sesion de Supabase.

- `POST /api/imports`
  - Recibe uno o varios `HybridOSAppInput`.
  - Valida contrato.
  - Evita duplicados por `trainingSession.id`.
  - Guarda raw import, training session, ejercicios, body check y nutrition check si existen.

- `GET /api/dashboard-data`
  - Devuelve datos agregados para Dashboard:
    - `sessions`
    - `bodyChecks`
    - `nutritionChecks`

## Supabase

### Configuracion

El cliente Supabase vive en `lib/supabase/server.ts`.

Variables requeridas:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

La app usa service role solo server-side. Las rutas API comprueban la cookie privada antes de leer o escribir.

### Tablas actuales

Definidas en `supabase/training_sessions.sql`.

#### `training_sessions`

Guarda una sesion completa y columnas analiticas principales.

Columnas principales:

- `id text primary key`
- `session_date date`
- `title text`
- `type text`
- `source text`
- `data_quality text`
- `running_distance_meters integer`
- `duration_minutes integer`
- `rpe numeric`
- `session_muscle_summary jsonb`
- `payload jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Uso actual:

- `payload` mantiene el contrato completo `TrainingSession`.
- Las columnas analiticas se rellenan desde `TrainingSession` al guardar.
- Al leer, `listRemoteTrainingSessions()` reconstruye `TrainingSession` usando `payload` y sobreescribe:
  - `durationMinutes` desde `duration_minutes`;
  - `rpe` desde `rpe`;
  - `sessionMetrics.totalRunMeters` desde `running_distance_meters`;
  - `sessionMuscleSummary` desde `session_muscle_summary`.

#### `raw_imports`

Guarda el JSON original de cada importacion.

Columnas principales:

- `id uuid primary key`
- `training_session_id text`
- `import_type text`
- `raw_payload jsonb`
- `created_at timestamptz`

#### `training_exercises`

Guarda un registro por ejercicio importado.

Columnas principales:

- `id text primary key`
- `training_session_id text`
- `block_id text`
- `block_name text`
- `exercise_index integer`
- `name text`
- `canonical_name text`
- `movement_pattern text`
- `payload jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `body_checks`

Guarda body checks opcionales incluidos en `appInput`.

Columnas principales:

- `id text primary key`
- `check_date date`
- `weight_kg numeric`
- `waist_cm numeric`
- `payload jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `nutrition_checks`

Guarda nutrition checks opcionales incluidos en `appInput`.

Columnas principales:

- `id text primary key`
- `check_date date`
- `day_type text`
- `adherence_percent numeric`
- `payload jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

## Seed y localStorage

### Seed historico

El seed principal de entrenamientos entra desde `src/data/training-source.ts`.

Tambien hay mock data en `lib/mock-data`:

- `bodyChecks`
- `nutritionChecks`
- `goals`
- training mock legacy

### Pantallas con Supabase principal

- `/dashboard`
  - Usa `useDashboardData`.
  - Lee `/api/dashboard-data`.
  - Si Supabase devuelve algun dato, usa datos remotos.
  - Si Supabase falla o devuelve todo vacio, usa seed/mock fallback.

### Pantallas que todavia mezclan seed + remoto + localStorage

Estas pantallas usan `useTrainingSessions`:

- `/`
- `/training`
- `/training/[id]`
- `/training/weekly`
- `/training/running`
- `/muscle-load`
- `/training/import` para detectar duplicados en UI

Comportamiento de `useTrainingSessions`:

- Lee remoto desde `/api/training-sessions`.
- Lee sesiones locales desde `localStorage`.
- Migra sesiones locales a Supabase si puede.
- Mezcla `seedSessions` + remoto/local con prioridad por `id`.
- Mantiene `deletedIds` en `localStorage` para ocultar sesiones borradas.

Esto significa que Training Log, Home y Muscle Load pueden mostrar seed mezclado aunque Supabase ya tenga datos reales.

### Pantallas solo mock/seed

- `/body`
  - Usa `lib/mock-data/body`.
  - No lee `body_checks` de Supabase.

- `/nutrition`
  - Usa `lib/mock-data/nutrition`.
  - No lee `nutrition_checks` de Supabase.

- `/goals`
  - Usa `lib/mock-data/goals`.
  - No tiene tabla Supabase.

## Modelo de datos TypeScript

### `HybridOSAppInput`

Definido en `types/training.ts`.

Campos:

- `appInputVersion: "1.0"`
- `generatedBy: "gpt"`
- `generatedAt: string`
- `trainingSession: TrainingSession`
- `bodyCheck?: BodyCheck`
- `nutritionCheck?: NutritionCheck`

### `TrainingSession`

Campos principales:

- identidad y fecha:
  - `id`
  - `date`
  - `reportedAt`
  - `dateConfidence`
  - `dateRule`
- descripcion:
  - `source`
  - `status`
  - `title`
  - `type`
  - `subtypes`
  - `location`
  - `objective`
  - `rawText`
- carga:
  - `durationMinutes`
  - `rpe`
  - `sessionMetrics`
  - `sessionMuscleSummary`
- estructura:
  - `blocks`
  - `result`
- notas/calidad:
  - `tags`
  - `soreness`
  - `injuryNotes`
  - `feeling`
  - `notes`
  - `pendingFields`
  - `dataQuality`
  - `importNotes`

### `TrainingBlock`

Campos principales:

- `id`
- `name`
- `format`
- `roundsPlanned`
- `roundsCompleted`
- `timeCapMinutes`
- `restSeconds`
- `exercises`
- `blockResult`
- `notes`

### `TrainingExercise`

Campos principales:

- `name`
- `canonicalName`
- `sets`
- `reps`
- `distanceMeters`
- `durationSeconds`
- `calories`
- `loadKg`
- `movementPattern`
- `intensity`
- `muscleLoad`
- `notes`

### `BodyCheck`

Campos principales:

- `id`
- `date`
- `weightKg`
- `waistCm`
- `steps`
- `sleepHours`
- `energy`
- `hunger`
- `notes`
- `pendingFields`

### `NutritionCheck`

Campos principales:

- `id`
- `date`
- `targetCalories`
- `estimatedCalories`
- `targetProteinGrams`
- `estimatedProteinGrams`
- `waterLiters`
- `adherencePercent`
- `digestion`
- `dayType`
- `notes`
- `pendingFields`

## Flujo appInput JSON -> Supabase -> Dashboard

### Flujo actual

1. El usuario abre `/training/import`.
2. Pega un `HybridOSAppInput` o array de inputs.
3. `parseHybridOSJsonInput()` parsea JSON y valida:
   - estructura raiz;
   - `trainingSession`;
   - enums permitidos;
   - metricas;
   - bloques;
   - ejercicios;
   - body check opcional;
   - nutrition check opcional.
4. La UI muestra preview:
   - titulo;
   - fecha;
   - tipo;
   - duracion;
   - RPE;
   - numero de bloques;
   - top muscles;
   - inclusion de body/nutrition.
5. La UI detecta duplicados con `useTrainingSessions`.
6. Al guardar, llama a `saveRemoteAppInputs()`.
7. `POST /api/imports` vuelve a validar en servidor.
8. El servidor comprueba duplicados por `trainingSession.id`.
9. Si hay duplicado, devuelve `409`.
10. Si no hay duplicado, guarda:
    - `raw_imports`;
    - `training_sessions`;
    - `training_exercises`;
    - `body_checks` si existe;
    - `nutrition_checks` si existe.
11. El cliente dispara `hybrid-os:remote-training-sessions-updated`.
12. `/dashboard`, si esta montado, recarga `/api/dashboard-data`.
13. Dashboard calcula metricas desde datos remotos:
    - sesiones;
    - km running;
    - duracion;
    - RPE medio;
    - peso/cintura;
    - adherencia nutricional;
    - ranking muscular;
    - alertas.

### Que ya funciona

- Validacion cliente y servidor.
- Preview antes de guardar.
- Guardado de JSON original.
- Guardado de sesion completa en `payload`.
- Guardado de columnas analiticas de `training_sessions`.
- Guardado de ejercicios.
- Guardado opcional de body/nutrition.
- Proteccion server-side contra duplicados.
- Dashboard lee Supabase por endpoint dedicado.
- Dashboard cae a seed/mock si Supabase falla o esta vacio.

### Huecos actuales

- El SQL actualizado debe estar ejecutado en Supabase para que existan las columnas:
  - `running_distance_meters`
  - `duration_minutes`
  - `rpe`
  - `session_muscle_summary`
- Home, Training Log, detalle, weekly, running y muscle load no usan la misma estrategia del Dashboard.
- Training Log puede seguir mostrando seed mezclado con datos reales.
- `/training/[id]` genera params estaticos desde seed; el detalle depende del cliente para encontrar sesiones remotas.
- `/body` y `/nutrition` no leen Supabase, aunque el importador ya guarda esos datos.
- El importador detecta duplicados en UI usando datos mezclados, no solo Supabase; la proteccion real esta en servidor.
- Los errores de `POST /api/imports` devuelven un mensaje generico si falla una escritura intermedia.
- No hay pantalla para inspeccionar `raw_imports` ni diagnosticar importaciones fallidas.
- No hay tests automatizados para el flujo de importacion ni para el fallback de Dashboard.

## Proximos pasos recomendados

1. Unificar fuente de datos de entrenamiento.
   - Reutilizar la estrategia de `useDashboardData` o crear una capa comun.
   - Objetivo: Supabase primero, seed solo fallback, localStorage solo pendiente/sincronizacion.

2. Migrar Home, Training Log, detalle, weekly, running y muscle load.
   - Evitar mezcla seed + Supabase cuando ya hay datos reales.
   - Mantener mensajes claros de fallback y pendientes locales.

3. Conectar Body y Nutrition a Supabase.
   - Crear hooks o endpoint reutilizable para `body_checks` y `nutrition_checks`.
   - Usar mock solo como fallback.

4. Mejorar trazabilidad de importacion.
   - Errores especificos por fase:
     - raw import;
     - training session;
     - exercises;
     - body check;
     - nutrition check.
   - Devolver detalles seguros al cliente.

5. Anadir pruebas del flujo critico.
   - JSON valido se guarda.
   - Duplicado devuelve `409`.
   - Dashboard usa Supabase y no seed cuando hay registros.
   - Fallback a seed si Supabase falla.
   - Body/nutrition importados aparecen en Dashboard.

