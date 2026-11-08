import { afterEach } from "bun:test";

export interface StubRoute {
  matches: (url: string) => boolean;
  status?: number;
  body?: unknown;
}

const REAL_FETCH = globalThis.fetch;
const requestedUrls: string[] = [];
let routes: StubRoute[] = [];

export function stubFetch(newRoutes: StubRoute[]): void {
  routes = newRoutes;
  globalThis.fetch = (async (input: unknown) => {
    const url = String(input);
    requestedUrls.push(url);
    const route = routes.find((entry) => entry.matches(url));
    if (!route) throw new Error(`URL no simulada en el test: ${url}`);
    const body = typeof route.body === "string" ? route.body : JSON.stringify(route.body ?? {});
    return new Response(body, {
      status: route.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

export function lastRequestedUrl(): string {
  return requestedUrls.at(-1) ?? "";
}

// Cada archivo de test debe llamar afterEach(restoreFetchStub):
// los hooks de módulos compartidos no aplican a todos los archivos
export function restoreFetchStub(): void {
  routes = [];
  requestedUrls.length = 0;
  globalThis.fetch = REAL_FETCH;
}

afterEach(restoreFetchStub);
