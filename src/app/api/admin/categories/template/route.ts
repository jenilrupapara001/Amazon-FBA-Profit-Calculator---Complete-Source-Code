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

    const templateData = [
      { 'Category Name': 'Electronics', Description: 'Devices and gadgets', 'Return %': 10, 'Is Active': true },
      { 'Category Name': 'Apparel', Description: 'Clothing and accessories', 'Return %': 15, 'Is Active': true },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="categories-template.xlsx"'
      }
    });

  } catch (error) {
    console.error('Error generating categories template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}


