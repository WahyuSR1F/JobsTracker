import { NextResponse } from 'next/server';
import { changeApplicationStatus } from '@/lib/applications/mutations';
import { mutationResponse, readJsonBody } from '@/lib/api/respond';
import { getCurrentUserId } from '@/lib/auth/current-user';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });

  const body = (await readJsonBody(request)) as { status?: unknown } | null;
  const status = typeof body?.status === 'string' ? body.status : '';
  return mutationResponse(await changeApplicationStatus(userId, params.id, status));
}
