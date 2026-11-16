'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { callApi } from '@/lib/http';
import { cn } from '@/lib/utils';

export function LogoutButton({
  withLabel = false,
  tone = 'default',
}: {
  withLabel?: boolean;
  tone?: 'default' | 'onBrand';
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await callApi('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className={cn(
        'inline-flex items-center justify-center transition-colors disabled:opacity-60',
        withLabel
          ? 'h-11 w-full justify-start gap-3 rounded-xl px-3 text-sm font-medium'
          : 'h-9 w-9 rounded-full',
        tone === 'onBrand'
          ? 'text-white/85 hover:bg-white/15 hover:text-white'
          : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900',
      )}
    >
      <LogOut className="h-4 w-4" />
      {withLabel ? (
        <span>{isSigningOut ? 'Keluar...' : 'Keluar'}</span>
      ) : (
        <span className="sr-only">{isSigningOut ? 'Keluar...' : 'Keluar'}</span>
      )}
    </button>
  );
}
