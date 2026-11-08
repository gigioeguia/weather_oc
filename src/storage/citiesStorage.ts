import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { AppState, TempUnit } from "../types/AppState.ts";
import { emptyState } from "../types/AppState.ts";
import type { City } from "../types/City.ts";

export function defaultStatePath(): string {
  const configDir = Bun.env.XDG_CONFIG_HOME?.trim() || join(homedir(), ".config");
  return join(configDir, "weather-cli", "cities.json");
}

export interface CitiesStore {
  state: AppState;
  load(): Promise<void>;
  addCity(city: City): Promise<boolean>;
  removeCity(name: string): Promise<boolean>;
  setDefault(name: string): Promise<boolean>;
  defaultCity(): City | null;
}

class FileCitiesStore implements CitiesStore {
  state: AppState = emptyState();

  constructor(private readonly filePath = defaultStatePath()) {}

  async load(): Promise<void> {
    this.state = await loadState(this.filePath);
  }

  isRegistered(name: string): boolean {
    return this.state.cities.some((city) => city.name.toLowerCase() === name.toLowerCase());
  }

  async addCity(city: City): Promise<boolean> {
    if (this.isRegistered(city.name)) return false;
    this.state.cities.push(city);
    if (!this.state.defaultCity) this.state.defaultCity = city.name;
    await saveState(this.filePath, this.state);
    return true;
  }

  async removeCity(name: string): Promise<boolean> {
    const index = this.state.cities.findIndex((city) => city.name === name);
    if (index === -1) return false;
    this.state.cities.splice(index, 1);
    if (this.state.defaultCity === name) {
      this.state.defaultCity = this.state.cities[0]?.name ?? null;
    }
    await saveState(this.filePath, this.state);
    return true;
  }

  async setDefault(name: string): Promise<boolean> {
    if (!this.isRegistered(name)) return false;
    this.state.defaultCity = name;
    await saveState(this.filePath, this.state);
    return true;
  }

  defaultCity(): City | null {
    if (!this.state.defaultCity) return null;
    return this.state.cities.find((city) => city.name === this.state.defaultCity) ?? null;
  }
}

export function createCitiesStore(filePath?: string): CitiesStore {
  return new FileCitiesStore(filePath ?? defaultStatePath());
}

export const citiesStore = createCitiesStore();

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
  mkdirSync(dirname(filePath), { recursive: true });
  await Bun.write(filePath, JSON.stringify(state, null, 2) + "\n");
}
