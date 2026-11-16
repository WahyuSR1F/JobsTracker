import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readJsonBody } from '@/lib/api/respond';
import { verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { getUserByEmail } from '@/lib/auth/users';

const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  }

  try {
    const user = await getUserByEmail(parsed.data.email);
    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: `Akun ini dibuat lewat ${user.authProvider === 'linkedin' ? 'LinkedIn' : 'Google'}. Masuk dengan tombol provider tersebut.` },
        { status: 400 },
      );
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login gagal:', error);
    return NextResponse.json({ error: 'Server gagal memproses login. Coba lagi.' }, { status: 500 });
  }
}
