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

// Extract translations from Excel
const translations = {};
for (let i = 1; i < jsonData.length; i++) {
  if (jsonData[i] && jsonData[i][0]) {
    translations[jsonData[i][0]] = {
      id: jsonData[i][0],
      category: jsonData[i][1],
      section: jsonData[i][2],
      english: jsonData[i][3],
      arabic: jsonData[i][4],
      french: jsonData[i][5]
    };
  }
}

// Read existing system file
const systemFilePath = path.join(__dirname, 'client/src/data/selfAssessmentData.ts');
const systemContent = fs.readFileSync(systemFilePath, 'utf8');

// Create the updated interface with translations
const updatedInterface = `// Self-Assessment Data Structure

export type SinCategory = 
  | 'tongue'
  | 'eyes'
  | 'ears'
  | 'pride'
  | 'stomach'
  | 'zina'
  | 'heart';

export type IslamicReference = {
  type: 'quran' | 'hadith';
  text: string;
  source: string;
  translation?: string;
};

export type QuestionTranslations = {
  english: string;
  arabic?: string;
  french?: string;
};

export type QuestionType = {
  id: string;
  text: string;
  category: SinCategory;
  section: string;
  conditionalOn?: string; // If this is a conditional question, this refers to the parent question ID
  conditionalValue?: number; // The minimum score on the parent question to show this question
  islamicReferences?: IslamicReference[]; // Quran verses and Hadith related to this question
  translations?: QuestionTranslations; // Multi-language support
};

export type ScoreScale = 1 | 2 | 3 | 4 | 5;

export interface SelfAssessmentResponse {
  questionId: string;
  score: ScoreScale;
  timestamp: Date;
}

export interface SelfAssessmentResult {
  categoryScores: Record<SinCategory, number>;
  totalQuestions: Record<SinCategory, number>;
  answeredQuestions: Record<SinCategory, number>;
  primaryStruggle: SinCategory;
  secondaryStruggle: SinCategory;
  completedAt: Date;
}

export interface SelfAssessmentGoal {
  sinCategory: SinCategory;
  durationDays: number;
  startDate: Date;
  reminder: boolean;
  reminderTime?: string;
}

// Sample category titles and descriptions
export const categoryInfo: Record<SinCategory, { title: string, description: string }> = {
  tongue: {
    title: "Sins of the Tongue",
    description: "Words that harm others through lying, backbiting, slander, mockery, or inappropriate speech."
  },
  eyes: {
    title: "Sins of the Eyes",
    description: "Looking at what is forbidden, inappropriate visual content, and the envy that can develop through sight."
  },
  ears: {
    title: "Sins of the Ears",
    description: "Listening to backbiting, slander, inappropriate content, and other harmful speech."
  },
  pride: {
    title: "Pride",
    description: "Feelings of superiority, arrogance, vanity, and difficulty with humility."
  },
  stomach: {
    title: "Sins of the Stomach",
    description: "Overeating, consuming what is unlawful, and excessive material appetite."
  },
  zina: {
    title: "Zina",
    description: "Unlawful physical relations and actions that may lead to them."
  },
  heart: {
    title: "Sins of the Heart",
    description: "Internal spiritual diseases such as envy, malice, hypocrisy, and attachments to the worldly life."
  },
};`;

// Extract existing questions and their structure
const questionMatches = systemContent.match(/{\s*id:\s*'([^']+)'[\s\S]*?}/g);
const existingQuestions = [];

if (questionMatches) {
  questionMatches.forEach(match => {
    const idMatch = match.match(/id:\s*'([^']+)'/);
    const textMatch = match.match(/text:\s*'([^']+)'/);
    const categoryMatch = match.match(/category:\s*'([^']+)'/);
    const sectionMatch = match.match(/section:\s*'([^']+)'/);
    const islamicRefsMatch = match.match(/islamicReferences:\s*\[([\s\S]*?)\]/);
    
    if (idMatch && textMatch && categoryMatch && sectionMatch) {
      existingQuestions.push({
        id: idMatch[1],
        text: textMatch[1],
        category: categoryMatch[1],
        section: sectionMatch[1],
        islamicReferences: islamicRefsMatch ? islamicRefsMatch[0] : null,
        fullMatch: match
      });
    }
  });
}

console.log('Found', existingQuestions.length, 'existing questions');
console.log('Have translations for', Object.keys(translations).length, 'questions');

// Generate updated questions with translations
const updatedQuestions = existingQuestions.map(q => {
  const translation = translations[q.id];
  let questionObj = `  {
    id: '${q.id}',
    text: '${q.text}',
    category: '${q.category}',
    section: '${q.section}'`;

  // Add translations if available
  if (translation) {
    questionObj += `,
    translations: {
      english: '${translation.english.replace(/'/g, "\\'")}',
      arabic: '${translation.arabic.replace(/'/g, "\\'")}',
      french: '${translation.french.replace(/'/g, "\\'")}'
    }`;
  }

  // Add Islamic references if they exist
  if (q.islamicReferences) {
    questionObj += `,
    ${q.islamicReferences}`;
  }

  questionObj += `
  }`;

  return questionObj;
});

const updatedFile = `${updatedInterface}

// Questions for self-assessment, organized by category with multilingual support
export const selfAssessmentQuestions: QuestionType[] = [
${updatedQuestions.join(',\n')}
];

// Response options for self-assessment
export const selfAssessmentResponseOptions = [
  { id: 'never', text: 'Never', value: 1 },
  { id: 'rarely', text: 'Rarely', value: 2 },
  { id: 'sometimes', text: 'Sometimes', value: 3 },
  { id: 'often', text: 'Often', value: 4 },
  { id: 'always', text: 'Always', value: 5 }
];

// Helper function to get question text by language
export function getQuestionText(question: QuestionType, language: 'en' | 'ar' | 'fr' = 'en'): string {
  if (!question.translations) return question.text;
  
  switch (language) {
    case 'ar':
      return question.translations.arabic || question.text;
    case 'fr':
      return question.translations.french || question.text;
    default:
      return question.translations.english || question.text;
  }
}

// Helper function to get all available languages for a question
export function getAvailableLanguages(question: QuestionType): string[] {
  const languages = ['en'];
  if (question.translations?.arabic) languages.push('ar');
  if (question.translations?.french) languages.push('fr');
  return languages;
}

// Statistics about translation coverage
export const translationStats = {
  totalQuestions: ${existingQuestions.length},
  questionsWithArabic: ${Object.values(translations).filter(t => t.arabic).length},
  questionsWithFrench: ${Object.values(translations).filter(t => t.french).length},
  fullyTranslated: ${Object.values(translations).filter(t => t.arabic && t.french).length}
};
`;

// Write the updated file
fs.writeFileSync(systemFilePath, updatedFile);

console.log('Successfully updated selfAssessmentData.ts with multilingual support!');
console.log('Translation coverage:');
console.log('- Total questions:', existingQuestions.length);
console.log('- Questions with Arabic:', Object.values(translations).filter(t => t.arabic).length);
console.log('- Questions with French:', Object.values(translations).filter(t => t.french).length);
console.log('- Fully translated:', Object.values(translations).filter(t => t.arabic && t.french).length);