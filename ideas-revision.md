# Revisión Weather CLI

-[x] **Colores:** ya definidos en `lib/ui.ts` (`ANSI`): cyan (menú), amarillo (temp), verde (ok), rojo (error).
-[x] **AGENTS.md:** ya actualizado — describe la app como fully functional (no menciona `index.ts` como stub).
-[x] **Ciudades:** ya resuelto — geocoding trae 5 resultados (`count=5`) con desambiguación interactiva; verificado con tests.
-[] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
-[x] **Binario:** compila bien; el estado ahora se guarda en `~/.config/weather-cli/cities.json` (respecta `XDG_CONFIG_HOME` con fallback a `~/.config`), verificado empíricamente.
-[] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
-[] **Carga:** ¿hay estado de carga en las tareas asíncronas?
-[x] **7 day forecast:** ya implementado — opción 6 del menú (`fetchDailyForecast` en `lib/api.ts`), con spinner, colores y tests.

## CheckList adicional de revision:
-[] ¿Usaron ramas?
-[] ¿Usaron pull request?
-[] ¿Que pasa si tras un nuevo feature, se rompio otra cosas?
-[] ¿Hicieron el testing? ¿Que probaron?
-[] ¿su modelo instalos depentencies ¿Que dependencias instalo? ¿Estan de acuerdo?
-[] ¿Comprendel el codigo? ¿Que es lo que hace? ¿Que es lo que no hace?