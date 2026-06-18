# Hybrid OS - Roadmap

Actualizado: 2026-06-18

Este roadmap mantiene el foco en datos reales, claridad de analisis y cambios pequenos. Hybrid OS ya funciona como app privada en produccion, con Supabase como fuente principal, Google Auth privado, allow-list, `user_id`, backfill y RLS activos.

## Principios

- La app sigue cerrada a uso privado; no es multiusuario abierto.
- Supabase es la fuente principal para datos reales.
- El seed historico es fallback/desarrollo y no debe mezclarse con Supabase cuando hay datos reales.
- `localStorage` es una cola temporal, no una fuente equivalente.
- El importador debe preservar `raw_imports`, `payload`, ejercicios y metricas historicas.
- Los periodos son calendario: semana lunes-domingo, mes calendario, ano calendario y todo el historial.
- No tocar primary keys hasta resolver `db_id` interno y `session_id` logico por usuario.
- No abrir grandes features si no mejoran el registro real o el contexto para el check diario.

## Estado completado

- Despliegue privado en `https://hybrid.alvarovillalba.es`.
- Google Auth privado con allow-list.
- `user_id`, backfill y RLS en tablas principales.
- APIs privadas protegidas.
- Importador con validacion cliente/servidor, preview, dry-run, duplicados por usuario y preservacion de raw data.
- `HybridOSAppInput` v1.1 parcial: acepta `1.0` y `1.1`; `trainingSession.equipment.shoes` se usa para running.
- Volumen por zapatilla en Running.
- Home como centro diario rapido.
- Dashboard como centro de decision del periodo.
- `/analysis` como vista profunda de informes, tendencias y calidad de datos.
- Visual Analytics ligera sin libreria externa de charts.
- Daily Plan en Home con `daily_entries`, prioridades, movilidad, posponer y revision de pendientes de ayer.
- Objetivos activos MVP con `goal_blocks`, perfiles, evaluacion semanal y contexto copiable.
- Plan semanal beta con `planned_sessions`, CRUD privado y comparacion planificado vs realizado.
- Training Log, detalle, weekly, running y muscle load sobre la capa actual de sesiones.

## Prioridad actual

1. Usar Goals, Dashboard y Analysis como contexto copiable para el check diario.
2. Calibrar senales a favor, senales en contra y datos insuficientes con uso real.
3. QA de Goals, Daily Plan y Plan semanal con uso real durante varios dias.
4. Crear `/daily` para historico y edicion semanal de entradas diarias.
5. Mejorar loading, empty y error states en pantallas prioritarias.
6. Auditar responsive/mobile de Home, Dashboard, Analysis, Training, Running, Muscle Load e Import.
7. Mejorar feedback del importador donde siga habiendo friccion real.
8. Ampliar `HybridOSAppInput` v1.1 solo si hay uso real de campos nuevos.

## Backlog cercano

- Check diario/body check cuando Body/Nutrition vuelvan a ser prioridad.
- Parser de check pegado con preview antes de guardar.
- Revision semanal basada en `daily_entries`.
- Mayor detalle por zapatilla si hay datos suficientes.
- Importador de programaciones desde texto hacia `planned_sessions`, con preview.

## Futuro congelado

- Multiusuario real abierto.
- Google Drive.
- Body/Nutrition con Supabase como bloque principal.
- Plantillas semanales avanzadas.
- Calendario complejo, drag and drop o notificaciones.
- IA interna/runtime dentro de la app.
- PWA/offline avanzada.
- BodyHeatmap 3D.

## Condiciones para retomar multiusuario real

Antes de abrir varios usuarios reales:

- Anadir `db_id uuid` como identificador interno.
- Mantener `session_id` como id logico externo por usuario.
- Crear `unique(user_id, session_id)`.
- Ajustar relaciones internas para evitar colisiones entre usuarios.
- Mantener compatibilidad con `trainingSession.id` en payload/raw import.

## Condiciones para BodyHeatmap

No reconstruir anatomia con CSS, SVG improvisado o primitivas 3D generadas a mano.

El mapa corporal solo debe retomarse con:

- asset `.glb` real y mantenible;
- mapeo claro a `MuscleName`;
- fallback simple si no carga;
- rendimiento aceptable en mobile.
