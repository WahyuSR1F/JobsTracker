import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readJsonBody } from '@/lib/api/respond';
import { hashPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { createUser, getUserByEmail } from '@/lib/auth/users';

const registerSchema = z.object({
  name: z.string().trim().max(80, 'Nama maksimal 80 karakter.'),
  email: z.string().trim().email('Email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.').max(72, 'Password maksimal 72 karakter.'),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  try {
    // Pastikan secret sesi valid sebelum menulis apa pun, supaya konfigurasi
    // server yang salah tidak meninggalkan akun tanpa sesi (gagal login).
    await createSessionToken('preflight');

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 });
    }

    const user = await createUser({
      email,
      name: name || null,
      passwordHash: await hashPassword(password),
    });

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Registrasi gagal:', error);
    return NextResponse.json({ error: 'Server gagal membuat akun. Coba lagi.' }, { status: 500 });
  }
}
