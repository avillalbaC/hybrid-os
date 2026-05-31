# Hybrid OS - Roadmap

Este roadmap refleja la direccion actual del proyecto. Mantiene el foco en datos reales, claridad de analisis y cambios pequenos y revisables.

## Principios

- Supabase es la fuente principal para datos reales.
- El seed historico es fallback/desarrollo.
- `localStorage` es cola temporal, no fuente primaria.
- El flujo importador no debe perder raw data ni payload completo.
- Las pantallas prioritarias deben compartir criterios de periodos: semana calendario de lunes a domingo, mes calendario, ano calendario y todo el historial.
- Evitar grandes features sin cerrar antes la capa de datos.

## v0.3 - Training Log + Training Detail

Objetivo: convertir el historial de entrenamiento en la experiencia principal de consulta.

Alcance:

- Unificar lectura de sesiones con Supabase como fuente primaria.
- Evitar mezcla de seed con datos reales cuando Supabase devuelve sesiones.
- Mejorar filtros, busqueda y estados del Training Log.
- Fortalecer `/training/[id]` para sesiones remotas.
- Mostrar bloques, ejercicios, resultados, RPE, duracion, running, tags, patrones y notas con jerarquia clara.
- Mantener export/import sin romper compatibilidad.

## v0.4 - Running Analytics

Objetivo: hacer que Running tenga analisis propio, no solo una lista filtrada.

Alcance:

- Metricas de distancia, duracion y tendencia por periodo.
- Separar sesiones puras de running y sesiones hibridas con componente running.
- Ranking o resumen de sesiones relevantes.
- Evolucion historica sin usar "last 7 days" como semana principal.
- Preparar datos para comparativas futuras.

## v0.5 - Muscle Load Analysis

Objetivo: profundizar el analisis muscular con datos reales y periodos consistentes.

Alcance:

- Consolidar resumen muscular por periodo.
- Mejorar ranking de musculos y patrones de movimiento.
- Distinguir carga reciente, acumulada y zonas con posible sobrecarga.
- Reutilizar helpers de metricas y periodos.
- Mantener BodyHeatmap como vista simple y util en esta fase.

Decision BodyHeatmap para esta version:

- No generar munecos por codigo.
- Priorizar analisis legible: ranking, barras, intensidad y contexto.
- Dejar el 3D para una fase asset-based posterior.

## v0.6 - Importador mejorado

Objetivo: hacer el importador mas robusto, diagnosticable y facil de corregir.

Alcance:

- Mensajes de error mas especificos por fase.
- Mejor preview de sesiones, body checks y nutrition checks.
- Mejor deteccion de duplicados en cliente sin depender de datos mezclados.
- Diagnostico seguro para fallos de escritura en Supabase.
- Mantener guardado de `raw_imports`, `training_sessions`, `training_exercises`, `body_checks` y `nutrition_checks`.

## v0.7 - Body/Nutrition desde Supabase

Objetivo: dejar de depender de mock/seed en Body y Nutrition.

Alcance:

- Leer `body_checks` desde Supabase.
- Leer `nutrition_checks` desde Supabase.
- Usar mock solo como fallback/desarrollo.
- Mostrar tendencias utiles sin convertir estas pantallas en prioridad mayor que training.
- Reutilizar datos ya guardados por el importador.

## v0.8 - Goals conectados

Objetivo: conectar objetivos con datos reales del historial.

Alcance:

- Sustituir mock de goals por una fuente persistente.
- Relacionar objetivos con entrenamiento, running, body o nutrition cuando aplique.
- Mostrar progreso calculado desde datos reales.
- Mantener el alcance simple antes de automatizaciones avanzadas.

## v1.0 - Body Heatmap simple

Objetivo: cerrar una primera version estable y util del mapa corporal sin 3D.

Alcance:

- Vista simple basada en resumen muscular real.
- Ranking de musculos y barras de intensidad.
- Estados vacios claros.
- Periodos consistentes con Dashboard y Muscle Load.
- Sin muneco generado por codigo.

## v1.1 - Body Heatmap 3D asset-based

Objetivo: introducir visualizacion corporal 3D solo cuando exista un asset adecuado.

Alcance:

- Usar un asset real `.glb` con anatomia fiable.
- Integrar con React Three Fiber.
- Mapear grupos musculares del modelo a `MuscleName`.
- Mantener fallback simple si el asset no carga.
- Respetar rendimiento y accesibilidad basica.

No alcance:

- Reintentar crear una anatomia completa con JSX, CSS, SVG improvisado o primitivas 3D generadas a mano.

## v1.2 - PWA basica

Objetivo: mejorar instalacion y uso privado basico.

Alcance:

- Manifest.
- Iconos.
- Configuracion minima de instalabilidad.
- Estrategia prudente de cache.
- Sin comprometer datos reales ni sincronizacion.

## v1.3 - Offline sync

Objetivo: formalizar la cola offline y sincronizacion.

Alcance:

- Convertir `localStorage` o una capa equivalente en cola explicita.
- Estados claros: pendiente, sincronizado, error.
- Reintentos seguros.
- Resolucion de duplicados por `trainingSession.id`.
- Evitar perdida de raw import y payload.

## Fuera de alcance inmediato

- Integraciones externas.
- IA interna de analisis.
- Cambios destructivos de Supabase.
- Reescritura completa de arquitectura.
- Nuevas dependencias de produccion sin justificacion clara.
