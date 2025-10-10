import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { TriggerTracker } from '@/components/triggers/TriggerTracker';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';

export default function TriggersPage() {
  const { userProgress, updateUserProgress } = useUser();
  
  const handleTriggerAdded = () => {
    // Update user activity when a trigger is added
    updateUserProgress({
      lastActivity: new Date()
    });
  };

  const handleTriggerEncountered = () => {
    // Update user activity when a trigger is encountered
    updateUserProgress({
      lastActivity: new Date()
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AppHeader title="Trigger Tracker" backPath="/" />
      
      <main className="flex-1 overflow-y-auto p-4">
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h2 className="text-lg font-medium mb-1">Identify Your Triggers</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Understanding your personal triggers is a key step in avoiding sin. Track patterns, situations, and circumstances that lead to spiritually harmful behaviors.
            </p>
          </CardContent>
        </Card>
        
        <TriggerTracker 
          onTriggerAdded={handleTriggerAdded}
          onTriggerEncountered={handleTriggerEncountered}
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
}