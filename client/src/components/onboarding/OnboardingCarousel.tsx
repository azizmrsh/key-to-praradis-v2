import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, navigate] = useLocation();
  const { markUserAsReturning } = useUser();
  const { t, i18n } = useTranslation();
  
  const isRTL = i18n.language === 'ar';

  const slides = [
    {
      icon: 'home',
      title: t('onboarding.welcome'),
      description: t('onboarding.welcomeDescription'),
      isFullScreen: true
    },
    {
      icon: 'psychology',
      title: t('onboarding.personalGrowth'),
      description: t('onboarding.personalGrowthDescription'),
      isFullScreen: true
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark user as returning when they complete onboarding
      markUserAsReturning();
      navigate('/assessment-choice');
    }
  };

  const handleSkip = () => {
    // Mark user as returning when they skip onboarding
    markUserAsReturning();
    navigate('/assessment-choice');
  };

  // Special layout for full-screen slides
  if (slides[currentSlide].isFullScreen) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header section - white section */}
          <div className={cn(
            "h-[28vh] px-6 pt-8 pb-6 flex flex-col justify-start",
            isRTL ? "text-right" : "text-left"
          )}>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight font-serif" style={{ paddingTop: '30px' }}>
              {slides[currentSlide].title}
            </h1>
          </div>

          {/* Content section with background */}
          <div className={cn(
            "flex-1 px-6 py-8",
            isRTL ? "text-right" : "text-left"
          )} style={{ backgroundColor: '#BCCBCC' }}>
            <div>
              <p className="text-2xl text-gray-800 leading-snug mb-6 whitespace-pre-line">
                {slides[currentSlide].description}
              </p>
              
              {/* Button directly under text */}
              <Button
                onClick={handleNext}
                variant="link"
                className={cn(
                  "text-red-500 hover:text-red-600 text-2xl font-medium italic p-0 h-auto",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                {currentSlide < slides.length - 1 ? t('onboarding.continueButton') : t('onboarding.getStartedButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular layout for other slides
  return (
    <div className="h-screen flex flex-col">
      <div className="pattern-bg h-1/2 flex flex-col items-center justify-center text-white p-6">
        <span className="material-icons text-6xl mb-4">{slides[currentSlide].icon}</span>
        <h1 className="text-3xl font-bold mb-2 text-center">Keys to Paradise</h1>
        <p className="text-center opacity-90">Your personal guide to spiritual growth and self-improvement</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="flex mb-6">
          {slides.map((_, index) => (
            <span 
              key={index}
              className={cn(
                "h-2 rounded-full mx-1",
                index === currentSlide ? "w-10 bg-primary" : "w-2 bg-neutral-200"
              )}
            ></span>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">{slides[currentSlide].title}</h2>
        <p className="text-center text-neutral-700 mb-8">{slides[currentSlide].description}</p>

        <Button 
          className="bg-primary text-white rounded-full py-3 px-8"
          onClick={handleNext}
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>

        {currentSlide < slides.length - 1 && (
          <Button 
            variant="ghost" 
            className="mt-4 text-primary"
            onClick={handleSkip}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}