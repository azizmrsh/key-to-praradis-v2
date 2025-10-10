import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useLanguage} from '../contexts/LanguageContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

const {width, height} = Dimensions.get('window');

type LanguageSelectionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'LanguageSelection'>;
};

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {changeLanguage, availableLanguages} = useLanguage();

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode);
    navigation.navigate('Assessment');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('languageSelection.title')}</Text>
          <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>
        </View>
        
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section with Language Selection */}
      <View style={styles.bottomSection}>
        {/* Background Image */}
        <Image
          source={require('../assets/images/background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.instruction}>
            {t('languageSelection.instruction')}
          </Text>

          <View style={styles.languageContainer}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={styles.languageButton}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text
                  style={[
                    styles.languageText,
                    language.code === 'ar' && styles.arabicText,
                  ]}
                >
                  {language.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: width * 0.1,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: width * 0.12,
    marginBottom: 16,
    fontFamily: 'PTSerif-Bold',
  },
  subtitle: {
    fontSize: width * 0.06,
    color: '#D97706',
    fontStyle: 'italic',
    fontFamily: 'PTSerif-Regular',
  },
  logo: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 112,
    height: 112,
  },
  bottomSection: {
    flex: 2,
    backgroundColor: '#B8C5C5',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.6,
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    width: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: 'Lato-Regular',
  },
  languageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    fontFamily: 'Lato-Bold',
  },
  arabicText: {
    fontFamily: 'SakkalKitab-Regular',
    fontSize: 24,
  },
});

export default LanguageSelectionScreen;