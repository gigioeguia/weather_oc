import type { TempUnit } from "./types.ts";

const COLOR_ENABLED = !process.env.NO_COLOR;

export const ANSI = {
  cyan: (text: string) => (COLOR_ENABLED ? `\x1b[36m${text}\x1b[0m` : text),
  yellow: (text: string) => (COLOR_ENABLED ? `\x1b[33m${text}\x1b[0m` : text),
  green: (text: string) => (COLOR_ENABLED ? `\x1b[32m${text}\x1b[0m` : text),
  red: (text: string) => (COLOR_ENABLED ? `\x1b[31m${text}\x1b[0m` : text),
};

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"];
const SPINNER_INTERVAL_MS = 80;
const SPINNER_MIN_MS = 400;

// Ejecuta una tarea mostrando un spinner animado (solo en TTY; en pipes solo imprime el rótulo)
export async function withSpinner<T>(label: string, task: () => Promise<T>): Promise<T> {
  const isTty = Boolean(process.stdout.isTTY);
  if (!isTty) {
    process.stdout.write(`  ${label}...\n`);
    return task();
  }

  let frameIndex = 0;
  const timer = setInterval(() => {
    const frame = ANSI.cyan(SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length] ?? "");
    process.stdout.write(`\r  ${frame} ${label}...`);
    frameIndex++;
  }, SPINNER_INTERVAL_MS);
  const startAt = performance.now();
  try {
    const res = await task();
    const elapsed = performance.now() - startAt;
    if (elapsed < SPINNER_MIN_MS) {
      await new Promise((resolve) => setTimeout(resolve, SPINNER_MIN_MS - elapsed));
    }
    return res;
  } finally {
    clearInterval(timer);
    process.stdout.write("\r\x1b[2K");
  }
}

const pendingLines: string[] = [];
let wakeWaiter: (() => void) | null = null;
let eof = false;

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

function wake(): void {
  if (!wakeWaiter) return;
  const waker = wakeWaiter;
  wakeWaiter = null;
  waker();
}

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

export function printBanner(title: string): void {
  const line = ANSI.cyan("════════════════════════════════════════");
  console.log(`${line}\n         ${ANSI.cyan(title)}\n${line}`);
}

export function printMessage(message: string): void {
  console.log(`\n  ${message}\n`);
}

export function printSuccess(message: string): void {
  console.log(`\n  ${ANSI.green(message)}\n`);
}

export function printError(message: string): void {
  console.log(`\n  ${ANSI.red(message)}\n`);
}

function unitSymbol(unit: TempUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatTemp(temperature: number, unit: TempUnit): string {
  return `${Math.round(temperature * 10) / 10}${unitSymbol(unit)}`;
}

export function printWeather(city: string, temperature: number, unit: TempUnit): void {
  console.log(`\n  Clima en ${city}: ${ANSI.yellow(formatTemp(temperature, unit))}\n`);
}
