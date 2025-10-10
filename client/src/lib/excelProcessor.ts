import * as XLSX from 'xlsx';
import { SelfAssessmentQuestion, SelfAssessmentResponseOption, SinCategory } from '@/data/selfAssessmentData';

export interface ExcelAssessmentQuestion {
  id: string;
  category: SinCategory;
  text: string;
  section?: string;
  weight?: number;
  isRequired?: boolean;
  conditional?: {
    dependsOn: string;
    value: number;
  };
  translations?: {
    ar?: string;
    fr?: string;
  };
}

export interface ExcelResponseOption {
  id: string;
  text: string;
  value: number;
  translations?: {
    ar?: string;
    fr?: string;
  };
}

export interface ProcessedExcelData {
  questions: ExcelAssessmentQuestion[];
  responseOptions: ExcelResponseOption[];
  metadata: {
    totalQuestions: number;
    categoryCounts: Record<SinCategory, number>;
    processedAt: Date;
    version: string;
  };
}

export class ExcelProcessor {
  
  /**
   * Process Excel file containing self-assessment data
   */
  static async processExcelFile(file: File): Promise<ProcessedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const result = this.parseWorkbook(workbook);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to process Excel file: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Parse the workbook and extract questions and response options
   */
  private static parseWorkbook(workbook: XLSX.WorkBook): ProcessedExcelData {
    const questions: ExcelAssessmentQuestion[] = [];
    const responseOptions: ExcelResponseOption[] = [];
    const categoryCounts: Record<SinCategory, number> = {
      tongue: 0,
      eyes: 0,
      ears: 0,
      pride: 0,
      stomach: 0,
      zina: 0,
      heart: 0
    };

    // Process Questions sheet
    if (workbook.SheetNames.includes('Questions')) {
      const questionsSheet = workbook.Sheets['Questions'];
      const questionsData = XLSX.utils.sheet_to_json(questionsSheet, { header: 1 });
      
      const questionResults = this.parseQuestionsSheet(questionsData);
      questions.push(...questionResults);
      
      // Count questions by category
      questionResults.forEach(q => {
        if (q.category in categoryCounts) {
          categoryCounts[q.category]++;
        }
      });
    }

    // Process Response Options sheet
    if (workbook.SheetNames.includes('ResponseOptions') || workbook.SheetNames.includes('Response Options')) {
      const responseSheet = workbook.Sheets['ResponseOptions'] || workbook.Sheets['Response Options'];
      const responseData = XLSX.utils.sheet_to_json(responseSheet, { header: 1 });
      
      const responseResults = this.parseResponseOptionsSheet(responseData);
      responseOptions.push(...responseResults);
    }

    // Alternative: Try to parse from single sheet if separate sheets don't exist
    if (questions.length === 0 && workbook.SheetNames.length > 0) {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const allData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      const combinedResults = this.parseMultiFormatSheet(allData);
      questions.push(...combinedResults.questions);
      responseOptions.push(...combinedResults.responseOptions);
      
      // Update category counts
      combinedResults.questions.forEach(q => {
        if (q.category in categoryCounts) {
          categoryCounts[q.category]++;
        }
      });
    }

    return {
      questions,
      responseOptions,
      metadata: {
        totalQuestions: questions.length,
        categoryCounts,
        processedAt: new Date(),
        version: '1.0'
      }
    };
  }

  /**
   * Parse questions sheet with expected columns
   */
  private static parseQuestionsSheet(data: any[][]): ExcelAssessmentQuestion[] {
    const questions: ExcelAssessmentQuestion[] = [];
    
    if (data.length < 2) return questions;
    
    const headers = data[0].map((header: string) => header?.toString().toLowerCase().trim());
    
    // Find column indices
    const idIndex = this.findColumnIndex(headers, ['id', 'question_id', 'questionid']);
    const categoryIndex = this.findColumnIndex(headers, ['category', 'sin_category', 'type']);
    const textIndex = this.findColumnIndex(headers, ['text', 'question', 'question_text']);
    const sectionIndex = this.findColumnIndex(headers, ['section', 'subsection', 'topic']);
    const weightIndex = this.findColumnIndex(headers, ['weight', 'importance', 'score_weight']);
    const arabicIndex = this.findColumnIndex(headers, ['arabic', 'ar', 'arabic_text']);
    const frenchIndex = this.findColumnIndex(headers, ['french', 'fr', 'french_text']);
    
    // Process each row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0) continue;
      
      const id = row[idIndex]?.toString().trim();
      const category = row[categoryIndex]?.toString().toLowerCase().trim();
      const text = row[textIndex]?.toString().trim();
      
      if (!id || !category || !text) continue;
      
      // Validate category
      if (!this.isValidCategory(category)) {
        console.warn(`Invalid category: ${category} for question ${id}`);
        continue;
      }
      
      const question: ExcelAssessmentQuestion = {
        id,
        category: category as SinCategory,
        text,
        section: sectionIndex !== -1 ? row[sectionIndex]?.toString().trim() : undefined,
        weight: weightIndex !== -1 ? parseFloat(row[weightIndex]) || 1 : 1,
        isRequired: true,
        translations: {}
      };
      
      // Add translations if available
      if (arabicIndex !== -1 && row[arabicIndex]) {
        question.translations!.ar = row[arabicIndex].toString().trim();
      }
      if (frenchIndex !== -1 && row[frenchIndex]) {
        question.translations!.fr = row[frenchIndex].toString().trim();
      }
      
      questions.push(question);
    }
    
    return questions;
  }

  /**
   * Parse response options sheet
   */
  private static parseResponseOptionsSheet(data: any[][]): ExcelResponseOption[] {
    const options: ExcelResponseOption[] = [];
    
    if (data.length < 2) return options;
    
    const headers = data[0].map((header: string) => header?.toString().toLowerCase().trim());
    
    const idIndex = this.findColumnIndex(headers, ['id', 'option_id', 'optionid']);
    const textIndex = this.findColumnIndex(headers, ['text', 'option', 'option_text']);
    const valueIndex = this.findColumnIndex(headers, ['value', 'score', 'points']);
    const arabicIndex = this.findColumnIndex(headers, ['arabic', 'ar', 'arabic_text']);
    const frenchIndex = this.findColumnIndex(headers, ['french', 'fr', 'french_text']);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0) continue;
      
      const id = row[idIndex]?.toString().trim();
      const text = row[textIndex]?.toString().trim();
      const value = parseFloat(row[valueIndex]) || 0;
      
      if (!id || !text) continue;
      
      const option: ExcelResponseOption = {
        id,
        text,
        value,
        translations: {}
      };
      
      if (arabicIndex !== -1 && row[arabicIndex]) {
        option.translations!.ar = row[arabicIndex].toString().trim();
      }
      if (frenchIndex !== -1 && row[frenchIndex]) {
        option.translations!.fr = row[frenchIndex].toString().trim();
      }
      
      options.push(option);
    }
    
    return options;
  }

  /**
   * Parse multi-format sheet (handles various Excel formats)
   */
  private static parseMultiFormatSheet(data: any[][]): { questions: ExcelAssessmentQuestion[]; responseOptions: ExcelResponseOption[] } {
    const questions: ExcelAssessmentQuestion[] = [];
    const responseOptions: ExcelResponseOption[] = [];
    
    if (data.length < 2) return { questions, responseOptions };
    
    // Try to detect format based on headers
    const headers = data[0].map((header: string) => header?.toString().toLowerCase().trim());
    
    // Check if this looks like a questions sheet
    if (headers.some(h => h.includes('question') || h.includes('text')) && 
        headers.some(h => h.includes('category') || h.includes('type'))) {
      
      questions.push(...this.parseQuestionsSheet(data));
    }
    
    // Check if this looks like response options
    if (headers.some(h => h.includes('option') || h.includes('response')) && 
        headers.some(h => h.includes('value') || h.includes('score'))) {
      
      responseOptions.push(...this.parseResponseOptionsSheet(data));
    }
    
    return { questions, responseOptions };
  }

  /**
   * Find column index by possible header names
   */
  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  }

  /**
   * Validate if category is valid
   */
  private static isValidCategory(category: string): boolean {
    const validCategories = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    return validCategories.includes(category);
  }

  /**
   * Convert processed data to application format
   */
  static convertToAppFormat(processedData: ProcessedExcelData): {
    questions: SelfAssessmentQuestion[];
    responseOptions: SelfAssessmentResponseOption[];
  } {
    const questions: SelfAssessmentQuestion[] = processedData.questions.map(q => ({
      id: q.id,
      text: q.text,
      category: q.category,
      section: q.section,
      weight: q.weight || 1,
      isRequired: q.isRequired !== false,
      conditional: q.conditional
    }));

    const responseOptions: SelfAssessmentResponseOption[] = processedData.responseOptions.map(o => ({
      id: o.id,
      text: o.text,
      value: o.value
    }));

    return { questions, responseOptions };
  }

  /**
   * Generate preview of processed data
   */
  static generatePreview(processedData: ProcessedExcelData): string {
    const { questions, responseOptions, metadata } = processedData;
    
    let preview = `Assessment Data Preview\n`;
    preview += `========================\n\n`;
    preview += `Total Questions: ${metadata.totalQuestions}\n`;
    preview += `Response Options: ${responseOptions.length}\n`;
    preview += `Processed: ${metadata.processedAt.toLocaleString()}\n\n`;
    
    preview += `Questions by Category:\n`;
    Object.entries(metadata.categoryCounts).forEach(([category, count]) => {
      preview += `  ${category}: ${count} questions\n`;
    });
    
    preview += `\nSample Questions:\n`;
    questions.slice(0, 5).forEach((q, index) => {
      preview += `  ${index + 1}. [${q.category}] ${q.text}\n`;
    });
    
    if (responseOptions.length > 0) {
      preview += `\nSample Response Options:\n`;
      responseOptions.slice(0, 5).forEach((o, index) => {
        preview += `  ${index + 1}. ${o.text} (${o.value})\n`;
      });
    }
    
    return preview;
  }

  /**
   * Validate processed data
   */
  static validateData(processedData: ProcessedExcelData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { questions, responseOptions } = processedData;
    
    // Validate questions
    if (questions.length === 0) {
      errors.push('No questions found in the Excel file');
    }
    
    // Check for duplicate question IDs
    const questionIds = questions.map(q => q.id);
    const duplicateIds = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate question IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Validate categories
    const invalidCategories = questions.filter(q => !this.isValidCategory(q.category));
    if (invalidCategories.length > 0) {
      errors.push(`Invalid categories found: ${invalidCategories.map(q => q.category).join(', ')}`);
    }
    
    // Validate response options if present
    if (responseOptions.length > 0) {
      const optionIds = responseOptions.map(o => o.id);
      const duplicateOptionIds = optionIds.filter((id, index) => optionIds.indexOf(id) !== index);
      if (duplicateOptionIds.length > 0) {
        errors.push(`Duplicate response option IDs found: ${duplicateOptionIds.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ExcelProcessor;