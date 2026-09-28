import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/** Ghost-Webhook „Site changed (rebuild)" → POST /api/revalidate?secret=… */
export async function POST(req: NextRequest) {
  if (
    !process.env.REVALIDATE_SECRET ||
    req.nextUrl.searchParams.get('secret') !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
