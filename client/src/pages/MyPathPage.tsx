import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { categoryInfo, SinCategory } from '@/data/selfAssessmentData';

export function MyPathPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

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
      {/* Header matching ProfilePage styling */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className={`text-4xl font-bold text-black mb-2 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('myPath.title')}
        </h1>
        <p className={`text-2xl text-gray-600 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('myPath.subtitle')}
        </p>
      </div>

      {/* Focus Areas Section */}
      {focusAreas && (
        <div className="px-6 py-4" style={{ backgroundColor: '#BCCBCC' }}>
          <h2 className="text-lg font-bold text-black mb-0">{t('profile.focusAreasHeading')}</h2>
          <p className="text-lg font-bold" style={{ color: '#ed1c24' }}>
            {t(`goals.categories.${focusAreas.primary}`)} • {t(`goals.categories.${focusAreas.secondary}`)}
          </p>
        </div>
      )}

      {/* Path Options taking up remaining screen space */}
      <div className="px-6 py-4 space-y-[15px]">
        {/* Challenges Option */}
        <Link href="/challenges">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500 h-[calc((100vh-220px)/3)] rounded-none" style={{ backgroundColor: 'rgba(188, 204, 204, 0.3)' }}>
            <CardContent className="p-6 h-full flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-0">{t('myPath.challenges.title')}</h3>
                    <p className="text-base text-black leading-relaxed">
                      {t('myPath.challenges.description')}
                    </p>
                  </div>
                </div>
                <ArrowIcon className="h-8 w-8 text-white ml-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Goals Option */}
        <Link href="/goals">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 h-[calc((100vh-220px)/3)] rounded-none" style={{ backgroundColor: 'rgba(188, 204, 204, 0.3)' }}>
            <CardContent className="p-6 h-full flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Target className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-0">{t('myPath.goals.title')}</h3>
                    <p className="text-base text-black leading-relaxed">
                      {t('myPath.goals.description')}
                    </p>
                  </div>
                </div>
                <ArrowIcon className="h-8 w-8 text-white ml-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Journal Entries Option */}
        <Link href="/journal">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500 h-[calc((100vh-220px)/6)] rounded-none" style={{ backgroundColor: 'rgba(188, 204, 204, 0.3)' }}>
            <CardContent className="p-6 h-full flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-0">{t('myPath.journal.title')}</h3>
                    <p className="text-base text-black leading-relaxed">
                      {t('myPath.journal.description')}
                    </p>
                  </div>
                </div>
                <ArrowIcon className="h-8 w-8 text-white ml-6" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
