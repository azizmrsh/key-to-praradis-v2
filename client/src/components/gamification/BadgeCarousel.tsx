import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Badge as BadgeType, GamificationService } from '@/lib/gamificationService';
import { ChevronRight, Trophy, Star } from 'lucide-react';

interface BadgeCarouselProps {
  onViewAll?: () => void;
}

export function BadgeCarousel({ onViewAll }: BadgeCarouselProps) {
  const rewards = GamificationService.getUserRewards();
  const recentBadges = GamificationService.getRecentBadges();
  const unlockedBadges = rewards.badges.filter(badge => badge.isUnlocked);
  const totalBadges = rewards.badges.length;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sincere': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Your Progress
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress Summary */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div>
            <div className="text-2xl font-bold text-green-700">
              {unlockedBadges.length}
            </div>
            <div className="text-sm text-green-600">
              of {totalBadges} badges earned
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-700">
              Level {Math.floor(rewards.masteryLevel / 10) + 1}
            </div>
            <div className="text-xs text-green-600">
              Mastery Level
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        {recentBadges.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Recently Earned
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {recentBadges.slice(0, 3).map((badge) => (
                <BadgeListItem key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        ) : (
          /* Next Badge to Earn */
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">
              Next Badge to Earn
            </h4>
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm text-gray-600">
                Complete your first challenge or maintain a 7-day prayer streak to earn your first badge!
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-amber-50 rounded-lg">
            <div className="font-bold text-amber-700">
              {rewards.badges.filter(b => b.isUnlocked && b.tier === 'bronze').length}
            </div>
            <div className="text-xs text-amber-600">Bronze</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="font-bold text-gray-700">
              {rewards.badges.filter(b => b.isUnlocked && b.tier === 'silver').length}
            </div>
            <div className="text-xs text-gray-600">Silver</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="font-bold text-yellow-700">
              {rewards.badges.filter(b => b.isUnlocked && b.tier === 'gold').length + 
               rewards.badges.filter(b => b.isUnlocked && b.tier === 'sincere').length}
            </div>
            <div className="text-xs text-yellow-600">Gold+</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgeListItemProps {
  badge: BadgeType;
}

function BadgeListItem({ badge }: BadgeListItemProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sincere': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
      <div className="text-2xl">{badge.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 truncate">
          {badge.title}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {badge.description}
        </div>
        {badge.dateEarned && (
          <div className="text-xs text-gray-400 mt-1">
            Earned {badge.dateEarned.toLocaleDateString()}
          </div>
        )}
      </div>
      <Badge className={`${getTierColor(badge.tier)} text-xs font-medium`}>
        {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
      </Badge>
    </div>
  );
}