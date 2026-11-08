import { beforeEach, describe, expect, it, afterEach } from "bun:test";
import {
  showAllCitiesWeather,
  showDefaultCityWeather,
  showSevenDayForecast,
} from "../../src/actions/getWeather.ts";
import { printCityList } from "../../src/actions/listCities.ts";
import { citiesStore } from "../../src/storage/citiesStorage.ts";
import { emptyState } from "../../src/types/AppState.ts";
import type { City } from "../../src/types/City.ts";
import { captureOutput } from "../helpers/capture.ts";
import { simulateInput } from "../helpers/input.ts";
import { restoreFetchStub, stubFetch } from "../helpers/stubFetch.ts";

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

const weatherRoutes = (temperature: number) => [
  {
    matches: (u: string) => u.includes("api.open-meteo.com"),
    body: { current: { temperature_2m: temperature } },
  },
];

function seedState(cities: City[], defaultCity: string | null = null): void {
  citiesStore.state = { ...emptyState(), cities, defaultCity: defaultCity ?? cities[0]?.name ?? null };
}

beforeEach(() => {
  seedState([]);
});

describe("showDefaultCityWeather", () => {
  it("avisa si no hay ciudad default", async () => {
    const output = await captureOutput(() => showDefaultCityWeather());
    expect(output.join("")).toContain("No hay ciudad default");
  });

  it("muestra el clima de la ciudad default", async () => {
    seedState([LIMA]);
    stubFetch(weatherRoutes(21.4));
    const output = await captureOutput(() => showDefaultCityWeather());
    const combined = output.join("");
    expect(combined).toContain("Clima en Lima");
    expect(combined).toContain("21.4°C");
  });

  it("avisa si la API de clima falla", async () => {
    seedState([LIMA]);
    stubFetch([{ matches: () => true, status: 500, body: {} }]);
    const output = await captureOutput(() => showDefaultCityWeather());
    expect(output.join("")).toContain("No se pudo obtener el clima de Lima");
  });
});

describe("showAllCitiesWeather", () => {
  it("avisa si no hay ciudades registradas", async () => {
    const output = await captureOutput(() => showAllCitiesWeather());
    expect(output.join("")).toContain("No hay ciudades registradas");
  });

  it("muestra el clima de todas las ciudades registradas", async () => {
    seedState([LIMA, OTTAWA]);
    stubFetch(weatherRoutes(10));
    const output = await captureOutput(() => showAllCitiesWeather());
    const combined = output.join("");
    expect(combined).toContain("Clima en Lima");
    expect(combined).toContain("Clima en Ottawa");
  });

  it("muestra el progreso (i/N) en el rótulo de carga de cada ciudad", async () => {
    seedState([LIMA, OTTAWA]);
    stubFetch(weatherRoutes(10));
    const output = await captureOutput(() => showAllCitiesWeather());
    const combined = output.join("");
    expect(combined).toContain("Consultando el clima de Lima (1/2)");
    expect(combined).toContain("Consultando el clima de Ottawa (2/2)");
  });

  it("muestra el clima sin progreso en la consulta individual", async () => {
    seedState([LIMA]);
    stubFetch(weatherRoutes(10));
    const output = await captureOutput(() => showDefaultCityWeather());
    expect(output.join("")).toContain("Consultando el clima de Lima...");
    expect(output.join("")).not.toContain("(1/1)");
  });
});

describe("showSevenDayForecast", () => {
  it("muestra el pronóstico diario de la ciudad elegida", async () => {
    seedState([LIMA]);
    simulateInput("1");
    stubFetch([
      {
        matches: (u) => u.includes("api.open-meteo.com"),
        body: {
          daily: {
            time: ["2026-11-08"],
            temperature_2m_max: [22.5],
            temperature_2m_min: [12.5],
          },
        },
      },
    ]);
    const output = await captureOutput(() => showSevenDayForecast());
    const combined = output.join("");
    expect(combined).toContain("Pronóstico de 7 días para Lima");
    expect(combined).toContain("2026-11-08");
    expect(combined).toContain("22.5°C");
    expect(combined).toContain("12.5°C");
  });

  it("cancela si la selección de ciudad es inválida", async () => {
    seedState([LIMA]);
    simulateInput("9");
    const output = await captureOutput(() => showSevenDayForecast());
    expect(output.join("")).toContain("Número inválido.");
  });

  it("avisa si no hay ciudades y no consulta la API", async () => {
    stubFetch([{ matches: () => true, body: {} }]);
    const output = await captureOutput(() => showSevenDayForecast());
    expect(output.join("")).toContain("No hay ciudades registradas.");
    expect(citiesStore.state.cities).toHaveLength(0);
  });
});

describe("printCityList", () => {
  it("lista las ciudades numeradas marcando la default", async () => {
    seedState([LIMA, OTTAWA]);
    const output = await captureOutput(() => printCityList(citiesStore.state.cities));
    const combined = output.join("");
    expect(combined).toContain("1. Lima (default)");
    expect(combined).toContain("2. Ottawa");
    expect(combined).not.toContain("Ottawa (default)");
  });
});

afterEach(restoreFetchStub);
