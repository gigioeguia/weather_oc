import { fetchDailyForecast, getWeatherFor } from "../api/weather.ts";
import { citiesStore } from "../storage/citiesStorage.ts";
import { pickCity } from "./listCities.ts";
import { printError, printMessage, printWeather, withSpinner } from "../presentation/output.ts";
import { formatTemp } from "../utils/format.ts";
import { ANSI } from "../utils/colors.ts";
import type { City } from "../types/City.ts";

export async function showWeatherFor(city: City): Promise<void> {
  try {
    const temperature = await withSpinner(`Consultando el clima de ${city.name}`, () =>
      getWeatherFor(city, citiesStore.state.unit),
    );
    printWeather(city.name, temperature, citiesStore.state.unit);
  } catch (error) {
    printError(`No se pudo obtener el clima de ${city.name}: ${String(error)}`);
  }
}

export async function showDefaultCityWeather(): Promise<void> {
  const city = citiesStore.defaultCity();
  if (!city) {
    printMessage("No hay ciudad default. Agrega una con la opción 3.");
    return;
  }
  await showWeatherFor(city);
}

export async function showAllCitiesWeather(): Promise<void> {
  const { cities } = citiesStore.state;
  if (cities.length === 0) {
    printMessage("No hay ciudades registradas. Agrega una con la opción 3.");
    return;
  }
  console.log("");
  for (const city of cities) {
    await showWeatherFor(city);
  }
}

export async function showSevenDayForecast(): Promise<void> {
  const city = await pickCity("consultar pronóstico de 7 días");
  if (!city) return;
  try {
    const entries = await withSpinner(`Consultando pronóstico de ${city.name}`, () =>
      fetchDailyForecast(city.latitude, city.longitude, citiesStore.state.unit),
    );
    console.log(`\n  Pronóstico de 7 días para ${city.name}:`);
    for (const entry of entries) {
      const maxTemp = ANSI.yellow(formatTemp(entry.max, citiesStore.state.unit));
      const minTemp = ANSI.cyan(formatTemp(entry.min, citiesStore.state.unit));
      console.log(`    ${entry.date}  Max: ${maxTemp}  Min: ${minTemp}`);
    }
    console.log("");
  } catch (error) {
    printError(`No se pudo obtener el pronóstico de ${city.name}: ${String(error)}`);
  }
}
