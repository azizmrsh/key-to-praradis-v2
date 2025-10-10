import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { SOSButton } from '@/components/layout/SOSButton';
import { DailyProgress } from '@/components/dashboard/DailyProgress';
import { SectionCards } from '@/components/dashboard/SectionCards';
import { DailyChallenge } from '@/components/dashboard/DailyChallenge';
import { PrayerTimeWidget } from '@/components/dashboard/PrayerTimeWidget';
import { DailyCheckInWidget } from '@/components/dashboard/DailyCheckInWidget';
import { RecommendedContentWidget } from '@/components/dashboard/RecommendedContentWidget';
import { useUser } from '@/contexts/UserContext';
import { useContentStore } from '@/store/contentStore';

export default function Dashboard() {
  const { t } = useTranslation();
  const { userProgress, updateUserProgress } = useUser();
  const { 
    sections, 
    getSectionProgress, 
    getDailyChallenge,
    acceptChallenge
  } = useContentStore();

  useEffect(() => {
    // Update last activity date
    if (userProgress) {
      updateUserProgress({
        lastActivity: new Date()
      });
    }
  }, []);

  const handleAcceptChallenge = (challengeId: number) => {
    acceptChallenge(challengeId);
  };

  // Calculate dashboard metrics
  const dailyStats = {
    completed: userProgress?.todayCompletedLessons?.length || 0,
    total: 5, // Fixed number for simplicity
    streak: userProgress?.streak || 0
  };

  // Generate section progress data
  const sectionProgressData = sections.reduce((acc, section) => {
    acc[section.id] = getSectionProgress(section.id);
    return acc;
  }, {} as Record<number, { completed: number; total: number }>);

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader title={t('dashboard.title')} />
      
      <main className="flex-1 overflow-y-auto">
        <section className="p-4">
          <DailyProgress 
            completed={dailyStats.completed} 
            total={dailyStats.total} 
            streak={dailyStats.streak} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Prayer Time Widget */}
            <PrayerTimeWidget />
            
            {/* Daily Check-in Widget */}
            <DailyCheckInWidget />
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Link href="/goals" className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md bg-primary/10 hover:bg-primary/20 transition-colors">
              <span className="material-icons">track_changes</span>
              <span>{t('dashboard.setGoals')}</span>
            </Link>
            
            <Link href="/content" className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md bg-primary/10 hover:bg-primary/20 transition-colors">
              <span className="material-icons">menu_book</span>
              <span>{t('dashboard.browseContent')}</span>
            </Link>
          </div>
          
          {/* Recommended Content */}
          <RecommendedContentWidget />
          
          <SectionCards 
            sections={sections} 
            sectionProgress={sectionProgressData} 
          />
          
          {/* Only render DailyChallenge when a challenge is available */}
          {(() => {
            const dailyChallenge = getDailyChallenge();
            return dailyChallenge ? (
              <DailyChallenge
                challenge={dailyChallenge}
                onAccept={handleAcceptChallenge}
              />
            ) : null;
          })()}
        </section>
      </main>
      
      <SOSButton />
      <BottomNavigation />
    </div>
  );
}
