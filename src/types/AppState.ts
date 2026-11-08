import type { City } from "./City.ts";

export type TempUnit = "celsius" | "fahrenheit";

export interface AppState {
  defaultCity: string | null;
  cities: City[];
  unit: TempUnit;
}

export function emptyState(): AppState {
  return { defaultCity: null, cities: [], unit: "celsius" };
}
