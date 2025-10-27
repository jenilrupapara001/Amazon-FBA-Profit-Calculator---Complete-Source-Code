import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-server';

// PUT update category fee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    const body = await request.json();
    const { categoryName, minPrice, maxPrice, referralFeePercent } = body;

    if (!categoryName || minPrice === undefined || maxPrice === undefined || referralFeePercent === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for overlapping price ranges (excluding current record)
    const existingFee = await db.categoryFee.findFirst({
      where: {
        categoryName,
        id: { not: id },
        OR: [
          {
            AND: [
              { minPrice: { lte: minPrice } },
              { maxPrice: { gte: minPrice } }
            ]
          },
          {
            AND: [
              { minPrice: { lte: maxPrice } },
              { maxPrice: { gte: maxPrice } }
            ]
          },
          {
            AND: [
              { minPrice: { gte: minPrice } },
              { maxPrice: { lte: maxPrice } }
            ]
          }
        ]
      }
    });

    if (existingFee) {
      return NextResponse.json(
        { success: false, error: 'Price range overlaps with existing fee for this category' },
        { status: 400 }
      );
    }

    const categoryFee = await db.categoryFee.update({
      where: { id },
      data: {
        categoryName,
        minPrice,
        maxPrice,
        referralFeePercent
      }
    });

    return NextResponse.json({
      success: true,
      data: categoryFee
    });

  } catch (error) {
    console.error('Error updating category fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category fee' },
      { status: 500 }
    );
  }
}

// DELETE category fee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    await db.categoryFee.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category fee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category fee' },
      { status: 500 }
    );
  }
}