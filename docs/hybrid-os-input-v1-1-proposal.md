# HybridOSAppInput v1.1 Proposal

Estado: propuesta documental. No implementado en tipos, validador, importador, schema ni migraciones.

## Objetivo

Evolucionar `HybridOSAppInput` de v1.0 a v1.1 para mejorar registros de running y contexto sin romper compatibilidad con los JSON actuales.

La extension debe servir para:

- Superficie de carrera.
- Desnivel positivo y negativo.
- Zapatillas usadas.
- Frecuencia cardiaca media y maxima.
- Molestias o sintomas con mas estructura que `soreness` e `injuryNotes`.

## Contrato actual revisado

El contrato v1.0 esta definido principalmente en `types/training.ts` y se valida en `lib/validation/hybrid-os-input.ts`.

Puntos relevantes del estado actual:

- `HybridOSAppInput.appInputVersion` solo acepta `"1.0"`.
- La raiz contiene `generatedBy`, `generatedAt`, `trainingSession` y checks opcionales de body/nutrition.
- `TrainingSession` contiene metricas de running en `sessionMetrics.totalRunMeters`.
- Las calorias ya viven en:
  - `trainingSession.sessionMetrics.totalCalories`
  - `trainingSession.blocks[].exercises[].calories`
- Las molestias actuales viven en:
  - `trainingSession.soreness: string[]`
  - `trainingSession.injuryNotes: string | null`
- `pendingFields` es un enum cerrado para datos pendientes relevantes.
- Supabase guarda columnas analiticas y conserva la sesion completa en `training_sessions.payload`.
- `raw_imports.raw_payload` conserva el input original.

## Principios de compatibilidad

v1.1 debe ser aditiva:

- Un JSON v1.0 valido debe seguir siendo valido.
- Ningun campo nuevo debe ser obligatorio.
- La ausencia de los campos v1.1 no debe degradar `dataQuality`.
- Los campos nuevos no deben crear warnings criticos si faltan.
- Los campos nuevos deben conservarse dentro de `training_sessions.payload` y `raw_imports.raw_payload`.
- No se debe crear migracion ni columna nueva hasta decidir que campos se consultaran o agregaran con frecuencia.

Implementacion futura sugerida:

```ts
export type HybridOSAppInputVersion = "1.0" | "1.1";

export type HybridOSAppInput = {
  appInputVersion: HybridOSAppInputVersion;
  generatedBy: "gpt";
  generatedAt: string;
  trainingSession: TrainingSession;
  bodyCheck?: BodyCheck;
  nutritionCheck?: NutritionCheck;
};
```

## Extension propuesta

Anadir los campos opcionales dentro de `trainingSession`, no en la raiz del input:

```ts
type RunningSurface =
  | "road"
  | "track"
  | "trail"
  | "gravel"
  | "treadmill"
  | "mixed"
  | "other"
  | "unknown";

type TrainingEnvironment = {
  surface?: RunningSurface | null;
  elevationGainMeters?: number | null;
  elevationLossMeters?: number | null;
};

type TrainingEquipment = {
  shoes?: string | null;
};

type HeartRateMetrics = {
  averageBpm?: number | null;
  maxBpm?: number | null;
};

type SymptomPhase = "before" | "during" | "after" | "next_day" | "unknown";

type TrainingSymptom = {
  area: string;
  phase?: SymptomPhase | null;
  severity?: number | null;
  description?: string | null;
  affectedTraining?: boolean | null;
};

type TrainingSessionV1_1 = TrainingSession & {
  environment?: TrainingEnvironment;
  equipment?: TrainingEquipment;
  heartRate?: HeartRateMetrics;
  symptoms?: TrainingSymptom[];
};
```

### `environment`

Contexto externo de la sesion.

Campos:

- `environment.surface?: RunningSurface | null`
- `environment.elevationGainMeters?: number | null`
- `environment.elevationLossMeters?: number | null`

Reglas:

- Usar metros como numero puro.
- Usar `null` si se sabe que el dato aplica pero no se conoce.
- Omitir `environment` si no hay ningun dato de contexto.
- `surface` describe la superficie principal. Para sesiones mixtas, usar `"mixed"` y ampliar en `notes` si hace falta.

### `equipment`

Material relevante de la sesion.

Campos:

- `equipment.shoes?: string | null`

Reglas:

- Usar `shoes` solo para sesiones `trainingSession.type === "running"`.
- Guardar el nombre/modelo de zapatilla como texto libre en sesiones de running.
- Omitir `equipment` si no hay material relevante o si la sesion no es running.
- No usar `shoes` para CrossFit, HYROX, fuerza, halterofilia, gimnasticos u otras sesiones no running.
- Si una sesion running no trae `shoes`, el importador futuro puede mostrar warning no bloqueante.
- La ausencia de `shoes` no debe bloquear importacion, degradar `dataQuality` ni anadirse a `pendingFields`.
- No mover cargas, ergometros ni implements aqui; esos siguen en ejercicios y bloques.

### `heartRate`

Metricas cardiacas agregadas de la sesion.

Campos:

- `heartRate.averageBpm?: number | null`
- `heartRate.maxBpm?: number | null`

Reglas:

- Usar bpm como numero puro.
- `averageBpm` y `maxBpm` deben ser opcionales e independientes.
- No estimar pulsaciones si no aparecen en la fuente.
- Si `averageBpm > maxBpm`, la validacion futura deberia emitir warning no bloqueante.

### `symptoms`

Nueva estructura opcional para molestias, sin eliminar `soreness` ni `injuryNotes`.

Campos:

- `symptoms?: TrainingSymptom[]`
- `symptoms[].area: string`
- `symptoms[].phase?: "before" | "during" | "after" | "next_day" | "unknown" | null`
- `symptoms[].severity?: number | null`
- `symptoms[].description?: string | null`
- `symptoms[].affectedTraining?: boolean | null`

Reglas:

- `soreness` se mantiene como resumen simple o etiquetas de agujetas/sobrecarga.
- `injuryNotes` se mantiene como nota narrativa compatible con v1.0.
- `symptoms` se usa cuando hay informacion estructurada sobre molestias.
- `severity` debe ser 0-10 cuando exista una escala clara. Si no hay escala, usar `null`.
- Las molestias durante/despues siguen siendo dato critico si no estan claras y afectan interpretacion de carga, por lo que pueden aparecer en `pendingFields`.

## Ejemplo v1.1

```json
{
  "appInputVersion": "1.1",
  "generatedBy": "gpt",
  "generatedAt": "2026-05-31T12:00:00+02:00",
  "trainingSession": {
    "id": "running-2026-05-31-z2-8k",
    "date": "2026-05-31",
    "reportedAt": "2026-05-31T12:00:00+02:00",
    "dateConfidence": "exact",
    "dateRule": "manual",
    "source": "chatgpt",
    "status": "completed",
    "title": "Running Z2 8 km",
    "type": "running",
    "subtypes": ["running", "z2"],
    "durationMinutes": 48,
    "rpe": 5,
    "location": "Madrid",
    "objective": "Rodaje aerobico suave.",
    "rawText": "8 km Z2 en asfalto, +70 m, Altra Via Olympus, FC media 142, maxima 164. Sin molestias despues.",
    "environment": {
      "surface": "road",
      "elevationGainMeters": 70,
      "elevationLossMeters": 65
    },
    "equipment": {
      "shoes": "Altra Via Olympus"
    },
    "heartRate": {
      "averageBpm": 142,
      "maxBpm": 164
    },
    "blocks": [],
    "result": {
      "type": "distance",
      "score": "8 km",
      "timeSeconds": 2880,
      "capMinutes": null,
      "completedAsPlanned": true,
      "notes": null
    },
    "sessionMetrics": {
      "totalRunMeters": 8000,
      "totalBikeMeters": 0,
      "totalRowMeters": 0,
      "totalSkiMeters": 0,
      "totalCalories": null,
      "totalExternalLoadKg": null,
      "totalBarbellReps": 0,
      "totalDumbbellReps": 0,
      "totalKettlebellReps": 0,
      "totalGymnasticsReps": 0,
      "hardSetsEstimate": null,
      "impactScore": 45,
      "cardioLoad": 70,
      "strengthLoad": 5,
      "technicalLoad": 10,
      "fatigueCost": 50
    },
    "sessionMuscleSummary": {
      "quadriceps": 45,
      "hamstrings": 35,
      "glutes": 40,
      "calves": 55,
      "hipFlexors": 35,
      "adductors": 10,
      "core": 20,
      "lowerBack": 10,
      "lats": 0,
      "upperBack": 0,
      "traps": 0,
      "shoulders": 0,
      "chest": 0,
      "triceps": 0,
      "biceps": 0,
      "forearms": 0
    },
    "tags": ["running", "z2", "road"],
    "soreness": [],
    "injuryNotes": "Sin molestias durante ni despues.",
    "symptoms": [],
    "feeling": "Comodo",
    "notes": null,
    "pendingFields": [],
    "dataQuality": "high",
    "importNotes": "Campos v1.1 opcionales incluidos para contexto de running."
  }
}
```

## Calorias

No se propone ningun campo nuevo para calorias.

Mantener:

- Total de sesion: `trainingSession.sessionMetrics.totalCalories`.
- Calorias por ejercicio o estacion: `trainingSession.blocks[].exercises[].calories`.

No anadir calorias como `pendingField` obligatorio. Si faltan calorias, normalmente no debe bloquear ni degradar la importacion. Solo documentarlo en `importNotes` si afecta la interpretacion de una sesion especifica.

## pendingFields

`pendingFields` debe seguir reservado para datos criticos que cambian la interpretacion de la sesion o impiden compararla bien.

v1.1 no debe introducir nuevos `pendingFields`.

Mantener como candidatos principales:

- `RPE exacto`
- `Molestias durante/despues`
- `Resultado exacto`
- `Carga exacta`

Otros pendingFields existentes pueden seguir usandose si el dato es realmente critico para esa sesion, pero v1.1 no debe usar `pendingFields` para datos secundarios como:

- Superficie ausente.
- Zapatillas ausentes.
- Desnivel ausente.
- Frecuencia cardiaca ausente.
- Calorias ausentes.

Esos datos secundarios pueden omitirse o anotarse en `importNotes` sin bloquear. Para running, la ausencia de zapatillas puede mostrarse como warning no bloqueante del importador, pero nunca como `pendingFields`.

## Validacion futura sugerida

Cuando se implemente v1.1, el validador deberia:

- Aceptar `appInputVersion` `"1.0"` y `"1.1"`.
- No exigir `environment`, `equipment`, `heartRate` ni `symptoms`.
- Validar que elevacion, pulsaciones y severidad sean numeros o `null` si existen.
- Emitir warning no bloqueante si:
  - `heartRate.averageBpm` es mayor que `heartRate.maxBpm`.
  - `symptoms[].severity` esta fuera de 0-10.
  - `environment.elevationGainMeters` o `environment.elevationLossMeters` son negativos.
- Emitir warning no bloqueante si una sesion `type === "running"` no incluye `equipment.shoes`.
- No generar warnings por ausencia de campos v1.1 en sesiones no running.
- No convertir campos v1.1 ausentes en `pendingFields`.
- Preservar todos los campos nuevos en `payload` y `raw_imports`.

## Supabase

No se propone cambio de schema en esta fase.

Razon:

- `training_sessions.payload` ya conserva la sesion completa.
- `raw_imports.raw_payload` ya conserva el input original.
- Todavia no esta claro que campos necesitan indices o agregaciones propias.

Propuesta documentada para una fase posterior:

- Mantener v1.1 inicialmente solo en `payload`.
- Evaluar columnas analiticas despues de tener varios imports reales con estos campos.
- Si Running Analytics necesita filtros/agregaciones frecuentes, considerar migracion incremental para:
  - `surface`
  - `elevation_gain_meters`
  - `elevation_loss_meters`
  - `average_hr_bpm`
  - `max_hr_bpm`
  - `shoes`

No usar `DROP`, `TRUNCATE`, mass `DELETE` ni migraciones destructivas.

## Decisiones propuestas

- Version raiz: usar `"1.1"` para inputs nuevos que incluyan estos campos.
- Compatibilidad: aceptar `"1.0"` y `"1.1"` cuando se implemente.
- Ubicacion: campos nuevos dentro de `trainingSession`.
- Zapatillas: `equipment.shoes` solo aplica a sesiones running.
- Calorias: sin cambios; mantener en `sessionMetrics.totalCalories` y `exercise.calories`.
- Molestias: conservar `soreness` e `injuryNotes`; anadir `symptoms` opcional para estructura.
- Persistencia inicial: payload/raw import, sin schema nuevo todavia.
- `pendingFields`: solo datos criticos, no contexto secundario ni ausencia de zapatillas.
