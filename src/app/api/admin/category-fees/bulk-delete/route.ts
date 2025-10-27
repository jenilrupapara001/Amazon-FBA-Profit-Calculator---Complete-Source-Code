import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ids = (body?.ids as number[]) || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    const result = await db.categoryFee.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error('Bulk delete category fees failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to bulk delete category fees' }, { status: 500 });
  }
}


