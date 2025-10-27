import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all category fees
export async function GET() {
  try {
    // For now, disable authentication to get basic functionality working
    // TODO: Re-enable authentication after testing

    const categoryFees = await db.categoryFee.findMany({
      orderBy: [
        { categoryName: 'asc' },
        { minPrice: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: categoryFees
    });

  } catch (error) {
    console.error('Error fetching category fees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category fees' },
      { status: 500 }
    );
  }
}

// POST create new category fee
export async function POST(request: NextRequest) {
  try {
    // For now, disable authentication to get basic functionality working
    // TODO: Re-enable authentication after testing

    const body = await request.json();
    const { categoryName, minPrice, maxPrice, referralFeePercent } = body;

    if (!categoryName || minPrice === undefined || maxPrice === undefined || referralFeePercent === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for overlapping price ranges
    const existingFee = await db.categoryFee.findFirst({
      where: {
        categoryName,
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

    const categoryFee = await db.categoryFee.create({
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
    console.error('Error creating category fee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category fee' },
      { status: 500 }
    );
  }
}