import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

export function AssessmentChoice() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  
  const isRTL = i18n.language === 'ar';

  const handleTakeAssessment = () => {
    setLocation('/enhanced-assessment');
  };

  const handleSkipToManualSelection = () => {
    setLocation('/enhanced-assessment?skip=true');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* White Header Section */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <h1 className={`text-4xl font-bold text-black font-serif leading-tight ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('onboarding.selfAssessmentTitle')}
        </h1>
      </div>

      {/* Gray Content Section */}
      <div className="flex-1 px-6 py-8" style={{ backgroundColor: '#B8C5C5' }}>
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* PURPOSE Section */}
          <div>
            <h2 className={`text-xl font-bold text-black uppercase ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.purpose')}
            </h2>
            <p className={`text-black text-lg leading-normal ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.purposeDescription')}
            </p>
          </div>

          {/* COMPLETE PRIVACY Section */}
          <div>
            <h2 className={`text-xl font-bold text-black uppercase ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.completePrivacy')}
            </h2>
            <p className={`text-black text-lg leading-normal ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.privacyDescription')}
            </p>
          </div>

          {/* CHOOSE YOUR PATH Section */}
          <div>
            <h2 className={`text-xl font-bold text-black uppercase ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.chooseYourPath')}
            </h2>
            <p className={`text-black text-lg leading-normal mb-6 ${isRTL ? 'font-arabic' : ''}`}>
              {t('onboarding.pathDescription')}
            </p>

            {/* Start Assessment Option */}
            <div className="mb-6">
              <button 
                onClick={handleTakeAssessment}
                className={`text-red-600 text-xl font-medium hover:text-red-700 transition-colors ${isRTL ? 'font-arabic' : ''}`}
              >
                {t('onboarding.startAssessmentButton')}
              </button>
              <p className={`text-black text-lg mt-2 leading-normal ${isRTL ? 'font-arabic' : ''}`}>
                {t('onboarding.assessmentDescription')}
              </p>
            </div>

            {/* Manual Selection Option */}
            <div>
              <button 
                onClick={handleSkipToManualSelection}
                className={`text-red-600 text-xl font-medium hover:text-red-700 transition-colors ${isRTL ? 'font-arabic' : ''}`}
              >
                {t('onboarding.skipToManualButton')}
              </button>
              <p className={`text-black text-lg mt-2 leading-normal ${isRTL ? 'font-arabic' : ''}`}>
                {t('onboarding.manualDescription')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}