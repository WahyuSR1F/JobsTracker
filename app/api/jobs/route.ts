import { NextResponse } from 'next/server';
import { mutationResponse, readJsonBody } from '@/lib/api/respond';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { createJobListing } from '@/lib/jobs/mutations';

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
  return mutationResponse(await createJobListing(userId, await readJsonBody(request)));
}
