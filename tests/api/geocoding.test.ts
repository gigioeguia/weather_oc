import { describe, expect, it, afterEach } from "bun:test";
import { geocodeCityCandidates } from "../../src/api/geocoding.ts";
import { lastRequestedUrl, restoreFetchStub, stubFetch } from "../helpers/stubFetch.ts";

// Tests de red real: solo con WEATHER_TEST_NETWORK=1
const itNetwork = Bun.env.WEATHER_TEST_NETWORK === "1" ? it : it.skip;

describe("geocodeCityCandidates (con fetch simulado)", () => {
  it("mapea los resultados incluyendo admin1 y country", async () => {
    stubFetch([
      {
        matches: (u) => u.includes("geocoding-api.open-meteo.com"),
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
    stubFetch([{ matches: (u) => u.includes("geocoding-api.open-meteo.com"), body: {} }]);
    expect(await geocodeCityCandidates("inexistente")).toEqual([]);
  });

  it("usa count=5 y language=es en la URL", async () => {
    stubFetch([{ matches: () => true, body: {} }]);
    await geocodeCityCandidates("Mérida");
    const requestedUrl = lastRequestedUrl();
    expect(requestedUrl).toContain("count=5");
    expect(requestedUrl).toContain("language=es");
  });
});

describe("integración real con OpenMeteo", () => {
  itNetwork("geocodeCityCandidates trae varias ciudades en la práctica", async () => {
    const candidates = await geocodeCityCandidates("Springfield");
    expect(candidates.length).toBeGreaterThan(0);
  }, 15_000);
});

afterEach(restoreFetchStub);
