import { NextResponse } from 'next/server';
import { deleteApplication, updateApplication } from '@/lib/applications/mutations';
import { mutationResponse, readJsonBody } from '@/lib/api/respond';
import { getCurrentUserId } from '@/lib/auth/current-user';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  return mutationResponse(await updateApplication(userId, params.id, await readJsonBody(request)));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  const result = await deleteApplication(userId, params.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id });
}
