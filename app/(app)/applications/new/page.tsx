import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ApplicationForm } from '@/components/applications/application-form';
import { toIsoDate } from '@/lib/applications/format';

export default function NewApplicationPage() {
  const today = toIsoDate(Math.floor(Date.now() / 1000));

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Tambah Lamaran</h1>
          <p className="mt-1 text-sm text-stone-600">Catat detail lowongan yang kamu lamar.</p>
        </div>
      </div>
      <ApplicationForm
        mode="create"
        initialValues={{
          company: '',
          position: '',
          location: '',
          workType: '',
          source: '',
          jobUrl: '',
          salaryNote: '',
          status: 'draft',
          appliedAt: today,
          notes: '',
        }}
      />
    </div>
  );
}
