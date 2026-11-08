import { geocodeCityCandidates } from "../api/geocoding.ts";
import { citiesStore } from "../storage/citiesStorage.ts";
import { ask, parseMenuNumber } from "../presentation/input.ts";
import {
  describeCandidate,
  printError,
  printMessage,
  printSuccess,
  withSpinner,
} from "../presentation/output.ts";
import type { City } from "../types/City.ts";
import type { GeocodeCandidate } from "../types/Weather.ts";

export async function addCity(): Promise<void> {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) {
    printError("Debes escribir un nombre.");
    return;
  }
  try {
    const candidates = await withSpinner(`Buscando "${name}"`, () =>
      geocodeCityCandidates(name),
    );
    if (candidates.length === 0) {
      printMessage(`No se encontró "${name}". Intenta con otro nombre.`);
      return;
    }
    const chosen = await chooseCandidate(name, candidates);
    if (!chosen) return;
    const city: City = {
      name: chosen.name,
      latitude: chosen.latitude,
      longitude: chosen.longitude,
    };
    const saved = await citiesStore.addCity(city);
    if (!saved) {
      printMessage(`${city.name} ya está registrada.`);
      return;
    }
    printSuccess(`Ciudad agregada: ${describeCandidate(chosen)}`);
    printMessage(`Coordenadas: (${city.latitude}, ${city.longitude})`);
  } catch (error) {
    printError(`No se pudo buscar "${name}": ${String(error)}`);
  }
}

async function chooseCandidate(
  name: string,
  candidates: GeocodeCandidate[],
): Promise<GeocodeCandidate | null> {
  if (candidates.length === 1) return candidates[0] ?? null;
  console.log(`\n  ${candidates.length} resultados para "${name}":`);
  candidates.forEach((candidate, index) => {
    console.log(`    ${index + 1}. ${describeCandidate(candidate)}`);
  });
  const input = await ask("  Número de la ciudad correcta: ");
  const index = parseMenuNumber(input, candidates.length);
  if (!index) {
    printError("Número inválido.");
    return null;
  }
  return candidates[index - 1] ?? null;
}
