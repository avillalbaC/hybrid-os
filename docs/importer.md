# Importador de entrenamientos

Estado: flujo activo para `/training/import`.

## Objetivo

El importador convierte uno o varios `HybridOSAppInput` en datos persistidos de entrenamiento respetando el contrato vigente.

Flujo principal:

`HybridOSAppInput JSON -> validacion cliente -> preview -> validacion servidor -> Supabase -> Training Log / Dashboard / Muscle Load`

## Contrato de entrada

Acepta:

- Un objeto `HybridOSAppInput`.
- Un array `HybridOSAppInput[]`.

Versiones aceptadas: `"1.0"` y `"1.1"`. El detalle del contrato vive en [HybridOSAppInput](./hybrid-os-input.md).

No debe hacer:

- Ampliar el contrato `HybridOSAppInput` desde el importador sin actualizar tipos, validador y documentacion.
- Reducir `trainingSession.payload` a campos simples.
- Inventar IDs nuevos para sesiones que representan el mismo entrenamiento.
- Usar service role en cliente.
- Tocar Goals, Daily Plan, `planned_sessions` ni schema de training.

## Validacion cliente

La UI usa `validateHybridOSImport()` antes de guardar.

Comprueba:

- JSON parseable.
- Campos obligatorios.
- Enums permitidos.
- Tipos y rangos numericos.
- `bodyCheck` y `nutritionCheck` opcionales.
- Warnings de calidad de datos.
- Duplicados exactos disponibles en cliente.
- Duplicados internos dentro de un array.
- Posibles duplicados por misma fecha, tipo y resultado parecido.

Los errores bloquean el guardado. Los warnings no bloquean.

## Validacion servidor

`POST /api/imports` vuelve a validar todo con `saveAppInputs()`.

Antes de escribir:

- Revalida estructura y enums.
- Rechaza arrays con `trainingSession.id` repetido.
- Comprueba duplicados por usuario y session id.
- Opera siempre con el usuario autenticado.

Si no hay sesion autenticada, la API devuelve `401` desde `requireAllowedUser()`.

## Persistencia

Cada import valido guarda:

- `training_sessions`, con `payload` completo.
- `raw_imports`, con el JSON original del input.
- `training_exercises`, normalizados desde bloques y ejercicios.
- `body_checks`, si el input incluye `bodyCheck`.
- `nutrition_checks`, si el input incluye `nutritionCheck`.

Regla importante: Supabase es la fuente principal. El seed historico es fallback/desarrollo y no debe mezclarse con datos reales cuando Supabase devuelve sesiones.

## Warnings vs errores

Errores bloqueantes:

- JSON invalido no reparable.
- Campo obligatorio ausente.
- Enum no permitido.
- Tipo incompatible en campos criticos.
- Rango invalido en metricas criticas.
- `bodyCheck` o `nutritionCheck` con estructura invalida.
- Duplicado exacto por session id.
- ID repetido dentro del array importado.

Warnings no bloqueantes:

- Falta RPE.
- Falta duracion exacta.
- Resultado ausente o parcial.
- `pendingFields` presentes.
- `dataQuality` partial o low.
- Running puro sin zapatillas.
- Bloques o ejercicios incompletos.
- Resumen muscular vacio o pobre.
- Fecha con baja confianza.
- Posible duplicado por fecha, tipo y resultado parecido.

## Duplicados

Tipos:

- Duplicado exacto contra Supabase: mismo `trainingSession.id` para el usuario autenticado. No se guarda por defecto.
- Duplicado interno: el array contiene el mismo `trainingSession.id` mas de una vez. No se escribe nada.
- Posible duplicado: misma fecha, mismo tipo y resultado/titulo parecido. No bloquea, pero se muestra como warning para revisar.

No se hacen reemplazos destructivos desde este flujo.

## Estados visibles

La UI muestra las fases:

1. Pegado.
2. Parseado.
3. Validado.
4. Preview listo.
5. Guardando.
6. Guardado.
7. Duplicado.
8. Error.

El feedback debe dejar claro si todavia no se ha guardado nada, si el dry-run no ha escrito datos o si el guardado termino en Supabase.

## Limitaciones

- El posible duplicado por fecha/tipo/resultado es heuristico y solo sirve para revisar.
- El dry-run valida contra servidor y duplicados, pero no sustituye una importacion real.
- No hay test framework formal para imports; la validacion principal sigue siendo lint/build y checklist manual.
- Running shoes v1.1 se conserva en payload/raw import, sin columnas nuevas.

## Checklist manual

1. Pegar JSON valido de una sesion.
2. Validar y comprobar preview.
3. Confirmar que aparece "No se ha guardado nada todavia".
4. Ejecutar dry-run.
5. Guardar y comprobar resumen de sesiones, raw imports, ejercicios y checks.
6. Pegar el mismo JSON y confirmar duplicado exacto.
7. Pegar JSON con enum invalido y confirmar error accionable con campo, valor y permitidos.
8. Pegar JSON parcial con `pendingFields` y confirmar warnings no bloqueantes.
9. Pegar array de sesiones y confirmar preview multiple.
10. Pegar array con ID repetido y confirmar bloqueo antes de guardar.
11. Probar en mobile: textarea, botones, preview, errores y detalles sin overflow horizontal.
12. Confirmar que no se toca Goals, Daily Plan ni `planned_sessions`.
