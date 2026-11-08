export type TempUnit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export interface AppState {
  defaultCity: string | null;
  cities: City[];
  unit: TempUnit;
}

export function emptyState(): AppState {
  return { defaultCity: null, cities: [], unit: "celsius" };
}
