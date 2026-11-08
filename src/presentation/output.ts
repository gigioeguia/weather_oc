import type { GeocodeCandidate } from "../types/Weather.ts";
import type { TempUnit } from "../types/AppState.ts";
import { formatTemp } from "../utils/format.ts";
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS, SPINNER_MIN_MS } from "../utils/constants.ts";
import { ANSI } from "../utils/colors.ts";

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

export function printWeather(city: string, temperature: number, unit: TempUnit): void {
  console.log(`\n  Clima en ${city}: ${ANSI.yellow(formatTemp(temperature, unit))}\n`);
}

export function describeCandidate(candidate: GeocodeCandidate): string {
  const region = [candidate.admin1, candidate.country].filter(Boolean).join(", ");
  return region ? `${candidate.name} (${region})` : candidate.name;
}
