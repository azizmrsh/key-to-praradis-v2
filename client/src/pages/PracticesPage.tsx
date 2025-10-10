import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { PracticesChecklist } from '@/components/practices/PracticesChecklist';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { getTodayFormatted } from '@/lib/utils';

export default function PracticesPage() {
  const { userProgress, updateUserProgress } = useUser();
  
  const handleCompletePractice = (practiceId: number) => {
    // Update user activity when a practice is completed
    updateUserProgress({
      lastActivity: new Date()
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AppHeader title="Prophetic Practices" backPath="/" />
      
      <main className="flex-1 overflow-y-auto p-4">
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h2 className="text-lg font-medium mb-1">Today's Practices</h2>
            <p className="text-sm text-muted-foreground">{getTodayFormatted()}</p>
            <p className="text-sm mt-2">
              Track your adherence to prophetic practices and build consistency in your spiritual routine.
            </p>
          </CardContent>
        </Card>
        
        <PracticesChecklist onComplete={handleCompletePractice} />
      </main>
      
      <BottomNavigation />
    </div>
  );
}