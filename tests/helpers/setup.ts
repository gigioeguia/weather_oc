// Preload de bun test: aísla la configuración real del usuario
Bun.env.XDG_CONFIG_HOME = "/tmp/opencode/weather-cli-config";

// Sin TTY en toda la suite: el spinner evita animación y esperas mínimas
try {
  const stdout = process.stdout as typeof process.stdout;
  if (stdout.isTTY) {
    Object.defineProperty(stdout, "isTTY", { value: false, configurable: true });
  }
} catch {
  // Si no se puede forzar, el spinner solo anima más despacio
}
