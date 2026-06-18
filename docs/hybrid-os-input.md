# Hybrid OS - HybridOSAppInput

Actualizado: 2026-06-18

Documento operativo del contrato de entrada que usa `/training/import`.

## Estado actual

El contrato vive principalmente en:

- `types/training.ts`
- `lib/validation/hybrid-os-input.ts`
- `lib/imports/save-app-input.ts`

Versiones aceptadas:

- `"1.0"`
- `"1.1"`

v1.1 esta implementado de forma parcial y aditiva. Hoy el unico campo nuevo usado por la app es:

- `trainingSession.equipment.shoes?: string | null`

No estan implementados todavia como contrato validado:

- `trainingSession.environment`
- `trainingSession.heartRate`
- `trainingSession.symptoms`

## Principios

- Un JSON v1.0 valido debe seguir siendo valido.
- Ningun campo v1.1 debe ser obligatorio.
- La ausencia de zapatillas en running es warning no bloqueante.
- La ausencia de zapatillas no debe degradar `dataQuality`.
- La ausencia de zapatillas no debe anadirse a `pendingFields`.
- Los campos aceptados deben conservarse en `training_sessions.payload` y `raw_imports.raw_payload`.
- No crear columnas nuevas hasta validar uso real suficiente.

## Zapatillas running

Campo:

```ts
type TrainingEquipment = {
  shoes?: string | null;
};
```

Reglas:

- Usar `equipment.shoes` solo para sesiones `trainingSession.type === "running"`.
- Guardar nombre/modelo como texto libre.
- Si no hay zapatillas en una sesion running, el importador muestra warning no bloqueante.
- El helper `addShoesToHybridOSJson()` puede parchear el JSON, subir `appInputVersion` a `"1.1"` y limpiar la nota de zapatillas pendientes.
- Running agrupa volumen por zapatilla desde sesiones running puras.

## Campos futuros posibles

Campos propuestos pero no implementados:

- superficie;
- desnivel positivo/negativo;
- frecuencia cardiaca media/maxima;
- molestias estructuradas.

Cuando se implementen:

- deben ser opcionales;
- deben validar tipos y rangos;
- deben generar como maximo warnings no bloqueantes;
- deben preservarse primero en payload/raw import;
- solo deben convertirse en columnas analiticas si se usan para filtros o agregaciones frecuentes.

## Calorias

No hay cambio de contrato para calorias.

Mantener:

- total de sesion: `trainingSession.sessionMetrics.totalCalories`;
- calorias por ejercicio o estacion: `trainingSession.blocks[].exercises[].calories`.

No anadir calorias como `pendingField` obligatorio.

## Pending fields

`pendingFields` queda reservado para datos criticos que cambian la interpretacion de la sesion o impiden compararla bien.

No usar `pendingFields` para:

- zapatillas ausentes;
- superficie ausente;
- desnivel ausente;
- frecuencia cardiaca ausente;
- calorias ausentes.

Mantener como candidatos principales:

- `RPE exacto`
- `Molestias durante/despues`
- `Resultado exacto`
- `Carga exacta`
