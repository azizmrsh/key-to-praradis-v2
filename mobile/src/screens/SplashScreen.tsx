import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useLanguage } from '../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { isLanguageSelected, loadSavedLanguage } = useLanguage();

  useEffect(() => {
    const checkLanguageAndNavigate = async () => {
      try {
        const hasSelectedLanguage = await isLanguageSelected();
        
        if (hasSelectedLanguage) {
          // Load saved language and go to home
          await loadSavedLanguage();
          setTimeout(() => {
            navigation.replace('Home');
          }, 2000);
        } else {
          // Go to language selection
          setTimeout(() => {
            navigation.replace('LanguageSelection');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking language:', error);
        // Default to language selection on error
        setTimeout(() => {
          navigation.replace('LanguageSelection');
        }, 2000);
      }
    };

    checkLanguageAndNavigate();
  }, [navigation, isLanguageSelected, loadSavedLanguage]);

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

      {/* Bottom Section with Loading */}
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
            Welcome to your spiritual journey
          </Text>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
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
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    alignSelf: 'center',
  },
  bottomSection: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  instruction: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'System',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    fontFamily: 'System',
  },
});

export default SplashScreen;