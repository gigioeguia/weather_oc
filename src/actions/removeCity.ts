import { citiesStore } from "../storage/citiesStorage.ts";
import { pickCity } from "./listCities.ts";
import { printSuccess } from "../presentation/output.ts";

export async function removeCity(): Promise<void> {
  const city = await pickCity("eliminar");
  if (!city) return;
  await citiesStore.removeCity(city.name);
  printSuccess(`Ciudad eliminada: ${city.name}`);
}
