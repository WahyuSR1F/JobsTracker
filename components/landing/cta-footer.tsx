import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function CtaFooter() {
  return (
    <>
      <section className="bg-teal-800 py-20 sm:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Mulai rapikan pencarian kerjamu hari ini
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-teal-100">
            Catat lamaran pertamamu dan lihat sendiri bedanya saat semuanya tersusun dalam satu tempat.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-base font-medium text-teal-900 shadow-sm transition-colors hover:bg-teal-50"
          >
            Masuk ke Job Tracker
          </Link>
        </div>
      </section>
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 font-medium text-stone-700">
            <Briefcase className="h-4 w-4 text-teal-700" />
            Job Tracker
          </span>
          <span>Dibuat untuk membantu pencari kerja tetap teratur.</span>
        </div>
      </footer>
    </>
  );
}
