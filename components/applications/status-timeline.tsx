import { STATUS_META, isApplicationStatus } from '@/lib/applications/status';
import { formatDateTime } from '@/lib/applications/format';
import type { statusHistory } from '@/lib/db/schema';

type HistoryEntry = typeof statusHistory.$inferSelect;

export function StatusTimeline({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-stone-500">Belum ada riwayat status.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-stone-200 pl-6">
      {entries.map((entry) => {
        const to = isApplicationStatus(entry.toStatus) ? entry.toStatus : 'draft';
        const from = entry.fromStatus && isApplicationStatus(entry.fromStatus) ? entry.fromStatus : null;
        return (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-stone-50 ${STATUS_META[to].dot}`}
              aria-hidden
            />
            <p className="text-sm font-medium text-stone-900">
              {from ? `${STATUS_META[from].label} → ${STATUS_META[to].label}` : `Dimulai sebagai ${STATUS_META[to].label}`}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">{formatDateTime(entry.changedAt)} WIB</p>
            {entry.note && <p className="mt-1 text-sm text-stone-600">{entry.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
