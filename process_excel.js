import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, 'attached_assets/Assessment_questions_multilingual_1752561738884.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('=== WORKBOOK INFORMATION ===');
  console.log('Sheet names:', workbook.SheetNames);
  console.log('');
  
  // Process each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`=== SHEET: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON to see the data
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Headers:', jsonData[0]);
    console.log('Total rows:', jsonData.length);
    console.log('');
    
    // Show first few rows
    console.log('First 5 rows:');
    jsonData.slice(0, 5).forEach((row, index) => {
      console.log(`Row ${index}:`, row);
    });
    
    console.log('');
    
    // Check for Arabic text
    console.log('=== CHECKING FOR ARABIC TEXT ===');
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    let arabicFound = false;
    jsonData.forEach((row, index) => {
      if (row && row.some(cell => cell && arabicRegex.test(cell.toString()))) {
        arabicFound = true;
        console.log(`Arabic text found in row ${index}:`, row.filter(cell => cell && arabicRegex.test(cell.toString())));
      }
    });
    
    if (!arabicFound) {
      console.log('No Arabic text detected in this sheet');
    }
    
    console.log('');
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error);
}