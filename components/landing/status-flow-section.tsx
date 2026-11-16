import { APPLICATION_STATUSES, STATUS_META } from '@/lib/applications/status';

export function StatusFlowSection() {
  return (
    <section id="alur" className="scroll-mt-24 bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Alur status</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            Dari lamaran pertama sampai hasil akhir
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Setiap lamaran bergerak lewat tahapan yang jelas. Kamu yang memperbarui statusnya, dan setiap perubahan
            langsung tercatat.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPLICATION_STATUSES.map((status, index) => (
            <li
              key={status}
              className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${STATUS_META[status].bar}`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-bold text-stone-900">{STATUS_META[status].label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{STATUS_META[status].description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
