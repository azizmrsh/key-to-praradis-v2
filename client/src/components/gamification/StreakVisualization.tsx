import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StreakData, GamificationService } from '@/lib/gamificationService';

interface StreakVisualizationProps {
  streakData: StreakData;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function StreakVisualization({ 
  streakData, 
  size = 'medium', 
  showDetails = true 
}: StreakVisualizationProps) {
  const { t } = useTranslation();
  const visualization = GamificationService.getStreakVisualization(streakData);
  
  // Helper to translate streak type
  const translateStreakType = (data: StreakData) => {
    // If there's a specific category (like 'all_prayers', 'fajr_only'), use that
    if (data.category) {
      const translated = t(`contentDashboard.streakTypes.${data.category}`, { defaultValue: '' });
      if (translated) return translated;
    }
    // Otherwise, use the general type (like 'prayer', 'behavioral')
    return t(`contentDashboard.streakTypes.${data.type}`, { defaultValue: data.type });
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-12 h-12 text-xs';
      case 'large': return 'w-20 h-20 text-lg';
      default: return 'w-16 h-16 text-sm';
    }
  };

  const getProgressPercentage = () => {
    const milestones = [3, 7, 21, 40];
    const nextMilestone = milestones.find(m => m > streakData.currentStreak) || 40;
    return Math.min((streakData.currentStreak / nextMilestone) * 100, 100);
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Streak Circle */}
      <div className="relative">
        <div className={`${getSizeClasses()} rounded-full flex items-center justify-center relative overflow-hidden`}>
          {/* Background */}
          <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
          
          {/* Progress Fill */}
          <div 
            className="absolute inset-0 rounded-full transition-all duration-500 ease-out"
            style={{
              background: `conic-gradient(${visualization.color} ${getProgressPercentage() * 3.6}deg, transparent 0deg)`,
              opacity: visualization.intensity
            }}
          ></div>
          
          {/* Glow Effect */}
          {streakData.currentStreak >= 7 && (
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                boxShadow: `0 0 20px ${visualization.color}`,
                opacity: 0.5
              }}
            ></div>
          )}
          
          {/* Streak Number */}
          <div className="relative z-10 font-bold text-gray-800">
            {streakData.currentStreak >= 7 ? '🔥' : streakData.currentStreak}
          </div>
        </div>
      </div>

      {/* Streak Details */}
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-800 capitalize">
              {translateStreakType(streakData)} {t('contentDashboard.streakLabel')}
            </span>
            <Badge variant="outline" className="text-xs">
              {streakData.currentStreak} {t('contentDashboard.days')}
            </Badge>
          </div>
          
          {streakData.bestStreak > streakData.currentStreak && (
            <div className="text-xs text-gray-500">
              {t('contentDashboard.best')}: {streakData.bestStreak} {t('contentDashboard.days')}
            </div>
          )}
          
          {visualization.message && (
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {t(visualization.message)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface StreakCardProps {
  streakData: StreakData;
  onClick?: () => void;
}

export function StreakCard({ streakData, onClick }: StreakCardProps) {
  const { t } = useTranslation();
  const visualization = GamificationService.getStreakVisualization(streakData);
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
        streakData.currentStreak >= 7 ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <StreakVisualization 
          streakData={streakData} 
          size="large"
          showDetails={true}
        />
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('contentDashboard.progress')}</span>
            <span>{t('contentDashboard.nextMilestone')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((streakData.currentStreak / 40) * 100, 100)}%`,
                backgroundColor: visualization.color
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}