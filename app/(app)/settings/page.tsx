import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Code2,
  KeyRound,
  Radio,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { getSourcesByMethod, isSourceConfigured, missingEnvFor, type JobSourceConfig } from '@/config/jobSources';
import { JobSearchTester } from '@/components/settings/job-search-tester';
import { requireUserId } from '@/lib/auth/current-user';
import type { JobFetchMethod } from '@/types/job';

type MethodKey = JobFetchMethod;

const METHODS: Record<
  MethodKey,
  { badge: string; title: string; description: string; icon: LucideIcon }
> = {
  api: {
    badge: 'Metode 1',
    title: 'API & RSS',
    description: 'Ambil data resmi lewat JSON API atau feed RSS/WordPress. Paling stabil dan aman.',
    icon: Radio,
  },
  scraper: {
    badge: 'Metode 2',
    title: 'Web Scraping',
    description: 'Ekstrak HTML halaman publik dengan CSS selector untuk situs yang tidak punya API.',
    icon: Code2,
  },
};

function statusOf(source: JobSourceConfig): {
  label: string;
  className: string;
  icon: LucideIcon;
} {
  if (!source.enabled) {
    return {
      label: 'Nonaktif',
      className: 'bg-stone-100 text-stone-600 ring-stone-200',
      icon: CircleSlash,
    };
  }
  const missing = missingEnvFor(source);
  if (missing.length > 0) {
    return {
      label: `Butuh ${missing.join(', ')}`,
      className: 'bg-amber-50 text-amber-800 ring-amber-200',
      icon: AlertTriangle,
    };
  }
  return {
    label: 'Siap dipakai',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    icon: CheckCircle2,
  };
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { metode?: string };
}) {
  await requireUserId();

  const activeMethod: MethodKey = searchParams.metode === 'scraper' ? 'scraper' : 'api';
  const sources = getSourcesByMethod(activeMethod);
  const activeMeta = METHODS[activeMethod];

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-7">
        <span
          className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <Settings2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
            <p className="mt-1 text-sm text-teal-50/85">
              Integrasi sumber lowongan kerja. Pilih metodenya, sisanya diatur dari file config.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Pilih metode" className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(METHODS) as MethodKey[]).map((key) => {
          const meta = METHODS[key];
          const active = key === activeMethod;
          const count = getSourcesByMethod(key).length;
          const ready = getSourcesByMethod(key).filter(
            (source) => source.enabled && isSourceConfigured(source),
          ).length;
          const Icon = meta.icon;

          return (
            <Link
              key={key}
              href={`/settings?metode=${key}`}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? 'rounded-2xl border border-teal-300 bg-white p-5 shadow-sm ring-2 ring-teal-600/20'
                  : 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-stone-300'
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={
                    active
                      ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white'
                      : 'flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700'
                  }
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                  {meta.badge}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-900">{meta.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{meta.description}</p>
              <p className="mt-3 text-[11px] font-medium text-stone-500">
                {ready} aktif dari {count} sumber
              </p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">
            Sumber — {activeMeta.badge}: {activeMeta.title}
          </h2>
          <span className="text-[11px] text-stone-500">{sources.length} sumber terdaftar</span>
        </div>

        <ul className="space-y-3">
          {sources.map((source) => {
            const status = statusOf(source);
            const StatusIcon = status.icon;
            const endpoint =
              source.method === 'api' ? source.endpoint : source.endpointTemplate;

            return (
              <li key={source.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900">{source.label}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-stone-400">
                      {source.id} · {source.method === 'api' ? source.transport : 'html'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                    {status.label}
                  </span>
                </div>

                <code className="mt-3 block truncate rounded-lg bg-stone-50 px-2.5 py-1.5 font-mono text-[11px] text-stone-600">
                  {endpoint}
                </code>

                <p className="mt-2 text-xs leading-relaxed text-stone-600">{source.notes}</p>

                {(source.requiredEnv ?? []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(source.requiredEnv ?? []).map((key) => {
                      const filled = Boolean(process.env[key]?.trim());
                      return (
                        <span
                          key={key}
                          className={
                            filled
                              ? 'inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] text-emerald-800 ring-1 ring-inset ring-emerald-200'
                              : 'inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-mono text-[11px] text-amber-800 ring-1 ring-inset ring-amber-200'
                          }
                        >
                          <KeyRound className="h-3 w-3" aria-hidden />
                          {key}
                          {filled ? ' terisi' : ' kosong'}
                        </span>
                      );
                    })}
                  </div>
                )}

                {source.method === 'scraper' && (
                  <dl className="mt-3 grid grid-cols-2 gap-1.5 rounded-lg bg-stone-50 p-3 text-[11px]">
                    {Object.entries(source.selectors).map(([field, selector]) => (
                      <div key={field} className="min-w-0">
                        <dt className="text-stone-500">{field}</dt>
                        <dd className="truncate font-mono text-stone-800">{selector}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <JobSearchTester />

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Cara mengatur sumber</h2>
        <ol className="mt-3 space-y-2 text-xs leading-relaxed text-stone-600">
          <li>
            <span className="font-semibold text-stone-900">1.</span> Buka{' '}
            <code className="rounded bg-stone-50 px-1.5 py-0.5 font-mono text-[11px]">
              config/jobSources.ts
            </code>{' '}
            — semua sumber, endpoint, API key, dan CSS selector ada di sana.
          </li>
          <li>
            <span className="font-semibold text-stone-900">2.</span> Ubah{' '}
            <code className="rounded bg-stone-50 px-1.5 py-0.5 font-mono text-[11px]">enabled</code>{' '}
            menjadi <code className="font-mono text-[11px]">true</code> dan isi variabel di{' '}
            <code className="rounded bg-stone-50 px-1.5 py-0.5 font-mono text-[11px]">.env</code>.
          </li>
          <li>
            <span className="font-semibold text-stone-900">3.</span> Sumber baru? Tambah id-nya di{' '}
            <code className="rounded bg-stone-50 px-1.5 py-0.5 font-mono text-[11px]">types/job.ts</code>{' '}
            lalu tambah satu objek konfigurasi. Tidak perlu menyentuh kode adapter.
          </li>
          <li>
            <span className="font-semibold text-stone-900">4.</span> Hasil pencarian di-cache 15 menit
            (atur lewat{' '}
            <code className="rounded bg-stone-50 px-1.5 py-0.5 font-mono text-[11px]">
              JOB_AGGREGATOR_CACHE_TTL_MS
            </code>
            ) agar API eksternal tidak kena rate limit.
          </li>
        </ol>
      </section>
    </div>
  );
}
