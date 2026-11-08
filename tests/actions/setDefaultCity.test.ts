import { beforeEach, describe, expect, it } from "bun:test";
import { setDefaultCity } from "../../src/actions/setDefaultCity.ts";
import { citiesStore } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import type { City } from "../../src/types/City.ts";
import { captureOutput } from "../helpers/capture.ts";
import { simulateInput } from "../helpers/input.ts";

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

beforeEach(() => {
  citiesStore.state = { ...emptyState(), cities: [LIMA, OTTAWA], defaultCity: "Lima" };
});

describe("setDefaultCity", () => {
  it("cambia la default a la ciudad elegida", async () => {
    simulateInput("2");
    const output = await captureOutput(() => setDefaultCity());
    expect(output.join("")).toContain("Ciudad default: Ottawa");
    expect(citiesStore.state.defaultCity).toBe("Ottawa");
  });

  it("no cambia la default con un número inválido", async () => {
    simulateInput("8");
    const output = await captureOutput(() => setDefaultCity());
    expect(output.join("")).toContain("Número inválido.");
    expect(citiesStore.state.defaultCity).toBe("Lima");
  });
});
