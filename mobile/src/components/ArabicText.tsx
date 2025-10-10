import React from 'react';
import {Text, StyleSheet, TextStyle} from 'react-native';
import {useLanguage} from '../contexts/LanguageContext';

interface ArabicTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  weight?: 'regular' | 'medium' | 'bold';
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export const ArabicText: React.FC<ArabicTextProps> = ({
  children,
  style,
  weight = 'regular',
  size = 'medium',
}) => {
  const {currentLanguage, isRTL} = useLanguage();
  
  const getArabicFont = () => {
    switch (weight) {
      case 'medium':
        return 'SakkalKitab-Medium';
      case 'bold':
        return 'SakkalKitab-Bold';
      default:
        return 'SakkalKitab-Regular';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      case 'xl':
        return 24;
      default:
        return 16;
    }
  };

  const textStyle = [
    styles.baseText,
    {
      fontFamily: currentLanguage === 'ar' ? getArabicFont() : 'System',
      fontSize: getFontSize(),
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    style,
  ];

  return <Text style={textStyle}>{children}</Text>;
};

interface BilingualTextProps {
  english: string;
  arabic: string;
  french?: string;
  style?: TextStyle | TextStyle[];
  weight?: 'regular' | 'medium' | 'bold';
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  english,
  arabic,
  french,
  style,
  weight = 'regular',
  size = 'medium',
}) => {
  const {currentLanguage} = useLanguage();
  
  const getText = () => {
    switch (currentLanguage) {
      case 'ar':
        return arabic;
      case 'fr':
        return french || english;
      default:
        return english;
    }
  };

  return (
    <ArabicText style={style} weight={weight} size={size}>
      {getText()}
    </ArabicText>
  );
};

const styles = StyleSheet.create({
  baseText: {
    color: '#000000',
    lineHeight: 1.6,
  },
});