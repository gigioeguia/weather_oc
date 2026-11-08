import { tmpdir } from "node:os";
import { join } from "node:path";

// Rutas temporales neutrales para Linux/macOS/Windows (evita /tmp hardcodeado)
const TEST_ROOT = join(tmpdir(), "opencode");

export const CONFIG_DIR = join(TEST_ROOT, "weather-cli-config");
export const CITIES_DIR = join(TEST_ROOT, "weather-cli");
export const CITIES_FILE = join(CITIES_DIR, "cities.json");
export const SETTINGS_DIR = join(TEST_ROOT, "weather-cli-settings");
export const SETTINGS_FILE = join(SETTINGS_DIR, "cities.json");
export const CUSTOM_CONFIG_DIR = join(TEST_ROOT, "custom-config");
