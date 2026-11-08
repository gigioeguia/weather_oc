import { afterEach, describe, expect, it } from "bun:test";
import { geocodeCityCandidates } from "./geocoding.ts";

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

describe("integración real con OpenMeteo", () => {
  it("geocodeCityCandidates trae varias ciudades en la práctica", async () => {
    const candidates = await geocodeCityCandidates("Springfield");
    expect(candidates.length).toBeGreaterThan(0);
  }, 15_000);
});
