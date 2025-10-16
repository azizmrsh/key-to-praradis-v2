import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import backgroundImage from '@assets/shutterstock_2521067645-Cropped_1752654314243.jpg';
import logoPath from '@assets/QT_final_logo-02-01_1751283453807.png';

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
          
          {/* Logo positioned at top right */}
          <div className="absolute top-8 right-8">
            <img 
              src={logoPath}
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>
        
        {/* Bottom image section - 70% of screen */}
        <div className="relative h-[70vh]">
          <img 
            src={backgroundImage}
            alt="Man in contemplation"
            className="w-full h-full object-cover object-left"
          />
          
          {/* Loading content overlay on the right side */}
          <div className="absolute inset-0 flex items-end justify-end pr-2 pb-40">
            <div className="text-center max-w-[180px] mr-0">
              <p className="text-black font-medium text-base leading-tight mb-6">
                Preparing your spiritual journey...
              </p>

              {/* Loading indicator */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${loadingProgress}%`,
                      backgroundColor: '#be1e2d'
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" style={{ color: '#be1e2d' }} />
                  <span className="font-bold text-lg" style={{ color: '#be1e2d' }}>
                    Loading...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;