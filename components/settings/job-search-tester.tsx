'use client';

import { useState } from 'react';
import { AlertTriangle, ExternalLink, Loader2, Search } from 'lucide-react';
import { FIELD_CLASS } from '@/components/applications/field-classes';
import { callApi } from '@/lib/http';
import type { AggregatedJobs } from '@/types/job';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: AggregatedJobs };

export function JobSearchTester() {
  const [keyword, setKeyword] = useState('developer');
  const [location, setLocation] = useState('jakarta');
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'loading' });

    const params = new URLSearchParams({ q: keyword.trim(), loc: location.trim() });
    const response = await callApi<AggregatedJobs>(`/api/jobs/search?${params.toString()}`);

    if (!response.ok) {
      setState({ status: 'error', message: response.error });
      return;
    }
    setState({ status: 'done', result: response.data });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-stone-900">Uji integrasi</h2>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">
        Jalankan pencarian nyata dari semua sumber yang aktif dan siap dipakai.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-700">Kata kunci</span>
          <input
            required
            minLength={2}
            maxLength={80}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="developer"
            className={FIELD_CLASS}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-700">Lokasi</span>
          <input
            maxLength={80}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="jakarta"
            className={FIELD_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:opacity-60"
        >
          {state.status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
          {state.status === 'loading' ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {state.status === 'error' && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 ring-1 ring-inset ring-red-200">
          {state.message}
        </p>
      )}

      {state.status === 'done' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 ring-1 ring-inset ring-teal-200">
              {state.result.jobs.length} lowongan
            </span>
            <span>{new Date(state.result.fetchedAt).toLocaleString('id-ID')}</span>
            {state.result.cached && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">
                dari cache
              </span>
            )}
          </div>

          {state.result.failures.length > 0 && (
            <ul className="space-y-1.5">
              {state.result.failures.map((failure) => (
                <li
                  key={`${failure.source}-${failure.method}`}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-900 ring-1 ring-inset ring-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold">{failure.source}</span> ({failure.method}):{' '}
                    {failure.message}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {state.result.jobs.length === 0 ? (
            <p className="text-xs text-stone-600">
              Tidak ada lowongan. Periksa sumber yang aktif, API key, dan query pencariannya.
            </p>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
              {state.result.jobs.slice(0, 5).map((job) => (
                <li key={job.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-stone-900">{job.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-stone-500">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ''}
                    </p>
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-stone-50 px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-100"
                  >
                    {job.source}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
