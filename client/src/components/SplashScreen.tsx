import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import manIllustration from '../assets/man-illustration.svg';

interface SplashScreenProps {
  duration?: number; // مدة عرض الشاشة التمهيدية بالمللي ثانية
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 3000 }) => {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // محاكاة تقدم التحميل
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, duration / 20);

    // التوجيه بعد انتهاء المدة المحددة
    const timer = setTimeout(() => {
      const selectedLanguage = localStorage.getItem('selectedLanguage');
      if (selectedLanguage) {
        navigate('/');
      } else {
        navigate('/language-selection');
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, duration]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary-100 to-primary-200 z-50">
      <div className="flex flex-col items-center justify-center space-y-8 p-6">
        {/* صورة الرجل */}
        <img 
          src={manIllustration} 
          alt={t('appName')} 
          className="w-48 h-48 object-contain animate-pulse"
        />
        
        <h1 className="text-3xl font-bold text-primary-900 text-center">
          {t('appName')}
        </h1>
        
        {/* مؤشر التحميل الأنيق */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-center text-primary-700">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>{t('loading')}...</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;