import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { readyDb } from '@/lib/db/client';
import { applications, statusHistory } from '@/lib/db/schema';
import { isApplicationStatus, type ApplicationStatus } from './status';

export type ApplicationFilter = {
  status?: ApplicationStatus;
  search?: string;
};

export async function listApplications(userId: string, filter: ApplicationFilter) {
  const db = await readyDb();
  const conditions: (SQL | undefined)[] = [eq(applications.userId, userId)];

  if (filter.status) conditions.push(eq(applications.status, filter.status));
  if (filter.search) {
    const pattern = `%${filter.search}%`;
    conditions.push(or(like(applications.company, pattern), like(applications.position, pattern)));
  }

  return db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.appliedAt), desc(applications.createdAt));
}

export async function countApplicationsByStatus(userId: string): Promise<Partial<Record<ApplicationStatus, number>>> {
  const db = await readyDb();
  const rows = await db
    .select({ status: applications.status, total: count() })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.status);

  const totals: Partial<Record<ApplicationStatus, number>> = {};
  for (const row of rows) {
    if (isApplicationStatus(row.status)) totals[row.status] = row.total;
  }
  return totals;
}

export async function getApplication(userId: string, id: string) {
  const db = await readyDb();
  const [application] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  return application ?? null;
}

export async function listRecentActivity(userId: string, limit = 5) {
  const db = await readyDb();
  return db
    .select({
      id: statusHistory.id,
      applicationId: statusHistory.applicationId,
      toStatus: statusHistory.toStatus,
      note: statusHistory.note,
      changedAt: statusHistory.changedAt,
      position: applications.position,
      company: applications.company,
    })
    .from(statusHistory)
    .innerJoin(applications, eq(statusHistory.applicationId, applications.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(statusHistory.changedAt))
    .limit(limit);
}

export async function getStatusHistory(applicationId: string) {
  const db = await readyDb();
  return db
    .select()
    .from(statusHistory)
    .where(eq(statusHistory.applicationId, applicationId))
    .orderBy(desc(statusHistory.changedAt));
}
