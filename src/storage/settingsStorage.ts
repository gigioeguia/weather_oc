import type { AppState, TempUnit } from "../types/AppState.ts";
import { defaultStatePath, saveState } from "./citiesStorage.ts";

// Actualiza la unidad y persiste el estado completo del store (única fuente de verdad)
export async function setUnit(
  state: AppState,
  unit: TempUnit,
  filePath = defaultStatePath(),
): Promise<void> {
  state.unit = unit;
  await saveState(filePath, state);
}
