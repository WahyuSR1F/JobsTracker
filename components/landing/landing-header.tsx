import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm transition-transform duration-200 group-hover:-rotate-6">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="text-base font-bold tracking-tight text-stone-900">Job Tracker</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href="#fitur"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 md:inline-flex"
          >
            Fitur
          </a>
          <a
            href="#alur"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 md:inline-flex"
          >
            Alur Status
          </a>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-lg bg-stone-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800"
          >
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}
