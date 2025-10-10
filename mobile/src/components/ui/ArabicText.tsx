import React from 'react';
import {Text, View, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {getArabicFontFamily, arabicTextStyle, arabicHeadingStyle, arabicVerseStyle, arabicDhikrStyle} from '../../assets/fonts/fonts';

interface ArabicTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  variant?: 'body' | 'heading' | 'verse' | 'dhikr';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
  color?: string;
}

export const ArabicText: React.FC<ArabicTextProps> = ({
  children,
  style,
  containerStyle,
  variant = 'body',
  size = 'base',
  weight = 'regular',
  color = '#000000',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'heading':
        return arabicHeadingStyle;
      case 'verse':
        return arabicVerseStyle;
      case 'dhikr':
        return arabicDhikrStyle;
      default:
        return arabicTextStyle;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {fontSize: 14};
      case 'base':
        return {fontSize: 16};
      case 'lg':
        return {fontSize: 18};
      case 'xl':
        return {fontSize: 20};
      case '2xl':
        return {fontSize: 24};
      default:
        return {fontSize: 16};
    }
  };

  const textStyle: TextStyle = {
    ...getVariantStyle(),
    ...getSizeStyle(),
    fontFamily: getArabicFontFamily(weight),
    color,
    ...style,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

interface BilingualTextProps {
  arabic: string;
  translation: string;
  transliteration?: string;
  containerStyle?: ViewStyle;
  arabicSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  arabicWeight?: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
  arabicColor?: string;
  translationColor?: string;
  transliterationColor?: string;
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  arabic,
  translation,
  transliteration,
  containerStyle,
  arabicSize = 'lg',
  arabicWeight = 'regular',
  arabicColor = '#000000',
  translationColor = '#666666',
  transliterationColor = '#888888',
}) => {
  return (
    <View style={[styles.bilingualContainer, containerStyle]}>
      <ArabicText
        variant="dhikr"
        size={arabicSize}
        weight={arabicWeight}
        color={arabicColor}
        containerStyle={styles.arabicContainer}
      >
        {arabic}
      </ArabicText>
      
      {transliteration && (
        <Text style={[styles.transliteration, {color: transliterationColor}]}>
          {transliteration}
        </Text>
      )}
      
      <Text style={[styles.translation, {color: translationColor}]}>
        {translation}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  bilingualContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  arabicContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});