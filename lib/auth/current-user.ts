import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, getSessionUserId } from './session';

export async function getCurrentUserId(): Promise<string | null> {
  return getSessionUserId(cookies().get(SESSION_COOKIE)?.value);
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');
  return userId;
}
