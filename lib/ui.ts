import type { TempUnit } from "./types.ts";

const pendingLines: string[] = [];
let wakeWaiter: (() => void) | null = null;
let eof = false;

// Lee la entrada línea por línea (TTY o stdin entubado) las encola
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
  process.stdout.write(question);
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
  const line = "════════════════════════════════════════";
  console.log(`${line}\n         ${title}\n${line}`);
}

export function printMessage(message: string): void {
  console.log(`\n  ${message}\n`);
}

export function printWeather(city: string, temperature: number, unit: TempUnit): void {
  console.log(`\n  Clima en ${city}: ${formatTemp(temperature, unit)}\n`);
}

export function formatTemp(temperature: number, unit: TempUnit): string {
  const symbol = unit === "celsius" ? "°C" : "°F";
  return `${Math.round(temperature * 10) / 10}${symbol}`;
}
