'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FileText,
  Home,
  LayoutList,
  Plus,
  Settings2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu, type NavActivity } from './user-menu';

const ITEMS: { href: string; label: string; icon: LucideIcon; isActive: (pathname: string) => boolean }[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    href: '/jobs',
    label: 'Daftar kerjaan',
    icon: Briefcase,
    isActive: (pathname) => pathname.startsWith('/jobs'),
  },
  {
    href: '/applications',
    label: 'Lamaran',
    icon: LayoutList,
    isActive: (pathname) =>
      pathname === '/applications' ||
      (pathname.startsWith('/applications/') && pathname !== '/applications/new'),
  },
  {
    href: '/documents',
    label: 'Dokumen',
    icon: FileText,
    isActive: (pathname) => pathname.startsWith('/documents'),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: User,
    isActive: (pathname) => pathname.startsWith('/profile'),
  },
  {
    href: '/settings',
    label: 'Pengaturan',
    icon: Settings2,
    isActive: (pathname) => pathname.startsWith('/settings'),
  },
];

export function SideNav({
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
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex xl:w-72">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-800 to-emerald-700 text-white shadow-sm">
          <Briefcase className="h-5 w-5" />
        </span>
        <span className="text-base font-bold tracking-tight text-stone-900">Job Tracker</span>
      </div>

      <nav aria-label="Navigasi utama" className="flex-1 space-y-1 px-3 py-2">
        {ITEMS.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                active ? 'bg-teal-50 text-teal-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-stone-200 p-3">
        <Link
          href="/applications/new"
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:from-teal-800 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Lamaran
        </Link>
        <UserMenu name={name} email={email} initial={initial} activities={activities} variant="sidebar" />
      </div>
    </aside>
  );
}
