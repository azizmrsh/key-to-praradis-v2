import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GamificationService, Badge as BadgeType } from '@/lib/gamificationService';
import { Trophy, ChevronRight } from 'lucide-react';

export function VisualBadgeGallery() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  
  const rewards = GamificationService.getUserRewards();
  const unlockedBadges = rewards.badges.filter(badge => badge.isUnlocked);
  const isRTL = i18n.language === 'ar';

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sincere': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleViewAll = () => {
    setLocation('/achievements-detail');
  };

  const handleStartJourney = () => {
    setLocation('/my-path');
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            {t('profile.badgeCollection')}
          </span>
          {unlockedBadges.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewAll}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
              data-testid="button-view-all-badges"
            >
              {t('profile.viewAll')}
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180 mr-1' : 'ml-1'}`} />
            </Button>
          )}
        </CardTitle>
        {unlockedBadges.length > 0 && (
          <p className="text-sm text-green-700 font-medium">
            {t('profile.badgesEarnedCount', { count: unlockedBadges.length })}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {unlockedBadges.length > 0 ? (
          <div 
            className={`flex gap-4 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#10b981 #d1fae5'
            }}
            data-testid="badge-gallery-scroll"
          >
            {unlockedBadges.map((badge) => (
              <div 
                key={badge.id}
                className="flex-shrink-0 w-24 text-center group cursor-pointer hover:scale-105 transition-transform"
                data-testid={`badge-item-${badge.id}`}
              >
                <div className="relative">
                  <div className="text-5xl mb-2 group-hover:animate-bounce">
                    {badge.icon}
                  </div>
                  <Badge 
                    className={`${getTierColor(badge.tier)} text-xs font-medium absolute -top-1 ${isRTL ? 'left-0' : 'right-0'}`}
                    data-testid={`badge-tier-${badge.id}`}
                  >
                    {badge.tier}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-gray-700 line-clamp-2 mt-1">
                  {badge.title}
                </p>
                {badge.dateEarned && (
                  <p className="text-xs text-green-600 mt-1">
                    {badge.dateEarned.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4" data-testid="no-badges-motivation">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm text-gray-700 mb-4">
              {t('profile.noBadgesMotivation')}
            </p>
            <Button 
              onClick={handleStartJourney}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-start-journey"
            >
              {t('profile.startYourJourney')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
