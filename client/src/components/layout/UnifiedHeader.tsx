import React from 'react';
import { useTranslation } from 'react-i18next';

interface UnifiedHeaderProps {
  title: string;
  subtitle?: string;
}

export function UnifiedHeader({ title, subtitle }: UnifiedHeaderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className={`text-4xl font-bold text-black mb-2 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>{title}</h1>
      {subtitle && (
        <p className={`text-2xl text-gray-600 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>{subtitle}</p>
      )}
    </div>
  );
}