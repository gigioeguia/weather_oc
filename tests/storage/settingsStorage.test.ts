import { mkdir, rm } from "node:fs/promises";
import { beforeEach, describe, expect, it } from "bun:test";
import { setUnit } from "../../src/storage/settingsStorage.ts";
import { createCitiesStore, loadState } from "../../src/storage/citiesStorage.ts";
import type { AppState } from "../../src/types/AppState.ts";
import { SETTINGS_DIR, SETTINGS_FILE } from "../helpers/paths.ts";

let state: AppState;

beforeEach(async () => {
  await rm(SETTINGS_DIR, { recursive: true, force: true });
  await mkdir(SETTINGS_DIR, { recursive: true });
  state = (await loadState(SETTINGS_FILE)) as AppState;
});

describe("setUnit (settingsStorage)", () => {
  it("alterna la unidad y la persiste en disco", async () => {
    await setUnit(state, "fahrenheit", SETTINGS_FILE);
    expect(state.unit).toBe("fahrenheit");
    const reloaded = await loadState(SETTINGS_FILE);
    expect(reloaded.unit).toBe("fahrenheit");
  });

  it("conserva el resto del estado al guardar la unidad", async () => {
    const store = createCitiesStore(SETTINGS_FILE);
    await store.load();
    await setUnit(store.state, "fahrenheit", SETTINGS_FILE);
    const reloaded = createCitiesStore(SETTINGS_FILE);
    await reloaded.load();
    expect(reloaded.state).toEqual(store.state);
  });
});
