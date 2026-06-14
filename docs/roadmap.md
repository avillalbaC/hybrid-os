# Hybrid OS - Roadmap

Este roadmap refleja la direccion actual del proyecto. Mantiene el foco en datos reales, claridad de analisis y cambios pequenos y revisables.

## Principios

- Hybrid OS ya esta desplegado y funcionando en produccion privada.
- URL de produccion: https://hybrid.alvarovillalba.es.
- El portfolio publico sigue en https://alvarovillalba.es; Hybrid OS vive en un subdominio separado.
- Supabase es la fuente principal para datos reales.
- Google Auth privado, allow-list, `user_id`, backfill y RLS ya estan activos.
- La app sigue cerrada a uso privado; no es multiusuario abierto.
- El seed historico es fallback/desarrollo.
- `localStorage` es cola temporal, no fuente primaria.
- El flujo importador no debe perder raw data ni payload completo.
- Las pantallas prioritarias deben compartir criterios de periodos: semana calendario de lunes a domingo, mes calendario, ano calendario y todo el historial.
- Evitar grandes features sin cerrar antes la experiencia de datos reales.
- No tocar primary keys hasta resolver `db_id` interno y `session_id` logico por usuario.

## Estado ya completado

- Despliegue privado de produccion en https://hybrid.alvarovillalba.es.
- Separacion de presencia publica: portfolio en https://alvarovillalba.es y app en subdominio propio.
- Supabase como fuente principal de datos reales.
- Google Auth privado.
- Allow-list activa para limitar acceso.
- `user_id` anadido a las tablas principales.
- Backfill de datos existentes al owner.
- RLS activo.
- APIs privadas protegidas.
- Importador funcionando con `user_id`.
- Dashboard decision refactor + ruta `/analysis`: Home queda corto, Dashboard decide el periodo y Analysis concentra informes/tendencias/calidad de datos.
- Post-refactor polish: mobile tabs, copy de decision, warnings con accion y quality actions.
- Visual Analytics layer: graficos ligeros reutilizables, datasets normalizados y visualizacion en Dashboard, Analysis, Running, Muscle Load y Home.
- Visual Analytics polish: cards con valor actual/referencia/estado, tendencias mejor agrupadas, calidad de datos con impacto y preparacion documental para objetivos activos.

## Siguiente roadmap

Orden actual:

1. Objetivos activos.
2. Body map asset-based.
3. Body/Nutrition Supabase.
4. Feedback loop de recomendaciones.
5. QA/calibracion continua de Visual Analytics con datos reales.
6. Feedback importador + dry-run.
7. Loading states globales.
8. v1.1 zapatillas running.
9. Volumen por zapatilla.
10. Responsive/mobile audit.
11. PWA basica mas adelante.

## Iteracion reciente - Visual Analytics layer

Estado: completada primera iteracion + polish.

Alcance:

- Componentes reutilizables en `components/charts`.
- Datasets normalizados en `lib/analytics/chart-data.ts`.
- Dashboard con panel `Evolucion clave`.
- Analysis mas visual en tabs Actual, Semanas, Meses, Tendencias y Calidad de datos.
- Running con carrera por semana, running estructurado, ritmo medio y zapatillas.
- Muscle Load con top musculos, ratios y sesiones clave mas visuales.
- Home con mini sparklines sin hacerla pesada.
- Sin nuevas dependencias de produccion.
- Sin cambios de schema, Auth/RLS/user_id, contratos JSON ni importador.

Pulido posterior:

- `ChartCard` acepta valor actual, estado, referencias compactas, footer, empty state y modo compacto.
- Dashboard mantiene cuatro graficos clave con valor actual, media/cambio y estado.
- Analysis Tendencias queda agrupado por bloques con descripcion y ancho razonable cuando hay pocas cards.
- Running explicita que la carrera mixta cuenta como impacto, no como running tecnico.
- Muscle Load deja slot discreto para BodyMap futuro sin implementarlo.
- Calidad de datos muestra acciones priorizadas e impacto de datos faltantes.
- Documentada futura integracion con active goals.

Siguiente paso sugerido:

1. Objetivos activos.
2. Mapa corporal asset-based.
3. Body/Nutrition Supabase.
4. Feedback loop de recomendaciones.

## Iteracion reciente - Dashboard decision refactor + Analysis route

Estado: completada a nivel de producto base.

Alcance:

- Nueva ruta `/analysis`.
- Navegacion principal con entrada `Analisis`.
- Dashboard reducido a centro de decision del periodo.
- Home reducido a estado diario rapido.
- Informes semanales/mensuales movidos fuera del Dashboard largo.
- Tendencias completas agrupadas en Analysis.
- Calidad de datos movida a Analysis.
- Running y Muscle Load mantienen foco especializado y enlazan a Analysis para profundidad global.
- Pulido posterior: Analysis mobile usa tabs en grid, badges tecnicos se sustituyen por copy de producto, Dashboard muestra decision con accion/por que/priorizar/evitar y Calidad de datos propone maximo 3 acciones.

Siguiente paso sugerido:

1. QA/calibracion final de Visual Analytics con datos reales.
2. Objetivos activos.
3. Mapa corporal asset-based.
4. Body/Nutrition Supabase.

## 1 - Feedback importador + dry-run

Objetivo: hacer que el importador sea mas claro cuando valida, detecta duplicados, guarda o falla.

Alcance:

- Modo dry-run para validar y diagnosticar sin escribir en Supabase.
- Mensajes de error mas especificos por fase.
- Warnings no bloqueantes separados de errores reales.
- Mejor preview de sesiones, body checks y nutrition checks.
- Estados claros de guardado, exito, duplicado y fallo.
- Diagnostico seguro para fallos de escritura en Supabase.
- Mantener guardado de `raw_imports`, `training_sessions`, `training_exercises`, `body_checks` y `nutrition_checks` con `user_id`.

## 2 - Loading states globales

Objetivo: mejorar la percepcion de estabilidad y respuesta en las pantallas privadas.

Alcance:

- Loading states consistentes en Home, Dashboard, Training, Training Detail, Weekly, Running, Muscle Load e Import.
- Estados vacios claros cuando no hay datos.
- Estados de error comprensibles y accionables.
- Evitar parpadeos entre seed/fallback y datos reales.
- Respetar accesibilidad basica y `prefers-reduced-motion` si se anaden transiciones.

## 3 - v1.1 zapatillas running

Objetivo: introducir v1.1 de forma aditiva y sin romper inputs v1.0.

Alcance:

- Aceptar `appInputVersion` `"1.0"` y `"1.1"`.
- Anadir campos opcionales de contexto para running, empezando por zapatillas.
- Evaluar otros campos opcionales como superficie, desnivel, frecuencia cardiaca y sintomas estructurados sin ampliar alcance si no son necesarios.
- Usar `shoes` solo para sesiones `type === "running"`.
- Tratar ausencia de `shoes` como warning no bloqueante en running, nunca como `pendingFields`.
- Preservar campos nuevos en `payload` y `raw_imports`.
- No crear columnas nuevas hasta validar uso real.

## 4 - Volumen por zapatilla

Objetivo: empezar a usar el campo de zapatillas para seguimiento practico de running.

Alcance:

- Calcular volumen por zapatilla desde sesiones running.
- Usar distancia y fecha existentes en sesiones reales.
- Mostrar resumen simple y util.
- Mantener fallback si una sesion running no tiene zapatilla informada.
- Evaluar si hace falta columna analitica o si basta con `payload`.

## 5 - Responsive/mobile audit

Objetivo: revisar la experiencia real en movil y pantallas pequenas tras estabilizar datos, auth y estados de carga.

Alcance:

- Auditar Home, Dashboard, Training, Training Detail, Weekly, Running, Muscle Load e Import.
- Corregir desbordes, jerarquias confusas y controles dificiles de usar en movil.
- Mantener estetica dark premium sin convertir la app en dashboard generico.
- Revisar accesibilidad basica: foco, tamanos tactiles, etiquetas y contraste.
- Evitar redisenos grandes salvo que una pantalla lo necesite claramente.

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

### PWA basica mas adelante

Objetivo: mejorar instalacion y sincronizacion cuando la app privada ya sea estable y la auditoria responsive/mobile este cerrada.

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
- Fusionar Hybrid OS con el portfolio publico.
- Cambios destructivos de Supabase.
- Reescritura completa de arquitectura.
- Nuevas dependencias de produccion sin justificacion clara.
