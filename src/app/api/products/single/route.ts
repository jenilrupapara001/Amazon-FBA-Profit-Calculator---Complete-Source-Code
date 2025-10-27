import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fee calculation functions
function getReferralFee(category: string, price: number): number {
  const referralFees: { [key: string]: { min: number; max: number; percent: number }[] } = {
    "Beauty - Haircare, Bath and Shower": [
      { min: 0, max: 300, percent: 0 },
      { min: 300, max: 500, percent: 5 },
      { min: 500, max: 99999999, percent: 8 }
    ],
    "Beauty - Make-up": [
      { min: 0, max: 300, percent: 0 },
      { min: 300, max: 500, percent: 2 },
      { min: 500, max: 1000, percent: 3.5 },
      { min: 1000, max: 99999999, percent: 7 }
    ],
    "Electronics": [
      { min: 0, max: 300, percent: 0 },
      { min: 300, max: 1000, percent: 6 },
      { min: 1000, max: 99999999, percent: 8 }
    ],
    "Home - Other products": [
      { min: 0, max: 300, percent: 0 },
      { min: 300, max: 500, percent: 5 },
      { min: 500, max: 1000, percent: 13 },
      { min: 1000, max: 99999999, percent: 18 }
    ],
    "General": [
      { min: 0, max: 300, percent: 8 },
      { min: 300, max: 99999999, percent: 15 }
    ]
  };

  const categoryFees = referralFees[category] || referralFees["General"];
  
  for (const fee of categoryFees) {
    if (price >= fee.min && price <= fee.max) {
      return price * (fee.percent / 100);
    }
  }
  
  return price * 0.15; // Default 15%
}

function getClosingFee(price: number): number {
  if (price <= 250) return 26;
  if (price <= 500) return 12;
  if (price <= 1000) return 20;
  return 35;
}

function getShippingFee(weight: number, region: string = "National"): number {
  const weightRanges = [
    { min: 0, max: 500, local: 40, regional: 50, national: 60 },
    { min: 501, max: 1000, local: 60, regional: 75, national: 90 },
    { min: 1001, max: 2000, local: 80, regional: 100, national: 120 },
    { min: 2001, max: 999999, local: 120, regional: 150, national: 180 }
  ];

  const weightGrams = weight * 1000;
  
  for (const range of weightRanges) {
    if (weightGrams >= range.min && weightGrams <= range.max) {
      switch (region) {
        case "Local": return range.local;
        case "Regional": return range.regional;
        default: return range.national;
      }
    }
  }
  
  return 180;
}

function getPickPackFee(weight: number): number {
  return weight <= 15 ? 11 : 50;
}

function getStorageFee(length: number, width: number, height: number): number {
  const volumeCm3 = length * width * height;
  const volumeCubicFeet = volumeCm3 / 28316.84;
  return volumeCubicFeet * 33; // ₹33 per cubic foot per month
}

function getRemovalFee(weight: number): number {
  const weightGrams = weight * 1000;
  if (weightGrams <= 200) return 15;
  if (weightGrams <= 500) return 20;
  if (weightGrams <= 1000) return 25;
  if (weightGrams <= 2000) return 40;
  return 100;
}

async function calculateFees(productData: any) {
  const {
    sellingPrice,
    weight,
    length,
    width,
    height,
    category,
    fulfillment,
    stepLevel
  } = productData;

  // Calculate all fees
  const referralFee = getReferralFee(category, sellingPrice);
  const closingFee = getClosingFee(sellingPrice);
  const shippingFee = fulfillment === "FBA" ? getShippingFee(weight) : 0;
  const pickPackFee = fulfillment === "FBA" ? getPickPackFee(weight) : 0;
  const storageFee = fulfillment === "FBA" ? getStorageFee(length, width, height) : 0;
  const removalFee = getRemovalFee(weight);
  
  const totalOtherCost = pickPackFee + storageFee + removalFee;
  const totalFees = referralFee + closingFee + shippingFee + totalOtherCost;
  
  // Tax calculations (18% GST)
  const taxCredit = totalFees * 0.18;
  const taxToPay = taxCredit * 18 / 118;
  const finalWithoutTax = sellingPrice - totalFees;
  const netEarnings = finalWithoutTax - taxToPay;
  const netEarningsPercent = sellingPrice > 0 ? (netEarnings / sellingPrice) * 100 : 0;

  return {
    referralFee,
    closingFee,
    shippingFee,
    pickPackFee,
    storageFee,
    removalFee,
    totalOtherCost,
    totalFees,
    taxCredit,
    taxToPay,
    finalWithoutTax,
    netEarnings,
    netEarningsPercent
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      stepLevel
    } = body;

    // Validate required fields
    if (!asin || !sellingPrice || !weight) {
      return NextResponse.json(
        { success: false, error: 'ASIN, selling price, and weight are required' },
        { status: 400 }
      );
    }

    // Check if product with this ASIN already exists
    const existingProduct = await db.productCalculation.findFirst({
      where: { asin: asin.toUpperCase() }
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this ASIN already exists' },
        { status: 409 }
      );
    }

    // Calculate fees
    const fees = await calculateFees({
      sellingPrice,
      weight,
      length: length || 0,
      width: width || 0,
      height: height || 0,
      category,
      fulfillment,
      stepLevel
    });

    // Create product record
    const product = await db.productCalculation.create({
      data: {
        asin: asin.toUpperCase(),
        productName: productName || `Product ${asin.toUpperCase()}`,
        category,
        sellingPrice,
        weight,
        length: length || 0,
        width: width || 0,
        height: height || 0,
        fulfillment,
        stepLevel,
        ...fees
      }
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product added successfully'
    });

  } catch (error) {
    console.error('Error adding single product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add product' },
      { status: 500 }
    );
  }
}