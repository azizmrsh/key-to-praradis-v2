import React from 'react';
import { AchievementsDisplay } from '@/components/achievements/AchievementsDisplay';
import { useUser } from '@/contexts/UserContext';
import { useContentStore } from '@/store/contentStore';

export default function AchievementsPage() {
  const { userProgress } = useUser();
  const { getAchievements } = useContentStore();
  
  const achievements = getAchievements();
  
  // Sample activity data - would be calculated from actual user history
  const activityData = Array(30).fill(0).map(() => Math.floor(Math.random() * 100));
  
  const statistics = {
    daysActive: userProgress?.activityDates?.length || 0,
    lessonsCompleted: userProgress?.completedLessons?.length || 0,
    currentStreak: userProgress?.streak || 0
  };
  
  return (
    <AchievementsDisplay 
      statistics={statistics} 
      achievements={achievements} 
      activityData={activityData}
    />
  );
}
