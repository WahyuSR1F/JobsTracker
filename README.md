# Jobs Tracker

Aplikasi pelacak & pencari lowongan kerja berbasis **Next.js 13 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **shadcn/ui**. Aplikasi ini menggabungkan daftar lowongan dari berbagai sumber (API, RSS, dan web scraping) ke satu halaman pencarian, sekaligus menyediakan fitur untuk menyimpan lowongan yang ingin dilamar.

## Fitur

- **Pencarian lowongan eksternal (agregator)** — `/jobs`
  - Mengambil dan menggabungkan lowongan dari sumber yang dikonfigurasi (API publik/ber-key, RSS/Atom, dan scraper HTML).
  - Pencarian berdasarkan kata kunci & lokasi, hasil dinormalisasi ke format seragam.
  - **Filter** (tombol Filter di bawah pencarian): filter **sumber** (Semua / per-sumber) dan **tanggal posting** (Semua tanggal, 24 jam, 7 hari, 30 hari) yang dapat digeser horizontal.
  - Default memuat pencarian awal agar daftar langsung tampil; hasil di-cache sementara di memori server.
- **Lowongan tersimpan** — simpan/catat lowongan incaran (dibuat/ditambahkan pengguna) sebelum melamar.
- **Pengaturan sumber & pengujian** — `/settings` untuk melihat/menguji konfigurasi sumber lowongan.
- **Autentikasi** — halaman masuk & sesi pengguna (middleware melindungi rute aplikasi/API terkait).
- **Database** — Drizzle ORM dengan libSQL/Turso untuk penyimpanan data aplikasi.

## Tech stack

- [Next.js 13](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Drizzle ORM](https://orm.drizzle.team/) + [@libsql/client](https://github.com/tursodatabase/libsql-client-ts) (Turso/libSQL)
- Agregasi lowongan: adapter API JSON/RSS & scraper HTML (`cheerio`, `fast-xml-parser`)

## Prasyarat

- Node.js 18+ dan npm
- Database libSQL/Turso (atau file SQLite lokal via libSQL) untuk fitur yang membutuhkan DB

## Mulai cepat

1. **Instal dependensi**
   ```bash
   npm install
   ```

2. **Siapkan environment**
   ```bash
   cp .env.example .env
   ```
   Isi nilai yang diperlukan di `.env` (lihat [Environment variables](#environment-variables)).

3. **Migrasi database** (setelah `TURSO_DATABASE_URL` diisi)
   ```bash
   npm run db:migrate
   ```

4. **Jalankan pengembangan**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3001](http://localhost:3001).

## Environment variables

Salin dari `.env.example` dan sesuaikan:

| Variabel | Keterangan |
| --- | --- |
| `TURSO_DATABASE_URL` | URL database libSQL/Turso. Lokal: `file:./local.db`. Turso: `libsql://<db>-<org>.turso.io`. |
| `TURSO_AUTH_TOKEN` | Token auth Turso (kosongkan untuk file lokal). |
| `AUTH_SECRET` | Secret penandatangan sesi, minimal 32 karakter. |
| `NEXT_PUBLIC_APP_URL` | URL aplikasi (untuk redirect OAuth). Dev: `http://localhost:3001` (sesuaikan port). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google (opsional, jika dipakai). |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | OAuth LinkedIn OIDC (opsional, jika dipakai). |
| `RAPIDAPI_KEY` | Key JSearch (RapidAPI) untuk sumber LinkedIn via agregator. |
| `JOBSTREET_API_KEY` | Key partner API JobStreet (jika tersedia). |
| `JOB_SCRAPER_USER_AGENT` | User-Agent opsional untuk scraper. |
| `JOB_AGGREGATOR_CACHE_TTL_MS` | TTL cache agregator (ms), default `900000` (15 menit). |

> Jangan commit file `.env`. Lihat `.env.example` untuk detail lengkap.

## Scripts

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan (port 3001) |
| `npm run build` | Build produksi (membersihkan `.next` terlebih dahulu) |
| `npm start` | Jalankan build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | Pemeriksaan tipe TypeScript |
| `npm run db:generate` | Generate migrasi Drizzle |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:studio` | Drizzle Studio |

## Konfigurasi sumber lowongan

Sumber agregator dikelola terpusat di **`config/jobSources.ts`** (metode 1: API/RSS, metode 2: scraper). Untuk tiap sumber Anda dapat mengatur `enabled`, endpoint, pemetaan field, env key yang diperlukan, dan `keywordFilter`.

- Menambah/mengubah sumber: edit `config/jobSources.ts` (dan `types/job.ts` bila menambah id sumber baru), lalu isi env key terkait di `.env`.
- Sumber hanya berjalan bila `enabled: true` dan env yang diwajibkan (`requiredEnv`) sudah terisi.
- Beberapa sumber (mis. API publik tanpa parameter pencarian) menggunakan `keywordFilter` untuk menyaring hasil di sisi aplikasi.
- **Catatan:** lakukan scraping hanya pada halaman publik yang mengizinkannya sesuai ToS/robots.txt. Sumber scraper bawaan dinonaktifkan sampai URL & selector diverifikasi.

## Struktur proyek (ringkas)

- `app/` — route & halaman (App Router), termasuk `/jobs`, `/settings`, API route
- `app/api/jobs/search/route.ts` — endpoint agregator pencarian lowongan (`GET /api/jobs/search?q=&loc=`)
- `components/jobs/external-job-browser.tsx` — UI pencarian, filter sumber/tanggal, dan daftar hasil
- `components/jobs/` — komponen lowongan tersimpan & form
- `lib/jobAggregator.ts`, `lib/adapters/` — logika agregasi & adapter sumber
- `config/jobSources.ts` — konfigurasi sumber lowongan
- `lib/db/`, `drizzle/` — skema & migrasi database

## Lisensi

Belum ditentukan.
