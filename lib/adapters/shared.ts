import type { JobSearchQuery, UnifiedJob } from '@/types/job';

/** Ambil nilai bertingkat dari objek JSON: getPath(data, 'data.0.job_title'). */
export function getPath(value: unknown, path: string | undefined): unknown {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(key);
      return Number.isInteger(index) ? current[index] : undefined;
    }
    if (typeof current === 'object') return (current as Record<string, unknown>)[key];
    return undefined;
  }, value);
}

/** Ubah nilai apa pun menjadi string yang rapi, atau null bila kosong. */
export function toText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.replace(/\s+/g, ' ').trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value && typeof value === 'object' && '#text' in value) {
    return toText((value as { '#text': unknown })['#text']);
  }
  return null;
}

/** Normalisasi tanggal dari ISO string, epoch detik/ms, atau RFC 822 (RSS). */
export function toIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Angka < 10^12 dianggap detik (epoch detik), selebihnya milidetik.
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const text = toText(value);
  if (!text) return null;
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/** Ganti placeholder {keyword}/{location} dengan nilai ter-encode. */
export function applyQueryTemplate(template: string, query: JobSearchQuery): string {
  return template
    .replaceAll('{keyword}', encodeURIComponent(query.keyword))
    .replaceAll('{location}', encodeURIComponent(query.location));
}

/** Bangun URL dengan query param tambahan (nilai juga mendukung placeholder). */
export function buildUrl(
  endpoint: string,
  query: JobSearchQuery,
  params: Record<string, string> = {},
): URL {
  const url = new URL(applyQueryTemplate(endpoint, query));
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, applyQueryTemplate(value, query));
  }
  return url;
}

/** Link absolut yang aman; null bila bukan http(s) atau tidak valid. */
export function toAbsoluteUrl(href: string | undefined, base: string): string | null {
  if (!href) return null;
  try {
    const url = new URL(href.trim(), base);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Cocokkan lowongan dengan kata kunci di judul/perusahaan/lokasi.
 * Dipakai sumber yang API-nya tidak mendukung pencarian (lihat `keywordFilter`).
 */
export function matchesKeyword(
  job: Pick<UnifiedJob, 'title' | 'company' | 'location'>,
  keyword: string,
): boolean {
  const haystack = `${job.title} ${job.company} ${job.location ?? ''}`.toLowerCase();
  const tokens = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.length === 0 || tokens.every((token) => haystack.includes(token));
}

/** ID stabil untuk sumber yang tidak memberi ID: gabungan sumber + hash URL. */
export function fallbackId(source: string, url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return `${source}:${Math.abs(hash).toString(36)}`;
}

/** fetch() dengan timeout + pesan error yang jelas (dipakai kedua adapter). */
export async function fetchWithTimeout(
  url: string | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout setelah ${timeoutMs} ms`);
    }
    // "fetch failed" saja tidak informatif di UI; sebutkan host & penyebabnya.
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return String(url);
      }
    })();
    const detail = networkErrorDetail(error);
    throw new Error(detail ? `Gagal menghubungi ${host} — ${detail}` : `Gagal menghubungi ${host}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const snippet = body.replace(/\s+/g, ' ').slice(0, 160);
    throw new Error(`HTTP ${response.status}${snippet ? ` — ${snippet}` : ''}`);
  }

  return response;
}

function networkErrorDetail(error: unknown): string {
  if (!(error instanceof Error)) return errorMessage(error);

  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof AggregateError) {
    const first = cause.errors.find((item): item is Error => item instanceof Error);
    return first ? networkErrorDetail(first) : '';
  }
  if (cause instanceof Error) {
    const code = (cause as { code?: string }).code;
    return cause.message || code || '';
  }
  return error.message === 'fetch failed' ? '' : error.message;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Terjadi kesalahan tidak dikenal';
}
