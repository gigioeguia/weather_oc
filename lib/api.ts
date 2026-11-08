import type { City, TempUnit } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
  }[];
}

interface ForecastResponse {
  current?: Partial<Record<"temperature_2m", number>>;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al consultar OpenMeteo`);
  }
  return (await response.json()) as T;
}

export async function geocodeCity(name: string): Promise<City | null> {
  const params = new URLSearchParams({ name, count: "1", language: "es", format: "json" });
  const data = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`);
  const first = data.results?.[0];
  if (!first) return null;
  return { name: first.name, latitude: first.latitude, longitude: first.longitude };
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

export async function getWeatherFor(city: City, unit: TempUnit): Promise<number> {
  return fetchCurrentTemperature(city.latitude, city.longitude, unit);
}
