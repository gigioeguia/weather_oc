import type { AppState, City } from "./types.ts";
import { emptyState } from "./types.ts";
import { defaultStatePath, loadState, saveState } from "./storage.ts";

export interface CitiesStore {
  state: AppState;
  load(): Promise<void>;
  addCity(city: City): Promise<boolean>;
  removeCity(name: string): Promise<boolean>;
  setDefault(name: string): Promise<boolean>;
  setUnit(unit: AppState["unit"]): Promise<void>;
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

  async setUnit(unit: AppState["unit"]): Promise<void> {
    this.state.unit = unit;
    await saveState(this.filePath, this.state);
  }

  defaultCity(): City | null {
    if (!this.state.defaultCity) return null;
    return this.state.cities.find((city) => city.name === this.state.defaultCity) ?? null;
  }
}

export function createStore(filePath?: string): CitiesStore {
  return new FileCitiesStore(filePath ?? defaultStatePath());
}
