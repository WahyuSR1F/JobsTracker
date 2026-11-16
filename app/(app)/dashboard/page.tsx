import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  FileText,
  LayoutList,
  Plus,
  Settings2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/applications/status-badge';
import { ScheduleCalendar, type ScheduleItem } from '@/components/dashboard/schedule-calendar';
import { formatDate, toIsoDate } from '@/lib/applications/format';
import { countApplicationsByStatus, listApplications } from '@/lib/applications/queries';
import { APPLICATION_STATUSES, STATUS_META, isApplicationStatus } from '@/lib/applications/status';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserById } from '@/lib/auth/users';

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [user, totals, applications] = await Promise.all([
    getUserById(userId),
    countApplicationsByStatus(userId),
    listApplications(userId, {}),
  ]);

  const total = Object.values(totals).reduce((sum, value) => sum + (value ?? 0), 0);
  const inProgress = (totals.send ?? 0) + (totals.ongoing ?? 0) + (totals.test ?? 0);
  const closed = (totals.gagal ?? 0) + (totals.tidak_ada_kabar ?? 0);
  const firstName = user?.name?.trim().split(' ')[0];
  const recent = applications.slice(0, 5);
  const schedule: ScheduleItem[] = applications.map((application) => ({
    id: application.id,
    position: application.position,
    company: application.company,
    date: toIsoDate(application.appliedAt ?? application.createdAt),
    status: isApplicationStatus(application.status) ? application.status : 'draft',
  }));

  const quickMenu: { href: string; label: string; icon: LucideIcon; primary?: boolean }[] = [
    { href: '/applications/new', label: 'Tambah', icon: Plus, primary: true },
    { href: '/jobs', label: 'Daftar kerjaan', icon: Briefcase },
    { href: '/applications', label: 'Lamaran', icon: LayoutList },
    { href: '/dashboard#kalender', label: 'Kalender', icon: CalendarDays },
    { href: '/documents', label: 'Dokumen', icon: FileText },
    { href: '/profile', label: 'Profil', icon: User },
    { href: '/settings', label: 'Pengaturan', icon: Settings2 },
  ];

  const stats = [
    { label: 'Total lamaran', value: total },
    { label: 'Sedang berjalan', value: inProgress },
    { label: 'Selesai', value: closed },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-7">
        <span
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-2xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-24 left-6 h-44 w-44 rounded-full bg-teal-200/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">
              {firstName ? `Halo, ${firstName}` : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-teal-50/85">Ringkasan perjalanan lamaran kerjamu.</p>
          </div>
          <Link
            href="/applications/new"
            className="hidden h-10 shrink-0 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/25 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Link>
        </div>

        <dl className="relative mt-6 grid grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="px-3 first:pl-0 last:pr-0">
              <dd className="text-2xl font-bold leading-none tabular-nums">{stat.value}</dd>
              <dt className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-teal-50/80">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Menu cepat" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 sm:gap-3">
          {quickMenu.map(({ href, label, icon: Icon, primary }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex flex-col items-center gap-2 rounded-xl px-1 py-2 transition-colors hover:bg-stone-50"
              >
                <span
                  className={
                    primary
                      ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-600 text-white shadow-sm transition-transform group-hover:-translate-y-0.5'
                      : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-transform group-hover:-translate-y-0.5'
                  }
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex min-h-[2.25rem] items-start justify-center text-center text-[11px] font-medium leading-tight text-stone-600 group-hover:text-stone-900">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section id="kalender" className="scroll-mt-20">
        <ScheduleCalendar items={schedule} />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Status lamaran</h2>
        {total === 0 ? (
          <p className="mt-2 text-sm text-stone-600">Belum ada lamaran tercatat.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {APPLICATION_STATUSES.map((status) => {
              const value = totals[status] ?? 0;
              return (
                <li key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-700">
                      <span className={`h-2 w-2 rounded-full ${STATUS_META[status].dot}`} aria-hidden />
                      {STATUS_META[status].label}
                    </span>
                    <span className="font-semibold text-stone-900">{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${STATUS_META[status].bar}`}
                      style={{ width: `${total === 0 ? 0 : (value / total) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Lamaran terbaru</h2>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Lihat semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-6 text-center">
            <p className="text-sm text-stone-600">Belum ada lamaran. Mulai catat lamaran pertamamu.</p>
            <Link
              href="/applications/new"
              className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" />
              Tambah Lamaran
            </Link>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {recent.map((application) => {
              const status = isApplicationStatus(application.status) ? application.status : 'draft';
              return (
                <li key={application.id}>
                  <Link
                    href={`/applications/${application.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-900">
                        {application.position}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-stone-500">
                        {application.company}
                        {application.appliedAt ? ` · ${formatDate(application.appliedAt)}` : ''}
                      </span>
                    </span>
                    <StatusBadge status={status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
