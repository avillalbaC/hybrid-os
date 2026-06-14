# Hybrid OS - Decision Refactor Review

Fecha: 2026-06-14

Revision de la iteracion "Dashboard decision refactor + Analysis route". No incluye cambios de schema, Auth, RLS, contratos JSON ni importador.

## Diagnostico previo

- Dashboard concentraba demasiadas capas: periodo actual, tendencias completas, analisis global, informes, calidad de datos, actividad secundaria, ranking muscular y comparativas.
- Home ya era util, pero aun podia competir con Dashboard al mostrar demasiadas piezas secundarias.
- Running y Muscle Load tenian buen foco tras el ajuste anterior; faltaba dejar claro que el analisis global vive fuera de esas pantallas.

## Que se movio desde Dashboard a Analysis

- Informes semanales y mensuales largos.
- Tendencias completas.
- Evidencias completas de insights.
- Calidad de datos.
- Lectura profunda del periodo.

## Que quedo en Dashboard

- Selector de periodo, badge de fuente y accion de importar.
- KPIs principales: sesiones, carrera total, duracion, RPE medio y fatiga.
- Lectura del periodo con evidencias cortas.
- Riesgos principales.
- Una decision recomendada.
- Tendencias clave.
- Preview de ultimo informe semanal y mensual.
- Distribucion compacta por disciplinas y actividad secundaria.

## Como queda Home

- Estado actual con mini KPIs en hero.
- Ultimo entrenamiento.
- Analisis rapido.
- Que vigilar.
- Proxima accion.
- Accesos a Dashboard, Analysis, importador, log, Running y Muscle Load.

## Como queda Analysis

- Nueva ruta `/analysis`.
- Tabs locales: Actual, Semanas, Meses, Tendencias y Calidad de datos.
- Usa `useDashboardData()` y `/api/dashboard-data`; no crea API nueva.
- Informes semanales y mensuales aparecen colapsados por defecto.
- Tendencias aparecen agrupadas por bloques.

## Duplicidades eliminadas

- Dashboard ya no muestra informes completos uno detras de otro.
- Dashboard ya no muestra todas las tendencias.
- Home ya no muestra tendencias, mix, top muscular ni actividad secundaria.
- Running y Muscle Load mantienen lectura especializada y enlazan a Analysis para contexto global.

## Limitaciones

- Las tabs de Analysis son estado local; no hay query params todavia.
- La decision recomendada usa la primera recomendacion determinista disponible; no hay objetivo activo del bloque.
- Calidad de datos es historica e informativa, no persiste diagnosticos.
- No se anadio test framework formal.

## Observaciones mobile

- Home deberia quedar sensiblemente mas corto.
- Dashboard mantiene varias secciones, pero con lectura y decision antes que informes profundos.
- Analysis puede ser largo por diseno, con informes colapsados y tabs horizontales.
- Capturas mobile generadas para Home, Dashboard, Analysis, Running y Muscle Load.
- La comprobacion automatica no detecto overflow horizontal en rutas revisadas.

## Capturas generadas

Directorio: `docs/audit/screenshots/decision-refactor/`

Desktop:

- `home-decision-desktop.png`
- `dashboard-decision-desktop.png`
- `analysis-actual-desktop.png`
- `analysis-weeks-desktop.png`
- `analysis-months-desktop.png`
- `analysis-trends-desktop.png`
- `analysis-data-quality-desktop.png`
- `running-focused-desktop.png`
- `muscle-load-focused-desktop.png`

Mobile:

- `home-decision-mobile.png`
- `dashboard-decision-mobile.png`
- `analysis-mobile.png`
- `running-focused-mobile.png`
- `muscle-load-focused-mobile.png`

## Validacion

- `npm run lint`: pasa.
- `npm run build`: pasa.
- Revision manual en navegador: `/`, `/dashboard`, `/analysis` con tabs Actual/Semanas/Meses/Tendencias/Calidad de datos, `/training/running`, `/muscle-load`, `/training` y `/training/import`.
- Nota: build muestra avisos no bloqueantes de Supabase sobre Node.js 18 deprecated.

## Post-refactor polish

Fecha: 2026-06-14

- Analysis mobile: tabs convertidas a grid de 2 columnas para evitar scrollbar horizontal nativa.
- Copy tecnico: `Sin IA runtime` se sustituye por `Informes automaticos`; los badges principales pasan a `Datos reales` donde aporta mas claridad.
- Dashboard: `Decision recomendada` queda estructurada en accion principal, por que, priorizar y evitar.
- Warnings: las tarjetas de vigilancia muestran evidencia concreta y accion recomendada cuando existe.
- Calidad de datos: se anade `Prioridad de mejora de datos` con maximo 3 acciones orientadas a mejorar el analisis, no a completar todo el historico.
- Capturas post-polish: no generadas en esta pasada porque el canal de screenshot del navegador integrado fallo por timeout de CDP incluso con recortes pequenos y pestanas nuevas. Las rutas se verificaron por HTTP y lint/build pasan.
