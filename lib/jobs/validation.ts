import { z } from 'zod';
import { WORK_TYPES } from '@/lib/applications/status';

const jobListingFormSchema = z.object({
  company: z.string().trim().min(1, 'Nama perusahaan wajib diisi.').max(120, 'Maksimal 120 karakter.'),
  position: z.string().trim().min(1, 'Posisi wajib diisi.').max(120, 'Maksimal 120 karakter.'),
  location: z.string().trim().max(120, 'Maksimal 120 karakter.').default(''),
  workType: z.enum(['', ...WORK_TYPES]).default(''),
  source: z.string().trim().max(60, 'Maksimal 60 karakter.').default(''),
  jobUrl: z
    .string()
    .trim()
    .max(500, 'Maksimal 500 karakter.')
    .default('')
    .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Link lowongan harus diawali http:// atau https://.'),
  salaryNote: z.string().trim().max(120, 'Maksimal 120 karakter.').default(''),
  notes: z.string().trim().max(2000, 'Maksimal 2000 karakter.').default(''),
});

export type JobListingFormValues = z.input<typeof jobListingFormSchema>;

export type JobListingRecordInput = {
  company: string;
  position: string;
  location: string | null;
  workType: 'onsite' | 'hybrid' | 'remote' | null;
  source: string | null;
  jobUrl: string | null;
  salaryNote: string | null;
  notes: string | null;
};

export const EMPTY_JOB_LISTING: JobListingFormValues = {
  company: '',
  position: '',
  location: '',
  workType: '',
  source: '',
  jobUrl: '',
  salaryNote: '',
  notes: '',
};

export function parseJobListingForm(values: unknown):
  | { ok: true; data: JobListingRecordInput }
  | { ok: false; error: string } {
  const result = jobListingFormSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Data tidak valid.' };
  }

  const value = result.data;
  return {
    ok: true,
    data: {
      company: value.company,
      position: value.position,
      location: value.location || null,
      workType: value.workType || null,
      source: value.source || null,
      jobUrl: value.jobUrl || null,
      salaryNote: value.salaryNote || null,
      notes: value.notes || null,
    },
  };
}
