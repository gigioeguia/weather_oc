import type { City } from "../types/City.ts";
import { citiesStore } from "../storage/citiesStorage.ts";
import { ask, parseMenuNumber } from "../presentation/input.ts";
import { printError, printMessage } from "../presentation/output.ts";

export function printCityList(cities: City[]): void {
  cities.forEach((city, index) => {
    const isDefault = city.name === citiesStore.state.defaultCity ? " (default)" : "";
    console.log(`    ${index + 1}. ${city.name}${isDefault}`);
  });
}

export async function pickCity(verb: string): Promise<City | null> {
  const { cities } = citiesStore.state;
  if (cities.length === 0) {
    printMessage("No hay ciudades registradas.");
    return null;
  }
  printCityList(cities);
  const input = await ask(`  Número de ciudad a ${verb}: `);
  const index = parseMenuNumber(input, cities.length);
  if (!index) {
    printError("Número inválido.");
    return null;
  }
  const city = cities[index - 1];
  return city ?? null;
}
