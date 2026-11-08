import { beforeEach, describe, expect, it } from "bun:test";
import { removeCity } from "../../src/actions/removeCity.ts";
import { citiesStore } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import type { City } from "../../src/types/City.ts";
import { captureOutput } from "../helpers/capture.ts";
import { simulateInput } from "../helpers/input.ts";

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

function seed(cities: City[], defaultCity: string | null): void {
  citiesStore.state = { ...emptyState(), cities, defaultCity };
}

beforeEach(() => {
  seed([], null);
});

describe("removeCity", () => {
  it("elimina la ciudad elegida", async () => {
    seed([LIMA, OTTAWA], "Lima");
    simulateInput("2");
    const output = await captureOutput(() => removeCity());
    expect(output.join("")).toContain("Ciudad eliminada: Ottawa");
    expect(citiesStore.state.cities).toEqual([LIMA]);
    expect(citiesStore.state.defaultCity).toBe("Lima");
  });

  it("reasigna la default al eliminar la que era default", async () => {
    seed([LIMA, OTTAWA], "Lima");
    simulateInput("1");
    await captureOutput(() => removeCity());
    expect(citiesStore.state.defaultCity).toBe("Ottawa");
  });

  it("no elimina nada con un número inválido", async () => {
    seed([LIMA], "Lima");
    simulateInput("5");
    const output = await captureOutput(() => removeCity());
    expect(output.join("")).toContain("Número inválido.");
    expect(citiesStore.state.cities).toEqual([LIMA]);
  });

  it("avisa si no hay ciudades registradas", async () => {
    const output = await captureOutput(() => removeCity());
    expect(output.join("")).toContain("No hay ciudades registradas.");
  });
});
