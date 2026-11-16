import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SideNav } from '@/components/layout/side-nav';
import type { NavActivity } from '@/components/layout/user-menu';
import { formatDate } from '@/lib/applications/format';
import { listRecentActivity } from '@/lib/applications/queries';
import { STATUS_META, isApplicationStatus } from '@/lib/applications/status';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserById } from '@/lib/auth/users';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const [user, recentActivity] = await Promise.all([getUserById(userId), listRecentActivity(userId, 5)]);

  const name = user?.name?.trim() || 'Tanpa nama';
  const email = user?.email ?? '-';
  const initial = name.charAt(0).toUpperCase();

  const activities: NavActivity[] = recentActivity.map((activity) => ({
    id: activity.id,
    title:
      activity.note ??
      (isApplicationStatus(activity.toStatus) ? `Status: ${STATUS_META[activity.toStatus].label}` : 'Perubahan status'),
    detail: `${activity.position} · ${activity.company}`,
    time: formatDate(activity.changedAt),
    href: `/applications/${activity.applicationId}`,
  }));

  return (
    <div className="min-h-dvh bg-stone-50 lg:flex lg:items-stretch">
      <SideNav name={name} email={email} initial={initial} activities={activities} />
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col bg-stone-50 md:max-w-3xl lg:max-w-none">
        <AppHeader name={name} email={email} initial={initial} activities={activities} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
