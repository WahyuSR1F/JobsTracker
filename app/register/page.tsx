import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Buat akun"
      subtitle="Simpan dan pantau semua lamaran kerjamu di satu tempat."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
            Masuk di sini
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <RegisterForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-stone-500">atau</span>
          </div>
        </div>
        <OAuthButtons />
      </div>
    </AuthShell>
  );
}
