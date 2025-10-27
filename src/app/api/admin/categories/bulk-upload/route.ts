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

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: string[] = [];

    const normalizeName = (value: string) =>
      (value || '')
        .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
        .replace(/[\u201C\u201D\u2033]/g, '"')
        .replace(/[\u2013\u2014\u2212]/g, '-')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const rawName = (row.name || row.Name || row["Category Name"]) as string;
        const name = normalizeName(rawName);
        const description = (row.description || row.Description || '') as string;
        const returnPercentValue = row.returnPercent ?? row["Return %"] ?? row["Return Percent"];
        const isActiveValue = row.isActive ?? row.Active ?? row["Is Active"];

        const returnPercent = parseFloat(String(returnPercentValue));
        const isActive = typeof isActiveValue === 'boolean'
          ? isActiveValue
          : String(isActiveValue || '').toLowerCase() === 'true' || String(isActiveValue || '') === '1';

        if (!name || isNaN(returnPercent)) {
          errors.push(`Row ${i + 1}: Missing or invalid required fields (name, returnPercent)`);
          continue;
        }

        // Create or update by unique name
        // Attempt to match existing categories by tolerant comparison
        const existing = await db.category.findFirst({ where: { name } });
        if (existing) {
          await db.category.update({
            where: { id: existing.id },
            data: {
              description: description ?? existing.description ?? '',
              returnPercent,
              isActive,
            }
          });
        } else {
          await db.category.upsert({
            where: { name },
          update: {
            description: description ?? '',
            returnPercent,
            isActive,
          },
          create: {
            name,
            description: description ?? '',
            returnPercent,
            isActive,
          }
          });
        }

        imported++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error processing categories bulk upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    );
  }
}


