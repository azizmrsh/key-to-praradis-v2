import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import backgroundImage from '@assets/shutterstock_2521067645-Cropped_1752654314243.jpg';
import logoPath from '@assets/QT_final_logo-02-01_1751283453807.png';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Flag SVG components for better quality
const FlagIcons = {
  GB: () => (
    <svg viewBox="0 0 60 30" className="w-8 h-6">
      <defs>
        <clipPath id="t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
        </clipPath>
      </defs>
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  ),
  
  JO: () => (
    <svg viewBox="0 0 60 30" className="w-8 h-6">
      <rect width="60" height="30" fill="#CE1126"/>
      <rect width="60" height="20" fill="#000"/>
      <rect width="60" height="10" fill="#FFF"/>
      <polygon points="0,0 0,30 25,15" fill="#007A3D"/>
      <polygon points="15,15 18,12 21,15 18,18" fill="#FFF"/>
    </svg>
  ),
  
  FR: () => (
    <svg viewBox="0 0 60 30" className="w-8 h-6">
      <rect width="20" height="30" fill="#002395"/>
      <rect x="20" width="20" height="30" fill="#FFFFFF"/>
      <rect x="40" width="20" height="30" fill="#ED2939"/>
    </svg>
  )
};

export function LanguageSelectionPage() {
  const { i18n } = useTranslation();
  const [, navigate] = useLocation();

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'ENGLISH', flag: 'GB' },
    { code: 'ar', name: 'Arabic', nativeName: 'عربي', flag: 'JO' },
    { code: 'fr', name: 'French', nativeName: 'FRANÇAIS', flag: 'FR' }
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    // Change language
    await i18n.changeLanguage(languageCode);
    
    // Save language preference
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with vertical split design */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top white section - 30% of screen */}
        <div className="bg-white h-[30vh] relative">
          {/* Logo and Title - RTL aware positioning */}
          <div className="absolute top-8 left-8 flex items-start gap-6">
            {/* Title */}
            <div className="pt-2">
              <h1 className="text-7xl font-bold text-black leading-none mb-3 font-serif">
                Keys to<br />
                Paradise
              </h1>
              <p className="text-3xl font-serif" style={{ color: '#c49a6c' }}>
                Breaking Bad Habits
              </p>
            </div>
          </div>
          

        </div>
        
        {/* Bottom image section - 70% of screen */}
        <div className="relative h-[70vh]">
          <img 
            src={backgroundImage}
            alt="Man in contemplation"
            className="w-full h-full object-cover object-left"
          />
          
          {/* Content overlay on the right side */}
          <div className="absolute inset-0 flex items-end justify-end pr-2 pb-40">
            <div className="text-center max-w-[180px] mr-0">
              <p className="text-black font-medium text-base leading-tight mb-3">
                Please select your preferred language to begin your spiritual journey
              </p>

              {/* Language Buttons - transparent, no spacing */}
              <div className="-space-y-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`w-full py-2 px-4 rounded-none font-bold text-lg tracking-wide transition-all duration-200 hover:shadow-md bg-transparent hover:bg-white/20 ${
                      language.code === 'ar' ? 'font-arabic' : ''
                    }`}
                    style={{ color: '#be1e2d' }}
                  >
                    {language.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}