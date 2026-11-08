import { beforeEach, describe, expect, it } from "bun:test";
import { setUnit } from "./settingsStorage.ts";
import { createCitiesStore, loadState } from "./citiesStorage.ts";
import type { AppState } from "../types/AppState.ts";

const TMP_DIR = "/tmp/opencode/weather-cli-settings";
const TMP_FILE = `${TMP_DIR}/cities.json`;

let state: AppState;

beforeEach(async () => {
  await Bun.$`rm -rf ${TMP_DIR}`.quiet();
  await Bun.$`mkdir -p ${TMP_DIR}`.quiet();
  state = (await loadState(TMP_FILE)) as AppState;
});

describe("setUnit (settingsStorage)", () => {
  it("alterna la unidad y la persiste en disco", async () => {
    await setUnit(state, "fahrenheit", TMP_FILE);
    expect(state.unit).toBe("fahrenheit");
    const reloaded = await loadState(TMP_FILE);
    expect(reloaded.unit).toBe("fahrenheit");
  });

  it("conserva el resto del estado al guardar la unidad", async () => {
    const store = createCitiesStore(TMP_FILE);
    await store.load();
    await setUnit(store.state, "fahrenheit", TMP_FILE);
    const reloaded = createCitiesStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state).toEqual(store.state);
  });
});
