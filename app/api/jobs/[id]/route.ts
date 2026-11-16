import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { deleteJobListing } from '@/lib/jobs/mutations';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  const result = await deleteJobListing(userId, params.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id });
}
