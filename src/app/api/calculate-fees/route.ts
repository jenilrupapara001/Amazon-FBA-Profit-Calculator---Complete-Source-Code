import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface FeeCalculationRequest {
  asin: string;
  productName: string;
  category: string;
  sellingPrice: number;
  weight: number; // in kg
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  fulfillment: string;
  stepLevel: string;
  region: string;
}

// Referral fees now come from DB CategoryFees; fallback to 8% if not found

// Closing fees based on price ranges
const CLOSING_FEES = [
  { minPrice: 0, maxPrice: 250, fee: 26 },
  { minPrice: 251, maxPrice: 500, fee: 12 },
  { minPrice: 501, maxPrice: 1000, fee: 20 },
  { minPrice: 1001, maxPrice: 99999999, fee: 35 }
];

// Shipping fees based on weight and region
const SHIPPING_FEES = [
  { minWeight: 0, maxWeight: 500, local: 40, regional: 50, national: 60 },
  { minWeight: 501, maxWeight: 1000, local: 60, regional: 75, national: 90 },
  { minWeight: 1001, maxWeight: 2000, local: 80, regional: 100, national: 120 },
  { minWeight: 2001, maxWeight: 999999, local: 120, regional: 150, national: 180 }
];

// Removal fees based on weight ranges
const REMOVAL_FEES = [
  { minWeight: 0, maxWeight: 200, fee: 15 },
  { minWeight: 201, maxWeight: 500, fee: 20 },
  { minWeight: 501, maxWeight: 1000, fee: 25 },
  { minWeight: 1001, maxWeight: 2000, fee: 40 },
  { minWeight: 2001, maxWeight: 999999, fee: 100 }
];

  // Tax credit percentages by category
const TAX_CREDIT_RATES: { [key: string]: number } = {
  "Beauty - Haircare, Bath and Shower": 18.00,
  "Beauty - Make-up": 18.00,
  "Laptops": 18.00,
  "Apparel - Sarees & Dress Materials": 18.00,
  "Apparel - Dress": 18.00,
  "Shoes": 18.00,
  "Home - Other products": 18.00,
  "Kitchen - Other products": 18.00,
  "Electronics": 18.00,
  "General": 18.00
};

// Return percentages from DB Category table (returnPercent); default 10
async function getReturnPercentage(category: string): Promise<number> {
  const rec = await db.category.findUnique({ where: { name: category } });
  return rec?.returnPercent ?? 10;
}

async function getReferralFee(category: string, sellingPrice: number): Promise<{ percentage: number; feeInr: number }> {
  const tier = await db.categoryFee.findFirst({
    where: {
      categoryName: category,
      minPrice: { lte: sellingPrice },
      maxPrice: { gte: sellingPrice }
    }
  });
  const percentage = tier?.referralFeePercent ?? 8;
  const feeInr = (sellingPrice * percentage) / 100;
  return { percentage, feeInr };
}

function getClosingFee(sellingPrice: number): number {
  for (const tier of CLOSING_FEES) {
    if (sellingPrice >= tier.minPrice && sellingPrice <= tier.maxPrice) {
      return tier.fee;
    }
  }
  return 35; // Default highest tier
}

function getShippingFee(weight: number, region: string): number {
  const weightInGrams = weight * 1000; // Convert kg to grams
  
  for (const tier of SHIPPING_FEES) {
    if (weightInGrams >= tier.minWeight && weightInGrams <= tier.maxWeight) {
      switch (region.toLowerCase()) {
        case "local":
          return tier.local;
        case "regional":
          return tier.regional;
        case "national":
          return tier.national;
        default:
          return tier.national; // Default to national
      }
    }
  }
  return 180; // Default highest tier
}

function getPickPackFee(weight: number): number {
  return weight <= 15 ? 11 : 50;
}

function getRemovalFee(weight: number): number {
  const weightInGrams = weight * 1000; // Convert kg to grams
  
  for (const tier of REMOVAL_FEES) {
    if (weightInGrams >= tier.minWeight && weightInGrams <= tier.maxWeight) {
      return tier.fee;
    }
  }
  return 100; // Default highest tier
}

function calculateStorageCost(length: number, width: number, height: number): number {
  // Calculate volume in cubic cm
  const volumeCmCubed = length * width * height;
  
  // Convert to cubic feet (1 cubic foot = 28316.84 cubic cm)
  const volumeCubicFeet = volumeCmCubed / 28316.84;
  
  // Storage cost = volume (cu ft) * monthly rate (₹33)
  const storageCost = volumeCubicFeet * 33;
  
  return Math.round(storageCost * 100) / 100; // Round to 2 decimal places
}

function getTaxCredit(category: string): number {
  return TAX_CREDIT_RATES[category] || 18.00;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeeCalculationRequest = await request.json();
    
    const {
      asin,
      productName,
      category,
      sellingPrice,
      weight,
      length,
      width,
      height,
      fulfillment,
      stepLevel,
      region
    } = body;

    // Validate required fields
    if (!sellingPrice || !weight || !category) {
      return NextResponse.json(
        { success: false, error: 'Selling price, weight, and category are required' },
        { status: 400 }
      );
    }

    // 1. Referral Fees
    const referralFeeResult = await getReferralFee(category, sellingPrice);
    const referralFeePercentage = referralFeeResult.percentage;
    const referralFeeInr = referralFeeResult.feeInr;

    // 2. Closing Fees
    const closingFee = getClosingFee(sellingPrice);

    // 3. Shipping Fee
    const shippingFee = getShippingFee(weight, region || "National");

    // 4. Pick & Pack Fee
    const pickPackFee = getPickPackFee(weight);

    // 5. Storage Cost
    const storageFee = calculateStorageCost(length || 0, width || 0, height || 0);

    // 6. Removal Fee
    const removalFee = getRemovalFee(weight);

    // 7. Total Other Cost
    const totalOtherCost = pickPackFee + storageFee + removalFee;

    // 8. Total Fees
    const totalFees = referralFeeInr + closingFee + shippingFee + totalOtherCost;

    // 9. Tax Credit %
    const taxCreditPercentage = getTaxCredit(category);

    // 10. Tax to Pay
    const taxToPay = (totalFees * taxCreditPercentage) / (100 + taxCreditPercentage);

    // 11. Final Without Tax
    const finalWithoutTax = totalFees - taxToPay;

    // 12. Net Earnings
    const netEarnings = sellingPrice - totalFees;

    // 13. Net Earnings %
    const netEarningsPercentage = sellingPrice > 0 ? (netEarnings / sellingPrice) * 100 : 0;

    // 14. Return % and Return Fees
    const returnPercentage = await getReturnPercentage(category);
    const returnFees = (sellingPrice * returnPercentage) / 100;

    // 15. Final Payout
    const finalPayout = netEarnings - returnFees;

    const calculationResult = {
      // Input values
      asin,
      productName,
      category,
      sellingPrice,
      weight,
      length,
      width,
      height,
      fulfillment,
      stepLevel,
      region,

      // Fee calculations
      referralFeePercentage,
      referralFeeInr,
      closingFee,
      shippingFee,
      pickPackFee,
      storageFee,
      removalFee,
      totalOtherCost,
      totalFees,
      taxCreditPercentage,
      taxToPay,
      finalWithoutTax,
      netEarnings,
      netEarningsPercentage: Math.round(netEarningsPercentage * 100) / 100, // Round to 2 decimal places
      returnPercentage,
      returnFees,
      finalPayout,

      // Additional info
      volumeCubicFeet: length && width && height ? Math.round((length * width * height / 28316.84) * 100) / 100 : 0
    };

    // Save to database if ASIN is provided
    if (asin) {
      try {
        await db.productCalculation.create({
          data: {
            asin: asin.toUpperCase(),
            productName: productName || `Product ${asin}`,
            category,
            sellingPrice,
            weight,
            length: length || 0,
            width: width || 0,
            height: height || 0,
            fulfillment,
            stepLevel,
            region: region || "National",
            referralFee: referralFeeInr,
            closingFee,
            shippingFee,
            pickPackFee,
            removalFee,
            storageFee,
            totalOtherCost,
            totalFees,
            taxCredit: taxCreditPercentage,
            taxToPay,
            finalWithoutTax,
            netEarnings,
            netEarningsPercent: netEarningsPercentage,
            returnPercent: returnPercentage,
            returnFees,
            finalPayout
          }
        });
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Continue even if database save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: calculationResult,
      message: 'Fees calculated successfully'
    });

  } catch (error) {
    console.error('Error calculating fees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate fees' },
      { status: 500 }
    );
  }
}