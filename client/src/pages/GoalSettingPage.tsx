import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { GoalSettingWizard } from '@/components/goals/GoalSettingWizard';
import { useLocation } from 'wouter';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { SelfAssessmentProvider } from '@/contexts/SelfAssessmentContext';

export function GoalSettingPageContent() {
  const { results } = useSelfAssessment();
  const [, setLocation] = useLocation();
  
  // Getting category from assessment results if available
  const preSelectedCategory = results?.primaryStruggle;
  
  // Handle completion of goal setting
  const handleComplete = () => {
    setLocation('/goals');
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AppHeader title="Set Spiritual Goal" backPath="/goals" />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center">
          <GoalSettingWizard 
            preSelectedCategory={preSelectedCategory} 
            onComplete={handleComplete}
          />
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

export function GoalSettingPage() {
  return (
    <SelfAssessmentProvider>
      <GoalSettingPageContent />
    </SelfAssessmentProvider>
  );
}