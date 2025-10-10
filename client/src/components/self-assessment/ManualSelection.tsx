import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ManualSelectionProps {
  onSelectionComplete: (primary: SinCategory, secondary?: SinCategory) => void;
  onBack: () => void;
}

export function ManualSelection({ onSelectionComplete, onBack }: ManualSelectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [primaryStruggle, setPrimaryStruggle] = useState<SinCategory | undefined>();
  const [secondaryStruggle, setSecondaryStruggle] = useState<SinCategory | undefined>();
  
  // Handle completion
  const handleComplete = () => {
    if (!primaryStruggle) {
      toast({
        title: t('assessment.manualSelection.selectionRequired'),
        description: t('assessment.manualSelection.selectionRequiredMessage'),
        variant: "destructive"
      });
      return;
    }
    onSelectionComplete(primaryStruggle, secondaryStruggle);
  };
  
  // Ensure primary and secondary selections are different
  const handleSecondaryChange = (value: SinCategory) => {
    if (value !== primaryStruggle) {
      setSecondaryStruggle(value);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* White Header Section - Top 1/3 */}
      <div className="bg-white h-[33vh] flex flex-col justify-center px-8">
        <div className="text-left">
          <h1 className="text-5xl font-bold text-black leading-tight mb-4">
            {t('assessment.manualSelection.title')}
          </h1>
          <p className="text-lg text-gray-700">
            {t('assessment.manualSelection.subtitle')}
          </p>
        </div>
      </div>

      {/* Gray Content Section - Bottom 2/3 */}
      <div className="flex-1 px-8 py-12" style={{ backgroundColor: '#B8C5C5' }}>
        <div className="max-w-lg mx-auto">
          {/* Main Card */}
          <div className="bg-gray-200 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-wide">
              {t('assessment.manualSelection.header')}
            </h2>
            <p className="text-black mb-8">
              {t('assessment.manualSelection.description')}
            </p>

            {/* Primary Focus Area */}
            <div className="mb-6">
              <label className="block text-red-600 font-bold text-sm mb-2 uppercase">
                {t('assessment.manualSelection.primaryLabel')}
              </label>
              <Select
                value={primaryStruggle}
                onValueChange={(value) => setPrimaryStruggle(value as SinCategory)}
              >
                <SelectTrigger className="w-full h-12 bg-gray-300 border-gray-400 text-gray-700 italic">
                  <SelectValue placeholder={t('assessment.manualSelection.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>{t('assessment.manualSelection.selectPlaceholder')}</SelectItem>
                  {Object.entries(categoryInfo).map(([key, { title, description }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Focus Area */}
            <div className="mb-8">
              <label className="block text-red-600 font-bold text-sm mb-2 uppercase">
                {t('assessment.manualSelection.secondaryLabel')}
              </label>
              <Select
                value={secondaryStruggle}
                onValueChange={(value) => handleSecondaryChange(value as SinCategory)}
                disabled={!primaryStruggle}
              >
                <SelectTrigger className="w-full h-12 bg-gray-300 border-gray-400 text-gray-700 italic">
                  <SelectValue placeholder={t('assessment.manualSelection.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>{t('assessment.manualSelection.selectPlaceholder')}</SelectItem>
                  {Object.entries(categoryInfo)
                    .filter(([key]) => key !== primaryStruggle)
                    .map(([key, { title, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Take Assessment Instead Link */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="text-black text-lg italic underline hover:text-red-600 transition-colors"
            >
              {t('assessment.manualSelection.takeAssessmentInstead')}
            </button>
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleComplete}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-bold"
            >
              {t('assessment.manualSelection.continueButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}