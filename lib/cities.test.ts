import { beforeEach, describe, expect, it } from "bun:test";
import { createStore, type CitiesStore } from "./cities.ts";
import { emptyState, type City } from "./types.ts";

const TMP_DIR = "/tmp/opencode/weather-cli";
const TMP_FILE = `${TMP_DIR}/cities.json`;

const LIMA: City = { name: "Lima", latitude: -12.046, longitude: -77.043 };
const OTTAWA: City = { name: "Ottawa", latitude: 45.411, longitude: -75.698 };

let store: CitiesStore;

beforeEach(async () => {
  await Bun.$`rm -rf ${TMP_DIR}`.quiet();
  await Bun.$`mkdir -p ${TMP_DIR}`.quiet();
  store = createStore(TMP_FILE);
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

  it("alterna la unidad de temperatura", async () => {
    expect(store.state.unit).toBe("celsius");
    await store.setUnit("fahrenheit");
    expect(store.state.unit).toBe("fahrenheit");
  });
});

describe("persistencia en cities.json", () => {
  it("recarga un estado guardado previamente", async () => {
    await store.addCity(LIMA);
    await store.addCity(OTTAWA);
    await store.setDefault("Ottawa");
    await store.setUnit("fahrenheit");

    const reloaded = createStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state).toEqual(store.state);
    expect(reloaded.defaultCity()?.name).toBe("Ottawa");
  });

  it("descarta datos corruptos y arranca con estado vacío", async () => {
    await Bun.write(TMP_FILE, "{ not valid json !!");
    const reloaded = createStore(TMP_FILE);
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
    const reloaded = createStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state.cities).toEqual([LIMA]);
    expect(reloaded.state.defaultCity).toBe("Lima");
  });

  it("nullifica la default si la ciudad guardada ya no existe", async () => {
    await Bun.write(
      TMP_FILE,
      JSON.stringify({ defaultCity: "Ottawa", unit: "celsius", cities: [LIMA] }),
    );
    const reloaded = createStore(TMP_FILE);
    await reloaded.load();
    expect(reloaded.state.defaultCity).toBeNull();
  });
});
