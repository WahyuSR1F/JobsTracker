import { createApplication } from '@/lib/applications/mutations';
import { mutationResponse, readJsonBody } from '@/lib/api/respond';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  return mutationResponse(await createApplication(userId, await readJsonBody(request)));
}
