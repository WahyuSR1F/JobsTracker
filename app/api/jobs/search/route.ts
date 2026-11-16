import { NextResponse } from 'next/server';
import { fetchAllJobs } from '@/lib/jobAggregator';

/**
 * GET /api/jobs/search?q=developer&loc=jakarta
 *
 * Catatan rute: POST /api/jobs sudah dipakai untuk menyimpan lowongan
 * (tabel `job_listings`), jadi pencarian agregator ditaruh di sub-path
 * `/api/jobs/search` agar tidak bentrok.
 *
 * Caching: route handler yang membaca query string selalu dinamis, jadi
 * `revalidate` tidak berpengaruh. Cache ditangani in-memory di
 * `lib/jobAggregator.ts` (default 15 menit, atur lewat JOB_AGGREGATOR_CACHE_TTL_MS).
 */
export const dynamic = 'force-dynamic';

const MAX_QUERY_LENGTH = 80;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = (searchParams.get('q') ?? '').trim();
  const location = (searchParams.get('loc') ?? '').trim();

  if (keyword.length < 2) {
    return NextResponse.json(
      { error: 'Kata kunci minimal 2 karakter (contoh: ?q=developer).' },
      { status: 400 },
    );
  }

  if (keyword.length > MAX_QUERY_LENGTH || location.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Kata kunci dan lokasi maksimal ${MAX_QUERY_LENGTH} karakter.` },
      { status: 400 },
    );
  }

  try {
    const result = await fetchAllJobs(keyword, location);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[api/jobs/search] gagal mengambil lowongan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil lowongan dari sumber. Coba lagi nanti.' },
      { status: 502 },
    );
  }
}
