import { fetchJson } from "./http.ts";
import type { TempUnit } from "../types/AppState.ts";
import type { City } from "../types/City.ts";
import type { DailyEntry } from "../types/Weather.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

interface ForecastResponse {
  current?: Partial<Record<"temperature_2m", number>>;
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export async function fetchCurrentTemperature(
  latitude: number,
  longitude: number,
  unit: TempUnit,
): Promise<number> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m",
    temperature_unit: unit,
  });
  const data = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params}`);
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") {
    throw new Error("La respuesta de OpenMeteo no incluye la temperatura actual");
  }
  return temperature;
}

export async function fetchDailyForecast(
  latitude: number,
  longitude: number,
  unit: TempUnit,
  days = 7,
): Promise<DailyEntry[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: unit,
    forecast_days: String(days),
  });
  const data = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params}`);
  const { time, temperature_2m_max: maxes, temperature_2m_min: mins } = data.daily ?? {};
  if (!time || !maxes || !mins) {
    throw new Error("La respuesta de OpenMeteo no incluye el pronóstico diario");
  }
  return time.map((date, i) => ({
    date,
    max: maxes[i] as number,
    min: mins[i] as number,
  }));
}

export async function getWeatherFor(city: City, unit: TempUnit): Promise<number> {
  return fetchCurrentTemperature(city.latitude, city.longitude, unit);
}
