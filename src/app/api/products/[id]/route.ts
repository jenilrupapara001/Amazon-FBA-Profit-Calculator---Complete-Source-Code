import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.productCalculation.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        batch: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const id = parseInt(params.id);

    // Check if product exists
    const existingProduct = await db.productCalculation.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if ASIN is being changed and if it conflicts with another product
    if (data.asin && data.asin !== existingProduct.asin) {
      const asinConflict = await db.productCalculation.findUnique({
        where: { asin: data.asin }
      });

      if (asinConflict) {
        return NextResponse.json(
          { error: 'Product with this ASIN already exists' },
          { status: 409 }
        );
      }
    }

    // Update product
    const product = await db.productCalculation.update({
      where: { id },
      data: {
        ...data,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        length: data.length ? parseFloat(data.length) : undefined,
        width: data.width ? parseFloat(data.width) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        referralFee: data.referralFee ? parseFloat(data.referralFee) : undefined,
        closingFee: data.closingFee ? parseFloat(data.closingFee) : undefined,
        shippingFee: data.shippingFee ? parseFloat(data.shippingFee) : undefined,
        pickPackFee: data.pickPackFee ? parseFloat(data.pickPackFee) : undefined,
        removalFee: data.removalFee ? parseFloat(data.removalFee) : undefined,
        storageFee: data.storageFee ? parseFloat(data.storageFee) : undefined,
        totalOtherCost: data.totalOtherCost ? parseFloat(data.totalOtherCost) : undefined,
        totalFees: data.totalFees ? parseFloat(data.totalFees) : undefined,
        taxCredit: data.taxCredit ? parseFloat(data.taxCredit) : undefined,
        taxToPay: data.taxToPay ? parseFloat(data.taxToPay) : undefined,
        finalWithoutTax: data.finalWithoutTax ? parseFloat(data.finalWithoutTax) : undefined,
        netEarnings: data.netEarnings ? parseFloat(data.netEarnings) : undefined,
        netEarningsPercent: data.netEarningsPercent ? parseFloat(data.netEarningsPercent) : undefined,
        returnPercent: data.returnPercent ? parseFloat(data.returnPercent) : undefined,
        returnFees: data.returnFees ? parseFloat(data.returnFees) : undefined,
        finalPayout: data.finalPayout ? parseFloat(data.finalPayout) : undefined,
        batchId: data.batchId !== undefined ? (data.batchId ? parseInt(data.batchId) : null) : undefined
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if product exists
    const existingProduct = await db.productCalculation.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    await db.productCalculation.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}