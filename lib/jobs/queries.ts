import { desc, eq } from 'drizzle-orm';
import { readyDb } from '@/lib/db/client';
import { jobListings } from '@/lib/db/schema';

export async function listJobListings(userId: string) {
  const db = await readyDb();
  return db
    .select()
    .from(jobListings)
    .where(eq(jobListings.userId, userId))
    .orderBy(desc(jobListings.createdAt));
}
