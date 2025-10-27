import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asin } = body;

    if (!asin || typeof asin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid ASIN is required' },
        { status: 400 }
      );
    }

    // Normalize ASIN
    const normalizedAsin = asin.trim().toUpperCase();

    // Test known products
    const knownProducts = {
      "B08N5WRWNW": {
        productName: "Apple 2020 MacBook Pro (13.3-inch, M1 chip, 8GB RAM, 512GB SSD) - Space Grey",
        category: "Laptops",
        sellingPrice: 122900,
        weight: 1400,
        length: 30.41,
        width: 21.24,
        height: 1.56
      },
      "B09G9FPH6J": {
        productName: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB‑C)",
        category: "Electronic Devices (Excluding TV, Camera & Camcorder, Camera Lenses & Accessories, GPS Devices & Speakers)",
        sellingPrice: 24900,
        weight: 50.8,
        length: 6.06,
        width: 4.58,
        height: 5.49
      }
    };

    // Check if we have known data for this ASIN
    if (knownProducts[normalizedAsin]) {
      const knownData = knownProducts[normalizedAsin];
      return NextResponse.json({
        success: true,
        data: {
          asin: normalizedAsin,
          ...knownData
        },
        message: `Found known product: ${knownData.productName}`
      });
    }

    // For other ASINs, return a basic fallback
    return NextResponse.json({
      success: true,
      data: {
        asin: normalizedAsin,
        productName: `Amazon Product ${normalizedAsin}`,
        category: "General",
        sellingPrice: null,
        weight: null,
        length: null,
        width: null,
        height: null
      },
      message: `Using basic fallback for ${normalizedAsin}. Please enter details manually.`
    });

  } catch (error) {
    console.error('Error in test-amazon-fetch:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process ASIN',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}