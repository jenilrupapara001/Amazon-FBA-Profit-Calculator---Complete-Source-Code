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

    // Prevent deleting categories with fees
    const categories = await db.category.findMany({ where: { id: { in: ids } } });
    const names = categories.map(c => c.name);
    const feeCounts = await db.categoryFee.groupBy({
      by: ['categoryName'],
      where: { categoryName: { in: names } },
      _count: { _all: true }
    });
    const blockedNames = new Set(feeCounts.map(f => f.categoryName));
    const deletableIds = categories.filter(c => !blockedNames.has(c.name)).map(c => c.id);

    if (deletableIds.length > 0) {
      await db.category.deleteMany({ where: { id: { in: deletableIds } } });
    }

    const blocked = categories.filter(c => blockedNames.has(c.name)).map(c => c.name);

    return NextResponse.json({
      success: true,
      deleted: deletableIds.length,
      blocked,
    });
  } catch (error) {
    console.error('Bulk delete categories failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to bulk delete categories' }, { status: 500 });
  }
}


