/**
 * Aggregator: jalankan semua sumber aktif secara paralel, gabungkan hasilnya.
 *
 * - `Promise.allSettled` → satu sumber gagal/timeout tidak mematikan yang lain.
 * - Deduplikasi berdasarkan URL (lowongan sama sering muncul di beberapa sumber).
 * - Urut dari yang paling baru.
 * - Cache in-memory singkat supaya API eksternal tidak kena rate limit.
 */

import { getRunnableSources, getSourceTimeout, type JobSourceConfig } from '@/config/jobSources';
import { fetchApiSource } from '@/lib/adapters/apiAdapter';
import { fetchScrapedSource } from '@/lib/adapters/scraperAdapter';
import { errorMessage } from '@/lib/adapters/shared';
import type {
  AggregatedJobs,
  JobSearchQuery,
  JobSourceFailure,
  JobSourceResult,
  UnifiedJob,
} from '@/types/job';

const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

type CacheEntry = { expiresAt: number; value: AggregatedJobs };

const cache = new Map<string, CacheEntry>();

function cacheTtlMs(): number {
  const raw = Number(process.env.JOB_AGGREGATOR_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_TTL_MS;
}

function cacheKey(query: JobSearchQuery): string {
  return `${query.keyword.toLowerCase()}|${query.location.toLowerCase()}`;
}

async function runSource(
  source: JobSourceConfig,
  query: JobSearchQuery,
): Promise<JobSourceResult> {
  const jobs =
    source.method === 'api'
      ? await fetchApiSource(source, query)
      : await fetchScrapedSource(source, query);

  return { source: source.id, method: source.method, jobs };
}

/** Buang duplikat URL (tanpa membedakan huruf besar/kecil dan trailing slash). */
function dedupeByUrl(jobs: UnifiedJob[]): UnifiedJob[] {
  const seen = new Set<string>();
  const unique: UnifiedJob[] = [];

  for (const job of jobs) {
    const key = job.url.trim().toLowerCase().replace(/\/+$/, '');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(job);
  }

  return unique;
}

function sortByNewest(jobs: UnifiedJob[]): UnifiedJob[] {
  return [...jobs].sort((a, b) => {
    const aTime = a.postedAt ? Date.parse(a.postedAt) : Number.NEGATIVE_INFINITY;
    const bTime = b.postedAt ? Date.parse(b.postedAt) : Number.NEGATIVE_INFINITY;
    if (aTime !== bTime) return bTime - aTime;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Ambil lowongan dari semua sumber aktif.
 * Mengembalikan `failures` agar UI bisa memberi tahu sumber mana yang sedang down.
 */
export async function fetchAllJobs(
  keyword: string,
  location: string,
): Promise<AggregatedJobs> {
  const query: JobSearchQuery = {
    keyword: keyword.trim(),
    // JSearch butuh lokasi; default ke Indonesia bila kosong.
    location: location.trim() || 'Indonesia',
  };

  const key = cacheKey(query);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.value, cached: true };
  }

  const sources = getRunnableSources();
  const settled = await Promise.allSettled(
    sources.map((source) =>
      // each source punya timeout sendiri; timer ini hanya jaring pengaman.
      Promise.race([
        runSource(source, query),
        new Promise<JobSourceResult>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout sumber setelah ${getSourceTimeout(source)} ms`)),
            getSourceTimeout(source) + 1_000,
          ),
        ),
      ]),
    ),
  );

  const collected: UnifiedJob[] = [];
  const failures: JobSourceFailure[] = [];

  settled.forEach((result, index) => {
    const source = sources[index];
    if (result.status === 'fulfilled') {
      collected.push(...result.value.jobs);
      return;
    }
    failures.push({
      source: source.id,
      method: source.method,
      message: errorMessage(result.reason),
    });
  });

  const value: AggregatedJobs = {
    jobs: sortByNewest(dedupeByUrl(collected)),
    failures,
    fetchedAt: new Date().toISOString(),
    cached: false,
  };

  cache.set(key, { expiresAt: Date.now() + cacheTtlMs(), value });
  return value;
}

/** Dipakai untuk pengujian/manual refresh. */
export function clearJobCache(): void {
  cache.clear();
}
