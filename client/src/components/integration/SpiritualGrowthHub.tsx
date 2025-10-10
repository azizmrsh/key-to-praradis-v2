import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Star, 
  Award, 
  Flame,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Clock,
  Heart,
  BarChart3,
  Lightbulb,
  Trophy,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, differenceInDays } from 'date-fns';
import { PersonalizedRecommendationDashboard } from '@/components/recommendations/PersonalizedRecommendationDashboard';
import { ProgressAnalyticsDashboard } from '@/components/analytics/ProgressAnalyticsDashboard';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { challengeSystem, type Challenge } from '@/lib/challengeSystem';
import { progressTracker, type AchievementBadge } from '@/lib/progressTracking';
import { recommendationEngine } from '@/lib/recommendationEngine';
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SpiritualGrowthHubProps {
  className?: string;
}

export function SpiritualGrowthHub({ className = '' }: SpiritualGrowthHubProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { results, responses } = useSelfAssessment();
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [todaysChallenges, setTodaysChallenges] = useState<Challenge[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<AchievementBadge[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load active challenges
      const challenges = challengeSystem.getActiveChallenges();
      setActiveChallenges(challenges);
      
      // Load today's challenges
      const todaysChall = challengeSystem.getTodaysChallenges();
      setTodaysChallenges(todaysChall);
      
      // Load recent achievements
      const achievements = progressTracker.getAchievements();
      const recent = achievements
        .filter(a => a.isUnlocked && a.unlockedAt && differenceInDays(new Date(), a.unlockedAt) <= 7)
        .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0));
      setRecentAchievements(recent);
      
      // Calculate current streak
      const streaks = progressTracker.getStreaks();
      const maxStreak = streaks.reduce((max, streak) => 
        streak.isActive ? Math.max(max, streak.currentStreak) : max, 0
      );
      setCurrentStreak(maxStreak);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading your dashboard data.",
        variant: "destructive",
      });
    }
  };

  const handleChallengeComplete = async (challengeId: string, note?: string) => {
    try {
      const success = challengeSystem.completeChallengeDay(challengeId, new Date(), note);
      
      if (success) {
        // Update progress tracking
        const challenge = activeChallenges.find(c => c.id === challengeId);
        if (challenge) {
          const categoryScores = { [challenge.category]: challenge.progress / 20 } as Record<SinCategory, number>;
          progressTracker.recordProgressSnapshot(
            categoryScores,
            [challengeId],
            activeChallenges.map(c => c.id)
          );
          
          // Update streak
          progressTracker.updateStreak(challenge.category, 'daily_goal', true);
        }
        
        // Show celebration if milestone reached
        const updatedChallenge = challengeSystem.getActiveChallenges().find(c => c.id === challengeId);
        if (updatedChallenge?.isCompleted) {
          setCelebrationData({
            type: 'challenge_complete',
            title: 'Challenge Completed!',
            message: `Congratulations! You've completed the "${updatedChallenge.title}" challenge.`,
            achievement: updatedChallenge
          });
          setShowCelebration(true);
        }
        
        // Reload data
        loadDashboardData();
        
        toast({
          title: "Day Completed!",
          description: "Great job completing today's challenge.",
        });
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "There was a problem completing the challenge.",
        variant: "destructive",
      });
    }
  };

  const handleGoalSelect = (goalId: string) => {
    // Navigate to goal details or show goal information
    console.log('Goal selected:', goalId);
  };

  const handleChallengeCreate = (goalId: string, duration: number) => {
    try {
      const challenge = challengeSystem.createChallenge(goalId, duration);
      loadDashboardData();
      
      toast({
        title: "Challenge Started!",
        description: `You've started a ${duration}-day challenge for ${challenge.title}.`,
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "There was a problem starting the challenge.",
        variant: "destructive",
      });
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every step on your spiritual journey matters. Keep going!",
      "Your dedication to self-improvement is inspiring. Stay strong!",
      "Small consistent actions lead to great spiritual growth.",
      "Allah sees your efforts and intention. Trust in His guidance.",
      "Your spiritual journey is unique and valuable. Embrace it!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <CelebrationModal
            data={celebrationData}
            onClose={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Spiritual Growth Hub</h1>
          <p className="text-green-100">{getMotivationalMessage()}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto p-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Challenges"
            value={activeChallenges.length}
            icon={<Target className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Current Streak"
            value={currentStreak}
            icon={<Flame className="h-5 w-5" />}
            color="orange"
            suffix="days"
          />
          <StatCard
            title="Achievements"
            value={recentAchievements.length}
            icon={<Award className="h-5 w-5" />}
            color="yellow"
            suffix="new"
          />
          <StatCard
            title="Spiritual Score"
            value={results ? Math.round(((Object.values(results.categoryScores).reduce((sum, score) => sum + (5 - score), 0)) / 35) * 100) : 0}
            icon={<BarChart3 className="h-5 w-5" />}
            color="green"
            suffix="%"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="challenges">Today's Tasks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardOverview
              activeChallenges={activeChallenges}
              recentAchievements={recentAchievements}
              currentStreak={currentStreak}
              onChallengeComplete={handleChallengeComplete}
            />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <TodaysChallenges
              challenges={todaysChallenges}
              onChallengeComplete={handleChallengeComplete}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <PersonalizedRecommendationDashboard
              onGoalSelect={handleGoalSelect}
              onChallengeCreate={handleChallengeCreate}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ProgressAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  suffix = '' 
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'yellow' | 'green';
  suffix?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value} {suffix}
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Overview Component
function DashboardOverview({
  activeChallenges,
  recentAchievements,
  currentStreak,
  onChallengeComplete
}: {
  activeChallenges: Challenge[];
  recentAchievements: AchievementBadge[];
  currentStreak: number;
  onChallengeComplete: (challengeId: string, note?: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Challenges */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.slice(0, 3).map((challenge, index) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={onChallengeComplete}
                  compact={true}
                />
              ))}
              
              {activeChallenges.length === 0 && (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Challenges</h3>
                  <p className="text-gray-600">Start a new challenge to begin your spiritual growth journey.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.title}</p>
                    <p className="text-xs text-gray-500">
                      {achievement.unlockedAt && format(achievement.unlockedAt, 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentAchievements.length === 0 && (
                <div className="text-center py-4">
                  <Award className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No recent achievements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {currentStreak}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {currentStreak === 1 ? 'day' : 'days'} of consistent practice
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(currentStreak * 2, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Keep going to reach your next milestone!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Today's Challenges Component
function TodaysChallenges({
  challenges,
  onChallengeComplete
}: {
  challenges: Challenge[];
  onChallengeComplete: (challengeId: string, note?: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today's Spiritual Tasks</h2>
        <Badge variant="outline" className="text-sm">
          {challenges.length} {challenges.length === 1 ? 'task' : 'tasks'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={onChallengeComplete}
          />
        ))}
      </div>
      
      {challenges.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Done for Today!</h3>
              <p className="text-gray-600">You've completed all your spiritual tasks for today.</p>
              <p className="text-sm text-gray-500 mt-2">Come back tomorrow for new challenges.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({
  challenge,
  onComplete,
  compact = false
}: {
  challenge: Challenge;
  onComplete: (challengeId: string, note?: string) => void;
  compact?: boolean;
}) {
  const [note, setNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const isToday = challengeSystem.isDayCompleted(challenge.id);

  const handleComplete = () => {
    onComplete(challenge.id, note);
    setIsCompleted(true);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isCompleted || isToday ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {challenge.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Day {challenge.currentDay}/{challenge.duration}
              </Badge>
            </div>
            
            <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
              {challenge.title}
            </CardTitle>
            
            {!compact && (
              <p className="text-sm text-gray-600 mt-2">{challenge.description}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(challenge.progress)}%
            </div>
            <div className="text-sm text-gray-500">complete</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Progress value={challenge.progress} className="h-2" />
        </div>
        
        {!compact && challenge.dailyActions && challenge.dailyActions.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium mb-2">Today's Action:</h5>
            <p className="text-sm text-gray-600">{challenge.dailyActions[0]}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {challenge.duration - challenge.currentDay + 1} days left
            </span>
          </div>
          
          <Button
            onClick={handleComplete}
            disabled={isCompleted || isToday}
            size="sm"
            className="flex items-center gap-2"
          >
            {isCompleted || isToday ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Complete Day
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Celebration Modal Component
function CelebrationModal({
  data,
  onClose
}: {
  data: any;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
          <p className="text-gray-600">{data.message}</p>
        </div>
        
        <Button onClick={onClose} className="w-full">
          Continue Your Journey
        </Button>
      </motion.div>
    </motion.div>
  );
}