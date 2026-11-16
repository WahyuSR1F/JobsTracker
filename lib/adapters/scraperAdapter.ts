/**
 * METODE 2 — Adapter Scraper / HTML Extraction.
 *
 * Memakai `cheerio` untuk mem-parse HTML halaman publik (SSR/statis) lalu
 * mengekstrak daftar lowongan memakai CSS selector dari `config/jobSources.ts`.
 *
 * Adapter ini sengaja dibuat defensif:
 * - User-Agent + Accept-Language custom agar tidak dianggap bot mentah.
 * - Satu kartu rusak tidak menggagalkan seluruh sumber (try-catch per item).
 * - Error jaringan/timeout diteruskan dengan pesan yang jelas ke aggregator.
 *
 * Yang perlu kamu tahu: patuhi ToS & robots.txt situs target, jangan request
 * berlebihan (pakai cache di aggregator), dan jangan menyalin data berhak cipta.
 */

import * as cheerio from 'cheerio';
import { getSourceTimeout, type ScraperSourceConfig } from '@/config/jobSources';
import type { JobSearchQuery, UnifiedJob } from '@/types/job';
import {
  applyQueryTemplate,
  errorMessage,
  fallbackId,
  fetchWithTimeout,
  toAbsoluteUrl,
  toIsoDate,
} from './shared';

const MAX_JOBS_PER_SOURCE = 50;

const FALLBACK_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function scraperHeaders(source: ScraperSourceConfig): Record<string, string> {
  return {
    'User-Agent': process.env.JOB_SCRAPER_USER_AGENT?.trim() || FALLBACK_USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    ...source.headers,
  };
}

type Selection = ReturnType<ReturnType<typeof cheerio.load>>;

function readText(scope: Selection, selector: string): string | null {
  const text = scope.find(selector).first().text().replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : null;
}

function readHref(scope: Selection, selector: string): string | null {
  const element = scope.find(selector).first();
  const href = element.attr('href') ?? element.find('a').first().attr('href');
  if (href) return href;
  // Selector bisa menunjuk ke kartu itu sendiri yang berupa <a>.
  return scope.is('a') ? (scope.attr('href') ?? null) : null;
}

/** Halaman HTML → UnifiedJob[]. */
export async function fetchScrapedSource(
  source: ScraperSourceConfig,
  query: JobSearchQuery,
): Promise<UnifiedJob[]> {
  const url = applyQueryTemplate(source.endpointTemplate, query);

  const response = await fetchWithTimeout(
    url,
    { headers: scraperHeaders(source) },
    getSourceTimeout(source),
  );

  const html = await response.text();
  if (!html.trim()) throw new Error('Halaman kosong');

  const $ = cheerio.load(html);
  const cards = $(source.selectors.item);
  if (cards.length === 0) {
    throw new Error(`Selector item "${source.selectors.item}" tidak menemukan apa pun`);
  }

  const jobs: UnifiedJob[] = [];
  let skipped = 0;

  cards.each((_, element) => {
    try {
      const scope = $(element);

      const title = readText(scope, source.selectors.title);
      const company = readText(scope, source.selectors.company);
      const href = readHref(scope, source.selectors.url);
      const absoluteUrl = toAbsoluteUrl(href ?? undefined, url);

      if (!title || !company || !absoluteUrl) {
        skipped += 1;
        return;
      }

      jobs.push({
        id: fallbackId(source.id, absoluteUrl),
        title,
        company,
        location: source.selectors.location ? readText(scope, source.selectors.location) : null,
        salary: source.selectors.salary ? readText(scope, source.selectors.salary) : null,
        url: absoluteUrl,
        source: source.id,
        method: 'scraper',
        postedAt: source.selectors.postedAt
          ? toIsoDate(readText(scope, source.selectors.postedAt))
          : null,
      });
    } catch (error) {
      skipped += 1;
      console.warn(`[scraper:${source.id}] gagal mem-parse satu kartu: ${errorMessage(error)}`);
    }
  });

  if (jobs.length === 0) {
    throw new Error(`Semua ${skipped || cards.length} kartu tidak lengkap (judul/perusahaan/link)`);
  }

  return jobs.slice(0, MAX_JOBS_PER_SOURCE);
}
