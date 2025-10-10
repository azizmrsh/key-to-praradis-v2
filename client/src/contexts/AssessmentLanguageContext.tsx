import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface AssessmentLanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
}

const AssessmentLanguageContext = createContext<AssessmentLanguageContextType | undefined>(undefined);

export function AssessmentLanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    // Initialize with saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    return savedLanguage || 'en';
  });

  // Update language when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
      if (savedLanguage && savedLanguage !== selectedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedLanguage]);

  return (
    <AssessmentLanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
      {children}
    </AssessmentLanguageContext.Provider>
  );
}

export function useAssessmentLanguage() {
  const context = useContext(AssessmentLanguageContext);
  if (context === undefined) {
    throw new Error('useAssessmentLanguage must be used within an AssessmentLanguageProvider');
  }
  return context;
}