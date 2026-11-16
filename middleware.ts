import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, getSessionUserId } from '@/lib/auth/session';

const AUTH_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = (await getSessionUserId(request.cookies.get(SESSION_COOKIE)?.value)) !== null;

  if (pathname.startsWith('/api/auth/')) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    if (isLoggedIn) return NextResponse.next();
    return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  }

  if (pathname === '/') return NextResponse.next();

  if (AUTH_PAGES.includes(pathname)) {
    return isLoggedIn ? NextResponse.redirect(new URL('/applications', request.url)) : NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
