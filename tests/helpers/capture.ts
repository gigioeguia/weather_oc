const REAL_LOG = console.log.bind(console);
const REAL_WRITE = process.stdout.write.bind(process.stdout);

// Capture console.log y process.stdout.write durante la ejecución de task
export async function captureOutput(task: () => unknown): Promise<string[]> {
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  process.stdout.write = ((chunk: unknown) => {
    lines.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  try {
    await task();
  } finally {
    console.log = REAL_LOG;
    process.stdout.write = REAL_WRITE;
  }
  return lines;
}
