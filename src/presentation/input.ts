import { ANSI } from "../utils/colors.ts";

const pendingLines: string[] = [];
let wakeWaiter: (() => void) | null = null;
let eof = false;

function wake(): void {
  if (!wakeWaiter) return;
  const waker = wakeWaiter;
  wakeWaiter = null;
  waker();
}

// Encola una línea de entrada (stdin o tests)
export function feedInput(line: string): void {
  pendingLines.push(line.replace(/\r$/, ""));
  wake();
}

export function closeInput(): void {
  eof = true;
  wake();
}

// Reemplaza la cola de entrada completa (tests: aísla cada flujo interactivo)
export function setInputQueue(lines: string[]): void {
  pendingLines.length = 0;
  eof = true;
  wake();
  for (const line of lines) feedInput(line);
}

// Lee la entrada línea por línea (TTY o stdin entubado) y la encola
void (async () => {
  try {
    for await (const raw of console) {
      feedInput(raw);
    }
  } finally {
    closeInput();
  }
})();

export async function ask(question: string): Promise<string> {
  process.stdout.write(ANSI.cyan(question));
  while (true) {
    const line = pendingLines.shift();
    if (line !== undefined) return line.trim();
    if (eof) return "";
    await new Promise<void>((resolve) => {
      wakeWaiter = resolve;
    });
  }
}

export function isClosed(): boolean {
  return eof && pendingLines.length === 0;
}

export function parseMenuNumber(input: string, max: number): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1 || value > max) return null;
  return value;
}
