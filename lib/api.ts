import type { City, TempUnit } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }[];
}

interface ForecastResponse {
  current?: Partial<Record<"temperature_2m", number>>;
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export interface GeocodeCandidate {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export interface DailyEntry {
  date: string;
  max: number;
  min: number;
}

export async function geocodeCityCandidates(name: string): Promise<GeocodeCandidate[]> {
  const params = new URLSearchParams({ name, count: "5", language: "es", format: "json" });
  const data = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`);
  const results = data.results ?? [];
  return results.map((result) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    admin1: result.admin1,
    country: result.country,
  }));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al consultar OpenMeteo`);
  }
  return (await response.json()) as T;
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
