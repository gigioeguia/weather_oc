# Revisión Weather CLI

-[x] **Colores:** ya definidos en `src/utils/colors.ts` (`ANSI`): cyan (menú), amarillo (temp), verde (ok), rojo (error).
-[x] **AGENTS.md:** ya actualizado — describe la app como fully functional (no menciona `index.ts` como stub).
-[x] **Ciudades:** ya resuelto — geocoding trae 5 resultados (`count=5`) con desambiguación interactiva; verificado con tests.
-[X] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
-[x] **Binario:** compila bien; el estado ahora se guarda en `~/.config/weather-cli/cities.json` (respecta `XDG_CONFIG_HOME` con fallback a `~/.config`), verificado empíricamente.
-[X] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
    Único cambio: editar ideas-revision.md para marcar el ítem como cubierto, con el resumen de evidencia:
    -[x] **Escalabilidad:** buena — menú data-driven (nueva feature = 1 action + 1 línea en menu.ts), capas desacopladas (actions/presentation/storage/api), estado retrocompatible vía normalizeState (campos nuevos no rompen cities.json viejos), fetchJson genérico por endpoint, infra de tests lista (stubFetch/simulateInput/captureOutput). Fricciones conocidas: firma rígida de MenuOption.label(count, symbol), error en http.ts hardcodea "OpenMeteo", sin submenúes (innecesario hoy).
-[x] **Carga:** sí — las 3 tareas de red (geocoding, clima, pronóstico) usan `withSpinner` (mínimo 400ms, fallback a rótulo en pipes); el clima de todas muestra progreso `(i/N)`; timeout HTTP de 10s acota la espera; las tareas locales de storage no llevan spinner por diseño (I/O instantáneo).
-[x] **7 day forecast:** ya implementado — opción 6 del menú (`fetchDailyForecast` en `src/api/weather.ts`), con spinner, colores y tests.

## CheckList adicional de revision:
-[] ¿Usaron ramas?
-[] ¿Usaron pull request?
-[] ¿Que pasa si tras un nuevo feature, se rompio otra cosas?
-[] ¿Hicieron el testing? ¿Que probaron?
-[] ¿su modelo instalos depentencies ¿Que dependencias instalo? ¿Estan de acuerdo?
-[] ¿Comprendel el codigo? ¿Que es lo que hace? ¿Que es lo que no hace?