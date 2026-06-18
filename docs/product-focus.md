# Hybrid OS - Foco de producto

Fecha: 2026-06-17

Este documento fija el foco real de Hybrid OS para evitar abrir frentes que no mejoran el uso actual.

## Decision principal

Hybrid OS no decide que hacer hoy.

Hybrid OS registra, ordena, visualiza y prepara contexto objetivo. La interpretacion diaria y la decision final viven en el check diario con ChatGPT.

## Producto nucleo

El producto nucleo es:

- registro de entrenamientos hibridos;
- importacion fiable desde `HybridOSAppInput`;
- historial completo y consultable;
- datos reales servidos desde Supabase;
- preservacion de `raw_imports`, `payload`, ejercicios y metricas historicas;
- Training Log rapido y fiable.

El valor principal esta en poder confiar en el historial: que cada sesion quede guardada, revisable y util para analisis posteriores.

## Producto de soporte

El producto de soporte es preparar datos objetivos para el check diario con ChatGPT.

Hybrid OS debe ayudar a responder:

- que se ha entrenado;
- como esta evolucionando el periodo;
- que senales objetivas conviene vigilar;
- que datos faltan;
- que contexto merece copiarse al check diario;
- que relacion hay entre objetivo, plan, ejecucion y estado reciente.

La app puede mostrar evidencia y contexto. No debe cerrar la decision diaria dentro de la interfaz.

## Que no es Hybrid OS

Hybrid OS no es:

- un entrenador autonomo;
- un planificador inteligente cerrado;
- una app completa de dieta;
- un calendario de vida;
- una IA runtime;
- una herramienta que prescribe que hacer hoy.

Cuando una pantalla empieza a comportarse como entrenador, agenda o asistente autonomo, se sale del foco actual.

## Relacion Hybrid OS - ChatGPT

Hybrid OS:

- registra;
- ordena;
- visualiza;
- resume;
- prepara contexto.

ChatGPT:

- interpreta;
- ajusta;
- decide;
- prioriza;
- responde al check diario.

La frontera es importante: Hybrid OS produce evidencia estructurada; ChatGPT convierte esa evidencia en decision contextual.

## Jerarquia de valor actual

1. Registro de entrenamientos: core validado.
2. Daily Plan: experimento con buena senal inicial.
3. Analysis y Dashboard: deben simplificarse hacia contexto util.
4. Goals: debe ser seguimiento de objetivo, no agenda.
5. Planning: beta/opcional.
6. Body, Nutrition, Google Drive y PWA: congelados.

## Criterio de prioridad

Una mejora debe tener prioridad si mejora una de estas dos cosas:

- registrar mejor el entrenamiento real;
- preparar mejor el check diario con ChatGPT.

Las pantallas que no hagan una de esas dos cosas pueden existir, pero ahora mismo son secundarias.

## Principio rector

"Si una pantalla no mejora el registro o el check diario, ahora mismo es secundaria."

