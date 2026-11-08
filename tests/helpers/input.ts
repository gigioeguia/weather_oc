import { setInputQueue } from "../../src/presentation/input.ts";

// Prepara las respuestas de stdin en cola para el siguiente flujo interactivo;
// al agotarse la cola, ask() devuelve "" (como si no escribiera nada)
export function simulateInput(...lines: string[]): void {
  setInputQueue(lines);
}
