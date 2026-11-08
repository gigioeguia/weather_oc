import { citiesStore } from "../storage/citiesStorage.ts";
import { pickCity } from "./listCities.ts";
import { printSuccess } from "../presentation/output.ts";

export async function setDefaultCity(): Promise<void> {
  const city = await pickCity("establecer como default");
  if (!city) return;
  await citiesStore.setDefault(city.name);
  printSuccess(`Ciudad default: ${city.name}`);
}
