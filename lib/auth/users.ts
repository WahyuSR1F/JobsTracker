import { randomUUID } from 'crypto';
import { count, eq, isNull } from 'drizzle-orm';
import { readyDb } from '@/lib/db/client';
import { applications, users } from '@/lib/db/schema';

export type UserRow = typeof users.$inferSelect;

export type OAuthUserInput = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
};

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const db = await readyDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = await readyDb();
  const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return user ?? null;
}

/**
 * Lamaran yang dibuat sebelum sistem akun ada tidak punya pemilik.
 * Akun pertama yang dibuat mengambil alih data lama tersebut.
 */
async function claimOrphanApplications(userId: string): Promise<void> {
  const db = await readyDb();
  const [row] = await db.select({ total: count() }).from(users);
  if (row?.total !== 1) return;
  await db.update(applications).set({ userId }).where(isNull(applications.userId));
}

export async function createUser(input: {
  email: string;
  name: string | null;
  passwordHash: string | null;
  avatarUrl?: string | null;
  provider?: string;
}): Promise<UserRow> {
  const db = await readyDb();
  const now = nowSeconds();
  const id = randomUUID();

  await db.insert(users).values({
    id,
    email: normalizeEmail(input.email),
    name: input.name,
    avatarUrl: input.avatarUrl ?? null,
    passwordHash: input.passwordHash,
    authProvider: input.provider ?? 'credentials',
    createdAt: now,
    updatedAt: now,
  });

  await claimOrphanApplications(id);

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function findOrCreateOAuthUser(input: OAuthUserInput): Promise<UserRow> {
  const existing = await getUserByEmail(input.email);
  if (!existing) return createUser({ ...input, passwordHash: null });

  const patch: Partial<UserRow> = {};
  if (!existing.name && input.name) patch.name = input.name;
  if (!existing.avatarUrl && input.avatarUrl) patch.avatarUrl = input.avatarUrl;

  if (Object.keys(patch).length === 0) return existing;

  const db = await readyDb();
  await db
    .update(users)
    .set({ ...patch, updatedAt: nowSeconds() })
    .where(eq(users.id, existing.id));

  return { ...existing, ...patch };
}
