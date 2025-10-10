import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import logoPath from '@assets/QT_final_logo-02-01_1751283453807.png';

interface AssessmentHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  showProgress?: boolean;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  language?: 'en' | 'fr' | 'ar';
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showProgress = false,
  progress = 0,
  currentStep,
  totalSteps,
  language = 'en'
}) => {
  const { t } = useTranslation();
  const isRTL = language === 'ar';
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-6 shadow-sm">
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src={logoPath} 
            alt="Keys to Paradise Logo" 
            className="w-16 h-16 object-contain rounded-xl shadow-sm"
          />
        </div>
        
        {/* Title and Info */}
        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className={`text-2xl font-bold text-foreground mb-2 tracking-tight ${isRTL ? 'font-arabic' : ''}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm text-muted-foreground ${isRTL ? 'font-arabic' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-primary/10"
          onClick={onBack}
        >
          <ArrowIcon className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="mt-6">
          <div className={`flex justify-between text-sm text-muted-foreground mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {currentStep && totalSteps && (
              <span className={`font-medium ${isRTL ? 'font-arabic' : ''}`}>
                {t('assessment.questionCounter', { current: currentStep, total: totalSteps })}
              </span>
            )}
            <span className={`font-medium ${isRTL ? 'font-arabic' : ''}`}>
              {t('assessment.progressComplete', { percent: Math.round(progress) })}
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-secondary/50" />
        </div>
      )}
    </div>
  );
};