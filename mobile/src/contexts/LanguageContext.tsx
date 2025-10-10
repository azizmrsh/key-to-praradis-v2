import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {I18nManager} from 'react-native';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (language: string) => Promise<void>;
  availableLanguages: Array<{code: string; name: string; nativeName: string}>;
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

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (storedLanguage) {
        await changeLanguage(storedLanguage);
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      const rtlLanguages = ['ar'];
      const isRightToLeft = rtlLanguages.includes(languageCode);
      setIsRTL(isRightToLeft);
      
      // Set RTL for React Native
      I18nManager.forceRTL(isRightToLeft);
      
      // Store language preference
      await AsyncStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    changeLanguage,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};