import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { STATUS_META } from '@/lib/applications/status';

const HIGHLIGHTS = ['Riwayat status tercatat otomatis', 'Tanpa perlu install', 'Bisa dibuka dari HP'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-stone-50 to-stone-50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-2 lg:gap-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-200">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden />
            Pelacak lamaran kerja
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Semua lamaran kerjamu, <span className="text-teal-700">terpantau</span> dalam satu tempat.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Catat setiap lamaran, ikuti perkembangannya dari dikirim sampai tahap tes, dan pastikan tidak ada kesempatan
            yang terlewat.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-teal-800"
            >
              Mulai Melacak
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="#alur"
              className="inline-flex h-12 items-center justify-center rounded-lg px-6 text-base font-medium text-stone-700 ring-1 ring-inset ring-stone-300 transition-colors hover:bg-white hover:text-stone-900"
            >
              Lihat alur status
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/5">
            <img
              src="https://images.pexels.com/photos/4559555/pexels-photo-4559555.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Notebook, laptop, dan kopi di atas meja untuk merencanakan lamaran kerja"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 w-64 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg sm:-left-8">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Ringkasan minggu ini</p>
            <ul className="mt-3 space-y-2.5">
              {(['send', 'ongoing', 'test'] as const).map((status, index) => (
                <li key={status} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-stone-700">
                    <span className={`h-2 w-2 rounded-full ${STATUS_META[status].dot}`} aria-hidden />
                    {STATUS_META[status].label}
                  </span>
                  <span className="font-bold text-stone-900">{[6, 3, 1][index]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
