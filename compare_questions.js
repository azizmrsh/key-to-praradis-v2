import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, 'attached_assets/Assessment_questions_multilingual_1752561738884.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['assessment_questions_multilingu'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Extract question IDs from Excel
const excelQuestions = [];
for (let i = 1; i < jsonData.length; i++) {
  if (jsonData[i] && jsonData[i][0]) {
    excelQuestions.push({
      id: jsonData[i][0],
      category: jsonData[i][1],
      section: jsonData[i][2],
      english: jsonData[i][3],
      arabic: jsonData[i][4],
      french: jsonData[i][5]
    });
  }
}

// Read existing system questions
const systemFilePath = path.join(__dirname, 'client/src/data/selfAssessmentData.ts');
const systemContent = fs.readFileSync(systemFilePath, 'utf8');

// Extract existing question IDs
const existingIds = [];
const idMatches = systemContent.match(/id: '[^']+'/g);
if (idMatches) {
  idMatches.forEach(match => {
    const id = match.replace("id: '", "").replace("'", "");
    existingIds.push(id);
  });
}

console.log('=== COMPATIBILITY ANALYSIS ===');
console.log('Excel file questions:', excelQuestions.length);
console.log('System questions:', existingIds.length);
console.log('');

// Check for exact matches
const exactMatches = [];
const newQuestions = [];
const missingFromExcel = [];

excelQuestions.forEach(q => {
  if (existingIds.includes(q.id)) {
    exactMatches.push(q.id);
  } else {
    newQuestions.push(q.id);
  }
});

existingIds.forEach(id => {
  if (!excelQuestions.find(q => q.id === id)) {
    missingFromExcel.push(id);
  }
});

console.log('=== EXACT MATCHES ===');
console.log('Questions with matching IDs:', exactMatches.length);
console.log('Sample matches:', exactMatches.slice(0, 10));
console.log('');

console.log('=== NEW QUESTIONS IN EXCEL ===');
console.log('New questions in Excel:', newQuestions.length);
console.log('Sample new questions:', newQuestions.slice(0, 10));
console.log('');

console.log('=== MISSING FROM EXCEL ===');
console.log('Questions in system but not in Excel:', missingFromExcel.length);
console.log('Sample missing:', missingFromExcel.slice(0, 10));
console.log('');

console.log('=== CATEGORY BREAKDOWN ===');
const categoryBreakdown = {};
excelQuestions.forEach(q => {
  if (!categoryBreakdown[q.category]) {
    categoryBreakdown[q.category] = 0;
  }
  categoryBreakdown[q.category]++;
});

Object.entries(categoryBreakdown).forEach(([category, count]) => {
  console.log(`${category}: ${count} questions`);
});
console.log('');

console.log('=== SAMPLE QUESTIONS WITH TRANSLATIONS ===');
excelQuestions.slice(0, 3).forEach(q => {
  console.log(`ID: ${q.id}`);
  console.log(`Category: ${q.category}`);
  console.log(`English: ${q.english}`);
  console.log(`Arabic: ${q.arabic}`);
  console.log(`French: ${q.french}`);
  console.log('---');
});

// Check for question numbering issues
console.log('=== QUESTION ID ANALYSIS ===');
const idIssues = [];
excelQuestions.forEach(q => {
  if (!q.id.includes('_')) {
    idIssues.push(q.id);
  }
});

if (idIssues.length > 0) {
  console.log('Questions with ID format issues:', idIssues);
} else {
  console.log('All question IDs follow the category_number format');
}