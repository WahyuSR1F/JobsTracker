'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { APPLICATION_STATUSES, STATUS_META, WORK_TYPE_LABELS, WORK_TYPES } from '@/lib/applications/status';
import type { ApplicationFormValues } from '@/lib/applications/validation';
import { callApi } from '@/lib/http';
import { cn } from '@/lib/utils';
import { FIELD_CLASS } from './field-classes';

type ApplicationFormProps =
  | { mode: 'create'; initialValues: ApplicationFormValues }
  | { mode: 'edit'; applicationId: string; initialValues: ApplicationFormValues };

function FormField({
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
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function ApplicationForm(props: ApplicationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationFormValues>(props.initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const result = await callApi<{ id: string }>(
      props.mode === 'create' ? '/api/applications' : `/api/applications/${props.applicationId}`,
      { method: props.mode === 'create' ? 'POST' : 'PATCH', body: values },
    );
    if (!result.ok) {
      setError(result.error);
      setIsSaving(false);
      return;
    }
    router.push(`/applications/${result.data.id}`);
    router.refresh();
  }

  const cancelHref = props.mode === 'create' ? '/applications' : `/applications/${props.applicationId}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <FormField id="company" label="Perusahaan" required className="sm:col-span-2">
          <input
            id="company"
            required
            maxLength={120}
            value={values.company}
            onChange={(event) => update('company', event.target.value)}
            placeholder="Contoh: PT Maju Bersama"
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="position" label="Posisi" required className="sm:col-span-2">
          <input
            id="position"
            required
            maxLength={120}
            value={values.position}
            onChange={(event) => update('position', event.target.value)}
            placeholder="Contoh: Frontend Developer"
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="status" label="Status">
          <select
            id="status"
            value={values.status}
            onChange={(event) => update('status', event.target.value as ApplicationFormValues['status'])}
            className={FIELD_CLASS}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="appliedAt" label="Tanggal melamar">
          <input
            id="appliedAt"
            type="date"
            value={values.appliedAt}
            onChange={(event) => update('appliedAt', event.target.value)}
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="workType" label="Tipe kerja">
          <select
            id="workType"
            value={values.workType}
            onChange={(event) => update('workType', event.target.value as ApplicationFormValues['workType'])}
            className={FIELD_CLASS}
          >
            <option value="">Belum ditentukan</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>
                {WORK_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="location" label="Lokasi">
          <input
            id="location"
            maxLength={120}
            value={values.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Contoh: Jakarta Selatan"
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="source" label="Sumber lowongan">
          <input
            id="source"
            maxLength={60}
            value={values.source}
            onChange={(event) => update('source', event.target.value)}
            placeholder="Contoh: LinkedIn, Glints"
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="salaryNote" label="Gaji (opsional)">
          <input
            id="salaryNote"
            maxLength={120}
            value={values.salaryNote}
            onChange={(event) => update('salaryNote', event.target.value)}
            placeholder="Contoh: 8-10 juta"
            className={FIELD_CLASS}
          />
        </FormField>
        <FormField id="jobUrl" label="Link lowongan" className="sm:col-span-2">
          <input
            id="jobUrl"
            type="url"
            maxLength={500}
            value={values.jobUrl}
            onChange={(event) => update('jobUrl', event.target.value)}
            placeholder="https://"
            className={FIELD_CLASS}
          />
        </FormField>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <FormField id="notes" label="Catatan">
          <textarea
            id="notes"
            rows={5}
            maxLength={2000}
            value={values.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Tulis hal penting: nama recruiter, kontak, atau persiapan yang perlu dilakukan"
            className={cn(FIELD_CLASS, 'h-auto min-h-[7.5rem] py-3 leading-relaxed')}
          />
        </FormField>
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-700 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Menyimpan...' : props.mode === 'create' ? 'Simpan Lamaran' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
