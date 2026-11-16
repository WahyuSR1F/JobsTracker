import Link from 'next/link';
import { APPLICATION_STATUSES, STATUS_META, type ApplicationStatus } from '@/lib/applications/status';

type StatusFilterTabsProps = {
  activeStatus?: ApplicationStatus;
  search?: string;
  totals: Partial<Record<ApplicationStatus, number>>;
  total: number;
};

function buildHref(status: ApplicationStatus | undefined, search: string | undefined) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('q', search);
  const query = params.toString();
  return query ? `/applications?${query}` : '/applications';
}

export function StatusFilterTabs({ activeStatus, search, totals, total }: StatusFilterTabsProps) {
  const tabClass = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-stone-900 text-white shadow-sm'
        : 'bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:text-stone-900 hover:ring-stone-300'
    }`;

  return (
    <nav aria-label="Filter status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link href={buildHref(undefined, search)} className={tabClass(!activeStatus)}>
        Semua
        <span className="text-xs opacity-70">{total}</span>
      </Link>
      {APPLICATION_STATUSES.map((status) => (
        <Link key={status} href={buildHref(status, search)} className={tabClass(activeStatus === status)}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} aria-hidden />
          {STATUS_META[status].label}
          <span className="text-xs opacity-70">{totals[status] ?? 0}</span>
        </Link>
      ))}
    </nav>
  );
}
