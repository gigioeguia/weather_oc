import type { TempUnit } from "../types/AppState.ts";

export function unitSymbol(unit: TempUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatTemp(temperature: number, unit: TempUnit): string {
  return `${Math.round(temperature * 10) / 10}${unitSymbol(unit)}`;
}
