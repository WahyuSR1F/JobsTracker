/**
 * Skema data terpadu untuk semua sumber lowongan.
 *
 * Setiap adapter (API/RSS maupun scraper) WAJIB mengembalikan `UnifiedJob`
 * supaya UI dan aggregator tidak perlu tahu asal datanya.
 */

export const JOB_SOURCE_IDS = [
  'linkedin',
  'jobstreet',
  'glints',
  'lokernas',
  'disnaker',
  /** API publik tanpa API key, supaya agregator tetap berisi tanpa kredensial. */
  'remotive',
  'arbeitnow',
] as const;

export type JobSourceId = (typeof JOB_SOURCE_IDS)[number];

/** Metode pengambilan data: lewat API/RSS resmi, atau ekstraksi HTML. */
export type JobFetchMethod = 'api' | 'scraper';

export interface UnifiedJob {
  /** ID unik yang stabil: `${source}:${idAsli}` (atau hash URL bila sumber tak punya ID). */
  id: string;
  title: string;
  company: string;
  location: string | null;
  /** Teks gaji apa adanya dari sumber (mis. "Rp8.000.000 – Rp12.000.000"). */
  salary: string | null;
  /** Link asli lowongan. */
  url: string;
  source: JobSourceId;
  method: JobFetchMethod;
  /** Tanggal posting dalam ISO 8601 (null bila sumber tidak menyediakannya). */
  postedAt: string | null;
}

/** Hasil satu sumber setelah dijalankan. */
export interface JobSourceResult {
  source: JobSourceId;
  method: JobFetchMethod;
  jobs: UnifiedJob[];
}

/** Kegagalan satu sumber — tidak menggagalkan sumber lain. */
export interface JobSourceFailure {
  source: JobSourceId;
  method: JobFetchMethod;
  message: string;
}

export interface AggregatedJobs {
  jobs: UnifiedJob[];
  failures: JobSourceFailure[];
  /** Waktu data dikumpulkan, ISO 8601. */
  fetchedAt: string;
  /** true bila hasil diambil dari cache in-memory. */
  cached: boolean;
}

/** Parameter pencarian yang dipakai semua adapter. */
export interface JobSearchQuery {
  keyword: string;
  location: string;
}
