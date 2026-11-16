import { Inbox, Search } from 'lucide-react';
import { ApplicationCard } from '@/components/applications/application-card';
import { StatusFilterTabs } from '@/components/applications/status-filter-tabs';
import { countApplicationsByStatus, listApplications } from '@/lib/applications/queries';
import { isApplicationStatus } from '@/lib/applications/status';
import { requireUserId } from '@/lib/auth/current-user';

type ApplicationsPageProps = {
  searchParams: { status?: string; q?: string };
};

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const userId = await requireUserId();
  const status = isApplicationStatus(searchParams.status) ? searchParams.status : undefined;
  const search = searchParams.q?.trim() || undefined;

  const [applications, totals] = await Promise.all([
    listApplications(userId, { status, search }),
    countApplicationsByStatus(userId),
  ]);
  const total = Object.values(totals).reduce((sum, count) => sum + (count ?? 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Lamaran</h1>
        <p className="mt-1 text-sm text-stone-600">{total} lamaran tercatat</p>
      </header>

      <div className="space-y-4">
        <form action="/applications" className="relative">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            name="q"
            defaultValue={search ?? ''}
            placeholder="Cari perusahaan atau posisi..."
            className="h-11 w-full rounded-lg border border-stone-300 bg-white pl-10 pr-3.5 text-[15px] text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </form>
        <StatusFilterTabs activeStatus={status} search={search} totals={totals} total={total} />
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <Inbox className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-bold text-stone-900">Belum ada lamaran di sini</h2>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-stone-600">
            {search || status
              ? 'Coba ubah filter atau kata pencarianmu.'
              : 'Mulai catat lamaran pertamamu supaya progresnya terpantau.'}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => (
            <li key={application.id}>
              <ApplicationCard application={application} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
