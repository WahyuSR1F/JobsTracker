'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { APPLICATION_STATUSES, STATUS_META, type ApplicationStatus } from '@/lib/applications/status';
import { callApi } from '@/lib/http';
import { cn } from '@/lib/utils';
import { FIELD_CLASS } from './field-classes';

export function StatusQuickSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ApplicationStatus>(status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: ApplicationStatus) {
    setValue(next);
    setIsSaving(true);
    setError(null);
    const result = await callApi(`/api/applications/${applicationId}/status`, {
      method: 'POST',
      body: { status: next },
    });
    setIsSaving(false);
    if (!result.ok) {
      setValue(status);
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="sr-only" htmlFor={`status-${applicationId}`}>
        Ubah status
      </label>
      <select
        id={`status-${applicationId}`}
        value={value}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.value as ApplicationStatus)}
        className={cn(FIELD_CLASS, 'h-9 w-auto min-w-[10.5rem] text-sm')}
      >
        {APPLICATION_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_META[option].label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
