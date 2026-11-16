import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'),
  authProvider: text('auth_provider').notNull().default('credentials'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    company: text('company').notNull(),
    position: text('position').notNull(),
    location: text('location'),
    workType: text('work_type'),
    source: text('source'),
    jobUrl: text('job_url'),
    salaryNote: text('salary_note'),
    status: text('status').notNull().default('draft'),
    appliedAt: integer('applied_at'),
    notes: text('notes'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    statusIdx: index('idx_app_status').on(table.status),
    userIdx: index('idx_app_user').on(table.userId),
  }),
);

export const jobListings = sqliteTable(
  'job_listings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    company: text('company').notNull(),
    position: text('position').notNull(),
    location: text('location'),
    workType: text('work_type'),
    source: text('source'),
    jobUrl: text('job_url'),
    salaryNote: text('salary_note'),
    notes: text('notes'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    userIdx: index('idx_job_user').on(table.userId),
  }),
);

export const statusHistory = sqliteTable(
  'status_history',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    changedAt: integer('changed_at').notNull(),
    note: text('note'),
  },
  (table) => ({
    applicationIdx: index('idx_history_app').on(table.applicationId),
  }),
);
