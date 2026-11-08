import { beforeEach, describe, expect, it, afterEach } from "bun:test";
import { addCity } from "../../src/actions/addCity.ts";
import { citiesStore } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import { captureOutput } from "../helpers/capture.ts";
import { simulateInput } from "../helpers/input.ts";
import { restoreFetchStub, stubFetch } from "../helpers/stubFetch.ts";
import type { City } from "../../src/types/City.ts";

const LIMA = { name: "Lima", latitude: -12.046, longitude: -77.043, country: "Perú" };
const OTTAWA = { name: "Ottawa", latitude: 45.41, longitude: -75.69, admin1: "Ontario", country: "Canadá" };

beforeEach(() => {
  citiesStore.state = emptyState();
});

describe("addCity", () => {
  it("avisa si no se escribe un nombre", async () => {
    simulateInput();
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain("Debes escribir un nombre.");
  });

  it("agrega la ciudad cuando hay un único resultado", async () => {
    simulateInput("Lima");
    stubFetch([
      { matches: (u) => u.includes("geocoding-api.open-meteo.com"), body: { results: [LIMA] } },
    ]);
    const output = await captureOutput(() => addCity());
    const combined = output.join("");
    expect(combined).toContain("Ciudad agregada");
    expect(combined).toContain("Coordenadas");
    expect(citiesStore.state.cities).toEqual([
      { name: "Lima", latitude: -12.046, longitude: -77.043 } satisfies City,
    ]);
    expect(citiesStore.state.defaultCity).toBe("Lima");
  });

  it("avisa cuando la búsqueda no devuelve resultados", async () => {
    simulateInput("Inexistente");
    stubFetch([{ matches: () => true, body: {} }]);
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain('No se encontró "Inexistente"');
  });

  it("pide elegir candidato cuando hay varios y guarda el elegido", async () => {
    simulateInput("Lima", "2");
    stubFetch([
      {
        matches: (u) => u.includes("geocoding-api.open-meteo.com"),
        body: { results: [LIMA, OTTAWA] },
      },
    ]);
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain("2 resultados para");
    expect(citiesStore.state.cities).toHaveLength(1);
    expect(citiesStore.state.cities[0]?.name).toBe("Ottawa");
  });

  it("cancela la operación con un número inválido", async () => {
    simulateInput("Lima", "99");
    stubFetch([
      {
        matches: (u) => u.includes("geocoding-api.open-meteo.com"),
        body: { results: [LIMA, OTTAWA] },
      },
    ]);
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain("Número inválido.");
    expect(citiesStore.state.cities).toHaveLength(0);
  });

  it("avisa si la ciudad ya está registrada", async () => {
    simulateInput("Lima");
    stubFetch([
      { matches: () => true, body: { results: [LIMA] } },
    ]);
    citiesStore.state.cities = [{ name: "Lima", latitude: -12.046, longitude: -77.043 }];
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain("ya está registrada");
  });

  it("avisa si la búsqueda falla", async () => {
    simulateInput("Lima");
    stubFetch([{ matches: () => true, status: 500, body: {} }]);
    const output = await captureOutput(() => addCity());
    expect(output.join("")).toContain('No se pudo buscar "Lima"');
    expect(citiesStore.state.cities).toHaveLength(0);
  });
});

afterEach(restoreFetchStub);
