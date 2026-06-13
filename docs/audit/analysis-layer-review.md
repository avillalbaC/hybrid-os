# Hybrid OS - Analysis Layer Review

Fecha: 2026-06-13

Revision post-implementacion de la primera capa determinista de analisis. Se uso Dev Auth Bypass local/Codex y datos reales servidos por las APIs locales. No se hicieron escrituras en Supabase.

## Secciones nuevas detectadas

- Home: `Analisis rapido`, con headline, tres senales maximas y una accion.
- Dashboard: `Analisis de datos`, `Que vigilar`, `Que va bien`, `Siguiente decision` y `Resumenes de periodo`.
- Running: `Lectura de carrera`.
- Muscle Load: `Lectura muscular avanzada`.
- Informes dinamicos: semanales y mensuales desde `lib/analytics/period-reports.ts`.

## Que funciona bien

- La arquitectura ya separa metricas, tendencias, insights e informes.
- Cada insight muestra evidencia concreta y recomendacion accionable.
- Dashboard es el sitio correcto para el analisis completo: mezcla carga, running, musculo, calidad de datos y reportes.
- Home queda como resumen ejecutivo: no lista informes ni todas las alertas.
- Running separa carrera total, running estructurado y carrera mixta sin mezclar volumen por zapatilla.
- Muscle Load aporta lectura muscular sobre ranking/ratios existentes, especialmente gemelos, core/lumbar y patrones.

## Que se repite

- Dashboard y Muscle Load pueden compartir insights musculares como `Gemelos cargados con carrera relevante`.
- Home toma las primeras senales de Dashboard; esto es aceptable mientras siga limitado a 3 senales y 1 accion.
- Antes del ajuste, Running tambien podia mostrar insights musculares y de calidad de datos; ahora se limita a carrera y casos directamente vinculados.

## Que es demasiado denso

- Dashboard en mobile exige pasar muchas KPIs antes del analisis. Se mantiene por jerarquia de producto, pero la captura debe apuntar al bloque de analisis.
- Dashboard desktop tiene alta densidad cuando se ven KPIs, analisis y sidebar de warnings a la vez.
- Muscle Load sigue siendo la pantalla mas densa, aunque la lectura avanzada ayuda a priorizar antes del ranking completo.
- Running mobile dejaba la lectura de carrera demasiado abajo; se ajusto el orden responsive para colocarla antes de la tabla/lista de sesiones.

## Mensajes utiles

- `Impacto por encima de referencia`: combina valor actual, media reciente y cambio porcentual.
- `Carrera total en subida brusca`: diferencia exposicion total frente a referencia reciente.
- `Carrera sin running estructurado`: evidencia sesiones running, carrera mixta y porcentaje mixto.
- `Gemelos cargados con carrera relevante`: une exposicion de carrera y top muscular.
- `Pádel como carga secundaria real`: evita convertir padel en running y lo suma como fatiga/impacto.

## Mensajes debiles o a vigilar

- `Sin recuperacion explicita` puede ser util, pero no debe convertirse en alarma. Se mantiene como `info`.
- `Musculos poco estimulados` puede ser generico si no hay objetivo de equilibrio. Se mantiene como `info`.
- `Fuerza poco representada` puede ser ruido en semanas claramente de running. Se mantiene como `info` y no se muestra en Running.
- `Datos parciales` aparece a menudo porque muchas sesiones historicas estan marcadas como partial; es util para precision, no para decision de carga.

## Ubicacion por pantalla

Home debe quedarse con:
- 1 headline.
- Hasta 3 senales principales.
- 1 accion recomendada.
- Sin informes ni listas largas.

Dashboard debe quedarse con:
- Estado global.
- Warnings, positives y recomendaciones completas.
- Tendencias.
- Resumenes semanales/mensuales.
- Calidad de datos.

Running debe quedarse con:
- Running estructurado.
- Carrera mixta.
- Exposicion total.
- Zapatillas cuando aplique.
- HYROX sin running estructurado cuando afecte a progresion de carrera.

Muscle Load debe quedarse con:
- Musculos dominantes.
- Gemelos/aductores/core/lumbar.
- Empuje/traccion y tren inferior/superior.
- Sesiones clave y ratios.

## Ajustes aplicados

- Running mobile: `Lectura de carrera` sube antes de la lista de sesiones en mobile; desktop mantiene dos columnas.
- Running UI: ya no muestra insights musculares/globales dentro de `Lectura de carrera`; solo running y casos directamente vinculados.
- Muscle Load UI: `Lectura muscular avanzada` ya no incluye recovery/data_quality; se centra en categoria `muscle`.
- `critical` en subida de carrera, fatiga e impacto se hizo mas estricto.
- Estado global `alta_carga` ya no se activa por un unico warning de carrera; requiere critical real o combinacion de fatiga, impacto y RPE.
- Concentracion muscular exige carga total minima para evitar falsos positivos en semanas pequenas.
- Sesgo tren inferior no se marca en semanas puramente running.
- Se anadio insight `Semana orientada a fuerza` para no tratar baja carrera como problema cuando el periodo es de fuerza.

## Thresholds ajustados

| Regla | Antes | Ahora | Motivo | Ejemplo real afectado |
| --- | --- | --- | --- | --- |
| Carrera total subida brusca | `warning >= 25%`, `critical >= 45%` | `warning >= 25%`; `critical` solo si `>= 80%` + impacto `>= 260` + RPE medio `>= 8` + gemelos top 5 | Critical debe ser raro y no salir por carrera aislada | Semana actual: carrera +185%, impacto 358, RPE 7.2. Antes podia empujar `alta_carga`; ahora queda `vigilar`. |
| Fatiga semanal en subida | `critical >= 45%` o muchas sesiones RPE alto | `critical` solo si `>= 60%` + RPE medio `>= 8` + impacto `>= 220` | Evitar que una subida de fatiga sin contexto sea alarma | Mantiene warning accionable si sube fatiga, reserva critical para acumulacion clara. |
| Impacto por encima de referencia | `critical >= 45%` | `critical` solo si `>= 60%` + impacto `>= 260` + al menos 50% sesiones RPE alto | Impacto alto necesita intensidad/contexto para ser critical | Semana actual: impacto +44%, queda warning. |
| Fatiga alta + RPE alto | `critical` si fatiga `>= 260` | `critical` si fatiga `>= 300` e impacto `>= 240` | Fatiga alta sin impacto alto no siempre requiere alarma maxima | Reduce falsos positives en semanas exigentes pero controladas. |
| Concentracion top 3 muscular | top 3 `> 45%` siempre | top 3 `> 45%` solo si carga muscular total `>= 500` | Evitar warnings en semanas pequenas o fixtures de baja carga | Fixture `normalStructuredRunningWeek` queda sin warning exagerado. |
| Sesgo tren inferior | tren inferior `> upper +25%` siempre | solo si hay sesiones no-running principales | En running puro, sesgo inferior es esperado | Fixture running normal no marca warning de tren inferior. |

## Propuesta de ajustes futuros

- Separar recomendaciones por pantalla con versiones corta/larga.
- Anadir objetivo activo del bloque para evitar insights tipo fuerza/running cuando no aplican.
- Revisar si `partial` debe ser calidad de datos por periodo o solo aviso contextual.
- Crear tests formales si se incorpora Vitest u otro framework en una iteracion futura.
