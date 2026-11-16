import Link from 'next/link';
import { Building2, CalendarDays, MapPin, Wallet } from 'lucide-react';
import type { applications } from '@/lib/db/schema';
import { formatDate } from '@/lib/applications/format';
import { STATUS_META, WORK_TYPE_LABELS, isApplicationStatus, type WorkType } from '@/lib/applications/status';
import { StatusBadge } from './status-badge';
import { StatusQuickSelect } from './status-quick-select';

type ApplicationRow = typeof applications.$inferSelect;

export function ApplicationCard({ application }: { application: ApplicationRow }) {
  const status = isApplicationStatus(application.status) ? application.status : 'draft';
  const workType = application.workType as WorkType | null;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${STATUS_META[status].bar}`} aria-hidden />
      <div className="flex flex-col gap-3 p-4 pl-5">
        <div className="min-w-0 flex-1 space-y-2">
          <Link href={`/applications/${application.id}`} className="block focus:outline-none">
            <h2 className="truncate text-lg font-bold leading-snug text-stone-900 group-hover:text-teal-800">
              {application.position}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-600">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{application.company}</span>
            </p>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {application.location}
                {workType && ` · ${WORK_TYPE_LABELS[workType]}`}
              </span>
            )}
            {application.appliedAt && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Melamar {formatDate(application.appliedAt)}
              </span>
            )}
            {application.salaryNote && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                {application.salaryNote}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <StatusBadge status={status} />
          <StatusQuickSelect applicationId={application.id} status={status} />
        </div>
      </div>
    </article>
  );
}
