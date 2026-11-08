import { fetchJson } from "./http.ts";
import type { GeocodeCandidate } from "../types/Weather.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }[];
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
