import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Get all products
    const products = await db.productCalculation.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products to export' },
        { status: 404 }
      );
    }

    // Prepare data for Excel
    const exportData = products.map(product => ({
      'ASIN': product.asin,
      'Product Name': product.productName,
      'Category': product.category,
      'Selling Price': product.sellingPrice,
      'Weight (kg)': product.weight,
      'Length (cm)': product.length,
      'Width (cm)': product.width,
      'Height (cm)': product.height,
      'Fulfillment': product.fulfillment,
      'Step Level': product.stepLevel,
      'Referral Fee': product.referralFee,
      'Closing Fee': product.closingFee,
      'Shipping Fee': product.shippingFee,
      'Pick & Pack Fee': product.pickPackFee,
      'Removal Fee': product.removalFee,
      'Storage Fee': product.storageFee,
      'Total Other Cost': product.totalOtherCost,
      'Total Fees': product.totalFees,
      'Tax Credit': product.taxCredit,
      'Tax to Pay': product.taxToPay,
      'Final Without Tax': product.finalWithoutTax,
      'Net Earnings': product.netEarnings,
      'Net Earnings %': product.netEarningsPercent.toFixed(2),
      'Created At': product.createdAt.toLocaleString()
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FBA Products');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="fba_products_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}