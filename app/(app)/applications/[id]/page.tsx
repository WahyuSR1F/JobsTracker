import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import { DeleteApplicationButton } from '@/components/applications/delete-application-button';
import { StatusBadge } from '@/components/applications/status-badge';
import { StatusQuickSelect } from '@/components/applications/status-quick-select';
import { StatusTimeline } from '@/components/applications/status-timeline';
import { formatDate } from '@/lib/applications/format';
import { getApplication, getStatusHistory } from '@/lib/applications/queries';
import { STATUS_META, WORK_TYPE_LABELS, isApplicationStatus, type WorkType } from '@/lib/applications/status';
import { requireUserId } from '@/lib/auth/current-user';

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const application = await getApplication(userId, params.id);
  if (!application) notFound();

  const history = await getStatusHistory(application.id);
  const status = isApplicationStatus(application.status) ? application.status : 'draft';
  const workType = application.workType as WorkType | null;

  const details: { label: string; value: React.ReactNode }[] = [
    { label: 'Lokasi', value: application.location },
    { label: 'Tipe kerja', value: workType ? WORK_TYPE_LABELS[workType] : null },
    { label: 'Sumber', value: application.source },
    { label: 'Tanggal melamar', value: application.appliedAt ? formatDate(application.appliedAt) : null },
    { label: 'Gaji', value: application.salaryNote },
    {
      label: 'Link lowongan',
      value: application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-teal-700 underline-offset-4 hover:underline"
        >
          Buka lowongan
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar
        </Link>
        <div className="flex flex-col gap-4">
          <div className="min-w-0 space-y-3">
            <StatusBadge status={status} />
            <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-stone-900">{application.position}</h1>
              <p className="mt-1 text-base text-stone-600">{application.company}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
            <Link
              href={`/applications/${application.id}/edit`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <DeleteApplicationButton applicationId={application.id} company={application.company} />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-stone-500">Ubah status</h2>
        <p className="mb-4 text-sm text-stone-600">{STATUS_META[status].description}</p>
        <StatusQuickSelect applicationId={application.id} status={status} />
      </section>

      <section className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{detail.label}</dt>
            <dd className="mt-1 text-[15px] text-stone-900">{detail.value || <span className="text-stone-400">Belum diisi</span>}</dd>
          </div>
        ))}
        {application.notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Catatan</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-stone-900">{application.notes}</dd>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900">Riwayat status</h2>
        <StatusTimeline entries={history} />
      </section>
    </div>
  );
}
