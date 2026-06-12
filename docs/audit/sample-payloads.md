# Hybrid OS - Sample Payloads

Fecha: 2026-06-11

Ejemplos reales resumidos desde `GET /api/training-sessions`. No se copia JSON completo ni secretos.

## 1. Running puro

- id: `running-2026-05-30-z2-5k`
- date: `2026-05-30`
- title: `Running Z2 - 5,04 km`
- type: `running`
- subtypes: `running`, `z2`
- result: `time`, score `5,04 km en 29:30`, `timeSeconds: 1770`, completado.
- sessionMetrics:
  - `totalRunMeters: 5040`
  - `durationMinutes`: 29 en UI/result, `timeSeconds: 1770`
  - `cardioLoad: 45`
  - `fatigueCost: 35`
  - `impactScore: 45`
  - `strengthLoad: 10`
  - `technicalLoad: 10`
  - `totalExternalLoadKg: 0`
- sessionMuscleSummary relevante:
  - calves 40
  - quadriceps 35
  - hamstrings 30
  - glutes 30
  - hipFlexors 30
  - core 20
- blocks resumidos:
  - `Carrera continua`, format `running`
  - ejercicio `Run`, `movementPattern: run`, `distanceMeters: 5040`, `sets: 1`, `calories: 400`
- tags: `running`, `z2`, `5k`, `ritmo 5:51`, `fc media 133`, `noche`
- fields relevantes:
  - `equipment.shoes: more v3 trail`
  - frecuencia cardiaca media extraible desde result/tags/raw text: 133 bpm

## 2. HYROX/CrossFit con carrera

- id: `hyrox-2026-06-09-am-partner-sled-wallball`
- date: `2026-06-09`
- title: `HYROX Partner - Run, Sled Complex, Wall Ball y Finisher`
- type: `hyrox`
- subtypes: `pairs`, `engine`, `running`, `mixed_modal`, `lower_body`, `upper_body`, `core`
- result: `partial`, sin tiempo final, completado como planificado.
- sessionMetrics:
  - `totalRunMeters: 3000`
  - `cardioLoad: 85`
  - `fatigueCost: 85`
  - `impactScore: 82`
  - `strengthLoad: 72`
  - `technicalLoad: 55`
  - `totalExternalLoadKg: 4140`
  - `totalGymnasticsReps: 20`
  - `hardSetsEstimate: 16`
- sessionMuscleSummary relevante:
  - quadriceps 80
  - glutes 75
  - core 75
  - lats 70
  - forearms 75
  - calves 65
- blocks resumidos:
  - `3 Set Partner - Run, Sled Complex y Wall Ball`, format `hyrox`
  - ejercicios: Partner Run 800 m x 3, Sled Pull 100 kg, Sled Push 100 kg, Wall Ball 9 kg
  - `Finisher - 1 Ronda`, incluye Run 300 m y carries/push-ups
- tags: `hyrox`, `partner`, `rpe 8`, `sled pull`, `sled push`, `wall ball`, `farmer carry`, `running`, `7am`
- fields relevantes:
  - La carrera cuenta como mixta, no como running estructurado.
  - `totalRunMeters` resume la exposicion de carrera dentro de HYROX.

## 3. Fuerza/Halterofilia o bloque strength

- id: `hyrox-2026-06-05-conditioning-run-row-bike-accessory`
- date: `2026-06-05`
- title: `HYROX Conditioning - Run, Row, Bike y accesorios`
- type: `hyrox`
- subtypes: `engine`, `running`, `mixed_modal`, `strength`, `lower_body`, `upper_body`, `core`
- result: `time`, score `25:00`, `timeSeconds: 1500`, RPE 7.
- sessionMetrics:
  - `totalRunMeters: 2000`
  - `totalRowMeters: 2000`
  - `totalBikeMeters: 4000`
  - `cardioLoad: 85`
  - `fatigueCost: 78`
  - `impactScore: 72`
  - `strengthLoad: 65`
  - `technicalLoad: 45`
  - `totalExternalLoadKg: 2970`
  - `totalBarbellReps: 45`
  - `totalDumbbellReps: 48`
  - `hardSetsEstimate: 15`
- sessionMuscleSummary relevante:
  - core 75
  - glutes 75
  - quadriceps 75
  - lats 70
  - upperBack 70
  - hamstrings 55
- blocks resumidos:
  - `HYROX Conditioning - 4 Set Run, Row y Bike`: Run 500 m, Row 500 m, Bike 1000 m por set
  - `3 Set - V-ups, Bent Over Barbell Row, Contralateral Bulgarian Squat y Broad Jump`
  - ejercicios strength: Barbell Row 50 kg, Bulgarian Squat 15 kg, V-ups, Broad Jump
- tags: `hyrox`, `conditioning`, `run`, `row`, `bike`, `rpe 7`, `fc media 162`, `bent over row`, `bulgarian squat`
- fields relevantes:
  - Mezcla carga cardiovascular, carrera mixta, volumen externo y estimacion de hard sets.

## 4. Actividad funcional / padel

- id: `actividad-funcional-2026-06-06-padel-torneo`
- date: `2026-06-06`
- title: `Torneo de pádel - 7 partidos a un set`
- type: `actividad_funcional`
- subtypes: `team`, `engine`, `mixed_modal`, `lower_body`, `full_body`
- result: `partial`, score `6-3, 6-4, 6-2, 6-0, 6-4, 6-4, 0-6`, `timeSeconds: 18000`
- sessionMetrics:
  - `totalRunMeters: 0`
  - `cardioLoad: 85`
  - `fatigueCost: 90`
  - `impactScore: 88`
  - `strengthLoad: 42`
  - `technicalLoad: 70`
  - `totalExternalLoadKg: 0`
- sessionMuscleSummary relevante:
  - quadriceps 80
  - calves 80
  - glutes 75
  - adductors 70
  - core 70
  - shoulders 60
  - forearms 65
- blocks resumidos:
  - `Fase de grupos`, format `other`, ejercicio `Pádel - fase de grupos`, `sets: 4`
  - `Eliminatorias`, format `other`, ejercicio `Pádel - cuartos, semifinal y final`, `sets: 3`
- tags: `padel`, `torneo`, `7 partidos`, `actividad funcional`, `deporte intermitente`, `cambios de direccion`, `larga duracion`
- fields relevantes:
  - No suma running meters aunque tiene carga cardio/impacto alta.
  - Modelo preserva actividad intermitente y carga muscular sin forzarla a running.
