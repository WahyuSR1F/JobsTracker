import { FileText } from 'lucide-react';
import { requireUserId } from '@/lib/auth/current-user';

export default async function DocumentsPage() {
  await requireUserId();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Dokumen</h1>
        <p className="mt-1 text-sm text-stone-600">Simpan CV, portofolio, dan berkas lamaran di satu tempat.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <FileText className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-stone-900">Belum ada dokumen</p>
        <p className="mt-1 max-w-xs text-sm text-stone-600">
          Fitur unggah dokumen belum tersedia. Catatan dan link lamaran tetap bisa disimpan di tiap lamaran.
        </p>
      </div>
    </div>
  );
}
