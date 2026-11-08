import { beforeEach, describe, expect, it } from "bun:test";
import { pickCity } from "../../src/actions/listCities.ts";
import { citiesStore } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import type { City } from "../../src/types/City.ts";
import { captureOutput } from "../helpers/capture.ts";
import { simulateInput } from "../helpers/input.ts";

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

beforeEach(() => {
  citiesStore.state = emptyState();
});

describe("pickCity", () => {
  it("devuelve null y avisa si no hay ciudades", async () => {
    const output = await captureOutput(async () => {
      const result = await pickCity("eliminar");
      expect(result).toBeNull();
    });
    expect(output.join("")).toContain("No hay ciudades registradas.");
  });

  it("devuelve la ciudad según el número elegido", async () => {
    citiesStore.state.cities = [LIMA, OTTAWA];
    simulateInput("2");
    const output = await captureOutput(async () => {
      const result = await pickCity("eliminar");
      expect(result).toEqual(OTTAWA);
    });
    expect(output.join("")).toContain("Número de ciudad a eliminar");
    expect(output.join("")).toContain("2. Ottawa");
  });

  it("devuelve null y avisa con un número inválido", async () => {
    citiesStore.state.cities = [LIMA];
    simulateInput("99");
    const output = await captureOutput(async () => {
      const result = await pickCity("eliminar");
      expect(result).toBeNull();
    });
    expect(output.join("")).toContain("Número inválido.");
  });
});
