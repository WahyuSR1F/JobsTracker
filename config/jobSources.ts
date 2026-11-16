/**
 * ============================================================================
 * KONFIGURASI SUMBER LOWONGAN (satu-satunya tempat yang perlu kamu ubah)
 * ============================================================================
 *
 * Cara kerja:
 * - Setiap entri di `JOB_SOURCES` adalah satu sumber (LinkedIn, JobStreet, ...).
 * - `enabled: false` → sumber dilewati total, tidak ada request keluar.
 * - `method: 'api'`     → metode 1, dijalankan oleh `lib/adapters/apiAdapter.ts`.
 * - `method: 'scraper'` → metode 2, dijalankan oleh `lib/adapters/scraperAdapter.ts`.
 *
 * Menambah sumber baru (3 langkah):
 * 1. Tambahkan id barunya ke `JOB_SOURCE_IDS` di `types/job.ts`.
 * 2. Tambahkan satu objek ke array `JOB_SOURCES` di bawah (pilih method + transport).
 * 3. Isi API key di `.env` bila ada `requiredEnv`. Selesai — UI Pengaturan dan
 *    aggregator otomatis membaca konfigurasi ini.
 *
 * Placeholder URL yang bisa dipakai di `endpoint`/`endpointTemplate`/`queryParams`:
 *   {keyword}  → kata kunci yang di-encode otomatis
 *   {location} → lokasi yang di-encode otomatis
 *
 * Catatan hukum: scraping hanya boleh dilakukan pada halaman publik milikmu
 * sendiri atau yang mengizinkannya di ToS/robots.txt. Sumber scraper di bawah
 * sengaja `enabled: false` sampai kamu memverifikasi URL & selectornya.
 */

import type { JobFetchMethod, JobSourceId } from '@/types/job';

type BaseSourceConfig = {
  id: JobSourceId;
  label: string;
  /** Matikan bila sumber sedang bermasalah atau belum siap dipakai. */
  enabled: boolean;
  /** Keterangan singkat yang tampil di halaman Pengaturan. */
  notes: string;
  /** Batas waktu request per sumber (ms). Default 10.000. */
  timeoutMs?: number;
  /** Env yang wajib terisi sebelum sumber dianggap siap. */
  requiredEnv?: string[];
  /**
   * Saring hasil di sisi kita berdasarkan kata kunci. Pakai untuk API yang
   * mengabaikan parameter pencarian (mis. Remotive selalu mengirim daftar terbaru).
   */
  keywordFilter?: boolean;
};

/** Pemetaan field JSON API → UnifiedJob. Mendukung path bertingkat: "data.0.job_title". */
export type JsonFieldMap = {
  /** Path ke array item, mis. "data" atau "jobs.results". */
  items: string;
  id?: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  url: string;
  postedAt?: string;
};

/** Pemetaan field RSS/Atom → UnifiedJob. Path relatif terhadap satu <item>. */
export type RssFieldMap = {
  /** Path ke array item. Default "rss.channel.item". */
  items?: string;
  title?: string;
  link?: string;
  company?: string;
  location?: string;
  postedAt?: string;
};

export type ApiSourceConfig = BaseSourceConfig & {
  method: 'api';
} & (
    | {
        transport: 'json';
        endpoint: string;
        /** Nama env berisi API key, mis. "RAPIDAPI_KEY". */
        apiKeyEnv?: string;
        /** Header tempat API key dikirim, mis. "X-RapidAPI-Key". */
        apiKeyHeader?: string;
        /** Alternatif: query param tempat API key dikirim. */
        apiKeyQueryParam?: string;
        /** Header statis tambahan (mis. X-RapidAPI-Host). */
        staticHeaders?: Record<string, string>;
        /** Query param tambahan; nilai boleh memakai {keyword}/{location}. */
        queryParams?: Record<string, string>;
        fieldMap: JsonFieldMap;
      }
    | {
        transport: 'rss';
        endpoint: string;
        fieldMap?: RssFieldMap;
      }
  );

export type ScraperSourceConfig = BaseSourceConfig & {
  method: 'scraper';
  /** URL halaman daftar lowongan; boleh memakai {keyword}/{location}. */
  endpointTemplate: string;
  selectors: {
    /** Selector untuk tiap kartu/baris lowongan. */
    item: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    /** Selector elemen <a> atau atribut href yang berisi link lowongan. */
    url: string;
    postedAt?: string;
  };
  /** Header tambahan; User-Agent & Accept-Language sudah diisi adapter. */
  headers?: Record<string, string>;
};

export type JobSourceConfig = ApiSourceConfig | ScraperSourceConfig;

const DEFAULT_TIMEOUT_MS = 10_000;

export const JOB_SOURCES: JobSourceConfig[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn (via JSearch / RapidAPI)',
    method: 'api',
    enabled: true,
    requiredEnv: ['RAPIDAPI_KEY'],
    timeoutMs: 12_000,
    notes:
      'LinkedIn tidak menyediakan API lowongan publik, jadi datanya diambil lewat agregator JSearch di RapidAPI. Daftar di rapidapi.com → subscribe "JSearch" → salin key ke RAPIDAPI_KEY.',
    transport: 'json',
    endpoint: 'https://jsearch.p.rapidapi.com/search',
    apiKeyEnv: 'RAPIDAPI_KEY',
    apiKeyHeader: 'X-RapidAPI-Key',
    staticHeaders: {
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      Accept: 'application/json',
    },
    queryParams: {
      query: '{keyword} in {location}',
      page: '1',
      num_pages: '1',
      date_posted: 'all',
    },
    fieldMap: {
      items: 'data',
      id: 'job_id',
      title: 'job_title',
      company: 'employer_name',
      location: 'job_city',
      url: 'job_apply_link',
      postedAt: 'job_posted_at_datetime_utc',
    },
  },
  {
    id: 'remotive',
    label: 'Remotive (API publik, tanpa key)',
    method: 'api',
    enabled: true,
    timeoutMs: 12_000,
    notes:
      'Lowongan remote global, langsung jalan tanpa API key. Berguna sebagai sumber default sebelum API berbayar (JSearch/JobStreet) diaktifkan. API Remotive mengabaikan parameter pencarian, jadi hasilnya disaring sendiri berdasarkan kata kunci (keywordFilter).',
    keywordFilter: true,
    transport: 'json',
    endpoint: 'https://remotive.com/api/remote-jobs',
    queryParams: {
      limit: '30',
    },
    fieldMap: {
      items: 'jobs',
      id: 'id',
      title: 'title',
      company: 'company_name',
      location: 'candidate_required_location',
      salary: 'salary',
      url: 'url',
      postedAt: 'publication_date',
    },
  },
  {
    id: 'arbeitnow',
    label: 'Arbeitnow (API publik, tanpa key)',
    method: 'api',
    enabled: true,
    keywordFilter: true,
    timeoutMs: 15_000,
    notes:
      'Papan lowongan remote tanpa API key dengan ratusan posisi terbaru. Isinya banyak berasal dari Eropa/Jerman, jadi pakai sebagai pelengkap dan saring kata kunci tetap aktif. API ini tidak menerima parameter pencarian, hasilnya disaring sendiri (keywordFilter).',
    transport: 'json',
    endpoint: 'https://www.arbeitnow.com/api/job-board-api',
    fieldMap: {
      items: 'data',
      title: 'title',
      company: 'company_name',
      location: 'location',
      url: 'url',
      postedAt: 'created_at',
    },
  },
  {
    id: 'jobstreet',
    label: 'JobStreet',
    method: 'api',
    enabled: false,
    notes:
      'JobStreet (SEEK) tidak punya API pencarian publik. Aktifkan hanya jika kamu punya akses partner API, lalu ganti endpoint + fieldMap di bawah.',
    transport: 'json',
    endpoint: 'https://api.partner-jobstreet.example/v1/jobs',
    apiKeyEnv: 'JOBSTREET_API_KEY',
    apiKeyHeader: 'Authorization',
    queryParams: {
      keyword: '{keyword}',
      location: '{location}',
      page: '1',
    },
    fieldMap: {
      items: 'data.jobs',
      id: 'id',
      title: 'title',
      company: 'company.name',
      location: 'location.name',
      salary: 'salary.label',
      url: 'url',
      postedAt: 'postedAt',
    },
  },
  {
    id: 'glints',
    label: 'Glints',
    method: 'api',
    enabled: false,
    notes:
      'Glints memakai API internal (tidak berdokumen resmi). Isi endpoint & fieldMap sesuai respons yang kamu dapat, dan patuhi ToS mereka.',
    transport: 'json',
    endpoint: 'https://glints.com/api/v2/job/search',
    queryParams: {
      keyword: '{keyword}',
      location: '{location}',
      limit: '20',
    },
    fieldMap: {
      items: 'data.jobs',
      id: 'id',
      title: 'title',
      company: 'company.name',
      location: 'location.city',
      salary: 'salary.estimate',
      url: 'url',
      postedAt: 'createdAt',
    },
  },
  {
    id: 'lokernas',
    label: 'Lokernas (RSS / WordPress feed)',
    method: 'api',
    enabled: false,
    notes:
      'Situs WordPress biasanya punya feed di /feed (RSS) atau JSON API /wp-json/wp/v2/posts. Verifikasi URL-nya dulu, lalu aktifkan. Untuk JSON API, pakai transport "json" + fieldMap.',
    transport: 'rss',
    endpoint: 'https://lokernas.com/feed',
    fieldMap: {
      items: 'rss.channel.item',
      title: 'title',
      link: 'link',
      company: 'author',
      postedAt: 'pubDate',
    },
  },
  {
    id: 'disnaker',
    label: 'Disnaker (web scraping)',
    method: 'scraper',
    enabled: false,
    notes:
      'Contoh metode 2: portal Disnaker adalah halaman SSR tanpa API. Ganti URL dan selector sesuai struktur HTML terbaru; jalankan hanya bila halaman publik itu mengizinkannya.',
    endpointTemplate: 'https://disnaker.example.go.id/lowongan?q={keyword}&lokasi={location}',
    selectors: {
      item: 'article.job-card',
      title: '.job-card__title',
      company: '.job-card__company',
      location: '.job-card__location',
      salary: '.job-card__salary',
      url: 'a.job-card__link',
      postedAt: '.job-card__date',
    },
  },
];

/** Sumber aktif untuk satu metode. */
export function getSourcesByMethod(method: JobFetchMethod): JobSourceConfig[] {
  return JOB_SOURCES.filter((source) => source.method === method);
}

/** true bila semua env yang dibutuhkan sumber sudah terisi. */
export function isSourceConfigured(source: JobSourceConfig): boolean {
  return (source.requiredEnv ?? []).every((key) => Boolean(process.env[key]?.trim()));
}

/** Env yang masih kosong untuk sumber ini. */
export function missingEnvFor(source: JobSourceConfig): string[] {
  return (source.requiredEnv ?? []).filter((key) => !process.env[key]?.trim());
}

/** Sumber yang benar-benar akan dipanggil aggregator. */
export function getRunnableSources(): JobSourceConfig[] {
  return JOB_SOURCES.filter((source) => source.enabled && isSourceConfigured(source));
}

export function getSourceTimeout(source: JobSourceConfig): number {
  return source.timeoutMs ?? DEFAULT_TIMEOUT_MS;
}
