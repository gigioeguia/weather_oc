import { describe, expect, it } from "bun:test";
import { geocodeCity, fetchCurrentTemperature } from "./api.ts";

describe("geocodeCity", () => {
  it("resuelve una ciudad conocida con sus coordenadas", async () => {
    const city = await geocodeCity("Ottawa");
    expect(city).not.toBeNull();
    expect(city?.name).toBe("Ottawa");
    expect(Math.abs(city!.latitude - 45.41117)).toBeLessThan(0.05);
    expect(Math.abs(city!.longitude - -75.69812)).toBeLessThan(0.05);
  }, 15_000);

  it("devuelve null para una ciudad inexistente", async () => {
    const city = await geocodeCity("xyzqwciudadinexistente12345");
    expect(city).toBeNull();
  }, 15_000);
});

describe("fetchCurrentTemperature", () => {
  it("devuelve la temperatura actual de una ubicación", async () => {
    const temperature = await fetchCurrentTemperature(45.41117, -75.69812, "celsius");
    expect(temperature).toBeGreaterThan(-100);
    expect(temperature).toBeLessThan(70);
  }, 15_000);

  it("con coordenadas inválidas lanza error", async () => {
    expect(fetchCurrentTemperature(9999, 9999, "celsius")).rejects.toThrow();
  }, 15_000);
});
