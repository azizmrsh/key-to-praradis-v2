import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target, 
  Flame,
  Clock,
  CheckCircle2,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  progressTracker, 
  type ProgressSnapshot, 
  type StreakData, 
  type AchievementBadge,
  type Milestone,
  type ProgressTrend
} from '@/lib/progressTracking';
import { challengeSystem } from '@/lib/challengeSystem';
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { useTranslation } from 'react-i18next';

interface ProgressAnalyticsDashboardProps {
  className?: string;
}

export function ProgressAnalyticsDashboard({ className = '' }: ProgressAnalyticsDashboardProps) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedCategory, setSelectedCategory] = useState<SinCategory | 'all'>('all');
  const [progressData, setProgressData] = useState<ProgressSnapshot[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [trends, setTrends] = useState<ProgressTrend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedCategory]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load progress snapshots
      const snapshots = progressTracker.getProgressSnapshots();
      const filtered = filterByTimeRange(snapshots, timeRange);
      setProgressData(filtered);

      // Load streaks
      setStreaks(progressTracker.getStreaks());

      // Load achievements
      setAchievements(progressTracker.getAchievements());

      // Load milestones
      setMilestones(progressTracker.getMilestones());

      // Generate trends
      const trendData = progressTracker.generateProgressTrends(timeRange);
      setTrends(trendData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (snapshots: ProgressSnapshot[], range: 'week' | 'month' | 'quarter') => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const cutoff = subDays(new Date(), days);
    return snapshots.filter(snapshot => snapshot.date >= cutoff);
  };

  const exportData = () => {
    const exportObject = {
      progressData,
      streaks,
      achievements,
      milestones,
      trends,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `spiritual-progress-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Analytics</h1>
          <p className="text-gray-600">Track your spiritual growth and achievements</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={(value: SinCategory | 'all') => setSelectedCategory(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Progress"
          value={progressData.length > 0 ? `${Math.round(progressData[progressData.length - 1]?.overallScore || 0)}%` : '0%'}
          change={calculateOverallChange()}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        
        <SummaryCard
          title="Current Streak"
          value={`${getCurrentStreak()} days`}
          change={getStreakChange()}
          icon={<Flame className="h-5 w-5" />}
          color="orange"
        />
        
        <SummaryCard
          title="Achievements"
          value={achievements.filter(a => a.isUnlocked).length.toString()}
          change={getAchievementChange()}
          icon={<Award className="h-5 w-5" />}
          color="yellow"
        />
        
        <SummaryCard
          title="Active Goals"
          value={challengeSystem.getActiveChallenges().length.toString()}
          change={null}
          icon={<Target className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OverallProgressChart data={progressData} />
            <CategoryRadarChart data={progressData} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentMilestones milestones={milestones} />
            <CategoryProgressBars data={progressData} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsAnalysis trends={trends} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsGrid achievements={achievements} />
        </TabsContent>

        <TabsContent value="streaks" className="space-y-6">
          <StreaksOverview streaks={streaks} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <PersonalizedInsights data={progressData} streaks={streaks} />
        </TabsContent>
      </Tabs>
    </div>
  );

  function calculateOverallChange(): number {
    if (progressData.length < 2) return 0;
    const current = progressData[progressData.length - 1]?.overallScore || 0;
    const previous = progressData[progressData.length - 2]?.overallScore || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  function getCurrentStreak(): number {
    const activeStreaks = streaks.filter(s => s.isActive);
    return activeStreaks.length > 0 ? Math.max(...activeStreaks.map(s => s.currentStreak)) : 0;
  }

  function getStreakChange(): number {
    // Compare current streak with previous week
    const currentStreak = getCurrentStreak();
    const previousWeekData = progressData.filter(p => p.date >= subDays(new Date(), 14) && p.date < subDays(new Date(), 7));
    // This is a simplified calculation - you could implement more complex streak tracking
    return Math.random() > 0.5 ? 2 : -1; // Placeholder
  }

  function getAchievementChange(): number {
    const recentAchievements = achievements.filter(a => 
      a.unlockedAt && a.unlockedAt >= subDays(new Date(), timeRange === 'week' ? 7 : 30)
    );
    return recentAchievements.length;
  }
}

// Summary Card Component
function SummaryCard({ 
  title, 
  value, 
  change, 
  icon, 
  color 
}: { 
  title: string;
  value: string;
  change: number | null;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'yellow' | 'green';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    green: 'text-green-600 bg-green-50'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== null && (
              <div className="flex items-center gap-1 mt-1">
                {change > 0 ? (
                  <ArrowUp className="h-3 w-3 text-green-600" />
                ) : change < 0 ? (
                  <ArrowDown className="h-3 w-3 text-red-600" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-400" />
                )}
                <span className={`text-xs ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Overall Progress Chart Component
function OverallProgressChart({ data }: { data: ProgressSnapshot[] }) {
  const chartData = data.map(snapshot => ({
    date: format(snapshot.date, 'MMM dd'),
    progress: snapshot.overallScore
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Overall Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Category Radar Chart Component
function CategoryRadarChart({ data }: { data: ProgressSnapshot[] }) {
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const radarData = Object.entries(latest.categoryScores).map(([category, score]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    score: 5 - score, // Invert score for better visualization
    fullMark: 5
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Category Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar name="Progress" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Recent Milestones Component
function RecentMilestones({ milestones }: { milestones: Milestone[] }) {
  const completedMilestones = milestones
    .filter(m => m.isCompleted)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Recent Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {completedMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{milestone.title}</h4>
                <p className="text-xs text-gray-600">{milestone.description}</p>
                {milestone.completedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Completed {format(milestone.completedAt, 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Category Progress Bars Component
function CategoryProgressBars({ data }: { data: ProgressSnapshot[] }) {
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const categoryData = Object.entries(latest.categoryScores).map(([category, score]) => ({
    category: categoryInfo[category as SinCategory].title,
    progress: ((5 - score) / 5) * 100,
    score: score
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Category Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryData.map((item, index) => (
            <div key={item.category}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm text-gray-600">{item.progress.toFixed(0)}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Trends Analysis Component
function TrendsAnalysis({ trends }: { trends: ProgressTrend[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {trends.map((trend, index) => (
        <Card key={trend.category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{categoryInfo[trend.category].title}</span>
              <Badge variant={trend.overallTrend === 'improving' ? 'default' : 
                            trend.overallTrend === 'declining' ? 'destructive' : 'secondary'}>
                {trend.overallTrend}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend.dataPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              Confidence: {Math.round(trend.confidenceLevel * 100)}%
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Achievements Grid Component
function AchievementsGrid({ achievements }: { achievements: AchievementBadge[] }) {
  const tierColors = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    sincere: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={achievement.isUnlocked ? '' : 'opacity-50'}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                </div>
                <Badge className={tierColors[achievement.tier]}>
                  {achievement.tier}
                </Badge>
              </div>
              
              {achievement.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                </div>
              )}
              
              {achievement.unlockedAt && (
                <div className="text-xs text-gray-500">
                  Unlocked {format(achievement.unlockedAt, 'MMM dd, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Streaks Overview Component
function StreaksOverview({ streaks }: { streaks: StreakData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {streaks.map((streak, index) => (
        <motion.div
          key={`${streak.category}_${streak.streakType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{categoryInfo[streak.category].title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{streak.streakType.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className={`h-5 w-5 ${streak.isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={`text-lg font-bold ${streak.isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                    {streak.currentStreak}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-medium">{streak.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longest Streak:</span>
                  <span className="font-medium">{streak.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{format(streak.lastActivity, 'MMM dd')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Personalized Insights Component
function PersonalizedInsights({ data, streaks }: { data: ProgressSnapshot[]; streaks: StreakData[] }) {
  const insights = generateInsights(data, streaks);

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <insight.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-gray-600 mb-3">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">{insight.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Helper function to generate insights
function generateInsights(data: ProgressSnapshot[], streaks: StreakData[]) {
  const insights = [];

  // Overall progress insight
  if (data.length >= 2) {
    const recent = data[data.length - 1];
    const previous = data[data.length - 2];
    const improvement = recent.overallScore - previous.overallScore;
    
    if (improvement > 0) {
      insights.push({
        icon: TrendingUp,
        title: 'Great Progress!',
        description: `Your overall spiritual score has improved by ${improvement.toFixed(1)} points since your last assessment.`,
        recommendation: 'Keep up the excellent work and maintain your current spiritual practices.'
      });
    }
  }

  // Streak insights
  const activeStreaks = streaks.filter(s => s.isActive);
  if (activeStreaks.length > 0) {
    const longestStreak = Math.max(...activeStreaks.map(s => s.currentStreak));
    insights.push({
      icon: Flame,
      title: 'Consistency Pays Off',
      description: `You have maintained a ${longestStreak}-day streak! This consistency is key to spiritual growth.`,
      recommendation: 'Continue your daily practices to maintain and extend your streak.'
    });
  }

  // Category-specific insights
  if (data.length > 0) {
    const latest = data[data.length - 1];
    const bestCategory = Object.entries(latest.categoryScores).reduce((best, [category, score]) => 
      score < best.score ? { category, score } : best
    , { category: '', score: 5 });

    insights.push({
      icon: Star,
      title: 'Strength Area Identified',
      description: `You're showing excellent progress in ${categoryInfo[bestCategory.category as SinCategory].title} with a score of ${bestCategory.score.toFixed(1)}.`,
      recommendation: 'Use this strength as a foundation to tackle more challenging areas.'
    });
  }

  return insights;
}