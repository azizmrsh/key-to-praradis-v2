import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';
import {Dimensions, PixelRatio} from 'react-native';
import {getArabicFontFamily} from '../assets/fonts/fonts';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10B981',
    primaryContainer: '#A7F3D0',
    secondary: '#059669',
    secondaryContainer: '#D1FAE5',
    tertiary: '#0891B2',
    tertiaryContainer: '#CFFAFE',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    background: '#FAFAFA',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
    onBackground: '#1F2937',
    outline: '#D1D5DB',
    outlineVariant: '#E5E7EB',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#34D399',
    primaryContainer: '#047857',
    secondary: '#6EE7B7',
    secondaryContainer: '#065F46',
    tertiary: '#67E8F9',
    tertiaryContainer: '#0E7490',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    background: '#111827',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: '#064E3B',
    onSecondary: '#064E3B',
    onTertiary: '#164E63',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#D1D5DB',
    onBackground: '#F9FAFB',
    outline: '#6B7280',
    outlineVariant: '#4B5563',
  },
};

// Screen dimensions and responsive utilities
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallPhone = screenWidth < 375;

export const responsive = {
  screenWidth,
  screenHeight,
  isTablet,
  isSmallPhone,
  
  // Responsive font sizes
  fontSize: {
    xs: isTablet ? 12 : 11,
    sm: isTablet ? 14 : 12,
    base: isTablet ? 16 : 14,
    lg: isTablet ? 18 : 16,
    xl: isTablet ? 20 : 18,
    '2xl': isTablet ? 24 : 20,
    '3xl': isTablet ? 30 : 24,
  },
  
  // Responsive spacing
  spacing: {
    xs: isTablet ? 4 : 3,
    sm: isTablet ? 8 : 6,
    md: isTablet ? 16 : 12,
    lg: isTablet ? 24 : 18,
    xl: isTablet ? 32 : 24,
    '2xl': isTablet ? 48 : 32,
  },
  
  // Arabic font sizing for mobile
  arabicFontSize: {
    sm: isTablet ? 16 : 14,
    base: isTablet ? 18 : 16,
    lg: isTablet ? 22 : 18,
    xl: isTablet ? 26 : 22,
    '2xl': isTablet ? 32 : 26,
  },
};

// Enhanced theme with Arabic support
export const enhancedLightTheme = {
  ...lightTheme,
  fonts: {
    ...lightTheme.fonts,
    arabic: {
      light: getArabicFontFamily('light'),
      regular: getArabicFontFamily('regular'),
      medium: getArabicFontFamily('medium'),
      bold: getArabicFontFamily('bold'),
      heavy: getArabicFontFamily('heavy'),
    },
  },
  responsive,
};

export const enhancedDarkTheme = {
  ...darkTheme,
  fonts: {
    ...darkTheme.fonts,
    arabic: {
      light: getArabicFontFamily('light'),
      regular: getArabicFontFamily('regular'),
      medium: getArabicFontFamily('medium'),
      bold: getArabicFontFamily('bold'),
      heavy: getArabicFontFamily('heavy'),
    },
  },
  responsive,
};

export const theme = enhancedLightTheme;