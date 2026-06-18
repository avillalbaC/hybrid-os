# Hybrid OS - Current State

Snapshot: 2026-06-18

Este documento describe el estado real del proyecto en este snapshot. No debe usarse para guardar metricas que cambian cada dia, salvo que se marquen explicitamente como snapshot.

## Estado general

Hybrid OS es una app privada de Next.js, TypeScript, Tailwind y Supabase para importar, consultar y analizar historial de entrenamiento hibrido.

La app ya esta desplegada y funcionando en produccion privada en:

https://hybrid.alvarovillalba.es

El portfolio publico sigue en https://alvarovillalba.es. Hybrid OS vive en un subdominio separado y no sustituye ni se mezcla con el portfolio.

El flujo principal sigue siendo:

`HybridOSAppInput JSON -> validacion -> preview -> Supabase -> Dashboard / Training Log / Muscle Load`

Google Auth privado ya funciona. La app usa autenticacion real con Supabase Auth, allow-list activa y acceso limitado al usuario autorizado. No se ha abierto multiusuario real.

Supabase es la fuente principal para datos reales. El seed historico queda solo como fallback/desarrollo y `localStorage` queda solo como cola temporal para sesiones pendientes de sincronizacion.

## Auth y acceso privado

Estado actual:

- Google Auth privado funciona.
- Allow-list activa.
- El acceso sigue siendo privado, no multiusuario abierto.
- La URL de produccion privada es https://hybrid.alvarovillalba.es.
- El portfolio publico sigue separado en https://alvarovillalba.es.
- Las rutas privadas de la app requieren sesion valida.
- Las APIs privadas estan protegidas y requieren usuario autenticado.
- `user_id` ya esta anadido a las tablas principales de datos.
- El backfill de datos existentes al usuario owner ya esta hecho.
- RLS esta activo.
- Las lecturas y escrituras normales deben operar siempre en el contexto del usuario autenticado.

Reglas que deben preservarse:

- No abrir varios usuarios reales todavia.
- No tocar primary keys todavia.
- No usar `SUPABASE_SERVICE_ROLE_KEY` en cliente.
- Mantener service role solo server-side y para tareas admin explicitas.
- Antes de abrir multiusuario real, resolver la separacion entre `db_id` interno y `session_id` logico por usuario.

## Supabase

Supabase es la fuente principal para datos reales.

Tablas principales:

- `training_sessions`: sesion completa, columnas analiticas, `payload` completo y `user_id`.
- `raw_imports`: JSON original importado y `user_id`.
- `training_exercises`: ejercicios normalizados por sesion y bloque, con `user_id`.
- `body_checks`: body checks opcionales importados, con `user_id` cuando existan.
- `nutrition_checks`: nutrition checks opcionales importados, con `user_id` cuando existan.
- `daily_entries`: plan diario manual por usuario y fecha, con prioridades, movilidad y nota rapida.
- `goal_blocks`: bloques de objetivo activo por usuario, con perfil, targets semanales, notas, RLS y estado.
- `planned_sessions`: sesiones previstas por usuario y fecha, relacionadas opcionalmente con `goal_blocks`, para plan semanal y planificado vs realizado.

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

Politica vigente:

- Cuando Supabase devuelve datos reales, las pantallas prioritarias deben usar esos datos.
- El seed no debe aparecer mezclado con datos reales.
- `localStorage` no debe tratarse como fuente equivalente; solo como pendientes.
- Las APIs y helpers deben filtrar por `user_id` o por el usuario autenticado.

## Rutas existentes

### UI

- `/`: Home ejecutiva corta para estado actual, Daily Plan, ultimo entrenamiento, analisis rapido, vigilancia y accesos.
- `/dashboard`: Centro de decision del periodo actual.
- `/analysis`: Analisis profundo con lectura actual, informes, tendencias y calidad de datos.
- `/training`: Training Log.
- `/training/[id]`: detalle de entrenamiento.
- `/training/weekly`: vista semanal.
- `/training/running`: vista de running.
- `/training/import`: importador JSON.
- `/muscle-load`: analisis de carga muscular.
- `/body`: pantalla Body, actualmente no es prioridad.
- `/nutrition`: pantalla Nutrition, actualmente no es prioridad.
- `/goals`: seguimiento del objetivo activo, progreso, senales a favor, senales en contra, datos insuficientes, contexto copiable para check diario y Plan semanal beta/opcional.

### API

- `GET /api/training-sessions`: lista sesiones propias desde Supabase.
- `PUT /api/training-sessions/:id`: guarda o actualiza una sesion propia.
- `DELETE /api/training-sessions/:id`: elimina una sesion propia.
- `POST /api/imports`: importa uno o varios `HybridOSAppInput` para el usuario autenticado.
- `GET /api/dashboard-data`: devuelve sesiones, body checks y nutrition checks del usuario autenticado para Dashboard.
- `GET /api/daily-entry?date=YYYY-MM-DD`: devuelve la entrada diaria propia o `null`.
- `PUT /api/daily-entry`: crea o actualiza la entrada diaria propia para una fecha.
- `GET /api/daily-entry/range?start=YYYY-MM-DD&end=YYYY-MM-DD`: devuelve entradas diarias propias para un rango.
- `POST /api/daily-entry/priorities/postpone`: marca una prioridad como pospuesta y crea la copia pendiente en la fecha destino.
- `GET /api/goals`: devuelve objetivos propios y objetivo activo.
- `POST /api/goals`: crea un bloque de objetivo propio y pausa otros activos si procede.
- `GET /api/goals/active`: devuelve el objetivo activo propio.
- `PUT /api/goals/active`: actualiza el objetivo activo propio o lo crea si no existe.
- `GET /api/planned-sessions`: devuelve sesiones planificadas propias por rango semanal o rango indicado.
- `POST /api/planned-sessions`: crea una sesion planificada propia.
- `PATCH /api/planned-sessions/:id`: edita una sesion planificada propia o cambia su estado.
- `DELETE /api/planned-sessions/:id`: borra una sesion planificada propia.
- `GET /api/planning/weekly-summary`: devuelve resumen planificado vs realizado de la semana.

Las rutas API privadas estan protegidas por Supabase Auth y deben respetar RLS.

## Flujo importador

Flujo actual:

1. El usuario autenticado abre `/training/import`.
2. Pega un `HybridOSAppInput` o un array de inputs.
3. `parseHybridOSJsonInput()` valida estructura, enums, metricas, bloques, ejercicios, body check opcional y nutrition check opcional.
4. La UI muestra preview antes de guardar.
5. En running puro, la UI permite completar `trainingSession.equipment.shoes` y subir el input a v1.1 de forma aditiva.
6. La UI detecta posibles duplicados usando las sesiones disponibles en cliente.
7. El dry-run valida contra servidor y duplicados sin escribir en Supabase.
8. Al guardar, llama a la API privada de imports.
9. `POST /api/imports` vuelve a validar en servidor.
10. El servidor opera en contexto del usuario autenticado.
11. El servidor evita duplicados por usuario y session id.
12. Si no hay duplicado, guarda con `user_id`:
    - `raw_imports`
    - `training_sessions`
    - `training_exercises`
    - `body_checks`, si existe
    - `nutrition_checks`, si existe
11. El cliente notifica actualizacion remota para refrescar vistas dependientes.

Reglas que deben preservarse:

- Guardar siempre el raw import.
- Guardar siempre el `payload` completo de la sesion.
- Guardar `user_id` en todas las tablas afectadas por imports.
- No reemplazar ids reales si representan la misma sesion del mismo usuario.
- No reducir el modelo a campos simples.
- Mantener metricas historicas necesarias para comparativas: distancia, duracion, RPE, resumen muscular, patrones de movimiento, ejercicios y raw import.

## Que esta hecho

- App base con Next.js, TypeScript y Tailwind.
- Despliegue privado de produccion funcionando en https://hybrid.alvarovillalba.es.
- Navegacion principal y rutas prioritarias de entrenamiento.
- Google Auth privado con Supabase.
- Allow-list activa.
- Acceso privado protegido.
- `user_id` anadido a las tablas principales.
- Backfill de datos existentes al owner.
- RLS activo.
- APIs privadas protegidas.
- Modelo `HybridOSAppInput` y `TrainingSession`.
- `HybridOSAppInput` acepta v1.0 y v1.1; v1.1 esta limitado hoy a `trainingSession.equipment.shoes`.
- Validacion cliente y servidor del importador.
- Preview del importador.
- Dry-run del importador sin escritura.
- Importador funcional con `user_id`.
- Persistencia en Supabase de sesiones, raw imports, ejercicios, body checks y nutrition checks.
- Endpoint dedicado para Dashboard.
- Dashboard con periodos calendarizados y metricas agregadas.
- Dashboard decision refactor: KPIs principales, lectura del periodo, riesgos, contexto para decision, tendencias clave y preview de informes.
- Ruta `/analysis` para informes semanales/mensuales, tendencias completas, evidencias y calidad de datos.
- Post-refactor polish: tabs mobile de Analysis sin scrollbar nativa, copy de decision mas claro y mejoras priorizadas de calidad de datos.
- Capa Visual Analytics: componentes reutilizables en `components/charts`, datasets en `lib/analytics/chart-data.ts` y graficos ligeros en Dashboard, Analysis, Running, Muscle Load y Home.
- Running muestra volumen por zapatilla cuando existe `equipment.shoes`.
- Daily Plan en Home: `daily_entries` con RLS, API privada, tres prioridades activas, acciones de completar/descartar/posponer, movilidad, foco y nota rapida.
- Objetivos activos MVP: `goal_blocks` con RLS, perfiles predefinidos, API privada, `/goals`, evaluacion semanal y resumen goal-aware en Home, Dashboard y Analysis.
- Goals seguimiento: `/goals` ya no actua como planificador principal; prepara progreso, evidencia y contexto objetivo para el check diario con ChatGPT.
- Plan semanal / Programaciones MVP: `planned_sessions` con RLS, CRUD privado, comparacion planificado vs realizado y resumen en Home, Dashboard y Analysis.
- Training Log, detalle, weekly, running y muscle load funcionales sobre la capa actual de sesiones.
- BodyHeatmap actual simplificado: ranking, barras y placeholder visual en vez de muneco generado por codigo.

## Reparto de responsabilidades UI

- Home: centro de mando diario rapido. Debe responder que esta pasando ahora, cual es el plan de hoy, cual fue el ultimo entrenamiento, que senales vigilar y a donde ir.
- Dashboard: panel de estado del periodo actual. Debe priorizar KPIs, lectura ejecutiva, riesgos principales, contexto para decision, tendencias clave y previews.
- Analysis: vista profunda. Contiene analisis completo, informes semanales y mensuales, tendencias completas agrupadas, calidad de datos y contexto para check diario.
- Objetivos: seguimiento del objetivo activo. Muestra progreso, senales a favor, senales en contra, datos insuficientes y contexto copiable. El Plan semanal queda como beta/opcional.
- Running: analisis especifico de carrera. No debe repetir lectura global salvo enlace a Analysis.
- Muscle Load: analisis especifico de carga muscular. No debe repetir informes ni lectura global salvo enlace a Analysis.

## Visual Analytics

Estado: primera capa implementada y pulida para decision.

- No se ha anadido libreria de charts. Los graficos usan componentes propios con CSS/SVG ligero.
- `lib/analytics/chart-data.ts` normaliza datos semanales, mensuales, distribucion por disciplina, exposicion de carrera, ranking muscular y calidad de datos.
- `components/charts/*` contiene tarjetas, barras semanales, barras apiladas de carrera, rankings horizontales, sparklines y barras de calidad.
- Dashboard incorpora `Evolucion clave` con carrera estructurada/mixta, duracion, fatiga y peso movido.
- Analysis incorpora graficos en Actual, Semanas, Meses, Tendencias y Calidad de datos.
- Running incorpora carrera por semana, running estructurado, ritmo medio y zapatillas.
- Muscle Load refuerza top musculos, ratios y sesiones clave sin implementar mapa corporal.
- Home mantiene solo mini sparklines en KPIs del hero para no convertirse en dashboard.
- `ChartCard` soporta valor actual, referencia compacta, estado, empty state y modo compacto.
- Las cards visuales importantes muestran unidad, valor actual, media/cambio cuando existe y un insight corto.
- Calidad de datos muestra mejoras priorizadas e impacto de cada falta relevante.

Regla de producto:

- Los insights explican los graficos; no sustituyen a los graficos.
- Los graficos deben estar preparados para recibir objetivos activos en una fase posterior, sin implementarlos todavia.

## Pendiente

- Crear ruta dedicada `/daily` para revisar y editar entradas diarias fuera de Home.
- Conectar check diario/body check cuando el alcance de Body/Nutrition vuelva a ser prioritario.
- Implementar parser de check pegado para daily/body cuando se cierre el formato.
- Preparar futura importacion desde Google Drive sin activarla todavia.
- Crear revision semanal basada en `daily_entries` cuando haya uso real suficiente.
- Mejorar feedback limpio del importador donde el uso real siga mostrando friccion.
- Anadir loading states globales y consistentes en pantallas prioritarias.
- Ampliar `HybridOSAppInput` v1.1 solo si hay uso real de nuevos campos.
- Preparar mayor detalle por zapatilla cuando haya datos suficientes.
- QA/calibracion final de la nueva separacion Home / Dashboard / Analysis con uso real.
- Hacer auditoria responsive/mobile actual de pantallas prioritarias.
- Conectar `/body` y `/nutrition` a Supabase como siguiente bloque no prioritario de training.
- Importador de programaciones desde texto hacia `planned_sessions`, con preview antes de guardar.
- Decidir e integrar un asset GLB real para BodyHeatmap 3D en una fase futura.
- Anadir PWA basica mas adelante, despues de estabilizar la experiencia privada y mobile.
- Anadir pruebas automaticas para el flujo critico de importacion, fuente de datos, auth/RLS y fallback.

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
