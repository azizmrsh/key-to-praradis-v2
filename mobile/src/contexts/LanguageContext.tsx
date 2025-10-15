import React, {createContext, useContext, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (language: string) => Promise<void>;
  availableLanguages: Array<{code: string; name: string; nativeName: string}>;
  isLanguageSelected: () => Promise<boolean>;
  loadSavedLanguage: () => Promise<void>;
  hasCompletedOnboarding: () => Promise<boolean>;
  setOnboardingCompleted: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {i18n} = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const availableLanguages = [
    {code: 'en', name: 'English', nativeName: 'ENGLISH'},
    {code: 'ar', name: 'Arabic', nativeName: 'عربي'},
    {code: 'fr', name: 'French', nativeName: 'FRANÇAIS'},
  ];

  // Check if language has been selected before
  const isLanguageSelected = async (): Promise<boolean> => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      return savedLanguage !== null;
    } catch (error) {
      console.error('Error checking saved language:', error);
      return false;
    }
  };

  // Load saved language
  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        await changeLanguageInternal(savedLanguage, false);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  // Internal function to change language
  const changeLanguageInternal = async (languageCode: string, saveToStorage: boolean = true) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      const rtlLanguages = ['ar'];
      const isRightToLeft = rtlLanguages.includes(languageCode);
      setIsRTL(isRightToLeft);
      
      // Set RTL for React Native
      I18nManager.forceRTL(isRightToLeft);
      
      // Save language to storage if requested
      if (saveToStorage) {
        await AsyncStorage.setItem('selectedLanguage', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const changeLanguage = async (languageCode: string) => {
    await changeLanguageInternal(languageCode, true);
  };

  // Check if onboarding has been completed
  const hasCompletedOnboarding = async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  // Mark onboarding as completed
  const setOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.error('Error setting onboarding completed:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    changeLanguage,
    availableLanguages,
    isLanguageSelected,
    loadSavedLanguage,
    hasCompletedOnboarding,
    setOnboardingCompleted,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};