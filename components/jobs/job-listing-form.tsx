'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { FIELD_CLASS } from '@/components/applications/field-classes';
import { Label } from '@/components/ui/label';
import { WORK_TYPE_LABELS, WORK_TYPES } from '@/lib/applications/status';
import { callApi } from '@/lib/http';
import { EMPTY_JOB_LISTING, type JobListingFormValues } from '@/lib/jobs/validation';

function Field({
  id,
  label,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function JobListingForm() {
  const router = useRouter();
  const [values, setValues] = useState<JobListingFormValues>(EMPTY_JOB_LISTING);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof JobListingFormValues>(key: K, value: JobListingFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const result = await callApi<{ id: string }>('/api/jobs', { method: 'POST', body: values });
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setValues(EMPTY_JOB_LISTING);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-stone-900">Tambah lowongan</h2>
      <p className="mt-1 text-xs text-stone-500">
        Simpan lowongan yang menarik dulu, lamar nanti saat siap.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field id="company" label="Perusahaan" required>
          <input
            id="company"
            required
            maxLength={120}
            value={values.company}
            onChange={(event) => update('company', event.target.value)}
            placeholder="Contoh: PT Maju Bersama"
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="position" label="Posisi" required>
          <input
            id="position"
            required
            maxLength={120}
            value={values.position}
            onChange={(event) => update('position', event.target.value)}
            placeholder="Contoh: Frontend Developer"
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="location" label="Lokasi">
          <input
            id="location"
            maxLength={120}
            value={values.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Contoh: Jakarta Selatan"
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="workType" label="Tipe kerja">
          <select
            id="workType"
            value={values.workType}
            onChange={(event) => update('workType', event.target.value as JobListingFormValues['workType'])}
            className={FIELD_CLASS}
          >
            <option value="">Belum ditentukan</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {WORK_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="source" label="Sumber">
          <input
            id="source"
            maxLength={60}
            value={values.source}
            onChange={(event) => update('source', event.target.value)}
            placeholder="Contoh: LinkedIn"
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="salaryNote" label="Info gaji">
          <input
            id="salaryNote"
            maxLength={120}
            value={values.salaryNote}
            onChange={(event) => update('salaryNote', event.target.value)}
            placeholder="Contoh: 8-10 juta"
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="jobUrl" label="Link lowongan" className="sm:col-span-2">
          <input
            id="jobUrl"
            type="url"
            maxLength={500}
            value={values.jobUrl}
            onChange={(event) => update('jobUrl', event.target.value)}
            placeholder="https://..."
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="notes" label="Catatan" className="sm:col-span-2">
          <textarea
            id="notes"
            maxLength={2000}
            rows={3}
            value={values.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Kualifikasi, benefit, atau hal yang perlu disiapkan..."
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </Field>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan lowongan'}
        </button>
      </div>
    </form>
  );
}
