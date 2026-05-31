# Hybrid OS - Current State

Snapshot: 2026-05-28

Este documento describe el estado real del proyecto en este snapshot. No debe usarse para guardar metricas que cambian cada dia, salvo que se marquen explicitamente como snapshot.

## Estado general

Hybrid OS es una app privada de Next.js, TypeScript, Tailwind y Supabase para importar, consultar y analizar historial de entrenamiento hibrido.

El flujo principal ya existe:

`HybridOSAppInput JSON -> validacion -> preview -> Supabase -> Dashboard / Training Log / Muscle Load`

La app ya guarda entrenamientos reales en Supabase, pero la capa de lectura no esta totalmente unificada. El Dashboard usa Supabase como fuente principal de forma mas clara que otras pantallas. Varias rutas de entrenamiento todavia pasan por una mezcla de seed historico, datos remotos y cola local.

## Supabase

Supabase es la fuente principal para datos reales.

El cliente server-side esta en `lib/supabase/server.ts` y usa:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

La service role key debe seguir solo en servidor. No debe exponerse en componentes, hooks cliente ni archivos publicos.

El esquema documentado esta en `supabase/training_sessions.sql`.

Tablas principales:

- `training_sessions`: sesion completa, columnas analiticas y `payload` completo.
- `raw_imports`: JSON original importado.
- `training_exercises`: ejercicios normalizados por sesion y bloque.
- `body_checks`: body checks opcionales importados.
- `nutrition_checks`: nutrition checks opcionales importados.

Columnas analiticas relevantes en `training_sessions`:

- `running_distance_meters`
- `duration_minutes`
- `rpe`
- `session_muscle_summary`
- `status`
- `movement_patterns`
- `tags`

La tabla mantiene `payload` como fuente completa de la sesion. Las columnas analiticas existen para consultas, filtros y agregaciones.

## Fuente de datos

Estado actual por capa:

- Supabase: fuente primaria para datos reales.
- Seed historico: fallback/desarrollo, no debe mezclarse con Supabase cuando Supabase ya devuelve sesiones reales.
- `localStorage`: cola temporal para sesiones pendientes de sincronizacion o respaldo si falla Supabase.

Lecturas actuales:

- `useDashboardData`: lee `/api/dashboard-data`; usa Supabase primero y fallback solo si falla o no hay datos.
- `useTrainingSessions`: lee `/api/training-sessions`, lee `localStorage`, intenta migrar pendientes y mezcla con seed por `id`.

Pendiente importante:

- Unificar Home, Training Log, Training Detail, Weekly, Running y Muscle Load con la misma politica que Dashboard: Supabase primero, seed solo fallback y `localStorage` solo como cola pendiente.

## Rutas existentes

### UI

- `/`: Home ejecutiva con resumen y carga muscular.
- `/dashboard`: Dashboard por periodos.
- `/training`: Training Log.
- `/training/[id]`: detalle de entrenamiento.
- `/training/weekly`: vista semanal.
- `/training/running`: vista de running.
- `/training/import`: importador JSON.
- `/muscle-load`: analisis de carga muscular.
- `/body`: pantalla Body, actualmente basada en mock/seed.
- `/nutrition`: pantalla Nutrition, actualmente basada en mock/seed.
- `/goals`: pantalla Goals, actualmente basada en mock/seed.

### API

- `GET /api/training-sessions`: lista sesiones desde Supabase.
- `PUT /api/training-sessions/:id`: guarda o actualiza una sesion.
- `DELETE /api/training-sessions/:id`: elimina una sesion.
- `POST /api/imports`: importa uno o varios `HybridOSAppInput`.
- `GET /api/dashboard-data`: devuelve sesiones, body checks y nutrition checks para Dashboard.

Las rutas API estan protegidas por el login privado local actual.

## Flujo importador

Flujo actual:

1. El usuario abre `/training/import`.
2. Pega un `HybridOSAppInput` o un array de inputs.
3. `parseHybridOSJsonInput()` valida estructura, enums, metricas, bloques, ejercicios, body check opcional y nutrition check opcional.
4. La UI muestra preview antes de guardar.
5. La UI detecta posibles duplicados usando las sesiones disponibles en cliente.
6. Al guardar, llama a `saveRemoteAppInputs()`.
7. `POST /api/imports` vuelve a validar en servidor.
8. El servidor evita duplicados por `trainingSession.id`.
9. Si no hay duplicado, guarda:
   - `raw_imports`
   - `training_sessions`
   - `training_exercises`
   - `body_checks`, si existe
   - `nutrition_checks`, si existe
10. El cliente notifica actualizacion remota para refrescar vistas dependientes.

Reglas que deben preservarse:

- Guardar siempre el raw import.
- Guardar siempre el `payload` completo de la sesion.
- No reemplazar ids reales si representan la misma sesion.
- No reducir el modelo a campos simples.
- Mantener metricas historicas necesarias para comparativas: distancia, duracion, RPE, resumen muscular, patrones de movimiento, ejercicios y raw import.

## Que esta hecho

- App base con Next.js, TypeScript y Tailwind.
- Navegacion principal y rutas prioritarias de entrenamiento.
- Login privado local para desarrollo.
- Modelo `HybridOSAppInput` y `TrainingSession`.
- Validacion cliente y servidor del importador.
- Preview del importador.
- Persistencia en Supabase de sesiones, raw imports, ejercicios, body checks y nutrition checks.
- Endpoint dedicado para Dashboard.
- Dashboard con periodos calendarizados y metricas agregadas.
- Training Log, detalle, weekly, running y muscle load funcionales sobre la capa actual de sesiones.
- BodyHeatmap actual simplificado: ranking, barras y placeholder visual en vez de muneco generado por codigo.

## Pendiente

- Unificar la capa de datos de entrenamiento para que Supabase sea la fuente primaria en todas las pantallas prioritarias.
- Evitar que seed historico se mezcle con datos reales cuando Supabase ya devuelve sesiones.
- Convertir `localStorage` en cola temporal clara, no en fuente equivalente.
- Mejorar Training Log y Training Detail como experiencia principal de consulta.
- Profundizar Running Analytics.
- Profundizar Muscle Load Analysis sobre datos reales y periodos consistentes.
- Mejorar diagnostico y trazabilidad de errores del importador.
- Conectar `/body` y `/nutrition` a Supabase.
- Conectar `/goals` a datos reales.
- Decidir e integrar un asset GLB real para BodyHeatmap 3D en una fase futura.
- Anadir pruebas automaticas para el flujo critico de importacion, fuente de datos y fallback.

## Decision BodyHeatmap

Decision actual:

- No seguir intentando generar munecos anatomicos por codigo.
- No invertir mas tiempo en figuras 2D/3D improvisadas que no aporten precision.
- Mantener ahora un analisis simple y util: ranking muscular, barras de carga, intensidad y periodos.
- Futuro: usar un asset real `.glb` con anatomia adecuada, integrado con React Three Fiber.

Motivo:

- La utilidad actual esta en el analisis de carga, no en una silueta generada.
- Un heatmap corporal serio necesita un asset controlado, mantenible y visualmente fiable.
- El enfoque asset-based reduce deuda visual y evita reconstruir anatomia en componentes.
