import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { GamificationService, Badge as BadgeType } from '@/lib/gamificationService';
import { StreakVisualization, StreakCard } from '@/components/gamification/StreakVisualization';
import { Trophy, Star, Target, Calendar, Flame, CheckCircle } from 'lucide-react';
import { goalsEngine } from '@/services/goalsEngine';

export function AchievementsDetailPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'prayer' | 'behavioral' | 'reflection' | 'mastery' | 'general' | 'goals'>('all');
  const [goalAchievements, setGoalAchievements] = useState<any[]>([]);
  
  const rewards = GamificationService.getUserRewards();
  const unlockedBadges = rewards.badges.filter(badge => badge.isUnlocked);
  const totalBadges = rewards.badges.length;
  const completionPercentage = Math.round((unlockedBadges.length / totalBadges) * 100);

  useEffect(() => {
    // Load goal achievements
    const achievements = goalsEngine.getGoalAchievements();
    setGoalAchievements(achievements);
  }, []);
  
  const getBadgesByCategory = (category: typeof selectedCategory) => {
    if (category === 'goals') {
      return []; // Goal achievements are handled separately
    }
    return category === 'all' 
      ? rewards.badges 
      : rewards.badges.filter(badge => badge.category === category);
  };

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'bronze': return 'bg-amber-600';
      default: return 'bg-blue-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'eyes': '👁️',
      'ears': '👂',
      'tongue': '🗣️',
      'heart': '💝',
      'pride': '🤲',
      'stomach': '🍯',
      'zina': '🛡️'
    };
    return icons[category] || '🎯';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sincere': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const activeStreaks = Object.values(rewards.streaks).filter(streak => streak.isActive && streak.currentStreak > 0);
  const bestStreaks = Object.values(rewards.streaks).sort((a, b) => b.bestStreak - a.bestStreak).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader title={t('achievements.myAchievements')} />
      
      <Container className="py-6 pb-24">
        <div className="space-y-6">
          {/* Overall Progress Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  {t('achievements.yourAchievements')}
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {t('achievements.level')} {Math.floor(rewards.masteryLevel / 10) + 1}
                  </div>
                  <div className="text-sm text-green-600">{t('achievements.masteryLevel')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{t('achievements.badgesEarned')}</span>
                    <span>{unlockedBadges.length} / {totalBadges}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {completionPercentage}% {t('achievements.complete')}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <div className="font-bold text-amber-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'bronze').length}
                    </div>
                    <div className="text-xs text-amber-600">{t('profile.bronze')}</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <div className="font-bold text-gray-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'silver').length}
                    </div>
                    <div className="text-xs text-gray-600">{t('profile.silver')}</div>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <div className="font-bold text-yellow-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'gold').length}
                    </div>
                    <div className="text-xs text-yellow-600">{t('profile.gold')}</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="font-bold text-purple-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'sincere').length}
                    </div>
                    <div className="text-xs text-purple-600">{t('profile.sincere')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Different Views */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t('achievements.badges')}
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('achievements.goals')}
              </TabsTrigger>
              <TabsTrigger value="streaks" className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                {t('achievements.streaks')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="badges" className="space-y-4">
              {/* Badge Category Filter */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'prayer', 'behavioral', 'reflection', 'mastery', 'general'] as const).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {t(`achievements.categories.${category}`)}
                  </Button>
                ))}
              </div>

              {/* Badge Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getBadgesByCategory(selectedCategory).map((badge) => (
                  <Card key={badge.id} className={`${badge.isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`text-3xl ${badge.isUnlocked ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium ${badge.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                              {t(`achievements.badgeTitles.${badge.id}`) || badge.title}
                            </h3>
                            <Badge className={`${getTierColor(badge.tier)} text-xs`}>
                              {t(`profile.${badge.tier}`)}
                            </Badge>
                          </div>
                          <p className={`text-sm ${badge.isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                            {t(`achievements.badgeDescriptions.${badge.id}`) || badge.description}
                          </p>
                          {badge.dateEarned && (
                            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {t('achievements.earned')} {badge.dateEarned.toLocaleDateString()}
                            </div>
                          )}
                          {!badge.isUnlocked && (
                            <div className="text-xs text-gray-400 mt-2">
                              🔒 {t('achievements.notYetUnlocked')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              {/* Goal Achievements */}
              {goalAchievements.length > 0 ? (
                <div className="grid gap-4">
                  {goalAchievements.map((achievement, index) => (
                    <Card key={`${achievement.goalId}-${achievement.durationDays}-${index}`} className="border-l-4 border-l-green-500 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">
                            {getCategoryIcon(achievement.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-800">
                                {achievement.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getBadgeColor(achievement.badge)} text-white text-xs`}>
                                  {achievement.badge}
                                </Badge>
                                <div className={`w-3 h-3 rounded-full ${getBadgeColor(achievement.badge)}`}></div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {t('achievements.completedGoalMessage', { duration: achievement.durationDays, category: achievement.category })}
                            </p>
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {t('achievements.completed')} {new Date(achievement.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-medium text-gray-800 mb-2">{t('achievements.noGoalsCompleted')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('achievements.noGoalsCompletedMessage')}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4">
              {/* Active Streaks */}
              {activeStreaks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    {t('achievements.activeStreaks')}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeStreaks.map((streak, index) => (
                      <StreakCard 
                        key={`active-${streak.type}-${streak.category}-${index}`}
                        streakData={streak}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Best Streaks */}
              {bestStreaks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    {t('achievements.bestStreaks')}
                  </h3>
                  <div className="space-y-3">
                    {bestStreaks.map((streak, index) => (
                      <Card key={`best-${streak.type}-${streak.category}-${index}`} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium capitalize">
                              {streak.category || streak.type} {t('achievements.streak')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {t('achievements.bestStreak')}: {streak.bestStreak} {t('contentDashboard.days')}
                            </div>
                          </div>
                          <div className="text-2xl">
                            {streak.bestStreak >= 40 ? '🏆' : streak.bestStreak >= 21 ? '🥈' : streak.bestStreak >= 7 ? '🥉' : '🔥'}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Streaks Message */}
              {activeStreaks.length === 0 && bestStreaks.length === 0 && (
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-medium text-gray-800 mb-2">{t('achievements.startFirstStreak')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('achievements.startFirstStreakMessage')}
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Container>

      <BottomNavigation />
    </div>
  );
}