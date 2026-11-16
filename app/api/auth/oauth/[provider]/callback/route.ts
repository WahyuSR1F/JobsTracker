import { NextResponse, type NextRequest } from 'next/server';
import {
  OAUTH_STATE_COOKIE,
  fetchOAuthProfile,
  getAppOrigin,
  getOAuthProvider,
} from '@/lib/auth/oauth';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { findOrCreateOAuthUser } from '@/lib/auth/users';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const origin = getAppOrigin(request);
  const fail = (message: string) => NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);

  const provider = getOAuthProvider(params.provider);
  if (!provider) return fail('Provider login tidak dikenal.');

  if (request.nextUrl.searchParams.get('error')) {
    return fail('Login dibatalkan. Coba lagi kalau berubah pikiran.');
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state) return fail('Login gagal: kode otorisasi tidak ditemukan.');
  if (expectedState !== `${provider.id}:${state}`) {
    return fail('Login gagal: state tidak cocok. Ulangi dari halaman masuk.');
  }

  const profile = await fetchOAuthProfile(provider, { code, origin });
  if (!profile) return fail(`Tidak bisa mengambil data akun ${provider.label}. Coba lagi.`);

  const user = await findOrCreateOAuthUser({ ...profile, provider: provider.id });

  const response = NextResponse.redirect(`${origin}/applications`);
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
