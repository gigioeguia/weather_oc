import { describe, expect, it, afterEach } from "bun:test";
import { fetchJson } from "../../src/api/http.ts";
import { restoreFetchStub, stubFetch } from "../helpers/stubFetch.ts";

describe("fetchJson", () => {
  it("parsea la respuesta JSON cuando el status es 2xx", async () => {
    stubFetch([
      { matches: () => true, body: { temperature: 21.5, city: "Lima" } },
    ]);
    const data = await fetchJson<{ temperature: number; city: string }>("https://example.com/data");
    expect(data).toEqual({ temperature: 21.5, city: "Lima" });
  });

  it("lanza error con el código HTTP cuando la respuesta no es 2xx", async () => {
    stubFetch([{ matches: () => true, status: 404, body: { error: true } }]);
    await expect(fetchJson("https://example.com/missing")).rejects.toThrow("Error HTTP 404");
  });

  it("lanza error si el cuerpo no es JSON válido", async () => {
    stubFetch([{ matches: () => true, body: "esto no es json" }]);
    await expect(fetchJson("https://example.com/broken")).rejects.toThrow();
  });
});

afterEach(restoreFetchStub);
