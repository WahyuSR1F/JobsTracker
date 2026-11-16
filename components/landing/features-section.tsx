import { FileText, History, LayoutList, Smartphone, Workflow, Zap, type LucideIcon } from 'lucide-react';

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: LayoutList,
    title: 'Satu daftar untuk semua lamaran',
    description: 'Lihat seluruh lamaran dalam satu daftar, lalu cari berdasarkan perusahaan atau posisi.',
  },
  {
    icon: Workflow,
    title: 'Status yang jelas',
    description: 'Enam status dari draft sampai tes, termasuk gagal dan tidak ada kabar, dengan warna yang konsisten.',
  },
  {
    icon: History,
    title: 'Riwayat setiap perubahan',
    description: 'Setiap perubahan status tercatat otomatis lengkap dengan waktu sesuai zona WIB.',
  },
  {
    icon: FileText,
    title: 'Detail yang lengkap',
    description: 'Simpan lokasi, tipe kerja, sumber lowongan, gaji, link lowongan, dan catatan penting.',
  },
  {
    icon: Zap,
    title: 'Ubah status tanpa ribet',
    description: 'Perbarui status langsung dari kartu lamaran, tanpa perlu membuka formulir.',
  },
  {
    icon: Smartphone,
    title: 'Nyaman di HP maupun laptop',
    description: 'Tampilannya dirancang untuk layar kecil, jadi kamu bisa memantau lamaran dari mana saja.',
  },
];

export function FeaturesSection() {
  return (
    <section id="fitur" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Fitur</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">
            Semua yang kamu butuhkan untuk berburu kerja dengan rapi
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-stone-200 bg-stone-50/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-lg hover:shadow-stone-900/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-stone-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
