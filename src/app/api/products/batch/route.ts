import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { productIds, action } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const ids = productIds.map(id => parseInt(id));

    switch (action) {
      case 'activate':
        await db.productCalculation.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true }
        });
        break;

      case 'deactivate':
        await db.productCalculation.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false }
        });
        break;

      case 'delete':
        await db.productCalculation.deleteMany({
          where: { id: { in: ids } }
        });
        break;

      case 'addToBatch':
        const { batchId } = await request.json();
        if (!batchId) {
          return NextResponse.json(
            { error: 'Batch ID is required for addToBatch action' },
            { status: 400 }
          );
        }
        await db.productCalculation.updateMany({
          where: { id: { in: ids } },
          data: { batchId: parseInt(batchId) }
        });
        break;

      case 'removeFromBatch':
        await db.productCalculation.updateMany({
          where: { id: { in: ids } },
          data: { batchId: null }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      message: `Batch ${action} completed successfully`,
      affectedProducts: ids.length
    });
  } catch (error) {
    console.error('Error performing batch operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch operation' },
      { status: 500 }
    );
  }
}