// React Native Font Configuration for Sakkal
// Fonts need to be registered in react-native.config.js for React Native

export const ArabicFonts = {
  // Font family names for React Native
  SAKKAL_LIGHT: 'SakkalKitabLt',
  SAKKAL_REGULAR: 'SakkalKitab-Regular', 
  SAKKAL_MEDIUM: 'SakkalKitabMd',
  SAKKAL_BOLD: 'SakkalKitab-Bold',
  SAKKAL_HEAVY: 'SakkalKitabHvy',
  
  // Font weights mapping
  WEIGHTS: {
    light: '300',
    regular: '400', 
    medium: '500',
    bold: '700',
    heavy: '900'
  }
};

export const getArabicFontFamily = (weight: 'light' | 'regular' | 'medium' | 'bold' | 'heavy' = 'regular') => {
  switch (weight) {
    case 'light':
      return ArabicFonts.SAKKAL_LIGHT;
    case 'regular':
      return ArabicFonts.SAKKAL_REGULAR;
    case 'medium':
      return ArabicFonts.SAKKAL_MEDIUM;
    case 'bold':
      return ArabicFonts.SAKKAL_BOLD;
    case 'heavy':
      return ArabicFonts.SAKKAL_HEAVY;
    default:
      return ArabicFonts.SAKKAL_REGULAR;
  }
};

export const arabicTextStyle = {
  fontFamily: ArabicFonts.SAKKAL_REGULAR,
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
  lineHeight: 28,
};

export const arabicHeadingStyle = {
  fontFamily: ArabicFonts.SAKKAL_BOLD,
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
  lineHeight: 32,
};

export const arabicVerseStyle = {
  fontFamily: ArabicFonts.SAKKAL_MEDIUM,
  textAlign: 'center' as const,
  writingDirection: 'rtl' as const,
  lineHeight: 36,
  fontSize: 18,
};

export const arabicDhikrStyle = {
  fontFamily: ArabicFonts.SAKKAL_MEDIUM,
  textAlign: 'center' as const,
  writingDirection: 'rtl' as const,
  lineHeight: 32,
  fontSize: 20,
};