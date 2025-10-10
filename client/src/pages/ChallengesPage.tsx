import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChallengeSelector } from '@/components/goals/ChallengeSelector';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { categoryInfo, SinCategory } from '@/data/selfAssessmentData';

export function ChallengesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  // Get user focus areas from assessment results using primaryStruggle and secondaryStruggle
  const getUserFocusAreas = () => {
    const results = localStorage.getItem('assessment_results');
    if (results) {
      try {
        const parsedResults = JSON.parse(results);
        if (parsedResults && parsedResults.primaryStruggle && parsedResults.secondaryStruggle) {
          return {
            primary: parsedResults.primaryStruggle,
            secondary: parsedResults.secondaryStruggle
          };
        }
      } catch (error) {
        console.error('Error parsing assessment results:', error);
      }
    }
    return { primary: 'heart', secondary: 'tongue' };
  };

  const userFocusAreas = getUserFocusAreas();

  // Get focus areas from assessment results
  const getFocusAreas = () => {
    try {
      const results = localStorage.getItem('assessment_results');
      if (results) {
        const parsed = JSON.parse(results);
        return {
          primary: parsed.primaryStruggle as SinCategory,
          secondary: parsed.secondaryStruggle as SinCategory
        };
      }
    } catch (error) {
      console.error('Error loading assessment results:', error);
    }
    return null;
  };

  const focusAreas = getFocusAreas();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching MyPathPage styling */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className={`text-4xl font-bold text-black mb-2 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('challenges.title')}
        </h1>
        <p className={`text-2xl text-gray-600 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('myPath.challenges.description')}
        </p>
      </div>

      {/* Focus Areas Section with red background - Always visible */}
      <div className="px-6 py-4 bg-red-500">
        <h2 className="text-lg font-bold text-white mb-0">{t('profile.focusAreasHeading')}</h2>
        {focusAreas ? (
          <p className="text-lg font-bold text-white">
            {t(`goals.categories.${focusAreas.primary}`)} • {t(`goals.categories.${focusAreas.secondary}`)}
          </p>
        ) : (
          <p className="text-base text-white mt-1">
            {t('profile.focusAreasNotSelected')}
          </p>
        )}
      </div>

      {/* Explanatory Paragraph */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-sm text-black leading-relaxed">
          {t('challenges.explanation', {
            focusAreas: focusAreas ? `${t(`goals.categories.${focusAreas.primary}`)} ${t('common.and')} ${t(`goals.categories.${focusAreas.secondary}`)}` : t('challenges.yourSelectedAreas')
          })}
        </p>
      </div>

      {/* Challenge Content */}
      <div className="p-6 pt-2">
        <ChallengeSelector userFocusAreas={userFocusAreas} />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}