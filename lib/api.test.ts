import { afterEach, describe, expect, it } from "bun:test";
import { fetchCurrentTemperature, fetchDailyForecast, geocodeCityCandidates } from "./api.ts";

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

describe("geocodeCityCandidates (con fetch simulado)", () => {
  it("mapea los resultados incluyendo admin1 y country", async () => {
    stubFetch([
      {
        url: (u) => u.includes("geocoding-api.open-meteo.com"),
        body: {
          results: [
            { name: "Ottawa", latitude: 45.41, longitude: -75.69, country: "Canadá" },
            { name: "Ottawa", latitude: 39.15, longitude: -95.02, admin1: "Kansas", country: "Estados Unidos" },
          ],
        },
      },
    ]);
    const candidates = await geocodeCityCandidates("Ottawa");
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toEqual({ name: "Ottawa", latitude: 45.41, longitude: -75.69, admin1: undefined, country: "Canadá" });
    expect(candidates[1]?.admin1).toBe("Kansas");
  });

  it("devuelve lista vacía cuando la API no trae resultados", async () => {
    stubFetch([
      { url: (u) => u.includes("geocoding-api.open-meteo.com"), body: {} },
    ]);
    expect(await geocodeCityCandidates("inexistente")).toEqual([]);
  });

  it("usa count=5 y language=es en la URL", async () => {
    let requestedUrl = "";
    globalThis.fetch = (async (input: unknown) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({}), { status: 200 });
    }) as typeof fetch;
    await geocodeCityCandidates("Mérida");
    expect(requestedUrl).toContain("count=5");
    expect(requestedUrl).toContain("language=es");
  });
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
  it("geocodeCityCandidates trae varias ciudades en la práctica", async () => {
    const candidates = await geocodeCityCandidates("Springfield");
    expect(candidates.length).toBeGreaterThan(0);
  }, 15_000);

  it("fetchCurrentTemperature devuelve una temperatura razonable", async () => {
    const temperature = await fetchCurrentTemperature(45.41117, -75.69812, "celsius");
    expect(temperature).toBeGreaterThan(-100);
    expect(temperature).toBeLessThan(70);
  }, 15_000);

  it("con coordenadas inválidas lanza error", async () => {
    await expect(fetchCurrentTemperature(9999, 9999, "celsius")).rejects.toThrow();
  }, 15_000);
});
