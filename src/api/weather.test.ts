import { afterEach, describe, expect, it } from "bun:test";
import { fetchCurrentTemperature, fetchDailyForecast } from "./weather.ts";

function stubFetch(responses: { url: (u: string) => boolean; body: unknown }[]): void {
  globalThis.fetch = (async (input: unknown) => {
    const url = String(input);
    const match = responses.find((response) => response.url(url));
    if (!match) throw new Error(`URL inesperada en el test: ${url}`);
    return new Response(JSON.stringify(match.body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

const ORIGINAL_FETCH = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

describe("fetchDailyForecast (con fetch simulado)", () => {
  it("combina fechas, máximos y mínimos en entradas diarias", async () => {
    stubFetch([
      {
        url: (u) => u.includes("api.open-meteo.com"),
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
    stubFetch([{ url: (u) => u.includes("api.open-meteo.com"), body: {} }]);
    await expect(fetchDailyForecast(45.41, -75.69, "celsius", 7)).rejects.toThrow();
  });
});

describe("integración real con OpenMeteo", () => {
  it("fetchCurrentTemperature devuelve una temperatura razonable", async () => {
    const temperature = await fetchCurrentTemperature(45.41117, -75.69812, "celsius");
    expect(temperature).toBeGreaterThan(-100);
    expect(temperature).toBeLessThan(70);
  }, 15_000);

  it("con coordenadas inválidas lanza error", async () => {
    await expect(fetchCurrentTemperature(9999, 9999, "celsius")).rejects.toThrow();
  }, 15_000);
});
