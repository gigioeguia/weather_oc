import { describe, expect, it } from "bun:test";
import {
  describeCandidate,
  printBanner,
  printError,
  printMessage,
  printSuccess,
  printWeather,
  withSpinner,
} from "../../src/presentation/output.ts";
import { captureOutput } from "../helpers/capture.ts";

describe("impresoras de mensajes", () => {
  it("printMessage muestra el mensaje en su propia línea", async () => {
    const out = await captureOutput(() => printMessage("contenido central"));
    expect(out.join("")).toContain("contenido central");
  });

  it("printSuccess y printError distinguen el tipo de mensaje", async () => {
    const out = await captureOutput(() => {
      printSuccess("guardado con éxito");
      printError("algo falló");
    });
    const combined = out.join("");
    expect(combined).toContain("guardado con éxito");
    expect(combined).toContain("algo falló");
  });

  it("printBanner incluye el título entre líneas", async () => {
    const out = await captureOutput(() => printBanner("MENÚ PRINCIPAL"));
    expect(out.join("")).toContain("MENÚ PRINCIPAL");
  });

  it("printWeather incluye ciudad y temperatura formateada", async () => {
    const out = await captureOutput(() => printWeather("Lima", 21.46, "celsius"));
    const combined = out.join("");
    expect(combined).toContain("Clima en Lima");
    expect(combined).toContain("21.5°C");
  });
});

describe("describeCandidate", () => {
  it("lista región y país cuando existen", () => {
    expect(
      describeCandidate({ name: "Ottawa", latitude: 45.41, longitude: -75.69, admin1: "Ontario", country: "Canadá" }),
    ).toBe("Ottawa (Ontario, Canadá)");
  });

  it("usa solo el nombre sin región", () => {
    expect(
      describeCandidate({ name: "Lima", latitude: -12.04, longitude: -77.04 }),
    ).toBe("Lima");
  });
});

describe("withSpinner (sin TTY)", () => {
  it("muestra el rótulo y devuelve el resultado de la tarea", async () => {
    const out = await captureOutput(async () => {
      expect(await withSpinner("Consultando datos", async () => 42)).toBe(42);
    });
    expect(out.join("")).toContain("Consultando datos");
  });

  it("propaga el error de la tarea sin colgar", async () => {
    await expect(
      withSpinner("Falla", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });
});
