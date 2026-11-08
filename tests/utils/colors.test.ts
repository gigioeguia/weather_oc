import { expect, it } from "bun:test";
import { ANSI } from "../../src/utils/colors.ts";

// Los códigos ANSI se generan solo si NO_COLOR no está definido
const itColor = Bun.env.NO_COLOR ? it.skip : it;

itColor("cyan envuelve el texto con el código ANSI del color", () => {
  expect(ANSI.cyan("hola")).toContain("hola");
  expect(ANSI.cyan("hola")).toContain("\x1b[36m");
});

itColor("red y green usan sus códigos distintivos", () => {
  expect(ANSI.red("error")).toContain("\x1b[31m");
  expect(ANSI.green("ok")).toContain("\x1b[32m");
});
