import { existsSync } from "node:fs";
import type { AppState, TempUnit } from "./types.ts";
import { emptyState } from "./types.ts";

export const STATE_FILE = "cities.json";

function isCity(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const city = value as Record<string, unknown>;
  return (
    typeof city.name === "string" &&
    typeof city.latitude === "number" &&
    typeof city.longitude === "number"
  );
}

function normalizeState(value: unknown): AppState {
  const empty = emptyState();
  if (typeof value !== "object" || value === null) return empty;
  const raw = value as Record<string, unknown>;
  const unit: TempUnit = raw.unit === "fahrenheit" ? "fahrenheit" : "celsius";
  const cities = Array.isArray(raw.cities) ? raw.cities.filter(isCity) : [];
  const defaultCity =
    typeof raw.defaultCity === "string" &&
    cities.some((city) => city.name === raw.defaultCity)
      ? raw.defaultCity
      : null;
  return { defaultCity, cities: cities as AppState["cities"], unit };
}

export async function loadState(filePath: string): Promise<AppState> {
  const file = Bun.file(filePath);
  try {
    return normalizeState(await file.json());
  } catch (error) {
    if (existsSync(filePath)) {
      console.error(`No se pudo leer ${filePath}, se inicia con lista vacía`);
      console.error(String(error));
    }
    return emptyState();
  }
}

export async function saveState(filePath: string, state: AppState): Promise<void> {
  await Bun.write(filePath, JSON.stringify(state, null, 2) + "\n");
}
