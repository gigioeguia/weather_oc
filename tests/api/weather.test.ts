import { describe, expect, it, afterEach } from "bun:test";
import { fetchCurrentTemperature, fetchDailyForecast } from "../../src/api/weather.ts";
import { restoreFetchStub, stubFetch } from "../helpers/stubFetch.ts";

// Tests de red real: solo con WEATHER_TEST_NETWORK=1
const itNetwork = Bun.env.WEATHER_TEST_NETWORK === "1" ? it : it.skip;

describe("fetchDailyForecast (con fetch simulado)", () => {
  it("combina fechas, máximos y mínimos en entradas diarias", async () => {
    stubFetch([
      {
        matches: (u) => u.includes("api.open-meteo.com"),
        body: {
          daily: {
            time: ["2026-11-08", "2026-11-09"],
            temperature_2m_max: [12.3, 14.1],
            temperature_2m_min: [2.4, 3.9],
          },
        },
      },
    ]);
    const entries = await fetchDailyForecast(45.41, -75.69, "celsius", 7);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ date: "2026-11-08", max: 12.3, min: 2.4 });
    expect(entries[1]).toEqual({ date: "2026-11-09", max: 14.1, min: 3.9 });
  });

  it("lanza error si la respuesta no incluye daily", async () => {
    stubFetch([{ matches: (u) => u.includes("api.open-meteo.com"), body: {} }]);
    await expect(fetchDailyForecast(45.41, -75.69, "celsius", 7)).rejects.toThrow();
  });

  it("lanza error si la respuesta es un HTTP que no es 2xx", async () => {
    stubFetch([
      {
        matches: (u) => u.includes("api.open-meteo.com"),
        status: 503,
        body: { error: true },
      },
    ]);
    await expect(fetchDailyForecast(45.41, -75.69, "celsius", 7)).rejects.toThrow("Error HTTP 503");
  });
});

describe("integración real con OpenMeteo", () => {
  itNetwork("fetchCurrentTemperature devuelve una temperatura razonable", async () => {
    const temperature = await fetchCurrentTemperature(45.41117, -75.69812, "celsius");
    expect(temperature).toBeGreaterThan(-100);
    expect(temperature).toBeLessThan(70);
  }, 15_000);

  itNetwork("con coordenadas inválidas lanza error", async () => {
    await expect(fetchCurrentTemperature(9999, 9999, "celsius")).rejects.toThrow();
  }, 15_000);
});

afterEach(restoreFetchStub);
