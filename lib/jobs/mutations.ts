import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { MutationResult } from '@/lib/applications/mutations';
import { readyDb } from '@/lib/db/client';
import { jobListings } from '@/lib/db/schema';
import { parseJobListingForm } from './validation';

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function revalidateJobs() {
  revalidatePath('/jobs');
  revalidatePath('/dashboard');
}

export async function createJobListing(userId: string, values: unknown): Promise<MutationResult> {
  const parsed = parseJobListingForm(values);
  if (!parsed.ok) return parsed;

  const db = await readyDb();
  const id = randomUUID();
  const now = nowSeconds();

  await db.insert(jobListings).values({ id, userId, ...parsed.data, createdAt: now, updatedAt: now });

  revalidateJobs();
  return { ok: true, id };
}

export async function deleteJobListing(userId: string, id: string): Promise<MutationResult> {
  const db = await readyDb();
  const [existing] = await db
    .select({ id: jobListings.id })
    .from(jobListings)
    .where(and(eq(jobListings.id, id), eq(jobListings.userId, userId)))
    .limit(1);
  if (!existing) return { ok: false, error: 'Lowongan tidak ditemukan.' };

  await db.delete(jobListings).where(and(eq(jobListings.id, id), eq(jobListings.userId, userId)));

  revalidateJobs();
  return { ok: true, id };
}
