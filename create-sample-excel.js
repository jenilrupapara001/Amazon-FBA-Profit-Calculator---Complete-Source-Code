import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Sample data for testing
const sampleData = [
  {
    ASIN: 'B08N5WRWNW',
    SellingPrice: 2999,
    Weight: 0.5,
    Length: 20,
    Width: 15,
    Height: 5,
    Fulfillment: 'FBA',
    StepLevel: 'Standard'
  },
  {
    ASIN: 'B07XJ8C8F5',
    SellingPrice: 1599,
    Weight: 0.3,
    Length: 15,
    Width: 10,
    Height: 8,
    Fulfillment: 'FBA',
    StepLevel: 'Standard'
  },
  {
    ASIN: 'B09F5X1X4Q',
    SellingPrice: 4999,
    Weight: 1.2,
    Length: 25,
    Width: 20,
    Height: 10,
    Fulfillment: 'FBA',
    StepLevel: 'Premium'
  }
];

// Create workbook
const ws = XLSX.utils.json_to_sheet(sampleData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Write to file
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync('./sample_products.xlsx', buffer);

console.log('Sample Excel file created: sample_products.xlsx');