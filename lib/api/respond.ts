import { NextResponse } from 'next/server';
import type { MutationResult } from '@/lib/applications/mutations';

export function mutationResponse(result: MutationResult) {
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}
