# Hybrid OS - Visual State Audit

Fecha: 2026-06-11

Auditoria visual ligera generada en local con Dev Auth Bypass activo. No se hicieron escrituras en Supabase.

## Viewports

- Desktop: 1440 x 1100 px.
- Mobile: 390 x 844 px.
- Base local: `http://localhost:3000`.

## Capturas desktop

- `/`: [home-desktop-top.png](./screenshots/desktop/home-desktop-top.png), [home-desktop-bottom.png](./screenshots/desktop/home-desktop-bottom.png)
- `/dashboard`: [dashboard-desktop.png](./screenshots/desktop/dashboard-desktop.png), [dashboard-desktop-trends.png](./screenshots/desktop/dashboard-desktop-trends.png)
- `/training`: [training-log-desktop.png](./screenshots/desktop/training-log-desktop.png), [training-log-desktop-list.png](./screenshots/desktop/training-log-desktop-list.png)
- `/training/running`: [running-desktop.png](./screenshots/desktop/running-desktop.png), [running-desktop-trends-shoes.png](./screenshots/desktop/running-desktop-trends-shoes.png)
- `/muscle-load`: [muscle-load-desktop.png](./screenshots/desktop/muscle-load-desktop.png), [muscle-load-desktop-lower.png](./screenshots/desktop/muscle-load-desktop-lower.png)
- `/training/import`: [import-initial-desktop.png](./screenshots/desktop/import-initial-desktop.png), [import-preview-desktop.png](./screenshots/desktop/import-preview-desktop.png), [import-dry-run-desktop.png](./screenshots/desktop/import-dry-run-desktop.png), [import-error-desktop.png](./screenshots/desktop/import-error-desktop.png)
- `/training/running-2026-05-30-z2-5k`: [session-detail-running-desktop.png](./screenshots/desktop/session-detail-running-desktop.png), [session-detail-running-desktop-blocks.png](./screenshots/desktop/session-detail-running-desktop-blocks.png)
- `/training/hyrox-2026-06-09-am-partner-sled-wallball`: [session-detail-mixed-run-desktop.png](./screenshots/desktop/session-detail-mixed-run-desktop.png), [session-detail-mixed-run-desktop-blocks.png](./screenshots/desktop/session-detail-mixed-run-desktop-blocks.png)

## Capturas mobile

- `/`: [home-mobile.png](./screenshots/mobile/home-mobile.png)
- `/dashboard`: [dashboard-mobile.png](./screenshots/mobile/dashboard-mobile.png), [dashboard-mobile-trends.png](./screenshots/mobile/dashboard-mobile-trends.png)
- `/training`: [training-log-mobile.png](./screenshots/mobile/training-log-mobile.png)
- `/training/running`: [running-mobile.png](./screenshots/mobile/running-mobile.png)
- `/muscle-load`: [muscle-load-mobile.png](./screenshots/mobile/muscle-load-mobile.png), [muscle-load-mobile-lower.png](./screenshots/mobile/muscle-load-mobile-lower.png)
- `/training/import`: [import-mobile.png](./screenshots/mobile/import-mobile.png)

## Capturas no generadas

Todas las capturas solicitadas se generaron. Se anadieron capturas secundarias cuando una sola pantalla no mostraba secciones inferiores relevantes.

Nota tecnica: se evito usar `fullPage` para las capturas finales principales porque duplicaba elementos sticky del layout en algunas paginas. Las capturas finales usan viewports limpios y scroll manual.

## Observaciones rapidas

- Home y Dashboard se solapan en el resumen ejecutivo de semana activa: Home funciona como "centro de mando" y Dashboard como version ampliada, pero comparten lenguaje visual y parte de los KPIs.
- Dashboard tiene buena jerarquia de KPIs, tendencias y actividad secundaria, aunque la densidad en desktop es alta; las tarjetas pequenas con comparativas pueden competir visualmente entre si.
- Training Log es claro y operativo: filtros, resumen y lista se entienden bien. En mobile, los filtros empujan el listado bastante abajo.
- Running separa bien carrera total, running estructurado y carrera mixta. El texto ayuda, pero algunos usuarios podrian confundir "sesiones running" con exposicion total de carrera porque las sesiones mixtas aparecen en otra caja.
- Muscle Load es la pantalla mas rica: KPIs, ranking, ratios, alertas e insights estan presentes. La densidad es alta pero la jerarquia es mejor que en un dashboard generico.
- El importador es funcional y completo. En mobile, el textarea largo domina la pantalla y obliga a mucho scroll antes de ver preview o estados.
- El sidebar en desktop aporta contexto y navegacion rapida, pero suma ruido visual junto a topbar, badges y cards. El badge `Dev auth bypass` es visible y discreto.
- En mobile la navegacion queda recogida tras boton, lo cual reduce ruido. La accion `Importar` queda muy prominente en todas las rutas.
