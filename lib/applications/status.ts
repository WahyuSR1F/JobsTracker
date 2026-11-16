export const APPLICATION_STATUSES = ['draft', 'send', 'ongoing', 'test', 'gagal', 'tidak_ada_kabar'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; description: string; badge: string; dot: string; bar: string }
> = {
  draft: {
    label: 'Draft',
    description: 'Disiapkan, belum dikirim',
    badge: 'bg-stone-100 text-stone-700 ring-stone-200',
    dot: 'bg-stone-400',
    bar: 'bg-stone-400',
  },
  send: {
    label: 'Send',
    description: 'Sudah dikirim, menunggu respons',
    badge: 'bg-sky-50 text-sky-800 ring-sky-200',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  ongoing: {
    label: 'Ongoing',
    description: 'Ada respons, proses berjalan',
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  test: {
    label: 'Test',
    description: 'Tahap tes atau assessment',
    badge: 'bg-violet-50 text-violet-800 ring-violet-200',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  gagal: {
    label: 'Gagal',
    description: 'Ditolak atau tidak lolos',
    badge: 'bg-red-50 text-red-800 ring-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
  },
  tidak_ada_kabar: {
    label: 'Tidak Ada Kabar',
    description: 'Tidak ada respons (ghosted)',
    badge: 'bg-orange-50 text-orange-800 ring-orange-200',
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
  },
};

export const WORK_TYPES = ['onsite', 'hybrid', 'remote'] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  onsite: 'Onsite',
  hybrid: 'Hybrid',
  remote: 'Remote',
};

export function isApplicationStatus(value: string | undefined): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}
