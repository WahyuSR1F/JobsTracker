'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Building2, ExternalLink, Loader2, MapPin, Trash2, Wallet } from 'lucide-react';
import { formatDate } from '@/lib/applications/format';
import { WORK_TYPE_LABELS, type WorkType } from '@/lib/applications/status';
import type { jobListings } from '@/lib/db/schema';
import { callApi } from '@/lib/http';

type JobListingRow = typeof jobListings.$inferSelect;

export function JobListingCard({ listing }: { listing: JobListingRow }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workType = listing.workType as WorkType | null;

  async function handleDelete() {
    if (!window.confirm(`Hapus lowongan "${listing.position}" dari daftar?`)) return;
    setError(null);
    setIsDeleting(true);
    const result = await callApi<{ id: string }>(`/api/jobs/${listing.id}`, { method: 'DELETE' });
    setIsDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300">
      <div className="min-w-0 space-y-2">
        <h3 className="truncate text-base font-bold leading-snug text-stone-900">{listing.position}</h3>
        <p className="flex items-center gap-1.5 text-sm text-stone-600">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{listing.company}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.location}
              {workType && ` · ${WORK_TYPE_LABELS[workType]}`}
            </span>
          )}
          {!listing.location && workType && <span>{WORK_TYPE_LABELS[workType]}</span>}
          {listing.salaryNote && (
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              {listing.salaryNote}
            </span>
          )}
          {listing.source && <span>via {listing.source}</span>}
        </div>
        {listing.notes && <p className="line-clamp-2 text-xs leading-relaxed text-stone-500">{listing.notes}</p>}
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <span className="text-[11px] text-stone-400">Disimpan {formatDate(listing.createdAt)}</span>
        <div className="flex items-center gap-1">
          {listing.jobUrl && (
            <a
              href={listing.jobUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Hapus lowongan ${listing.position}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
