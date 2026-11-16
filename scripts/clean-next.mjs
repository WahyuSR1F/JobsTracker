import fs from "node:fs";
import path from "node:path";

/**
 * Membersihkan folder build Next.js sebelum `next dev` / `next build`.
 *
 * Kalau proyek berada di dalam folder OneDrive, OneDrive bisa mengubah file di
 * `.next` menjadi placeholder cloud (reparse point). Node.js melempar
 * `EINVAL: invalid argument, readlink` saat membaca file seperti itu, dan itu
 * membuat proses pembersihan internal Next.js gagal sebelum server start.
 * `fs.rmSync` tetap bisa menghapusnya, jadi folder dikosongkan lebih dulu di sini.
 */
const target = process.env.NEXT_DIST_DIR?.trim() || ".next";
const dir = path.resolve(process.cwd(), target);

if (!fs.existsSync(dir)) {
  process.exit(0);
}

try {
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
} catch (error) {
  console.warn(`[clean-next] percobaan pertama gagal: ${error.message}`);
}

if (fs.existsSync(dir)) {
  console.error(
    `[clean-next] tidak bisa menghapus ${target}. Tutup semua proses node/next lalu jalankan ulang. ` +
      `Jika proyek ada di folder OneDrive, pindahkan ke folder lokal atau jeda sinkronisasi OneDrive.`
  );
  process.exit(1);
}

console.log(`[clean-next] ${target} dibersihkan.`);
