# Migrasi Database

Skema database dikelola dengan **drizzle-kit**. File migrasi ada di folder ini
dan diterapkan ke Turso (libSQL) lewat `npm run db:migrate`.

## Alur kerja

| Perintah | Kegunaan |
| --- | --- |
| `npm run db:generate` | Buat file SQL baru setelah `lib/db/schema.ts` diubah |
| `npm run db:migrate` | Terapkan migrasi yang belum jalan ke database di `TURSO_DATABASE_URL` |
| `npm run db:studio` | Buka Drizzle Studio untuk melihat isi database |

Setiap migrasi yang sudah dijalankan dicatat di tabel `__drizzle_migrations`,
jadi perintah `db:migrate` aman diulang (tidak mengeksekusi ulang migrasi lama).

## Setup database Turso

```bash
# 1. Install CLI (sekali saja)
#    Windows: scoop install turso   |   macOS/Linux: brew install tursodatabase/tap/turso
turso auth signup

# 2. Buat database
turso db create job-tracker

# 3. Ambil URL dan token
turso db show job-tracker --url
turso db tokens create job-tracker
```

Isi `.env`:

```env
TURSO_DATABASE_URL=libsql://job-tracker-<org>.turso.io
TURSO_AUTH_TOKEN=<token dari perintah di atas>
```

Lalu jalankan migrasi:

```bash
npm run db:migrate
```

Output yang benar terlihat seperti:

```
Menjalankan migrasi ke libsql://job-tracker-<org>.turso.io
Selesai. Tidak ada migrasi yang tertunda.
```

## Mengubah skema

1. Edit `lib/db/schema.ts`.
2. `npm run db:generate` — file baru muncul di `drizzle/`, misal `0001_tambah_kolom.sql`.
3. **Baca dulu** SQL-nya: periksa tidak ada `DROP TABLE` atau `DROP COLUMN` yang tidak disengaja.
4. `npm run db:migrate` untuk menerapkan (lokal maupun Turso).
5. Commit folder `drizzle/` beserta `drizzle/meta/` — snapshot di dalamnya dipakai
   drizzle-kit untuk menghitung diff berikutnya.

## Catatan

- `0000_init.sql` bersifat idempoten (`CREATE ... IF NOT EXISTS`), jadi bisa
  dijalankan pada database Turso yang tabelnya sudah dibuat oleh aplikasi.
- Database lama yang dibuat sebelum sistem login (kolom `applications.user_id`
  belum ada) akan ditambal otomatis oleh `db:migrate` sebelum migrasi dijalankan.
  Data lama tidak dihapus.
- `lib/db/client.ts` masih menjalankan DDL `IF NOT EXISTS` saat aplikasi start
  sebagai jaring pengaman. Migrasi tetap sumber kebenaran untuk perubahan skema;
  jangan mengandalkan jalur runtime untuk perubahan baru.
- Untuk dev lokal tanpa Turso: `TURSO_DATABASE_URL=file:./local.db` lalu
  `npm run db:migrate`.
