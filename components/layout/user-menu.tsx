'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
};

type UserMenuProps = {
  name: string;
  email: string;
  initial: string;
  activities: NavActivity[];
  variant?: 'header' | 'sidebar';
};

export function UserMenu({ name, email, initial, activities, variant = 'header' }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const isSidebar = variant === 'sidebar';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu akun ${name}`}
        className={cn(
          'flex items-center transition-colors duration-200',
          isSidebar
            ? 'w-full gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-stone-100'
            : 'h-9 gap-1 rounded-full pl-1 pr-1.5 text-white/85 hover:bg-white/15 hover:text-white',
        )}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 font-bold text-white',
            isSidebar ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-xs ring-1 ring-white/40',
          )}
        >
          {initial}
        </span>
        {isSidebar ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-stone-900">{name}</span>
              <span className="block truncate text-xs text-stone-500">{email}</span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200', open && 'rotate-180')}
            />
          </>
        ) : (
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-xl shadow-stone-900/15',
            isSidebar ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2',
          )}
        >
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-stone-900">{name}</p>
            <p className="truncate text-xs text-stone-500">{email}</p>
          </div>

          <div className="flex items-center gap-2 px-4 pb-1 pt-3">
            <Bell className="h-3.5 w-3.5 text-stone-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Notifikasi</span>
            {activities.length > 0 && (
              <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                {activities.length}
              </span>
            )}
          </div>

          <ul className="max-h-64 overflow-y-auto px-2 py-1">
            {activities.length === 0 ? (
              <li className="px-2 py-3 text-xs leading-relaxed text-stone-500">
                Belum ada notifikasi. Update status lamaran akan muncul di sini.
              </li>
            ) : (
              activities.map((activity) => (
                <li key={activity.id}>
                  <Link
                    href={activity.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 transition-colors hover:bg-stone-50"
                  >
                    <span className="block text-xs font-medium text-stone-800">{activity.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-stone-500">{activity.detail}</span>
                    <span className="mt-0.5 block text-[10px] text-stone-400">{activity.time}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-stone-100 p-2">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <UserRound className="h-4 w-4 text-stone-500" />
              Lihat profil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
