import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { UserMenu, type NavActivity } from './user-menu';

export function AppHeader({
  name,
  email,
  initial,
  activities,
}: {
  name: string;
  email: string;
  initial: string;
  activities: NavActivity[];
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-700 px-4 text-white shadow-md shadow-teal-950/20 lg:hidden">
      <Link href="/dashboard" className="group flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/25 transition-transform duration-200 group-hover:-rotate-6">
          <Briefcase className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold leading-tight tracking-tight">Job Tracker</span>
          <span className="block truncate text-[11px] font-medium text-emerald-100/80">Kelola lamaran kerjamu</span>
        </span>
      </Link>
      <UserMenu name={name} email={email} initial={initial} activities={activities} />
    </header>
  );
}
