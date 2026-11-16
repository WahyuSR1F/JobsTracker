import { Briefcase } from 'lucide-react';
import { ExternalJobBrowser } from '@/components/jobs/external-job-browser';
import { JobListingCard } from '@/components/jobs/job-listing-card';
import { JobListingForm } from '@/components/jobs/job-listing-form';
import { requireUserId } from '@/lib/auth/current-user';
import { listJobListings } from '@/lib/jobs/queries';

export default async function JobsPage() {
  const userId = await requireUserId();
  const listings = await listJobListings(userId);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Lowongan kerja</h1>
        <p className="mt-1 text-sm text-stone-600">
          Cari dan lihat daftar lowongan dari berbagai sumber, lalu simpan yang ingin kamu lamar.
        </p>
      </header>

      <ExternalJobBrowser />

      <section className="space-y-4">
        <header>
          <h2 className="text-base font-semibold text-stone-900">Lowongan tersimpan</h2>
          <p className="mt-1 text-sm text-stone-600">
            {listings.length === 0
              ? 'Simpan lowongan incaranmu di sini (dibuat/ditambahkan olehmu) sebelum melamar.'
              : `${listings.length} lowongan tersimpan`}
          </p>
        </header>

        <JobListingForm /> 

        {listings.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <Briefcase className="h-6 w-6" />
            </span>
            <p className="text-sm leading-relaxed text-stone-600">Belum ada lowongan tersimpan.</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-500">
              Isi form di atas untuk mencatat lowongan yang ingin kamu lamar.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <JobListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
