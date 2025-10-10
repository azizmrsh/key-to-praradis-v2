import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievement } from '@shared/schema';

interface AchievementsDisplayProps {
  statistics: {
    daysActive: number;
    lessonsCompleted: number;
    currentStreak: number;
  };
  achievements: Achievement[];
  activityData: number[]; // Array of values representing daily activity
}

export function AchievementsDisplay({ statistics, achievements, activityData }: AchievementsDisplayProps) {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="pattern-bg px-4 py-6 text-white">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 mr-2 p-0"
            onClick={() => navigate('/content-dashboard')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-semibold">{t('achievements.yourProgress')}</h2>
        </div>
        <p className="opacity-90">{t('achievements.trackJourney')}</p>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-medium mb-3">{t('achievements.activitySummary')}</h3>
          
          <div className="flex items-center justify-around mb-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{statistics.daysActive}</p>
              <p className="text-sm text-neutral-500">{t('achievements.daysActive')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{statistics.lessonsCompleted}</p>
              <p className="text-sm text-neutral-500">{t('achievements.lessonsCompleted')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{statistics.currentStreak}</p>
              <p className="text-sm text-neutral-500">{t('achievements.currentStreak')}</p>
            </div>
          </div>
          
          <h4 className="font-medium mb-2">{t('achievements.monthlyActivity')}</h4>
          <div className="h-24 bg-neutral-100 rounded-lg mb-4 flex items-end justify-between p-2">
            {activityData.map((height, idx) => (
              <div 
                key={idx}
                className="w-2 bg-primary rounded-t" 
                style={{ height: `${height}%` }}
                aria-label={`Activity bar ${idx+1}`}
              ></div>
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-3">{t('achievements.yourAchievements')}</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`bg-white rounded-lg shadow-sm p-3 flex flex-col items-center text-center ${
                !achievement.unlockedAt ? 'bg-neutral-100 opacity-60' : ''
              }`}
            >
              <div className={`h-12 w-12 ${
                achievement.unlockedAt 
                  ? 'bg-amber-400' 
                  : 'bg-neutral-300'
              } rounded-full mb-2 flex items-center justify-center`}>
                <span className="material-icons text-white">
                  {achievement.unlockedAt ? achievement.icon : 'lock'}
                </span>
              </div>
              <p className="text-sm font-medium">{achievement.title}</p>
              <p className="text-xs text-neutral-500">
                {achievement.unlockedAt ? achievement.description : t('achievements.locked')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
