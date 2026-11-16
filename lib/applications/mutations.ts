import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { readyDb } from '@/lib/db/client';
import { applications, statusHistory } from '@/lib/db/schema';
import { isApplicationStatus } from '@/lib/applications/status';
import { parseApplicationForm } from '@/lib/applications/validation';

export type MutationResult = { ok: true; id: string } | { ok: false; error: string };

const NOT_FOUND: MutationResult = { ok: false, error: 'Lamaran tidak ditemukan.' };

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function ownedBy(userId: string, id: string) {
  return and(eq(applications.id, id), eq(applications.userId, userId));
}

function revalidateApplications(id?: string) {
  revalidatePath('/applications');
  revalidatePath('/dashboard');
  if (id) revalidatePath(`/applications/${id}`);
}

export async function createApplication(userId: string, values: unknown): Promise<MutationResult> {
  const parsed = parseApplicationForm(values);
  if (!parsed.ok) return parsed;

  const db = await readyDb();
  const id = randomUUID();
  const now = nowSeconds();

  await db.batch([
    db.insert(applications).values({ id, userId, ...parsed.data, createdAt: now, updatedAt: now }),
    db.insert(statusHistory).values({
      id: randomUUID(),
      applicationId: id,
      fromStatus: null,
      toStatus: parsed.data.status,
      changedAt: now,
      note: 'Lamaran dibuat',
    }),
  ]);

  revalidateApplications();
  return { ok: true, id };
}

export async function updateApplication(userId: string, id: string, values: unknown): Promise<MutationResult> {
  const parsed = parseApplicationForm(values);
  if (!parsed.ok) return parsed;

  const db = await readyDb();
  const [existing] = await db
    .select({ status: applications.status })
    .from(applications)
    .where(ownedBy(userId, id))
    .limit(1);
  if (!existing) return NOT_FOUND;

  const now = nowSeconds();
  const update = db
    .update(applications)
    .set({ ...parsed.data, updatedAt: now })
    .where(ownedBy(userId, id));

  if (existing.status === parsed.data.status) {
    await update;
  } else {
    await db.batch([
      update,
      db.insert(statusHistory).values({
        id: randomUUID(),
        applicationId: id,
        fromStatus: existing.status,
        toStatus: parsed.data.status,
        changedAt: now,
      }),
    ]);
  }

  revalidateApplications(id);
  return { ok: true, id };
}

export async function changeApplicationStatus(userId: string, id: string, status: string): Promise<MutationResult> {
  if (!isApplicationStatus(status)) return { ok: false, error: 'Status tidak dikenal.' };

  const db = await readyDb();
  const [existing] = await db
    .select({ status: applications.status })
    .from(applications)
    .where(ownedBy(userId, id))
    .limit(1);
  if (!existing) return NOT_FOUND;
  if (existing.status === status) return { ok: true, id };

  const now = nowSeconds();
  await db.batch([
    db.update(applications).set({ status, updatedAt: now }).where(ownedBy(userId, id)),
    db.insert(statusHistory).values({
      id: randomUUID(),
      applicationId: id,
      fromStatus: existing.status,
      toStatus: status,
      changedAt: now,
    }),
  ]);

  revalidateApplications(id);
  return { ok: true, id };
}

export async function deleteApplication(userId: string, id: string): Promise<MutationResult> {
  const db = await readyDb();
  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(ownedBy(userId, id))
    .limit(1);
  if (!existing) return NOT_FOUND;

  await db.batch([
    db.delete(statusHistory).where(eq(statusHistory.applicationId, id)),
    db.delete(applications).where(ownedBy(userId, id)),
  ]);

  revalidateApplications(id);
  return { ok: true, id };
}
