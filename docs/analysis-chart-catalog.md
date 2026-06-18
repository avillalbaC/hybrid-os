# Hybrid OS - Analysis Chart Catalog

Fecha: 2026-06-18

Catalogo operativo de graficas para `/analysis`. Cada grafica debe responder una pregunta concreta y usar datos ya disponibles en sesiones reales.

## Implementadas

### Carga semanal reciente

- Pregunta: esta subiendo o bajando la carga global?
- Datos de entrada: sesiones por semana, duracion, fatigueCost, RPE medio.
- Unidad: minutos, puntos de fatiga, RPE.
- Pantalla/tab: Actual, Semanas, Tendencias.
- Prioridad: alta.
- Limitaciones: fatigueCost es indice interno; no equivale a minutos.

### Distribucion semanal por disciplina

- Pregunta: en que se esta yendo cada semana?
- Datos de entrada: tipo de sesion por semana.
- Unidad: sesiones.
- Pantalla/tab: Actual, Semanas.
- Prioridad: alta.
- Limitaciones: fuerza y halterofilia se agrupan para reducir ruido visual.

### Distribucion mensual por disciplina

- Pregunta: como cambia el reparto de estimulos por mes?
- Datos de entrada: tipo de sesion por mes.
- Unidad: sesiones.
- Pantalla/tab: Meses.
- Prioridad: media.
- Limitaciones: no pondera por duracion; muestra frecuencia.

### Running estructurado vs carrera mixta

- Pregunta: la carrera viene de running puro o de sesiones mixtas?
- Datos de entrada: structuredRunMeters, mixedRunMeters.
- Unidad: km.
- Pantalla/tab: Actual, Semanas, Meses.
- Prioridad: alta.
- Limitaciones: carrera mixta cuenta como impacto, no como running tecnico.

### Intensidad por semana

- Pregunta: cuantas sesiones son suaves, moderadas, intensas o sin RPE?
- Datos de entrada: RPE por sesion.
- Unidad: sesiones.
- Pantalla/tab: Actual, Semanas.
- Prioridad: alta.
- Limitaciones: sesiones sin RPE reducen la lectura de intensidad.

### Intensidad mensual

- Pregunta: como cambia la distribucion de intensidad por mes?
- Datos de entrada: RPE por sesion.
- Unidad: sesiones.
- Pantalla/tab: Meses.
- Prioridad: media.
- Limitaciones: no sustituye el detalle semanal cuando hay pocas sesiones.

### Duracion vs RPE

- Pregunta: aparecen sesiones largas e intensas?
- Datos de entrada: durationMinutes y RPE por sesion.
- Unidad: minutos / RPE.
- Pantalla/tab: Actual.
- Prioridad: alta.
- Limitaciones: solo muestra sesiones con duracion y RPE disponibles.

### Top musculos por periodo

- Pregunta: que musculos reciben mas carga en el periodo?
- Datos de entrada: sessionMuscleSummary agregado.
- Unidad: puntos de carga muscular.
- Pantalla/tab: Actual, Meses.
- Prioridad: alta.
- Limitaciones: depende de la calidad del resumen muscular importado.

### Evolucion de musculos principales

- Pregunta: que musculos suben o bajan semana a semana?
- Datos de entrada: sessionMuscleSummary por semana.
- Unidad: puntos de carga muscular.
- Pantalla/tab: Tendencias.
- Prioridad: alta.
- Limitaciones: mini lineas muestran tendencia relativa, no diagnostico local.

### Consistencia de entrenamiento

- Pregunta: que dias y semanas tienen registro?
- Datos de entrada: sesiones, duracion y fatigueCost por dia.
- Unidad: dias / densidad visual.
- Pantalla/tab: Semanas, Tendencias.
- Prioridad: media.
- Limitaciones: intensidad visual mezcla sesiones, duracion y fatiga.

### Calidad de datos por semana

- Pregunta: mejora o empeora la calidad del registro?
- Datos de entrada: complete, partial, sin RPE, sin duracion, sin resultado, running sin zapatillas.
- Unidad: sesiones.
- Pantalla/tab: Calidad de datos, Tendencias.
- Prioridad: alta.
- Limitaciones: las categorias pueden solaparse; una sesion puede aparecer en varios faltantes.

### Contexto para check diario

- Pregunta: que resumen objetivo se puede copiar?
- Datos de entrada: check-in-context centralizado, objetivo, plan, sesiones, daily entries y calidad de datos.
- Unidad: texto plano.
- Pantalla/tab: Actual.
- Prioridad: alta.
- Limitaciones: no decide que hacer; solo empaqueta contexto.

## Propuestas siguientes

### Comparativa planificado vs realizado visual

- Pregunta: que diferencia hay entre intencion semanal y ejecucion real?
- Datos de entrada: planned_sessions y training_sessions.
- Unidad: sesiones.
- Pantalla/tab: Actual o Tendencias.
- Prioridad: media.
- Limitaciones: planned_sessions sigue siendo beta.

### Bandas de objetivo activo en graficas

- Pregunta: donde cae el dato real frente al rango del objetivo?
- Datos de entrada: goal_blocks.targets y datasets existentes.
- Unidad: depende de cada metrica.
- Pantalla/tab: Actual, Tendencias.
- Prioridad: futura.
- Limitaciones: requiere diseno cuidadoso para no convertir Analysis en entrenador.
