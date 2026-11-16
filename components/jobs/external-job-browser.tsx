'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Briefcase, ExternalLink, Loader2, MapPin, Search, SlidersHorizontal, Wallet } from 'lucide-react';
import { FIELD_CLASS } from '@/components/applications/field-classes';
import { callApi } from '@/lib/http';
import type { AggregatedJobs, UnifiedJob } from '@/types/job';

const SOURCE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  jobstreet: 'JobStreet',
  glints: 'Glints',
  lokernas: 'Lokernas',
  disnaker: 'Disnaker',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: AggregatedJobs };

type DateFilter = 'all' | '1d' | '7d' | '30d';

const DATE_FILTERS: { value: DateFilter; label: string; days?: number }[] = [
  { value: 'all', label: 'Semua tanggal' },
  { value: '1d', label: '24 jam', days: 1 },
  { value: '7d', label: '7 hari', days: 7 },
  { value: '30d', label: '30 hari', days: 30 },
];

function formatPostedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function JobCard({ job }: { job: UnifiedJob }) {
  const posted = formatPostedAt(job.postedAt);
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">{job.title}</h3>
          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
            {SOURCE_LABELS[job.source] ?? job.source}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-stone-700">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
          <span className="truncate">{job.company}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" aria-hidden />
              {job.salary}
            </span>
          )}
          {posted && <span>Diposting {posted}</span>}
        </div>
      </div>
      <div className="mt-auto flex justify-end pt-1">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
        >
          Lihat lowongan
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </li>
  );
}

export function ExternalJobBrowser() {
  const [keyword, setKeyword] = useState('developer');
  const [location, setLocation] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [state, setState] = useState<State>({ status: 'loading' });
  const didInit = useRef(false);

  const runSearch = useCallback(async (q: string, loc: string) => {
    const keywordValue = q.trim();
    if (keywordValue.length < 2) return;
    setState({ status: 'loading' });
    setSourceFilter('all');
    setDateFilter('all');

    const params = new URLSearchParams({ q: keywordValue });
    const locationValue = loc.trim();
    if (locationValue) params.set('loc', locationValue);
    const response = await callApi<AggregatedJobs>(`/api/jobs/search?${params.toString()}`);

    if (!response.ok) {
      setState({ status: 'error', message: response.error });
      return;
    }
    setState({ status: 'done', result: response.data });
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void runSearch('developer', '');
  }, [runSearch]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(keyword, location);
  }

  const sources = useMemo(() => {
    if (state.status !== 'done') return [];
    const counts = new Map<string, number>();
    for (const job of state.result.jobs) {
      counts.set(job.source, (counts.get(job.source) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [state]);

  const visibleJobs = useMemo(() => {
    if (state.status !== 'done') return [];
    let jobs = state.result.jobs;
    if (sourceFilter !== 'all') {
      jobs = jobs.filter((job) => job.source === sourceFilter);
    }
    if (dateFilter !== 'all') {
      const option = DATE_FILTERS.find((f) => f.value === dateFilter);
      const days = option?.days ?? 0;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      jobs = jobs.filter((job) => {
        if (!job.postedAt) return false;
        const t = Date.parse(job.postedAt);
        return Number.isFinite(t) && t >= cutoff;
      });
    }
    return jobs;
  }, [state, sourceFilter, dateFilter]);

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
      <header>
        <h2 className="text-base font-semibold text-stone-900">Cari lowongan kerja</h2>
        <p className="mt-1 text-sm text-stone-600">
          Daftar lowongan dari berbagai sumber (API, RSS, dan web scraping) ditampilkan di sini — bukan dibuat olehmu. Default menampilkan semua sumber; gunakan filter sumber atau ubah pencarian.
        </p>
      </header>

      <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-700">Kata kunci</span>
          <input
            required
            minLength={2}
            maxLength={80}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Contoh: developer, designer, marketing"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-700">Lokasi (opsional)</span>
          <input
            maxLength={80}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: jakarta, remote"
            className={FIELD_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:opacity-60"
        >
          {state.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
          {state.status === 'loading' ? 'Mencari...' : 'Cari lowongan'}
        </button>
      </form>

      <div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset transition-colors ${
            showFilters || sourceFilter !== 'all' || dateFilter !== 'all'
              ? 'bg-teal-50 text-teal-800 ring-teal-200'
              : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filter
          {(sourceFilter !== 'all' || dateFilter !== 'all') && (
            <span className="rounded-full bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              Aktif
            </span>
          )}
        </button>
      </div>

      {state.status === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-inset ring-red-200">{state.message}</p>
      )}

      {state.status === 'done' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 ring-1 ring-inset ring-teal-200">
              {state.result.jobs.length} lowongan ditemukan
            </span>
            {(sourceFilter !== 'all' || dateFilter !== 'all') && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
                Ditampilkan: {visibleJobs.length}
              </span>
            )}
            <span>{new Date(state.result.fetchedAt).toLocaleString('id-ID')}</span>
            {state.result.cached && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">dari cache</span>
            )}
          </div>

          {showFilters && sources.length >= 1 && (
            <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-3">
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-stone-600">Filter sumber</span>
                <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                  <button
                    type="button"
                    onClick={() => setSourceFilter('all')}
                    className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                      sourceFilter === 'all'
                        ? 'bg-teal-700 text-white ring-teal-700 shadow-sm'
                        : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Semua ({state.result.jobs.length})
                  </button>
                  {sources.map(([source, count]) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setSourceFilter(source)}
                      className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                        sourceFilter === source
                          ? 'bg-teal-700 text-white ring-teal-700 shadow-sm'
                          : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {SOURCE_LABELS[source] ?? source} ({count})
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-stone-600">Filter tanggal</span>
                <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                  {DATE_FILTERS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDateFilter(option.value)}
                      className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                        dateFilter === option.value
                          ? 'bg-teal-700 text-white ring-teal-700 shadow-sm'
                          : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state.result.failures.length > 0 && (
            <ul className="space-y-1.5">
              {state.result.failures.map((failure) => (
                <li
                  key={`${failure.source}-${failure.method}`}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold">{SOURCE_LABELS[failure.source] ?? failure.source}</span> ({failure.method}): {failure.message}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {visibleJobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
              <p className="text-sm text-stone-600">Tidak ada lowongan yang cocok.</p>
              <p className="mt-1 text-xs text-stone-500">Coba ubah kata kunci, lokasi, atau filter sumber.</p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </ul>
          )}
        </div>
      )}

      {state.status === 'loading' && (
        <p className="text-xs text-stone-500">Memuat daftar lowongan dari semua sumber...</p>
      )}
    </section>
  );
}
