import { describe, expect, it } from "bun:test";
import { formatTemp, unitSymbol } from "../../src/utils/format.ts";

describe("unitSymbol", () => {
  it("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  it("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatTemp", () => {
  it("redondea la temperatura a un decimal y añade el símbolo", () => {
    expect(formatTemp(21.46, "celsius")).toBe("21.5°C");
    expect(formatTemp(12, "celsius")).toBe("12°C");
  });

  it("mantiene el signo en negativos", () => {
    expect(formatTemp(-3.24, "fahrenheit")).toBe("-3.2°F");
  });
});
