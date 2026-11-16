'use client';

export default function ApplicationsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-white px-6 py-16 text-center">
      <h2 className="text-lg font-bold text-stone-900">Data lamaran belum bisa dimuat</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
        Periksa koneksi ke database dan pastikan pengaturan database di file lingkungan sudah benar, lalu coba lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-10 rounded-lg bg-teal-700 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
      >
        Coba lagi
      </button>
    </div>
  );
}
