import { setUnit } from "../storage/settingsStorage.ts";
import { citiesStore } from "../storage/citiesStorage.ts";
import { printSuccess } from "../presentation/output.ts";
import { unitSymbol } from "../utils/format.ts";

export async function toggleUnit(): Promise<void> {
  const next = citiesStore.state.unit === "celsius" ? "fahrenheit" : "celsius";
  await setUnit(citiesStore.state, next);
  printSuccess(`Unidad de temperatura: ${unitSymbol(next)}`);
}
