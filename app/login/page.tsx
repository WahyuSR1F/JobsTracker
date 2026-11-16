import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell
      title="Masuk"
      subtitle="Lanjutkan memantau progres lamaran kerjamu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <LoginForm initialError={searchParams.error} />
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
