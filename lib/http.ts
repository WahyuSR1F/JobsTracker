export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function callApi<T>(url: string, init?: { method?: string; body?: unknown }): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: init?.method ?? 'GET',
      headers: init?.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok || data === null) {
      return { ok: false, error: data?.error ?? 'Terjadi kesalahan. Coba lagi.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Tidak bisa terhubung ke server. Periksa koneksimu.' };
  }
}
