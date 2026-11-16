import { resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

// Database yang dibuat sebelum autentikasi per-user belum punya kolom ini.
// Ditambal dulu supaya migrasi awal bisa membuat index di atasnya.
const LEGACY_COLUMN_FIXES = [
  {
    table: 'applications',
    column: 'user_id',
    statement: 'ALTER TABLE applications ADD COLUMN user_id TEXT',
  },
];

async function patchLegacyColumns(client) {
  for (const fix of LEGACY_COLUMN_FIXES) {
    const info = await client.execute(`PRAGMA table_info(${fix.table})`);
    if (info.rows.length === 0) continue; // tabel belum ada, biar migrasi yang membuat
    if (info.rows.some((row) => String(row.name) === fix.column)) continue;
    console.log(`Menambal kolom lama ${fix.table}.${fix.column}`);
    await client.execute(fix.statement);
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL belum diatur. Isi .env atau jalankan: TURSO_DATABASE_URL=... npm run db:migrate',
    );
  }

  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    if (!authToken) throw new Error('TURSO_AUTH_TOKEN wajib diisi untuk database Turso remote.');
  }

  const client = createClient({ url, authToken });
  try {
    console.log(`Menjalankan migrasi ke ${url}`);
    await patchLegacyColumns(client);
    await migrate(drizzle(client), { migrationsFolder: resolve(process.cwd(), 'drizzle') });
    console.log('Selesai. Tidak ada migrasi yang tertunda.');
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(`Migrasi gagal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
