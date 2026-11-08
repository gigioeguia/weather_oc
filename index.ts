import { geocodeCity, getWeatherFor } from "./lib/api.ts";
import { createStore } from "./lib/cities.ts";
import {
  ask,
  isClosed,
  printBanner,
  printMessage,
  printWeather,
} from "./lib/ui.ts";
import type { City } from "./lib/types.ts";

const APP_TITLE = "WEATHER CLI";

interface Menu {
  key: string;
  label: (allCitiesCount: number, unitSymbol: string) => string;
  run: () => Promise<void>;
}

const store = createStore();

function printCityList(cities: City[]): void {
  cities.forEach((city, index) => {
    const isDefault = city.name === store.state.defaultCity ? " (default)" : "";
    console.log(`    ${index + 1}. ${city.name}${isDefault}`);
  });
}

function parseMenuNumber(input: string, max: number): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1 || value > max) return null;
  return value;
}

async function showDefaultCityWeather(): Promise<void> {
  const city = store.defaultCity();
  if (!city) {
    printMessage("No hay ciudad default. Agrega una con la opción 3.");
    return;
  }
  await showWeatherFor(city);
}

async function showWeatherFor(city: City): Promise<void> {
  try {
    const temperature = await getWeatherFor(city, store.state.unit);
    printWeather(city.name, temperature, store.state.unit);
  } catch (error) {
    printMessage(`No se pudo obtener el clima de ${city.name}: ${String(error)}`);
  }
}

async function showAllCitiesWeather(): Promise<void> {
  const { cities } = store.state;
  if (cities.length === 0) {
    printMessage("No hay ciudades registradas. Agrega una con la opción 3.");
    return;
  }
  console.log("");
  for (const city of cities) {
    await showWeatherFor(city);
  }
}

async function addCity(): Promise<void> {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) {
    printMessage("Debes escribir un nombre.");
    return;
  }
  try {
    const city = await geocodeCity(name);
    if (!city) {
      printMessage(`No se encontró "${name}". Intenta con otro nombre.`);
      return;
    }
    const added = await store.addCity(city);
    if (!added) {
      printMessage(`${city.name} ya está registrada.`);
      return;
    }
    printMessage(`Ciudad agregada: ${city.name} (${city.latitude}, ${city.longitude})`);
  } catch (error) {
    printMessage(`No se pudo buscar "${name}": ${String(error)}`);
  }
}

async function pickCity(verb: string): Promise<City | null> {
  const { cities } = store.state;
  if (cities.length === 0) {
    printMessage("No hay ciudades registradas.");
    return null;
  }
  printCityList(cities);
  const input = await ask(`  Número de ciudad a ${verb}: `);
  const index = parseMenuNumber(input, cities.length);
  if (!index) {
    printMessage("Número inválido.");
    return null;
  }
  const city = cities[index - 1];
  return city ?? null;
}

async function removeCity(): Promise<void> {
  const city = await pickCity("eliminar");  if (!city) return;
  await store.removeCity(city.name);
  printMessage(`Ciudad eliminada: ${city.name}`);
}

async function setDefaultCity(): Promise<void> {
  const city = await pickCity("establecer como default");
  if (!city) return;
  await store.setDefault(city.name);
  printMessage(`Ciudad default: ${city.name}`);
}

async function toggleUnit(): Promise<void> {
  const next = store.state.unit === "celsius" ? "fahrenheit" : "celsius";
  await store.setUnit(next);
  printMessage(`Unidad de temperatura: ${next === "celsius" ? "°C" : "°F"}`);
}

async function exitApp(): Promise<void> {
  printMessage("¡Hasta luego!");
  process.exit(0);
}

const menu: Menu[] = [
  { key: "1", label: () => "Clima de ciudad default", run: showDefaultCityWeather },
  { key: "2", label: (count) => `Clima de todas las ciudades (${count})`, run: showAllCitiesWeather },
  { key: "3", label: () => "Buscar y agregar ciudad", run: addCity },
  { key: "4", label: () => "Eliminar ciudad", run: removeCity },
  { key: "5", label: () => "Establecer ciudad default", run: setDefaultCity },
  { key: "8", label: (_count, unitSymbol) => `Ajustes (${unitSymbol})`, run: toggleUnit },
  { key: "9", label: () => "Salir", run: exitApp },
];

function printMenu(): void {
  const unitSymbol = store.state.unit === "celsius" ? "°C" : "°F";
  for (const item of menu) {
    console.log(`  ${item.key}. ${item.label(store.state.cities.length, unitSymbol)}`);
  }
}

async function main(): Promise<void> {
  await store.load();
  printBanner(APP_TITLE);
  while (true) {
    printMenu();
    const input = await ask("  Selecciona una opción: ");
    if (!input) {
      if (isClosed()) {
        printMessage("¡Hasta luego!");
        break;
      }
      printMessage("Opción inválida.");
      continue;
    }
    const item = menu.find((entry) => entry.key === input);
    if (!item) {
      printMessage("Opción inválida.");
      continue;
    }
    await item.run();
    if (isClosed()) break;
    printBanner(APP_TITLE);
  }
}

main().catch((error) => {
  console.error(`Error inesperado: ${String(error)}`);
  process.exit(1);
});
