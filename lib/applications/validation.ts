import { z } from 'zod';
import { APPLICATION_STATUSES, WORK_TYPES } from './status';

const applicationFormSchema = z.object({
  company: z.string().trim().min(1, 'Nama perusahaan wajib diisi.').max(120, 'Maksimal 120 karakter.'),
  position: z.string().trim().min(1, 'Posisi wajib diisi.').max(120, 'Maksimal 120 karakter.'),
  location: z.string().trim().max(120, 'Maksimal 120 karakter.'),
  workType: z.enum(['', ...WORK_TYPES]),
  source: z.string().trim().max(60, 'Maksimal 60 karakter.'),
  jobUrl: z
    .string()
    .trim()
    .max(500, 'Maksimal 500 karakter.')
    .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Link lowongan harus diawali http:// atau https://.'),
  salaryNote: z.string().trim().max(120, 'Maksimal 120 karakter.'),
  status: z.enum(APPLICATION_STATUSES),
  appliedAt: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Format tanggal tidak valid.'),
  notes: z.string().trim().max(2000, 'Maksimal 2000 karakter.'),
});

export type ApplicationFormValues = z.input<typeof applicationFormSchema>;

export type ApplicationRecordInput = {
  company: string;
  position: string;
  location: string | null;
  workType: 'onsite' | 'hybrid' | 'remote' | null;
  source: string | null;
  jobUrl: string | null;
  salaryNote: string | null;
  status: (typeof APPLICATION_STATUSES)[number];
  appliedAt: number | null;
  notes: string | null;
};

export function parseApplicationForm(values: unknown):
  | { ok: true; data: ApplicationRecordInput }
  | { ok: false; error: string } {
  const result = applicationFormSchema.safeParse(values);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Data tidak valid.' };
  }

  const value = result.data;
  let appliedAt: number | null = null;
  if (value.appliedAt) {
    appliedAt = Math.floor(Date.parse(`${value.appliedAt}T00:00:00+07:00`) / 1000);
    if (Number.isNaN(appliedAt)) return { ok: false, error: 'Tanggal melamar tidak valid.' };
  }

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
      status: value.status,
      appliedAt,
      notes: value.notes || null,
    },
  };
}
