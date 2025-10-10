// Response options for self-assessment with multilingual support

export interface ResponseOption {
  id: string;
  text: string;
  value: number;
  translations?: {
    english: string;
    arabic?: string;
    french?: string;
  };
}

export const selfAssessmentResponseOptions: ResponseOption[] = [
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

// Helper function to get response option text by language
export function getResponseOptionText(option: ResponseOption, language: 'en' | 'ar' | 'fr' = 'en'): string {
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

// Helper function to get all response options in a specific language
export function getResponseOptionsInLanguage(language: 'en' | 'ar' | 'fr' = 'en'): ResponseOption[] {
  return selfAssessmentResponseOptions.map(option => ({
    ...option,
    text: getResponseOptionText(option, language)
  }));
}