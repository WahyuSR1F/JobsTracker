import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  KeyRound,
  LayoutList,
  LogOut,
  Mail,
} from 'lucide-react';
import { LogoutButton } from '@/components/layout/logout-button';
import { formatDate } from '@/lib/applications/format';
import { countApplicationsByStatus } from '@/lib/applications/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserById } from '@/lib/auth/users';
import { listJobListings } from '@/lib/jobs/queries';

const PROVIDER_LABELS: Record<string, string> = {
  credentials: 'Email & password',
  google: 'Google',
  linkedin: 'LinkedIn',
};

export default async function ProfilePage() {
  const userId = await requireUserId();
  const [user, totals, listings] = await Promise.all([
    getUserById(userId),
    countApplicationsByStatus(userId),
    listJobListings(userId),
  ]);

  const name = user?.name?.trim() || 'Tanpa nama';
  const email = user?.email ?? '-';
  const initial = name.charAt(0).toUpperCase();
  const provider = PROVIDER_LABELS[user?.authProvider ?? 'credentials'] ?? user?.authProvider ?? '-';

  const total = Object.values(totals).reduce((sum, value) => sum + (value ?? 0), 0);
  const inProgress = (totals.send ?? 0) + (totals.ongoing ?? 0) + (totals.test ?? 0);
  const closed = (totals.gagal ?? 0) + (totals.tidak_ada_kabar ?? 0);

  const stats = [
    { label: 'Lowongan tersimpan', value: listings.length, icon: Briefcase },
    { label: 'Total lamaran', value: total, icon: LayoutList },
    { label: 'Sedang berjalan', value: inProgress, icon: Clock3 },
    { label: 'Selesai', value: closed, icon: CheckCircle2 },
  ];

  const details = [
    { label: 'Email', value: email, icon: Mail },
    { label: 'Metode masuk', value: provider, icon: KeyRound },
    { label: 'Bergabung', value: user ? formatDate(user.createdAt) : '-', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-7">
        <span
          className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-2xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-24 left-4 h-44 w-44 rounded-full bg-teal-200/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-50/75">
              Profil akun
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight">{name}</h1>
            <p className="mt-0.5 truncate text-sm text-teal-50/85">{email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-teal-50 ring-1 ring-inset ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
              Akun aktif
            </span>
          </div>
        </div>

        <ul className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <li
              key={label}
              className="rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-teal-50/70" aria-hidden />
              <p className="mt-2 text-xl font-bold leading-none tabular-nums">{value}</p>
              <p className="mt-1.5 text-[11px] font-medium leading-tight text-teal-50/80">{label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Detail akun" className="grid gap-3 sm:grid-cols-3">
        {details.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
              {label}
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-stone-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-900">Keluar dari akun</p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              Kamu perlu masuk lagi untuk membuka Job Tracker di perangkat ini.
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-xl border border-stone-200 p-1 sm:w-40">
          <LogoutButton withLabel />
        </div>
      </section>
    </div>
  );
}
