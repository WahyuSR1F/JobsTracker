import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ApplicationForm } from '@/components/applications/application-form';
import { toIsoDate } from '@/lib/applications/format';
import { getApplication } from '@/lib/applications/queries';
import { WORK_TYPES, isApplicationStatus, type WorkType } from '@/lib/applications/status';
import { requireUserId } from '@/lib/auth/current-user';

export default async function EditApplicationPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const application = await getApplication(userId, params.id);
  if (!application) notFound();

  const workType = WORK_TYPES.find((type): type is WorkType => type === application.workType) ?? '';

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href={`/applications/${application.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke detail
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Edit Lamaran</h1>
          <p className="mt-1 text-sm text-stone-600">
            {application.position} di {application.company}
          </p>
        </div>
      </div>
      <ApplicationForm
        mode="edit"
        applicationId={application.id}
        initialValues={{
          company: application.company,
          position: application.position,
          location: application.location ?? '',
          workType,
          source: application.source ?? '',
          jobUrl: application.jobUrl ?? '',
          salaryNote: application.salaryNote ?? '',
          status: isApplicationStatus(application.status) ? application.status : 'draft',
          appliedAt: toIsoDate(application.appliedAt),
          notes: application.notes ?? '',
        }}
      />
    </div>
  );
}
