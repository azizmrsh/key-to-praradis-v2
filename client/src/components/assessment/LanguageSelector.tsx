import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  selectedLanguage: 'en' | 'ar' | 'fr';
  onLanguageChange: (language: 'en' | 'ar' | 'fr') => void;
  availableLanguages?: string[];
  className?: string;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  availableLanguages = ['en', 'ar', 'fr'],
  className = ''
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' }
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Language:</span>
      </div>
      
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              disabled={!availableLanguages.includes(lang.code)}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                {availableLanguages.includes(lang.code) && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Badge variant="secondary" className="text-xs">
        {languages.find(l => l.code === selectedLanguage)?.nativeName}
      </Badge>
    </div>
  );
}

export default LanguageSelector;