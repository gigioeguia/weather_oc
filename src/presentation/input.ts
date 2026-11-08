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

// Lee la entrada línea por línea (TTY o stdin entubado) y la encola
void (async () => {
  try {
    for await (const raw of console) {
      pendingLines.push(raw.replace(/\r$/, ""));
      wake();
    }
  } finally {
    eof = true;
    wake();
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
