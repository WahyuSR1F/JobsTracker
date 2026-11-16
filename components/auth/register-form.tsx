'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { callApi } from '@/lib/http';

const inputClass = 'h-11 rounded-lg border-stone-300 bg-white focus-visible:ring-teal-600';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password belum sama.');
      return;
    }

    setIsSubmitting(true);
    const result = await callApi('/api/auth/register', { method: 'POST', body: { name, email, password } });
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    router.replace('/applications');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-stone-700">
          Nama
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-stone-700">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-stone-500">Minimal 8 karakter.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium text-stone-700">
          Ulangi password
        </Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || !email || !password || !confirmPassword}
        className="h-11 w-full rounded-lg bg-teal-700 text-white hover:bg-teal-800"
      >
        {isSubmitting ? 'Membuat akun...' : 'Daftar'}
      </Button>
    </form>
  );
}
