import { APP_TITLE } from "../utils/constants.ts";
import { citiesStore } from "../storage/citiesStorage.ts";
import { unitSymbol } from "../utils/format.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { showAllCitiesWeather, showDefaultCityWeather, showSevenDayForecast } from "../actions/getWeather.ts";
import { addCity } from "../actions/addCity.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { toggleUnit } from "../actions/toggleUnit.ts";
import { ask, isClosed } from "./input.ts";
import { printBanner, printError, printMessage } from "./output.ts";

const menu: MenuOption[] = [
  { key: "1", label: () => "Clima de ciudad default", run: showDefaultCityWeather },
  { key: "2", label: (count) => `Clima de todas las ciudades (${count})`, run: showAllCitiesWeather },
  { key: "3", label: () => "Buscar y agregar ciudad", run: addCity },
  { key: "4", label: () => "Eliminar ciudad", run: removeCity },
  { key: "5", label: () => "Establecer ciudad default", run: setDefaultCity },
  { key: "6", label: () => "Pronóstico de 7 días", run: showSevenDayForecast },
  { key: "8", label: (_count, symbol) => `Ajustes (${symbol})`, run: toggleUnit },
  { key: "9", label: () => "Salir", run: exitApp },
];

function printMenu(): void {
  const count = citiesStore.state.cities.length;
  const symbol = unitSymbol(citiesStore.state.unit);
  for (const option of menu) {
    console.log(`  ${option.key}. ${option.label(count, symbol)}`);
  }
}

async function exitApp(): Promise<void> {
  printMessage("¡Hasta luego!");
  process.exit(0);
}

async function dispatch(input: string): Promise<void> {
  const option = menu.find((entry) => entry.key === input);
  if (!option) {
    printError("Opción inválida.");
    return;
  }
  await option.run();
}

export async function runMenu(): Promise<void> {
  await citiesStore.load();
  printBanner(APP_TITLE);
  while (true) {
    printMenu();
    const input = await ask("  Selecciona una opción: ");
    if (!input) {
      if (isClosed()) {
        printMessage("¡Hasta luego!");
        break;
      }
      printError("Opción inválida.");
      continue;
    }
    await dispatch(input);
    if (isClosed()) break;
    printBanner(APP_TITLE);
  }
}
