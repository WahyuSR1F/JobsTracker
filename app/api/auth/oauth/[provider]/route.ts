import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { OAUTH_STATE_COOKIE, buildAuthorizationUrl, getAppOrigin, getOAuthProvider } from '@/lib/auth/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  const origin = getAppOrigin(request);
  const provider = getOAuthProvider(params.provider);

  if (!provider) {
    const message = encodeURIComponent('Login dengan provider ini belum dikonfigurasi. Hubungi admin.');
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildAuthorizationUrl(provider, { origin, state }));
  response.cookies.set(OAUTH_STATE_COOKIE, `${provider.id}:${state}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });
  return response;
}
