import { beforeEach, describe, expect, it } from "bun:test";
import { createCitiesStore, defaultStatePath, type CitiesStore } from "./citiesStorage.ts";
import { setUnit } from "./settingsStorage.ts";
import { emptyState, type AppState } from "../types/AppState.ts";
import type { City } from "../types/City.ts";

const TMP_DIR = "/tmp/opencode/weather-cli";
const TMP_FILE = `${TMP_DIR}/cities.json`;

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

let store: CitiesStore;

beforeEach(async () => {
  await Bun.$`rm -rf ${TMP_DIR}`.quiet();
  await Bun.$`mkdir -p ${TMP_DIR}`.quiet();
  store = createCitiesStore(TMP_FILE);
  await store.load();
});

describe("estado del store", () => {
  it("arranca con estado vacío si no hay archivo", () => {
    expect(store.state).toEqual(emptyState());
    expect(store.defaultCity()).toBeNull();
  });

  it("agrega una ciudad y la asigna como default la primera vez", async () => {
    expect(await store.addCity(LIMA)).toBe(true);
    expect(store.defaultCity()?.name).toBe("Lima");
  });

  it("agrega sin cambiar la default ya asignada", async () => {
    await store.addCity(LIMA);
    await store.addCity(OTTAWA);
    expect(store.defaultCity()?.name).toBe("Lima");
  });

  it("no registra la misma ciudad dos veces", async () => {
    expect(await store.addCity(LIMA)).toBe(true);
    expect(await store.addCity(LIMA)).toBe(false);
    expect(store.state.cities).toHaveLength(1);
  });

  it("elimina una ciudad y reasigna la default", async () => {
    await store.addCity(LIMA);
    await store.addCity(OTTAWA);
    expect(await store.removeCity("Lima")).toBe(true);
    expect(store.defaultCity()?.name).toBe("Ottawa");
  });

  it("devuelve false al eliminar una ciudad inexistente", async () => {
    expect(await store.removeCity("Lima")).toBe(false);
  });

  it("establece la default solo con ciudades registradas", async () => {
    await store.addCity(LIMA);
    expect(await store.setDefault("Ottawa")).toBe(false);
    expect(await store.setDefault("Lima")).toBe(true);
    expect(store.defaultCity()?.name).toBe("Lima");
  });
});

describe("defaultStatePath", () => {
  it("usa XDG_CONFIG_HOME cuando está definido", () => {
    const original = Bun.env.XDG_CONFIG_HOME;
    Bun.env.XDG_CONFIG_HOME = "/tmp/opencode/custom-config";
    try {
      expect(defaultStatePath()).toBe("/tmp/opencode/custom-config/weather-cli/cities.json");
    } finally {
      if (original === undefined) delete Bun.env.XDG_CONFIG_HOME;
      else Bun.env.XDG_CONFIG_HOME = original;
    }
  });

  it("cae al home del usuario si XDG_CONFIG_HOME está vacío", () => {
    const original = Bun.env.XDG_CONFIG_HOME;
    Bun.env.XDG_CONFIG_HOME = "   ";
    try {
      expect(defaultStatePath().endsWith("weather-cli/cities.json")).toBe(true);
    } finally {
      if (original === undefined) delete Bun.env.XDG_CONFIG_HOME;
      else Bun.env.XDG_CONFIG_HOME = original;
    }
  });
});

describe("persistencia en cities.json", () => {
  it("recarga un estado guardado previamente", async () => {
    await store.addCity(LIMA);
    await store.addCity(OTTAWA);
    await store.setDefault("Ottawa");
    await setUnit(store.state, "fahrenheit", TMP_FILE);

    const reloaded = createCitiesStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state).toEqual(store.state);
    expect(reloaded.defaultCity()?.name).toBe("Ottawa");
  });

  it("descarta datos corruptos y arranca con estado vacío", async () => {
    await Bun.write(TMP_FILE, "{ not valid json !!");
    const reloaded = createCitiesStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state).toEqual(emptyState());
  });

  it("ignora entradas malformadas en cities", async () => {
    await Bun.write(
      TMP_FILE,
      JSON.stringify({
        defaultCity: "Lima",
        unit: "celsius",
        cities: [LIMA, { name: "roto", latitude: "x" }],
      }),
    );
    const reloaded = createCitiesStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state.cities).toEqual([LIMA]);
    expect(reloaded.state.defaultCity).toBe("Lima");
  });

  it("nullifica la default si la ciudad guardada ya no existe", async () => {
    await Bun.write(
      TMP_FILE,
      JSON.stringify({ defaultCity: "Ottawa", unit: "celsius", cities: [LIMA] }),
    );
    const reloaded = createCitiesStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state.defaultCity).toBeNull();
  });
});

describe("tipo AppState", () => {
  it("unit forma parte del estado", () => {
    const state: AppState = emptyState();
    expect(state.unit).toBe("celsius");
  });
});
