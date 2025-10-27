import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create template data
    const templateData = [
      {
        'Category Name': 'Electronics',
        'Min Price': 0,
        'Max Price': 1000,
        'Referral Fee %': 8
      },
      {
        'Category Name': 'Electronics',
        'Min Price': 1000,
        'Max Price': 5000,
        'Referral Fee %': 12
      },
      {
        'Category Name': 'Apparel',
        'Min Price': 0,
        'Max Price': 500,
        'Referral Fee %': 15
      },
      {
        'Category Name': 'Apparel',
        'Min Price': 500,
        'Max Price': 999999,
        'Referral Fee %': 20
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Category Fees');

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Category Name
      { wch: 12 }, // Min Price
      { wch: 12 }, // Max Price
      { wch: 15 }  // Referral Fee %
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="category-fees-template.xlsx"'
      }
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}