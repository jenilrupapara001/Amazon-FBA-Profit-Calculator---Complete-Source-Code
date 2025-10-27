import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ExcelRow {
  ASIN: string;
  SellingPrice: number;
  Weight: number;
  Length: number;
  Width: number;
  Height: number;
  Fulfillment: string;
  StepLevel: string;
}

interface AmazonProductData {
  productName: string;
  category: string;
  imageUrl: string;
}

// Fee calculation constants
const CLOSING_FEES: { [key: string]: { min: number; max: number; fee: number }[] } = {
  'Beauty': [
    { min: 0, max: 1000, fee: 20 },
    { min: 1000, max: 5000, fee: 40 },
    { min: 5000, max: Infinity, fee: 100 }
  ],
  'Electronics': [
    { min: 0, max: 1000, fee: 30 },
    { min: 1000, max: 5000, fee: 50 },
    { min: 5000, max: Infinity, fee: 120 }
  ],
  'default': [
    { min: 0, max: 1000, fee: 25 },
    { min: 1000, max: 5000, fee: 45 },
    { min: 5000, max: Infinity, fee: 110 }
  ]
};

const SHIPPING_RATE_PER_KG = 50; // ₹50 per kg

async function fetchAmazonProductData(asin: string): Promise<AmazonProductData> {
  try {
    const url = `https://www.amazon.in/dp/${asin}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    const productName = $('#productTitle').text().trim() || 
                       $('h1.a-size-large').text().trim() || 
                       `Product ${asin}`;
    
    const category = $('#wayfinding-breadcrumbs_container a').last().text().trim() ||
                     $('.nav-breadcrumb-text').last().text().trim() ||
                     'General';
    
    const imageUrl = $('#landingImage').attr('src') ||
                    $('.product-image-feature').attr('src') ||
                    '';

    return {
      productName,
      category,
      imageUrl
    };
  } catch (error) {
    console.error(`Failed to fetch data for ASIN ${asin}:`, error);
    return {
      productName: `Product ${asin}`,
      category: 'General',
      imageUrl: ''
    };
  }
}

async function getReferralFeePercentage(category: string, sellingPrice: number): Promise<number> {
  try {
    const categoryFee = await db.categoryFee.findFirst({
      where: {
        categoryName: category,
        minPrice: { lte: sellingPrice },
        maxPrice: { gte: sellingPrice }
      }
    });

    if (categoryFee) {
      return categoryFee.referralFeePercent;
    }

    // Default percentages if not found in database
    const defaultFees: { [key: string]: number } = {
      'Beauty': 15,
      'Electronics': 8,
      'Clothing': 17,
      'Home': 15,
      'Books': 12,
      'Toys': 15,
      'Sports': 15,
      'General': 15
    };

    return defaultFees[category] || defaultFees['General'];
  } catch (error) {
    console.error('Error fetching referral fee:', error);
    return 15; // Default 15%
  }
}

function getClosingFee(category: string, sellingPrice: number): number {
  const categoryFees = CLOSING_FEES[category] || CLOSING_FEES['default'];
  
  for (const range of categoryFees) {
    if (sellingPrice >= range.min && sellingPrice < range.max) {
      return range.fee;
    }
  }
  
  return categoryFees[categoryFees.length - 1].fee;
}

function calculateAllFees(
  sellingPrice: number,
  weight: number,
  length: number,
  width: number,
  height: number,
  category: string,
  referralFeePercent: number
) {
  // 1. Referral Fee
  const referralFee = (sellingPrice * referralFeePercent) / 100;

  // 2. Closing Fee
  const closingFee = getClosingFee(category, sellingPrice);

  // 3. Shipping Fee
  const shippingFee = weight * SHIPPING_RATE_PER_KG;

  // 4. Pick & Pack Fee
  const pickPackFee = weight < 15 ? 11 : 50;

  // 5. Removal Fee
  const removalFee = weight * 10;

  // 6. Storage Fee (volume in cubic feet)
  const volumeCuFt = (length * width * height) / 28316.84;
  const storageFee = volumeCuFt * 33;

  // 7. Total Other Cost
  const totalOtherCost = pickPackFee + storageFee + removalFee;

  // 8. Total Fees
  const totalFees = referralFee + closingFee + shippingFee + totalOtherCost;

  // 9. Tax Credit (18% default)
  const taxCredit = (totalFees * 18) / 100;

  // 10. Tax To Pay
  const taxToPay = (totalFees * taxCredit) / (100 + taxCredit);

  // 11. Final Without Tax
  const finalWithoutTax = totalFees - taxToPay;

  // 12. Net Earnings
  const netEarnings = sellingPrice - totalFees;

  // 13. Net Earnings %
  const netEarningsPercent = sellingPrice > 0 ? (netEarnings / sellingPrice) * 100 : 0;

  return {
    referralFee,
    closingFee,
    shippingFee,
    pickPackFee,
    removalFee,
    storageFee,
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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: 'No data found in Excel file' }, { status: 400 });
    }

    const results = [];
    let processed = 0;

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.ASIN || !row.SellingPrice || !row.Weight) {
          console.warn(`Skipping row with missing required fields:`, row);
          continue;
        }

        // Fetch Amazon product data
        const amazonData = await fetchAmazonProductData(row.ASIN);
        
        // Get referral fee percentage
        const referralFeePercent = await getReferralFeePercentage(amazonData.category, row.SellingPrice);
        
        // Calculate all fees
        const fees = calculateAllFees(
          row.SellingPrice,
          row.Weight,
          row.Length || 0,
          row.Width || 0,
          row.Height || 0,
          amazonData.category,
          referralFeePercent
        );

        // Save to database
        const productCalculation = await db.productCalculation.create({
          data: {
            asin: row.ASIN,
            productName: amazonData.productName,
            category: amazonData.category,
            sellingPrice: row.SellingPrice,
            weight: row.Weight,
            length: row.Length || 0,
            width: row.Width || 0,
            height: row.Height || 0,
            fulfillment: row.Fulfillment || 'FBA',
            stepLevel: row.StepLevel || 'Standard',
            ...fees
          }
        });

        results.push(productCalculation);
        processed++;
      } catch (error) {
        console.error(`Error processing ASIN ${row.ASIN}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed,
        total: data.length,
        results
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process file. Please check the format and try again.' 
    }, { status: 500 });
  }
}