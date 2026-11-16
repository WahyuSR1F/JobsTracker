import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Job Tracker',
  description: 'Pantau lamaran kerja, status, dan jadwal kegiatanmu dalam satu tempat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${font.className} min-h-screen bg-stone-50 text-stone-900 antialiased`}>{children}</body>
    </html>
  );
}
