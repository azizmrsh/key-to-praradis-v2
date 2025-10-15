import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const {isLanguageSelected, loadSavedLanguage, hasCompletedOnboarding} = useLanguage();

  // Debug function to clear all data
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared - restarting app flow');
      navigation.replace('LanguageSelection');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  useEffect(() => {
    const checkAppState = async () => {
      try {
        // قم أولاً بتخزين معرّف فريد في التخزين المحلي (AsyncStorage) للتحقق من كونها أول مرة
        const isFirstLaunch = await AsyncStorage.getItem('appLaunched');
        const hasLanguage = await isLanguageSelected();
        const hasOnboarding = await hasCompletedOnboarding();
        
        // Debug logging
        console.log('SplashScreen - isFirstLaunch:', isFirstLaunch);
        console.log('SplashScreen - hasLanguage:', hasLanguage);
        console.log('SplashScreen - hasOnboarding:', hasOnboarding);
        
        setTimeout(() => {
          // إذا كانت أول مرة أو لا توجد لغة، توجه إلى صفحة اختيار اللغة
          if (isFirstLaunch === null || !hasLanguage) {
            // First launch - user needs to select language
            console.log('SplashScreen - Going to LanguageSelection - First Launch');
            // تعيين علامة الإطلاق بحيث لا تعتبر أول مرة في المرات القادمة
            AsyncStorage.setItem('appLaunched', 'true');
            navigation.replace('LanguageSelection');
          } else if (hasLanguage && !hasOnboarding) {
            // User has language but not onboarding, go to onboarding
            console.log('SplashScreen - Going to Onboarding');
            loadSavedLanguage();
            navigation.replace('Onboarding');
          } else if (hasLanguage && hasOnboarding) {
            // User has completed everything, go to home
            console.log('SplashScreen - Going to Home');
            loadSavedLanguage();
            navigation.replace('Home');
          } else {
            // Fallback to language selection
            console.log('SplashScreen - Fallback to LanguageSelection');
            navigation.replace('LanguageSelection');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking app state:', error);
        // Default to language selection on error
        setTimeout(() => {
          navigation.replace('LanguageSelection');
        }, 2000);
      }
    };

    checkAppState();
  }, [navigation, isLanguageSelected, loadSavedLanguage, hasCompletedOnboarding]);

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
            {t('languageSelection.instruction', 'Loading your spiritual journey...')}
          </Text>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
            
            {/* Debug: Clear data button */}
            <TouchableOpacity 
              onPress={clearAllData}
              style={styles.debugButton}
            >
              <Text style={styles.debugButtonText}>Clear Data (Debug)</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#DC2626',
    marginTop: 16,
    fontFamily: 'Lato-Bold',
    textAlign: 'center',
  },
  debugButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SplashScreen;