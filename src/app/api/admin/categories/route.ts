import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // For now, disable authentication to get basic functionality working
    // TODO: Re-enable authentication after testing

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        categoryFees: {
          orderBy: { minPrice: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For now, disable authentication to get basic functionality working
    // TODO: Re-enable authentication after testing

    const data = await request.json();

    // Validate required fields
    if (!data.name || data.returnPercent === undefined) {
      return NextResponse.json(
        { error: 'Name and return percent are required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await db.category.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const newCategory = await db.category.create({
      data: {
        name: data.name,
        description: data.description || '',
        returnPercent: parseFloat(data.returnPercent),
      }
    });

    return NextResponse.json({
      success: true,
      data: newCategory
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}