'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { callApi } from '@/lib/http';

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await callApi('/api/auth/login', { method: 'POST', body: { email, password } });
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
        <Label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="nama@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border-stone-300 bg-white focus-visible:ring-teal-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-stone-700">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border-stone-300 bg-white focus-visible:ring-teal-600"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || !email || !password}
        className="h-11 w-full rounded-lg bg-teal-700 text-white hover:bg-teal-800"
      >
        {isSubmitting ? 'Memeriksa...' : 'Masuk'}
      </Button>
    </form>
  );
}
