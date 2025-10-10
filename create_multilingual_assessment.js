import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Excel file
const filePath = path.join(__dirname, 'attached_assets/Assessment_questions_multilingual_1752561738884.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['assessment_questions_multilingu'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Create translations map
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

// Helper function to escape strings for TypeScript
function escapeString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

// Create the TypeScript file content
const fileContent = `// Self-Assessment Data Structure with Multilingual Support

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
  translations?: QuestionTranslations;
  conditionalOn?: string;
  conditionalValue?: number;
  islamicReferences?: IslamicReference[];
};

export type SelfAssessmentQuestion = QuestionType;

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

export interface SelfAssessmentResponseOption {
  id: string;
  text: string;
  value: number;
  translations?: {
    english: string;
    arabic?: string;
    french?: string;
  };
}

// Category information
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
};

// Assessment questions with multilingual support
export const selfAssessmentQuestions: SelfAssessmentQuestion[] = [
${Object.values(translations).map(q => `  {
    id: '${q.id}',
    text: '${escapeString(q.english)}',
    category: '${q.category}' as SinCategory,
    section: '${escapeString(q.section)}',
    translations: {
      english: '${escapeString(q.english)}',
      arabic: '${escapeString(q.arabic)}',
      french: '${escapeString(q.french)}'
    }
  }`).join(',\n')}
];

// Response options with multilingual support
export const selfAssessmentResponseOptions: SelfAssessmentResponseOption[] = [
  {
    id: 'never',
    text: 'Never',
    value: 1,
    translations: {
      english: 'Never',
      arabic: 'أبدا',
      french: 'Jamais'
    }
  },
  {
    id: 'rarely',
    text: 'Rarely',
    value: 2,
    translations: {
      english: 'Rarely',
      arabic: 'نادرا',
      french: 'Rarement'
    }
  },
  {
    id: 'sometimes',
    text: 'Sometimes',
    value: 3,
    translations: {
      english: 'Sometimes',
      arabic: 'أحيانا',
      french: 'Parfois'
    }
  },
  {
    id: 'often',
    text: 'Often',
    value: 4,
    translations: {
      english: 'Often',
      arabic: 'غالبا',
      french: 'Souvent'
    }
  },
  {
    id: 'always',
    text: 'Always',
    value: 5,
    translations: {
      english: 'Always',
      arabic: 'دائما',
      french: 'Toujours'
    }
  }
];

// Helper functions
export function getQuestionText(question: SelfAssessmentQuestion, language: 'en' | 'ar' | 'fr' = 'en'): string {
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

export function getResponseOptionText(option: SelfAssessmentResponseOption, language: 'en' | 'ar' | 'fr' = 'en'): string {
  if (!option.translations) return option.text;
  
  switch (language) {
    case 'ar':
      return option.translations.arabic || option.text;
    case 'fr':
      return option.translations.french || option.text;
    default:
      return option.translations.english || option.text;
  }
}

export function getAvailableLanguages(question: SelfAssessmentQuestion): string[] {
  const languages = ['en'];
  if (question.translations?.arabic) languages.push('ar');
  if (question.translations?.french) languages.push('fr');
  return languages;
}

// Translation statistics
export const translationStats = {
  totalQuestions: ${Object.keys(translations).length},
  questionsWithArabic: ${Object.values(translations).filter(t => t.arabic).length},
  questionsWithFrench: ${Object.values(translations).filter(t => t.french).length},
  fullyTranslated: ${Object.values(translations).filter(t => t.arabic && t.french).length},
  categories: {
    ${Object.keys(translations).reduce((acc, key) => {
      const category = translations[key].category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {})}
  }
};
`;

// Write the updated file
const outputPath = path.join(__dirname, 'client/src/data/selfAssessmentData.ts');
fs.writeFileSync(outputPath, fileContent);

console.log('✅ Successfully created multilingual assessment system!');
console.log('📊 Integration Summary:');
console.log('- Total questions:', Object.keys(translations).length);
console.log('- Questions with Arabic:', Object.values(translations).filter(t => t.arabic).length);
console.log('- Questions with French:', Object.values(translations).filter(t => t.french).length);
console.log('- Categories covered:', [...new Set(Object.values(translations).map(t => t.category))].length);

// Show sample questions
console.log('\n🎯 Sample Questions:');
Object.values(translations).slice(0, 3).forEach(q => {
  console.log(`${q.id} (${q.category}): ${q.english}`);
  console.log(`  Arabic: ${q.arabic}`);
  console.log(`  French: ${q.french}`);
});