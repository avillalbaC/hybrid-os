# Hybrid OS - Plan de MVP

## Estado actual tras iteraciones

La app ya no es un MVP puramente local. El flujo principal de entrenamientos usa Supabase/Postgres como fuente persistente mediante API routes server-side:

- `training_sessions` guarda cada `TrainingSession` validada como `payload` JSONB.
- Las escrituras pasan por `/api/training-sessions` usando `SUPABASE_SERVICE_ROLE_KEY` solo en servidor.
- `localStorage` queda como fallback temporal y cola simple de sesiones pendientes si Supabase no responde.
- El importador permite validar, previsualizar, detectar duplicados, importar backups JSON y guardar en Supabase.
- El log/detalle permiten ver estado de sincronización, exportar backup, editar campos básicos y eliminar sesiones.
- El dashboard incluye comparación semanal basada en los selectores existentes.

La prioridad técnica actual es mejorar edición/validación y completar vistas analíticas, no decidir persistencia.

## Estado actual del repositorio

Este bloque queda como referencia histórica del plan inicial. El repositorio ya contiene una app Next.js funcional con datos seed, Supabase, rutas API, validación de importaciones, dashboard, training log, detalle, carga muscular, body, nutrition y goals.

Por tanto, este plan asume que el MVP se construira desde cero, manteniendo el enfoque incremental indicado: frontend funcional primero, datos mock/locales, sin backend, sin base de datos, sin autenticacion y sin IA interna.

## Vision del producto

Hybrid OS es una aplicacion personal para registrar, analizar y hacer seguimiento de entrenamiento hibrido, carga muscular, objetivos corporales, nutricion y progreso por semanas o periodos.

No debe plantearse como blog ni como landing page. La primera pantalla debe ser una experiencia de aplicacion: dashboard operativo, navegacion clara y acceso rapido al registro/importacion de datos.

El flujo principal del MVP sera:

1. El usuario entrena.
2. El usuario pasa el entrenamiento en bruto a ChatGPT.
3. ChatGPT devuelve un `appInput` JSON normalizado.
4. El usuario pega ese JSON en Hybrid OS.
5. La app valida el JSON.
6. La app muestra una preview.
7. El usuario guarda el registro localmente o en mock state.
8. Dashboard, calendario, estadisticas, carga muscular, body check y nutricion se actualizan.

## Principios de implementacion

- Construir cambios pequenos, revisables e incrementales.
- Empezar con una arquitectura simple, pero preparada para crecer.
- Separar datos, tipos, validacion, componentes UI y logica de agregacion.
- Usar TypeScript estricto para modelar el dominio desde el inicio.
- Evitar dependencias innecesarias.
- No introducir backend, base de datos, autenticacion ni integraciones externas en el MVP inicial.
- Priorizar accesibilidad basica: HTML semantico, labels, estados de foco y textos claros.
- Disenar responsive desde el inicio, especialmente para consulta rapida en movil.
- Mantener el producto como herramienta de uso repetido: denso, claro, escaneable y sin ornamentacion excesiva.

## Stack propuesto

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- Componentes reutilizables.
- Datos mock/locales al inicio.
- Validacion local del objeto `appInput`.
- Persistencia pospuesta a una fase posterior, empezando probablemente por `localStorage` o IndexedDB.

## Arquitectura inicial recomendada

Estructura sugerida para cuando se cree la app:

```text
app/
  layout.tsx
  page.tsx
  training/
    page.tsx
    import/
      page.tsx
    [id]/
      page.tsx
  calendar/
    page.tsx
  muscle-load/
    page.tsx
  body/
    page.tsx
  nutrition/
    page.tsx
  goals/
    page.tsx

components/
  layout/
  navigation/
  dashboard/
  training/
  calendar/
  muscle-load/
  body/
  nutrition/
  goals/
  ui/

lib/
  mock-data/
  domain/
  validation/
  selectors/
  storage/
  utils/

types/
  app-input.ts
  training.ts
  body.ts
  nutrition.ts
  goals.ts
```

Notas:

- `types/` debe contener los contratos del dominio.
- `lib/validation/` debe validar `appInput` y devolver errores legibles.
- `lib/selectors/` debe contener calculos derivados: volumen semanal, carga muscular, resumen por tipo, tendencias.
- `lib/mock-data/` debe contener datos iniciales separados de la presentacion.
- `components/ui/` debe contener piezas genericas pequenas: cards, tabs, badges, inputs, empty states, metric tiles.

## Modelo de datos base

La app debe aceptar un objeto raiz `appInput` con campos opcionales:

```ts
type AppInput = {
  trainingSession?: TrainingSession;
  bodyCheck?: BodyCheck;
  nutritionCheck?: NutritionCheck;
  goals?: Goal[];
};
```

### TrainingSession

Campos necesarios para el MVP:

- `id`
- `date`
- `title`
- `type`
- `subtypes`
- `durationMinutes`
- `rpe`
- `location`
- `objective`
- `blocks`
- `exercises`
- `notes`
- `feeling`
- `soreness`
- `tags`
- `sessionMuscleSummary`
- `pendingFields`

Cada ejercicio debe poder incluir su propio `muscleLoad`.

### TrainingBlock

Campos necesarios:

- `name`
- `format`
- `rounds`
- `timeCap`
- `rest`
- `exercises`

### Exercise

Campos necesarios:

- `name`
- `sets`
- `reps`
- `load`
- `distance`
- `time`
- `calories`
- `notes`
- `movementPattern`
- `muscleLoad`

### MuscleLoadEntry

```ts
type MuscleLoadEntry = {
  muscle: string;
  role: "primary" | "secondary" | "stabilizer";
  loadScore: number;
};
```

El `loadScore` deberia tratarse como una puntuacion normalizada, por ejemplo de 0 a 10. La validacion debe detectar valores fuera de rango.

## Rutas del MVP

### `/` - Dashboard

Objetivo: vista general operativa.

Debe mostrar:

- Resumen de sesiones recientes.
- Carga semanal.
- Distribucion por tipo de entrenamiento.
- Musculos mas cargados.
- Ultimo body check.
- Ultimo nutrition check.
- Objetivos activos.
- Acceso claro a importar JSON.

### `/training` - Training Log

Objetivo: listado filtrable de entrenamientos.

Debe mostrar:

- Lista de sesiones.
- Fecha, titulo, tipo, duracion, RPE y tags.
- Filtros basicos por tipo, fecha y texto.
- Estado vacio si no hay datos.
- Enlace al detalle de cada sesion.

### `/training/import` - Importar entrenamiento por JSON

Objetivo: puerta de entrada principal del MVP.

Debe incluir:

- Textarea para pegar `appInput`.
- Validacion de JSON valido.
- Validacion de estructura esperada.
- Mensajes de error claros.
- Preview antes de guardar.
- Resumen de campos pendientes.
- Accion de guardar en estado local/mock.

En el MVP inicial, si todavia no existe persistencia, el guardado puede simularse dentro del estado de la sesion de navegador. La siguiente iteracion deberia moverlo a `localStorage`.

### `/training/[id]` - Detalle de entrenamiento

Objetivo: lectura completa de una sesion.

Debe mostrar:

- Cabecera con fecha, titulo, tipo, subtipos, duracion y RPE.
- Objetivo y notas.
- Bloques del entrenamiento.
- Ejercicios.
- Cargas, reps, distancia, tiempo o calorias cuando existan.
- Carga muscular por ejercicio.
- Resumen muscular de la sesion.
- Soreness y feeling.
- Pending fields.

### `/calendar` - Calendario

Objetivo: visualizar consistencia y distribucion temporal.

Debe mostrar:

- Vista mensual simple.
- Dias con entrenamiento.
- Indicadores por tipo o carga.
- Seleccion de dia para ver sesiones.
- Estados vacios.

### `/muscle-load` - Muscle Load Analysis

Objetivo: entender que zonas estan acumulando carga.

Debe mostrar:

- Ranking de musculos por carga.
- Carga por periodo.
- Separacion entre rol primario/secundario/estabilizador si aporta claridad.
- Alertas suaves para carga alta repetida.
- Relacion con soreness cuando exista.

### `/body` - Body Check

Objetivo: seguimiento corporal basico.

Debe mostrar:

- Ultimo registro corporal.
- Peso, medidas o notas si existen.
- Tendencia historica mock/local.
- Campos pendientes.

### `/nutrition` - Nutrition Check

Objetivo: seguimiento nutricional simple.

Debe mostrar:

- Ultimo registro nutricional.
- Calorias/macros si existen.
- Hidratacion, adherencia o notas si existen.
- Relacion ligera con objetivos.

### `/goals` - Objetivos

Objetivo: objetivos basicos y seguimiento manual.

Debe mostrar:

- Lista de objetivos activos.
- Tipo de objetivo: rendimiento, corporal, nutricion, habito, recuperacion.
- Estado: activo, pausado, completado.
- Progreso simple.
- Fecha objetivo si existe.

## Validacion de `appInput`

La validacion debe implementarse en capas:

1. JSON parseable.
2. Objeto raiz valido.
3. Al menos una seccion reconocida: `trainingSession`, `bodyCheck`, `nutritionCheck` o `goals`.
4. Validacion especifica por seccion.
5. Normalizacion ligera si es segura.
6. Preview con errores y advertencias.

Errores:

- Deben bloquear el guardado.
- Ejemplo: JSON invalido, `trainingSession.date` ausente, `rpe` fuera de rango.

Advertencias:

- No necesariamente bloquean el guardado.
- Ejemplo: falta `location`, falta `feeling`, hay `pendingFields`.

Para el MVP puede bastar con validacion manual tipada. Si mas adelante la complejidad crece, valorar una dependencia como Zod, pero no introducirla sin necesidad.

## Datos mock/locales iniciales

Crear un pequeno set de datos representativo cuando se implemente la app:

- 5-8 sesiones de entrenamiento.
- Mezcla de CrossFit, HYROX, running, fuerza, halterofilia, gimnasticos y movilidad.
- Varias sesiones con muscle load.
- 2-3 body checks.
- 2-3 nutrition checks.
- 3-5 objetivos.

Los datos mock deben vivir separados de los componentes para poder reemplazarse por persistencia real sin reescribir la UI.

## Componentes clave del MVP

- `AppShell`: estructura general, navegacion y contenido.
- `MainNav`: navegacion principal.
- `MetricCard`: metricas del dashboard.
- `TrainingSessionCard`: resumen de sesion.
- `TrainingFilters`: filtros del log.
- `JsonImportForm`: textarea, validacion y acciones.
- `ImportPreview`: preview estructurada del `appInput`.
- `TrainingBlockView`: render de bloques.
- `ExerciseTable` o `ExerciseList`: ejercicios responsive.
- `MuscleLoadChart`: visualizacion simple de carga muscular.
- `CalendarMonth`: calendario mensual.
- `EmptyState`: estados sin datos.
- `StatusBadge` / `TagBadge`: estados, tipos y etiquetas.

## Fases de trabajo

### Fase 1 - Scaffold del proyecto

Objetivo: crear la base tecnica.

Tareas:

- Crear app Next.js con TypeScript y Tailwind.
- Configurar App Router.
- Definir layout global.
- Crear navegacion principal.
- Crear estructura de carpetas inicial.
- Confirmar que `npm run lint` y `npm run build` funcionan.

Resultado esperado:

- App arranca localmente.
- Rutas base existen.
- No hay funcionalidad de dominio todavia salvo navegacion.

### Fase 2 - Tipos, mocks y selectores

Objetivo: definir el dominio sin acoplarlo a UI.

Tareas:

- Crear tipos base de `AppInput`.
- Crear tipos para training, body, nutrition y goals.
- Crear mocks iniciales.
- Crear selectores para resumen semanal, sesiones recientes, carga muscular y objetivos activos.

Resultado esperado:

- Datos mock alimentan varias vistas.
- Calculos derivados estan centralizados.

### Fase 3 - Dashboard y Training Log

Objetivo: tener la experiencia principal de lectura.

Tareas:

- Implementar dashboard.
- Implementar listado de entrenamientos.
- Implementar filtros basicos.
- Implementar detalle de entrenamiento.

Resultado esperado:

- El usuario puede navegar y entender su historial mock.

### Fase 4 - Importacion JSON

Objetivo: implementar el flujo principal del producto.

Tareas:

- Crear formulario de importacion.
- Parsear JSON.
- Validar estructura.
- Mostrar errores, advertencias y preview.
- Simular guardado inicialmente.
- Preparar la interfaz para persistencia posterior.

Resultado esperado:

- El usuario puede pegar un `appInput`, validarlo y ver una preview util.

### Fase 5 - Calendario, Muscle Load, Body, Nutrition y Goals

Objetivo: completar las vistas del MVP.

Tareas:

- Crear calendario mensual simple.
- Crear analisis de carga muscular.
- Crear body check.
- Crear nutrition check.
- Crear goals basicos.

Resultado esperado:

- Todas las rutas MVP tienen contenido funcional basado en mocks/local state.

### Fase 6 - Persistencia local

Objetivo: hacer que el MVP sea util entre sesiones.

Tareas:

- Introducir `localStorage` o IndexedDB.
- Definir adaptador de storage.
- Migrar guardado de importaciones a persistencia local.
- Mantener mocks como fallback o seed inicial.

Resultado esperado:

- Los registros importados sobreviven al refresco del navegador.

## Iteraciones posteriores al MVP

- Supabase/PostgreSQL.
- Autenticacion.
- Backend/API.
- Importacion desde texto libre.
- Generacion interna de `appInput` con IA.
- Integraciones externas.
- Graficas mas avanzadas.
- Periodizacion y comparativas por bloques.
- Exportacion/importacion de datos.
- Tests unitarios para validacion y selectores.
- Tests de interfaz para flujo de importacion.

## Criterios de aceptacion del MVP

- Todas las rutas propuestas existen y son navegables.
- La app se entiende como herramienta, no como blog o landing.
- El dashboard resume entrenamiento, carga muscular, body, nutrition y goals.
- El usuario puede pegar un JSON `appInput`.
- La app diferencia entre JSON invalido, estructura invalida, advertencias y preview valida.
- La app puede mostrar detalle completo de una sesion.
- La carga muscular se calcula o agrega de forma consistente.
- El diseno es responsive y usable en escritorio y movil.
- Los datos estan separados de la presentacion.
- La arquitectura permite reemplazar mocks por persistencia sin reescribir toda la UI.

## Riesgos y decisiones pendientes

- Definir cuanto debe bloquear la validacion frente a permitir registros incompletos con `pendingFields`.
- Decidir si `trainingSession.exercises` debe duplicar ejercicios que ya viven dentro de `blocks`, o si debe tratarse como indice derivado.
- Definir catalogo inicial de musculos y nombres normalizados.
- Definir escalas exactas para `rpe`, `feeling`, `soreness` y `loadScore`.
- Decidir si el primer guardado real sera `localStorage` o IndexedDB.
- Decidir si se introduce una libreria de validacion cuando el modelo crezca.

## Primer siguiente paso recomendado

Crear el scaffold de Next.js con TypeScript y Tailwind, manteniendo la estructura simple. Despues, implementar primero tipos, mocks y layout base antes de crear vistas complejas.
