# Hybrid OS - Running Analytics

Fecha: 2026-06-18

## Objetivo

`/training/running` muestra contexto especifico de carrera sobre datos reales de entrenamiento. La pantalla no actua como entrenador y no decide que hacer hoy; prepara evidencia objetiva para el check diario.

## Definiciones

- Running estructurado: kilometros de sesiones con `type === "running"`.
- Carrera mixta: distancia de carrera registrada dentro de sesiones que no son running puro, por ejemplo HYROX, CrossFit, mixed o actividad funcional con `running_distance_meters`.
- Carrera total: running estructurado + carrera mixta.
- Sesiones no-running: sesiones con `type !== "running"`, incluidas CrossFit, HYROX, fuerza, halterofilia, gimnasticos, movilidad, actividad funcional y mixed.

## Carga no-running

La carga no-running se calcula solo con sesiones `type !== "running"`.

Preferencia de metrica por sesion:

1. `fatigueCost`, cuando existe como valor positivo.
2. `duration_minutes * rpe`, cuando hay duracion y RPE.
3. `duration_minutes`, cuando no hay RPE.
4. `0`, cuando no hay dato suficiente.

La carga no-running excluye sesiones running puras, aunque una sesion no-running puede contener carrera mixta.

## Normalizacion

La vista usa las ultimas 12 semanas visibles.

`nonRunningLoadNormalized` se calcula dividiendo la carga no-running raw de cada semana entre el maximo raw del rango visible.

- Si el maximo raw es 0, todas las semanas quedan en 0.
- El valor normalizado se usa solo como indice visual relativo.
- No equivale a kilometros y no debe leerse como conversion entre fuerza/HYROX/CrossFit y carrera.

Etiquetas:

- `baja`: 0 a 0.25
- `moderada`: >0.25 a 0.55
- `alta`: >0.55 a 0.8
- `muy alta`: >0.8

## Grafica principal

La card "Carga semanal y carrera" aparece arriba de `/training/running`, debajo del header y antes de los KPIs.

Muestra:

- eje Y en kilometros de carrera;
- barras cyan para running estructurado;
- barras teal para carrera mixta;
- sombreado ambar como carga no-running normalizada;
- leyenda explicita;
- detalle por semana con carrera total, split, sesiones no-running, duracion no-running, RPE medio y etiqueta de carga relativa.

Regla clave: el eje Y solo aplica a kilometros de carrera. El sombreado ambar indica carga no-running relativa y no equivale a kilometros.

## Lectura objetiva

La card "Contexto de carrera" debe limitarse a senales descriptivas:

- carrera total frente a referencia reciente;
- split running estructurado / carrera mixta;
- contexto de carga no-running;
- progresion semanal;
- datos insuficientes.

Lenguaje permitido:

- "se observa";
- "dato relevante";
- "carga no-running alta";
- "util para valorar en check diario";
- "senal de contexto";
- "dato insuficiente".

Lenguaje a evitar:

- ordenes de entrenamiento;
- recomendaciones cerradas;
- conversiones de carga no-running a kilometros;
- mensajes que hagan parecer que Hybrid OS decide la sesion del dia.

## Limitaciones

- La carga no-running es un indice relativo dentro del rango visible, no una unidad fisiologica absoluta.
- Si falta RPE, duracion, FC media o zapatillas, la lectura muestra datos insuficientes.
- La carrera mixta cuenta como exposicion e impacto, pero no como running tecnico.
- El contexto copiable esta pensado para pegarse fuera de la app en el check diario.
