import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DailyCheckInCard } from '@/components/check-in/DailyCheckInCard';
import { StreakCalendar } from '@/components/check-in/StreakCalendar';
import { CheckInStats } from '@/components/check-in/CheckInStats';
import { 
  getCheckInStatus, 
  submitDailyCheckIn, 
  getReminderTime, 
  checkIfStreakBroken,
  DailyCheckIn 
} from '@/lib/dailyCheckInService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notificationService';
import { journalManager } from '@/services/journalManager';
import { AddJournalModal } from '@/components/journal/AddJournalModal';
import { BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function DailyCheckInPage() {
  const { userProgress, updateUserProgress } = useUser();
  const [loading, setLoading] = useState(false);
  const [showStreakBrokenAlert, setShowStreakBrokenAlert] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Journal modal state
  const [addJournalModalOpen, setAddJournalModalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState(journalManager.getEntriesByOrigin('daily-checkin', 'CheckIn'));
  
  // Get the current focus sin from user progress
  const focusSin = userProgress?.selfAssessment?.areas?.[0] || 'heart';
  
  // Get check-in status
  const [checkInStatus, setCheckInStatus] = useState(() => getCheckInStatus());
  
  // Get reminder time
  const [reminderTime, setReminderTime] = useState<string | null>(getReminderTime(focusSin));
  
  useEffect(() => {
    // Check if streak was broken
    const { broken, previousStreak } = checkIfStreakBroken();
    if (broken && previousStreak > 2) {
      setPreviousStreak(previousStreak);
      setShowStreakBrokenAlert(true);
    }
  }, []);
  
  const handleSubmitCheckIn = async (success: boolean, note: string, newReminderTime?: string) => {
    setLoading(true);
    try {
      const result = await submitDailyCheckIn(
        focusSin,
        success,
        note,
        newReminderTime
      );
      
      setCheckInStatus(result);
      
      if (newReminderTime) {
        setReminderTime(newReminderTime);
        // Schedule a notification
        notificationService.scheduleReminder(
          'Daily Check-in Reminder',
          `Time to check in on your progress for ${focusSin}!`,
          newReminderTime
        );
      }
      
      // Update user progress
      updateUserProgress({
        streak: result.streakDays,
        lastActivity: new Date()
      });
      
      toast({
        title: 'Check-in recorded',
        description: success ? 'Great job staying mindful today!' : 'Keep trying, tomorrow is a new day.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your check-in. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function is now imported from dailyCheckInService
  
  // Journal handlers
  const handleOpenJournalModal = () => {
    setAddJournalModalOpen(true);
  };

  const handleJournalSuccess = () => {
    setJournalEntries(journalManager.getEntriesByOrigin('daily-checkin', 'CheckIn'));
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Daily Accountability</h1>
      
      {!checkInStatus.hasCheckedInToday ? (
        <DailyCheckInCard
          focusSin={focusSin}
          streakDays={checkInStatus.streakDays}
          onSubmit={handleSubmitCheckIn}
          loading={loading}
          reminderTime={reminderTime}
        />
      ) : (
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="mb-6">
              <CheckInStats
                dailyLogs={checkInStatus.dailyLog}
                streakDays={checkInStatus.streakDays}
                failureCount={checkInStatus.failureCount}
              />
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h3 className="text-lg font-medium mb-2">Today's Check-in</h3>
              
              {checkInStatus.dailyLog.filter(log => {
                const today = new Date();
                const logDate = new Date(log.date);
                return (
                  logDate.getDate() === today.getDate() &&
                  logDate.getMonth() === today.getMonth() &&
                  logDate.getFullYear() === today.getFullYear()
                );
              }).map((log, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        log.success ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <span>{log.success ? 'Success' : 'Challenge'}</span>
                  </div>
                  {log.note && (
                    <div className="text-sm bg-background border rounded p-3 mt-2">
                      {log.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <BookHeart className="h-5 w-5 text-purple-600" />
                {t('journal.journalYourExperience')}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('journal.checkInReflection')}
              </p>
              <Button 
                onClick={handleOpenJournalModal}
                className="w-full"
                variant="outline"
                data-testid="button-add-journal-checkin"
              >
                <BookHeart className="h-4 w-4 mr-2" />
                {t('journal.addEntry')}
              </Button>

              {journalEntries.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">{t('journal.recentReflections')} ({journalEntries.length})</h4>
                  {journalEntries.slice(-3).map((entry) => (
                    <div key={entry.id} className="bg-white/80 p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-purple-600">{entry.emotion}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <StreakCalendar dailyLogs={checkInStatus.dailyLog} />
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <AlertDialog open={showStreakBrokenAlert} onOpenChange={setShowStreakBrokenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Streak Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Your streak of {previousStreak} days has been reset because you missed yesterday's check-in.
              Remember, consistency is key to personal growth. Start a new streak today!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Let's start again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Journal Entry Modal */}
      <AddJournalModal
        open={addJournalModalOpen}
        onOpenChange={setAddJournalModalOpen}
        defaultOrigin="CheckIn"
        defaultOriginId="daily-checkin"
        defaultArea="Misc"
        onSuccess={handleJournalSuccess}
        title="Journal Your Daily Check-in Experience"
      />
    </div>
  );
}