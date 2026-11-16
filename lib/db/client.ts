import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'credentials',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    work_type TEXT,
    source TEXT,
    job_url TEXT,
    salary_note TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    applied_at INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS job_listings (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    work_type TEXT,
    source TEXT,
    job_url TEXT,
    salary_note TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_at INTEGER NOT NULL,
    note TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS idx_app_status ON applications(status)',
  'CREATE INDEX IF NOT EXISTS idx_job_user ON job_listings(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_history_app ON status_history(application_id)',
];

const USER_COLUMN_MIGRATIONS = [
  { table: 'applications', column: 'user_id', statement: 'ALTER TABLE applications ADD COLUMN user_id TEXT' },
];

let client: Client | undefined;
let db: LibSQLDatabase<typeof schema> | undefined;
let schemaReady: Promise<void> | undefined;

function getDb(): LibSQLDatabase<typeof schema> {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL belum diatur');
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    db = drizzle(client, { schema });
  }
  return db;
}

async function migrateColumns(): Promise<void> {
  for (const migration of USER_COLUMN_MIGRATIONS) {
    const info = await client!.execute(`PRAGMA table_info(${migration.table})`);
    const hasColumn = info.rows.some((row) => String(row.name) === migration.column);
    if (!hasColumn) await client!.execute(migration.statement);
  }
  await client!.execute('CREATE INDEX IF NOT EXISTS idx_app_user ON applications(user_id)');
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    getDb();
    schemaReady = client!.batch(SCHEMA_STATEMENTS, 'write')
      .then(migrateColumns)
      .then(
        () => undefined,
        (error: unknown) => {
          schemaReady = undefined;
          throw error;
        },
      );
  }
  return schemaReady;
}

export async function readyDb() {
  await ensureSchema();
  return getDb();
}
