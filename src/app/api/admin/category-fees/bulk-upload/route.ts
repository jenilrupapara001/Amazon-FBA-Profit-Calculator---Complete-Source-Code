import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload CSV or Excel files.' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    let imported = 0;
    let errors = [];

    // Helper: normalize category names to reduce mismatches
    const normalizeName = (value: string) =>
      (value || '')
        .replace(/[\u2018\u2019\u201A\u2032]/g, "'") // fancy single quotes → '
        .replace(/[\u201C\u201D\u2033]/g, '"')         // fancy double quotes → "
        .replace(/[\u2013\u2014\u2212]/g, '-')         // en/em dashes → -
        .replace(/[\u200B-\u200D\uFEFF]/g, '')         // zero-width chars
        .replace(/\s+/g, ' ')                            // collapse spaces
        .trim();

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      try {
        // Validate required fields
        const rawCategoryName = (row.categoryName || row['Category Name'] || row.category || '').toString();
        const categoryName = normalizeName(rawCategoryName);
        const minPrice = parseFloat(row.minPrice || row['Min Price'] || row['min price']);
        const maxPrice = parseFloat(row.maxPrice || row['Max Price'] || row['max price']);
        const referralFeePercent = parseFloat(row.referralFeePercent || row['Referral Fee %'] || row['referral fee']);

        if (!categoryName || isNaN(minPrice) || isNaN(maxPrice) || isNaN(referralFeePercent)) {
          errors.push(`Row ${i + 1}: Missing or invalid required fields`);
          continue;
        }

        // Ensure category exists (attempt tolerant match), create if missing
        // Try to find exact or close variants
        const altVariants = [
          rawCategoryName?.trim?.() || '',
          categoryName,
          categoryName.toLowerCase(),
        ].filter(Boolean);

        let matchedCategory = await db.category.findFirst({
          where: {
            OR: altVariants.map((n) => ({ name: n as string }))
          }
        });

        if (!matchedCategory) {
          // As a last resort, fetch some categories and compare normalized in JS
          const maybeCats = await db.category.findMany({ take: 1000 });
          matchedCategory = maybeCats.find((c) => normalizeName(c.name) === categoryName) || null as any;
        }

        const finalCategoryName = matchedCategory ? matchedCategory.name : categoryName;

        if (!matchedCategory) {
          await db.category.create({
            data: {
              name: finalCategoryName,
              description: '',
              returnPercent: 0,
              isActive: true,
            }
          });
        }

        // Check for overlapping price ranges
        const existingFee = await db.categoryFee.findFirst({
          where: {
            categoryName,
            OR: [
              {
                AND: [
                  { minPrice: { lte: minPrice } },
                  { maxPrice: { gte: minPrice } }
                ]
              },
              {
                AND: [
                  { minPrice: { lte: maxPrice } },
                  { maxPrice: { gte: maxPrice } }
                ]
              },
              {
                AND: [
                  { minPrice: { gte: minPrice } },
                  { maxPrice: { lte: maxPrice } }
                ]
              }
            ]
          }
        });

        if (existingFee) {
          errors.push(`Row ${i + 1}: Price range overlaps with existing fee for category "${categoryName}"`);
          continue;
        }

        // Create category fee
        await db.categoryFee.create({
          data: {
            categoryName: finalCategoryName,
            minPrice,
            maxPrice,
            referralFeePercent
          }
        });

        imported++;

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error processing bulk upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    );
  }
}