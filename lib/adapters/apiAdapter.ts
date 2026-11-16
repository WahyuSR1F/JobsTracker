/**
 * METODE 1 — Adapter API & RSS.
 *
 * Dua transport:
 * - `json`: API publik berbasis JSON (JSearch/RapidAPI, WordPress REST, dsb).
 * - `rss` : feed XML/RSS/Atom (mis. situs WordPress di /feed).
 *
 * Semua detail (endpoint, API key, nama field) diambil dari `config/jobSources.ts`,
 * jadi menambah sumber baru tidak perlu menyentuh file ini.
 */

import { XMLParser } from 'fast-xml-parser';
import { getSourceTimeout, type ApiSourceConfig, type JsonFieldMap } from '@/config/jobSources';
import type { JobSearchQuery, UnifiedJob } from '@/types/job';
import {
  applyQueryTemplate,
  buildUrl,
  errorMessage,
  fallbackId,
  fetchWithTimeout,
  getPath,
  toText,
  toIsoDate,
  matchesKeyword,
} from './shared';

const MAX_JOBS_PER_SOURCE = 50;

type JsonApiConfig = Extract<ApiSourceConfig, { transport: 'json' }>;
type RssApiConfig = Extract<ApiSourceConfig, { transport: 'rss' }>;

function apiKeyFor(source: JsonApiConfig): string | null {
  if (!source.apiKeyEnv) return null;
  const value = process.env[source.apiKeyEnv]?.trim();
  if (!value) throw new Error(`Env ${source.apiKeyEnv} belum diisi`);
  return value;
}

function normalizeId(source: ApiSourceConfig, rawId: string | null, url: string): string {
  return rawId ? `${source.id}:${rawId}` : fallbackId(source.id, url);
}

/** API JSON → UnifiedJob[]. Melempar error bila respons tidak bisa dipakai. */
export async function fetchJsonApiSource(
  source: JsonApiConfig,
  query: JobSearchQuery,
): Promise<UnifiedJob[]> {
  const url = buildUrl(source.endpoint, query, source.queryParams ?? {});

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...source.staticHeaders,
  };

  const apiKey = apiKeyFor(source);
  if (apiKey) {
    if (source.apiKeyHeader) headers[source.apiKeyHeader] = apiKey;
    if (source.apiKeyQueryParam) url.searchParams.set(source.apiKeyQueryParam, apiKey);
  }

  const response = await fetchWithTimeout(url, { headers }, getSourceTimeout(source));

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Respons bukan JSON yang valid');
  }

  const items = getPath(payload, source.fieldMap.items);
  if (!Array.isArray(items)) {
    throw new Error(`Path items "${source.fieldMap.items}" tidak berisi array`);
  }

  const mapped = mapJsonItems(source, source.fieldMap, items);
  const filtered = source.keywordFilter
    ? mapped.filter((job) => matchesKeyword(job, query.keyword))
    : mapped;

  return filtered.slice(0, MAX_JOBS_PER_SOURCE);
}

function mapJsonItems(
  source: ApiSourceConfig,
  fieldMap: JsonFieldMap,
  items: unknown[],
): UnifiedJob[] {
  const jobs: UnifiedJob[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const title = toText(getPath(item, fieldMap.title));
    const company = toText(getPath(item, fieldMap.company));
    const url = toText(getPath(item, fieldMap.url));

    // Lowongan tanpa judul/perusahaan/link tidak berguna untuk ditampilkan.
    if (!title || !company || !url) continue;

    const rawId = toText(getPath(item, fieldMap.id));

    jobs.push({
      id: normalizeId(source, rawId, url),
      title,
      company,
      location: fieldMap.location ? toText(getPath(item, fieldMap.location)) : null,
      salary: fieldMap.salary ? toText(getPath(item, fieldMap.salary)) : null,
      url,
      source: source.id,
      method: 'api',
      postedAt: fieldMap.postedAt ? toIsoDate(getPath(item, fieldMap.postedAt)) : null,
    });
  }

  return jobs;
}

/* ------------------------------ RSS / Atom ------------------------------ */

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseTagValue: false,
  processEntities: true,
});

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

/** <link> di RSS berupa teks, di Atom berupa atribut href (bisa array). */
function extractLink(value: unknown): string | null {
  const direct = toText(value);
  if (direct) return direct;

  for (const entry of asArray(value)) {
    if (entry && typeof entry === 'object') {
      const href = toText((entry as Record<string, unknown>)['@_href']);
      if (href) return href;
    }
  }
  return null;
}

function handleRssLink(value: unknown): string | null {
  return extractLink(value);
}

/** Feed RSS/Atom → UnifiedJob[]. */
export async function fetchRssSource(
  source: RssApiConfig,
  query: JobSearchQuery,
): Promise<UnifiedJob[]> {
  const url = new URL(applyQueryTemplate(source.endpoint, query));

  const response = await fetchWithTimeout(
    url,
    { headers: { Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8' } },
    getSourceTimeout(source),
  );

  const xml = await response.text();
  if (!xml.trim()) throw new Error('Feed kosong');

  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xml);
  } catch (error) {
    throw new Error(`XML tidak valid: ${errorMessage(error)}`);
  }

  const fieldMap = source.fieldMap ?? {};
  const itemsPath = fieldMap.items ?? 'rss.channel.item';
  const rawItems = getPath(parsed, itemsPath);
  const items = asArray(rawItems);
  if (items.length === 0) throw new Error(`Tidak ada item pada path "${itemsPath}"`);

  const channelTitle = toText(getPath(parsed, itemsPath.replace(/\.?item$/, '') + '.title'));

  const jobs: UnifiedJob[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const title = toText(getPath(item, fieldMap.title ?? 'title'));
    const link = handleRssLink(getPath(item, fieldMap.link ?? 'link'));
    if (!title || !link) continue;

    const company =
      toText(getPath(item, fieldMap.company ?? 'author')) ?? channelTitle ?? 'Tidak diketahui';

    jobs.push({
      id: fallbackId(source.id, link),
      title,
      company,
      location: fieldMap.location ? toText(getPath(item, fieldMap.location)) : null,
      salary: null,
      url: link,
      source: source.id,
      method: 'api',
      postedAt: toIsoDate(getPath(item, fieldMap.postedAt ?? 'pubDate')),
    });
  }

  if (jobs.length === 0) throw new Error('Tidak ada item yang bisa dipetakan ke lowongan');

  const filtered = source.keywordFilter
    ? jobs.filter((job) => matchesKeyword(job, query.keyword))
    : jobs;

  return filtered.slice(0, MAX_JOBS_PER_SOURCE);
}

/** Dispatcher metode 1: pilih transport sesuai konfigurasi. */
export async function fetchApiSource(
  source: ApiSourceConfig,
  query: JobSearchQuery,
): Promise<UnifiedJob[]> {
  return source.transport === 'json'
    ? fetchJsonApiSource(source, query)
    : fetchRssSource(source, query);
}
