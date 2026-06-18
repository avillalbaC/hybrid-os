# Hybrid OS - Calendario

Fecha: 2026-06-18

## Objetivo

`/calendar` es la referencia visual de adherencia, consistencia y movimiento de Hybrid OS.

La pantalla permite ver de un vistazo:

- que dias tuvieron entrenamiento real;
- que disciplinas aparecieron en el mes;
- carga o intensidad visual del dia;
- movilidad registrada;
- racha actual de entrenamiento;
- racha actual de movimiento;
- dias activos, sesiones y distribucion mensual;
- detalle de un dia seleccionado.

No decide que hacer hoy, no prescribe entrenamientos y no sustituye al check diario con ChatGPT.

## Fuentes de datos

El calendario usa datos existentes:

- `training_sessions`: fuente principal. Cada sesion real cuenta como entrenamiento del dia. Las sesiones canceladas no se cuentan.
- `daily_entries`: fuente secundaria para `mobility_done`, minutos de movilidad, prioridades completadas y nota rapida.
- `planned_sessions`: no participa en el MVP.
- `goal_blocks`: no participa en el MVP.

No crea tablas nuevas, no toca schema, no toca el importador y no llama APIs externas.

## Definiciones

Dia entrenado:

- un dia cuenta como entrenado si existe al menos una `training_session` no cancelada en esa fecha.

Dia de movimiento:

- un dia cuenta como movimiento si existe al menos una `training_session`; o
- existe una `daily_entry` con `mobility_done === true`.

Racha actual de entrenamiento:

- numero de dias consecutivos hasta hoy con entrenamiento real.

Racha actual de movimiento:

- numero de dias consecutivos hasta hoy con entrenamiento real o movilidad marcada.

Mejor racha del mes:

- mayor numero de dias consecutivos entrenados dentro del mes seleccionado.

Movilidad del mes:

- dias unicos con `mobility_done === true` o sesiones de tipo `movilidad`;
- evita doble conteo por dia.

Disciplina dominante:

- disciplina con mas sesiones del mes;
- si hay empate, se muestra `Mixto`.

## Intensidad diaria

La intensidad visual es una clasificacion simple para MVP:

- `none`: sin sesion y sin movilidad.
- `low`: solo movilidad o sesion corta/suave.
- `moderate`: duracion media o RPE medio.
- `high`: mas de 75 minutos, RPE alto, HYROX/CrossFit intenso o dos sesiones.
- `very_high`: varias sesiones, duracion larga con RPE alto, competicion o actividad funcional larga.

La regla no intenta ser perfecta. Es consistente, determinista y suficiente para lectura visual.

## Disciplinas

El calendario normaliza sesiones a:

- Running;
- HYROX;
- CrossFit;
- Fuerza;
- Halterofilia;
- Gimnasticos;
- Movilidad;
- Actividad funcional;
- Mixto;
- Otro.

Cada dia muestra hasta tres badges compactos y un `+N` si hay mas disciplinas.

## MVP incluido

- Ruta `/calendar`.
- Vista mensual.
- Navegacion mes anterior, mes siguiente y hoy.
- Grid lunes-domingo.
- KPIs superiores del mes.
- Distribucion por disciplina.
- Detalle de dia seleccionado.
- Estados loading, empty y error.
- Responsive mobile.
- Documentacion.

## No incluido

- Vista semanal separada.
- Edicion desde calendario.
- Drag and drop.
- Google Calendar.
- Notificaciones.
- Sistema de puntos.
- Medallas complejas.
- Runtime IA.
- Integracion editable con `planned_sessions`.

## Futuras fases

1. Integracion discreta de `planned_sessions`.
2. Lectura planificado vs realizado.
3. Badges o hitos simples validados por uso real.
4. Vista semanal.
5. Export de calendario.
6. PWA/offline.

La recomendacion actual es usar el calendario varios dias y validar si aumenta adherencia antes de anadir planificado vs realizado o gamificacion avanzada.
