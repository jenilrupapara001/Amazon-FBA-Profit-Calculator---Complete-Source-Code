import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const fulfillment = searchParams.get('fulfillment') || '';
    const isActive = searchParams.get('isActive');
    const batchId = searchParams.get('batchId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { asin: { contains: search } },
        { category: { contains: search } }
      ];
    }

    if (category) {
      where.category = { contains: category };
    }

    if (fulfillment) {
      where.fulfillment = fulfillment;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (batchId) {
      where.batchId = parseInt(batchId);
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      db.productCalculation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          batch: {
            select: {
              id: true,
              batchName: true
            }
          }
        }
      }),
      db.productCalculation.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['asin', 'productName', 'category', 'sellingPrice', 'weight'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if ASIN already exists
    const existingProduct = await db.productCalculation.findUnique({
      where: { asin: data.asin }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this ASIN already exists' },
        { status: 409 }
      );
    }

    // Create product
    const product = await db.productCalculation.create({
      data: {
        ...data,
        sellingPrice: parseFloat(data.sellingPrice),
        weight: parseFloat(data.weight),
        length: parseFloat(data.length || 0),
        width: parseFloat(data.width || 0),
        height: parseFloat(data.height || 0),
        referralFee: parseFloat(data.referralFee || 0),
        closingFee: parseFloat(data.closingFee || 0),
        shippingFee: parseFloat(data.shippingFee || 0),
        pickPackFee: parseFloat(data.pickPackFee || 0),
        removalFee: parseFloat(data.removalFee || 0),
        storageFee: parseFloat(data.storageFee || 0),
        totalOtherCost: parseFloat(data.totalOtherCost || 0),
        totalFees: parseFloat(data.totalFees || 0),
        taxCredit: parseFloat(data.taxCredit || 18),
        taxToPay: parseFloat(data.taxToPay || 0),
        finalWithoutTax: parseFloat(data.finalWithoutTax || 0),
        netEarnings: parseFloat(data.netEarnings || 0),
        netEarningsPercent: parseFloat(data.netEarningsPercent || 0),
        returnPercent: parseFloat(data.returnPercent || 0),
        returnFees: parseFloat(data.returnFees || 0),
        finalPayout: parseFloat(data.finalPayout || 0),
        batchId: data.batchId ? parseInt(data.batchId) : null
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}