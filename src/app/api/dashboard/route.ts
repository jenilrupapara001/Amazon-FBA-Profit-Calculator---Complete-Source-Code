import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total products count
    const totalProducts = await db.productCalculation.count();

    // Get sum of all selling prices (total revenue)
    const revenueResult = await db.productCalculation.aggregate({
      _sum: {
        sellingPrice: true
      }
    });

    // Get sum of all net earnings
    const earningsResult = await db.productCalculation.aggregate({
      _sum: {
        netEarnings: true
      }
    });

    // Get average profit margin
    const avgMarginResult = await db.productCalculation.aggregate({
      _avg: {
        netEarningsPercent: true
      }
    });

    const totalRevenue = revenueResult._sum.sellingPrice || 0;
    const totalNetEarnings = earningsResult._sum.netEarnings || 0;
    const avgProfitMargin = avgMarginResult._avg.netEarningsPercent || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        totalNetEarnings,
        avgProfitMargin
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}