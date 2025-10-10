import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { Progress } from '@/components/ui/progress';
import { GamificationService } from '@/lib/gamificationService';
import { useUser } from '@/contexts/UserContext';
import { goalsEngine } from '@/services/goalsEngine';
import { challengeSelector } from '@/services/challengeSelector';
import { PrayerTimesWidget } from '@/components/prayer/PrayerTimesWidget';
import { 
  User, 
  Settings, 
  Trophy, 
  Target, 
  Book, 
  ChevronRight,
  Star,
  Zap,
  ClipboardList,
  Eye,
  Play,
  RotateCcw
} from 'lucide-react';
import { categoryInfo, SinCategory } from '@/data/selfAssessmentData';
import { VisualBadgeGallery } from '@/components/gamification/VisualBadgeGallery';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { userProgress } = useUser();
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const currentLanguage = i18n.language as 'en' | 'ar' | 'fr';
  
  const rewards = GamificationService.getUserRewards();
  const unlockedBadges = rewards.badges.filter(badge => badge.isUnlocked);
  const recentBadges = GamificationService.getRecentBadges();
  
  // Load goals and challenges data
  useEffect(() => {
    const goals = goalsEngine.getActiveGoals();
    const challenges = challengeSelector.getActiveChallenges();
    setActiveGoals(goals);
    setActiveChallenges(challenges);
  }, []);
  
  // Calculate user stats
  const totalLessonsCompleted = 0;
  const activeStreaks = Object.values(rewards.streaks).filter(streak => streak.isActive && streak.currentStreak > 0);
  const bestStreak = Math.max(0, ...Object.values(rewards.streaks).map(s => s.bestStreak));

  const handleNavigateToAchievements = () => {
    setLocation('/achievements-detail');
  };

  const handleNavigateToSettings = () => {
    setLocation('/settings');
  };

  // Get focus areas from assessment results
  const getFocusAreas = () => {
    try {
      const results = localStorage.getItem('assessment_results');
      if (results) {
        const parsed = JSON.parse(results);
        return {
          primary: parsed.primaryStruggle as SinCategory,
          secondary: parsed.secondaryStruggle as SinCategory
        };
      }
    } catch (error) {
      console.error('Error loading assessment results:', error);
    }
    return null;
  };

  const focusAreas = getFocusAreas();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching MyPathPage styling */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className={`text-4xl font-bold text-black mb-2 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('profile.title')}
        </h1>
        <p className={`text-2xl text-gray-600 font-serif ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Focus Areas Section - Always visible */}
      <div className="px-6 py-4" style={{ backgroundColor: '#BCCBCC' }}>
        <h2 className="text-lg font-bold text-black mb-0">{t('profile.focusAreasHeading')}</h2>
        {focusAreas ? (
          <p className="text-lg font-bold" style={{ color: '#ed1c24' }}>
            {t(`goals.categories.${focusAreas.primary}`)} • {t(`goals.categories.${focusAreas.secondary}`)}
          </p>
        ) : (
          <p className="text-base text-black mt-1">
            {t('profile.focusAreasNotSelected')}
          </p>
        )}
      </div>
      
      <Container className="py-6 pb-24">
        <div className="space-y-6">
          {/* Prayer Times Widget */}
          <PrayerTimesWidget 
            userLocation={(() => {
              const saved = localStorage.getItem('prayer_location_data');
              return saved ? JSON.parse(saved) : null;
            })()}
            settings={(() => {
              const saved = localStorage.getItem('prayer_settings_data');
              return saved ? JSON.parse(saved) : {
                calculationMethod: 'muslim-world-league',
                madhab: 'shafi'
              };
            })()}
          />
          
          {/* Self-Assessment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const assessmentResults = localStorage.getItem('assessment_results');
                  const inProgressState = localStorage.getItem('assessment_state');
                  
                  if (assessmentResults) {
                    return <><Eye className="h-5 w-5" />{t('goals.selfAssessment')}</>;
                  }
                  
                  if (inProgressState) {
                    return <><Play className="h-5 w-5" />{t('goals.selfAssessment')}</>;
                  }
                  
                  return <><ClipboardList className="h-5 w-5" />{t('goals.selfAssessment')}</>;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const completedResults = localStorage.getItem('assessment_results');
                  const inProgressState = localStorage.getItem('assessment_state');
                  
                  // Check if we have completed results (manual or assessment)
                  if (completedResults) {
                    const results = JSON.parse(completedResults);
                    const selectionMethod = results.selectionMethod || 'assessment';
                    const focusAreas = results.focusAreas || { 
                      primary: results.primaryStruggle, 
                      secondary: results.secondaryStruggle 
                    };
                    
                    if (selectionMethod === 'manual') {
                      // Manual selection state
                      return (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.manuallySelectedFocusAreas')}
                          </p>
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => setLocation('/enhanced-assessment?skip=true')}
                              className="w-full"
                              variant="outline"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              {t('profile.changeFocusAreas')}
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => setLocation('/enhanced-assessment')}
                                className="w-full"
                              >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                {t('profile.takeFullAssessment')}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setLocation('/assessment-review')}
                                className="w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t('profile.review')}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {t('profile.manualSelection')}
                            </Badge>
                          </div>
                        </>
                      );
                    } else {
                      // Full assessment completed state
                      return (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.assessmentComplete')}
                          </p>
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => setLocation('/assessment-review')}
                              className="w-full"
                              variant="outline"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('dashboard.reviewAssessment')}
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => setLocation('/enhanced-assessment?skip=true')}
                                className="w-full"
                              >
                                <Target className="h-4 w-4 mr-2" />
                                {t('profile.changeFocus')}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  localStorage.removeItem('assessment_results');
                                  setLocation('/enhanced-assessment');
                                }}
                                className="w-full"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {t('profile.retake')}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {t('goals.completed')}
                            </Badge>
                          </div>
                        </>
                      );
                    }
                  }
                  
                  // In-progress assessment state
                  if (inProgressState) {
                    const parsed = JSON.parse(inProgressState);
                    const answeredCount = Object.keys(parsed.responses || {}).length;
                    return (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {`${t('dashboard.resumeFromQuestion')} ${parsed.currentQuestionIndex + 1} (${answeredCount} ${t('dashboard.answered')})`}
                        </p>
                        
                        <div className="space-y-2">
                          <Button 
                            onClick={() => setLocation('/enhanced-assessment')}
                            className="w-full"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {t('dashboard.continueAssessment')}
                          </Button>
                          
                          <Button 
                            onClick={() => setLocation('/enhanced-assessment?skip=true')}
                            className="w-full"
                            variant="outline"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            {t('profile.manualSelection')}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {t('goals.inProgress')}
                          </Badge>
                        </div>
                      </>
                    );
                  }
                  
                  // No assessment or selection state
                  return (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.discoverGrowthAreas')}
                      </p>
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={() => setLocation('/enhanced-assessment')}
                          className="w-full"
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          {t('dashboard.takeSelfAssessment')}
                        </Button>
                        
                        <Button 
                          onClick={() => setLocation('/enhanced-assessment?skip=true')}
                          className="w-full"
                          variant="outline"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          {t('profile.manualSelection')}
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{t('profile.title')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('profile.subtitle')}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalLessonsCompleted}</div>
                  <div className="text-sm text-muted-foreground">{t('profile.activeFocusAreas')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{unlockedBadges.length}</div>
                  <div className="text-sm text-muted-foreground">{t('profile.badgesEarned')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{bestStreak}</div>
                  <div className="text-sm text-muted-foreground">{t('profile.bestStreak')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeStreaks.length}</div>
                  <div className="text-sm text-muted-foreground">{t('profile.activeStreaks')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Badge Gallery - Shows all earned badges */}
          <VisualBadgeGallery />

          {/* Achievements Overview Box */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleNavigateToAchievements}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  {t('profile.achievements')}
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400 rtl:rotate-180" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Achievement Stats */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <div className="font-bold text-amber-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'bronze').length}
                    </div>
                    <div className="text-xs text-amber-600">{t('profile.bronze')}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'silver').length}
                    </div>
                    <div className="text-xs text-gray-600">{t('profile.silver')}</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <div className="font-bold text-yellow-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'gold').length}
                    </div>
                    <div className="text-xs text-yellow-600">{t('profile.gold')}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-700">
                      {rewards.badges.filter(b => b.isUnlocked && b.tier === 'sincere').length}
                    </div>
                    <div className="text-xs text-purple-600">{t('profile.sincere')}</div>
                  </div>
                </div>

                {/* Recent Badges Preview */}
                {recentBadges.length > 0 ? (
                  <div>
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {t('profile.recentlyEarned')}
                    </div>
                    <div className="flex space-x-2">
                      {recentBadges.slice(0, 3).map((badge) => (
                        <div key={badge.id} className="text-2xl">{badge.icon}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-2">
                    {t('profile.firstBadgePrompt')}
                  </div>
                )}

                <div className="text-xs text-gray-400 text-center">
                  {t('profile.tapToViewAll')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/my-path')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold">{t('profile.yourPath')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('profile.yourPathDesc')}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto rtl:rotate-180" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleNavigateToSettings}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-gray-600" />
                  <div>
                    <div className="font-semibold">{t('profile.settings')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('profile.settingsDesc')}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto rtl:rotate-180" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Path Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t('profile.yourPathProgress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Active Goals Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('profile.activeGoals')}</span>
                    <span>{activeGoals.filter(g => g.status === 'active').length}</span>
                  </div>
                  {activeGoals.filter(g => g.status === 'active').slice(0, 2).map((goal) => {
                    const goalDetails = goalsEngine.getGoalDetails(goal.goal_id);
                    const progress = goalsEngine.getGoalProgress(goal.goal_id);
                    const localizedTitle = goalDetails?.translations?.[currentLanguage]?.title || goalDetails?.translations?.en?.title || 'Goal';
                    return (
                      <div key={goal.goal_id} className="p-2 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{localizedTitle}</span>
                          <span className="text-xs text-muted-foreground">{goal.current_day || 0}/{goal.duration_days} {t('goals.days')}</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    );
                  })}
                </div>

                {/* Active Challenges Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('profile.activeChallenges')}</span>
                    <span>{activeChallenges.filter(c => c.status === 'in_progress').length}</span>
                  </div>
                  {activeChallenges.filter(c => c.status === 'in_progress').slice(0, 2).map((challenge) => {
                    const challengeDetails = challengeSelector.getChallengeDetails(challenge.challenge_id);
                    const progress = challengeSelector.getChallengeProgress(challenge.challenge_id);
                    const localizedContent = challengeDetails ? challengeSelector.getChallengeContent(challengeDetails, currentLanguage) : null;
                    return (
                      <div key={challenge.challenge_id} className="p-2 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{localizedContent?.title || 'Challenge'}</span>
                          <span className="text-xs text-muted-foreground">{challenge.current_day || 0}/{challenge.duration_days} {t('goals.days')}</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    );
                  })}
                </div>

                {/* View Your Path Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setLocation('/my-path')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t('profile.viewYourPath')}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </Container>

      <BottomNavigation />
    </div>
  );
}