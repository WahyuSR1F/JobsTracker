'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { callApi } from '@/lib/http';

export function DeleteApplicationButton({ applicationId, company }: { applicationId: string; company: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    setIsDeleting(true);
    setError(null);
    const result = await callApi(`/api/applications/${applicationId}`, { method: 'DELETE' });
    if (!result.ok) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }
    router.replace('/applications');
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50"
        >
          Hapus
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus lamaran ini?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            Lamaran di {company} beserta riwayat statusnya akan dihapus permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'Menghapus...' : 'Ya, hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
