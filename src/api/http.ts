export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al consultar OpenMeteo`);
  }
  return (await response.json()) as T;
}
