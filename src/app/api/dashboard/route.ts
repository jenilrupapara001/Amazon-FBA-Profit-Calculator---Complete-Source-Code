import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Total number of products
    const totalProducts = await db.productCalculation.count();

    // Aggregate calculations
    const [revenueResult, earningsResult, avgMarginResult] = await Promise.all([
      db.productCalculation.aggregate({
        _sum: { sellingPrice: true },
      }),
      db.productCalculation.aggregate({
        _sum: { netEarnings: true },
      }),
      db.productCalculation.aggregate({
        _avg: { netEarningsPercent: true },
      }),
    ]);

    const totalRevenue = revenueResult._sum.sellingPrice ?? 0;
    const totalNetEarnings = earningsResult._sum.netEarnings ?? 0;
    const avgProfitMargin = avgMarginResult._avg.netEarningsPercent ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        totalNetEarnings,
        avgProfitMargin,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching dashboard data:", error.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
