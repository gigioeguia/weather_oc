import { rm } from "node:fs/promises";
import { beforeEach, describe, expect, it } from "bun:test";
import { toggleUnit } from "../../src/actions/toggleUnit.ts";
import { citiesStore, createCitiesStore, defaultStatePath } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import type { City } from "../../src/types/City.ts";
import { captureOutput } from "../helpers/capture.ts";
import { CONFIG_DIR } from "../helpers/paths.ts";

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

beforeEach(async () => {
  citiesStore.state = { ...emptyState(), cities: [LIMA, OTTAWA], defaultCity: "Lima" };
  await rm(CONFIG_DIR, { recursive: true, force: true });
});

describe("toggleUnit", () => {
  it("alterna celsius a fahrenheit y muestra °F", async () => {
    const output = await captureOutput(() => toggleUnit());
    expect(output.join("")).toContain("Unidad de temperatura: °F");
    expect(citiesStore.state.unit).toBe("fahrenheit");
  });

  it("alterna de vuelta a celsius y muestra °C", async () => {
    citiesStore.state.unit = "fahrenheit";
    const output = await captureOutput(() => toggleUnit());
    expect(output.join("")).toContain("Unidad de temperatura: °C");
    const unit: string = citiesStore.state.unit;
    expect(unit).toBe("celsius");
  });

  it("persiste el estado completo al guardar la unidad", async () => {
    await toggleUnit();
    const reloaded = createCitiesStore(defaultStatePath());
    await reloaded.load();
    expect(reloaded.state).toEqual(citiesStore.state);
    expect(reloaded.state.unit).toBe("fahrenheit");
  });
});
