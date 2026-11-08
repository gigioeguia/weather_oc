import { beforeEach, describe, expect, it } from "bun:test";
import { ask, isClosed, parseMenuNumber } from "../../src/presentation/input.ts";
import { simulateInput } from "../helpers/input.ts";

beforeEach(() => {
  simulateInput();
});

describe("parseMenuNumber", () => {
  it("acepta números enteros dentro del rango", () => {
    expect(parseMenuNumber("1", 5)).toBe(1);
    expect(parseMenuNumber("3", 5)).toBe(3);
  });

  it("rechaza fuera de rango, no enteros y texto vacío", () => {
    expect(parseMenuNumber("0", 5)).toBeNull();
    expect(parseMenuNumber("6", 5)).toBeNull();
    expect(parseMenuNumber("-2", 5)).toBeNull();
    expect(parseMenuNumber("1.5", 5)).toBeNull();
    expect(parseMenuNumber("abc", 5)).toBeNull();
    expect(parseMenuNumber("", 5)).toBeNull();
  });
});

describe("ask", () => {
  it("devuelve la línea encolada sin espacios sobrantes", async () => {
    simulateInput("  hola mundo  ");
    await expect(ask("pregunta:")).resolves.toBe("hola mundo");
  });

  it("encola varias líneas en orden FIFO", async () => {
    simulateInput("primera", "segunda");
    expect(await ask("1:")).toBe("primera");
    expect(await ask("2:")).toBe("segunda");
  });

  it("devuelve vacío al agotar la cola con stdin cerrado", async () => {
    await expect(ask("vacío:")).resolves.toBe("");
  });
});

describe("isClosed", () => {
  it("refleja stdin cerrado con cola vacía", () => {
    simulateInput();
    expect(isClosed()).toBe(true);
    simulateInput("pendiente");
    expect(isClosed()).toBe(false);
  });
});
