# Hybrid OS - Roadmap

Este roadmap refleja la direccion actual del proyecto. Mantiene el foco en datos reales, claridad de analisis y cambios pequenos y revisables.

## Principios

- Supabase es la fuente principal para datos reales.
- Google Auth privado, `user_id`, backfill y RLS ya estan activos.
- La app sigue cerrada a uso privado; no abrir multiusuario real todavia.
- El seed historico es fallback/desarrollo.
- `localStorage` es cola temporal, no fuente primaria.
- El flujo importador no debe perder raw data ni payload completo.
- Las pantallas prioritarias deben compartir criterios de periodos: semana calendario de lunes a domingo, mes calendario, ano calendario y todo el historial.
- Evitar grandes features sin cerrar antes la experiencia de datos reales.
- No tocar primary keys hasta resolver `db_id` interno y `session_id` logico por usuario.

## Estado ya completado

- Supabase como fuente principal de datos reales.
- Google Auth privado.
- `user_id` anadido a las tablas principales.
- Backfill de datos existentes al owner.
- RLS activo.
- APIs privadas protegidas.
- Importador funcionando con `user_id`.

## v0.6.3 - Importador feedback limpio

Objetivo: hacer que el importador sea mas claro cuando valida, detecta duplicados, guarda o falla.

Alcance:

- Mensajes de error mas especificos por fase.
- Warnings no bloqueantes separados de errores reales.
- Mejor preview de sesiones, body checks y nutrition checks.
- Estados claros de guardado, exito, duplicado y fallo.
- Diagnostico seguro para fallos de escritura en Supabase.
- Mantener guardado de `raw_imports`, `training_sessions`, `training_exercises`, `body_checks` y `nutrition_checks` con `user_id`.

## v0.6.4 - Loading states globales

Objetivo: mejorar la percepcion de estabilidad y respuesta en las pantallas privadas.

Alcance:

- Loading states consistentes en Home, Dashboard, Training, Training Detail, Weekly, Running, Muscle Load e Import.
- Estados vacios claros cuando no hay datos.
- Estados de error comprensibles y accionables.
- Evitar parpadeos entre seed/fallback y datos reales.
- Respetar accesibilidad basica y `prefers-reduced-motion` si se anaden transiciones.

## v0.7.0 - HybridOSAppInput v1.1 minimo

Objetivo: introducir v1.1 de forma aditiva y sin romper inputs v1.0.

Alcance:

- Aceptar `appInputVersion` `"1.0"` y `"1.1"`.
- Anadir campos opcionales de contexto: superficie, desnivel, zapatillas, frecuencia cardiaca y sintomas estructurados.
- Usar `shoes` solo para sesiones `type === "running"`.
- Tratar ausencia de `shoes` como warning no bloqueante en running, nunca como `pendingFields`.
- Preservar campos nuevos en `payload` y `raw_imports`.
- No crear columnas nuevas hasta validar uso real.

## v0.7.1 - Volumen por zapatilla

Objetivo: empezar a usar el campo de zapatillas para seguimiento practico de running.

Alcance:

- Calcular volumen por zapatilla desde sesiones running.
- Usar distancia y fecha existentes en sesiones reales.
- Mostrar resumen simple y util.
- Mantener fallback si una sesion running no tiene zapatilla informada.
- Evaluar si hace falta columna analitica o si basta con `payload`.

## v0.8 - Body/Nutrition Supabase

Objetivo: dejar de depender de mock/seed en Body y Nutrition.

Alcance:

- Leer `body_checks` desde Supabase.
- Leer `nutrition_checks` desde Supabase.
- Usar mock solo como fallback/desarrollo.
- Mostrar tendencias utiles sin convertir estas pantallas en prioridad mayor que training.
- Reutilizar datos ya guardados por el importador.

## v0.9 - Goals

Objetivo: conectar objetivos con datos reales del historial.

Alcance:

- Sustituir mock de goals por una fuente persistente.
- Relacionar objetivos con entrenamiento, running, body o nutrition cuando aplique.
- Mostrar progreso calculado desde datos reales.
- Mantener el alcance simple antes de automatizaciones avanzadas.

## v1.0 - App privada estable

Objetivo: cerrar una primera version privada estable para uso real.

Alcance:

- Experiencia privada consistente con Google Auth.
- Datos reales servidos desde Supabase y protegidos por usuario.
- Importador fiable para el flujo principal.
- Pantallas prioritarias con loading, empty y error states claros.
- Periodos consistentes en Dashboard, Training, Running y Muscle Load.
- Sin multiusuario abierto.
- Sin cambios destructivos de Supabase.

## Fases posteriores

### Body Heatmap 3D asset-based

Objetivo: introducir visualizacion corporal 3D solo cuando exista un asset adecuado.

Alcance:

- Usar un asset real `.glb` con anatomia fiable.
- Integrar con React Three Fiber.
- Mapear grupos musculares del modelo a `MuscleName`.
- Mantener fallback simple si el asset no carga.
- Respetar rendimiento y accesibilidad basica.

No alcance:

- Reintentar crear una anatomia completa con JSX, CSS, SVG improvisado o primitivas 3D generadas a mano.

### PWA basica y offline sync

Objetivo: mejorar instalacion y sincronizacion cuando la app privada ya sea estable.

Alcance:

- Manifest e iconos.
- Estrategia prudente de cache.
- Cola offline explicita.
- Estados claros: pendiente, sincronizado, error.
- Reintentos seguros.
- Resolucion de duplicados por usuario y session id.

## Fuera de alcance inmediato

- Multiusuario real abierto.
- Integraciones externas.
- IA interna de analisis.
- Cambios destructivos de Supabase.
- Reescritura completa de arquitectura.
- Nuevas dependencias de produccion sin justificacion clara.
