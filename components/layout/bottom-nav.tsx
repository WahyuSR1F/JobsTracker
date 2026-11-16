'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, LayoutList, Plus, User, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const LEFT_TABS: Tab[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    href: '/applications',
    label: 'Lamaran',
    icon: LayoutList,
    isActive: (pathname) =>
      pathname === '/applications' ||
      (pathname.startsWith('/applications/') && pathname !== '/applications/new'),
  },
];

const RIGHT_TABS: Tab[] = [
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
];

function NavTab({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      aria-label={tab.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200',
        active ? 'bg-teal-50 text-teal-700' : 'text-stone-400 hover:text-stone-700',
      )}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isAdding = pathname === '/applications/new';

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-16px_rgba(28,25,23,0.45)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-1">
        {LEFT_TABS.map((tab) => (
          <NavTab key={tab.href} tab={tab} active={tab.isActive(pathname)} />
        ))}

        <div className="flex items-center justify-center">
          <Link
            href="/applications/new"
            aria-label="Tambah lamaran"
            aria-current={isAdding ? 'page' : undefined}
            className={cn(
              '-mt-6 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-teal-900/25 ring-4 ring-white transition duration-200 active:scale-95',
              isAdding
                ? 'bg-gradient-to-br from-teal-800 to-emerald-700'
                : 'bg-gradient-to-br from-teal-700 to-emerald-600',
            )}
          >
            <Plus className="h-6 w-6" strokeWidth={2.4} />
          </Link>
        </div>

        {RIGHT_TABS.map((tab) => (
          <NavTab key={tab.href} tab={tab} active={tab.isActive(pathname)} />
        ))}
      </div>
    </nav>
  );
}
