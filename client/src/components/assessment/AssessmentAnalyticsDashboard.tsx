import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Calendar,
  Star,
  Zap,
  BookOpen,
  CheckCircle,
  Clock,
  BarChart3,
  Trophy
} from 'lucide-react';
import { assessmentAnalytics, type AssessmentAnalytics, type ProgressTrend } from '@/lib/assessmentAnalytics';
import { SinCategory } from '@/data/selfAssessmentData';

const CATEGORY_COLORS = {
  tongue: '#ef4444',
  eyes: '#f97316', 
  ears: '#eab308',
  heart: '#22c55e',
  pride: '#06b6d4',
  stomach: '#8b5cf6',
  zina: '#ec4899'
};

const CATEGORY_LABELS = {
  tongue: 'Speech',
  eyes: 'Sight',
  ears: 'Hearing', 
  heart: 'Heart',
  pride: 'Pride',
  stomach: 'Appetite',
  zina: 'Purity'
};

export function AssessmentAnalyticsDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<AssessmentAnalytics[]>([]);
  const [trends, setTrends] = useState<ProgressTrend[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setAnalytics(assessmentAnalytics.getAnalyticsHistory());
    setTrends(assessmentAnalytics.getProgressTrends());
    setStats(assessmentAnalytics.getStatistics());
  };

  const streaks = assessmentAnalytics.getStreaks();
  const milestones = assessmentAnalytics.getAllMilestones();
  const recommendations = assessmentAnalytics.getRecommendations();
  const unviewedMilestones = assessmentAnalytics.getUnviewedMilestones();

  // Prepare chart data
  const categoryDistributionData = Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const categoryAnalytics = analytics.filter(a => a.primaryArea === key || a.secondaryArea === key);
    return {
      name: label,
      value: categoryAnalytics.length,
      color: CATEGORY_COLORS[key as SinCategory]
    };
  });

  const progressChartData = trends.slice(0, 5).map(trend => ({
    category: CATEGORY_LABELS[trend.category],
    current: trend.scores.length > 0 ? trend.scores[trend.scores.length - 1].score : 0,
    trend: trend.changePercentage,
    status: trend.trend
  }));

  const streakChartData = streaks.map(streak => ({
    category: CATEGORY_LABELS[streak.category],
    current: streak.currentStreak,
    longest: streak.longestStreak,
    total: streak.totalAssessments
  }));

  const markMilestoneViewed = (milestoneId: string) => {
    assessmentAnalytics.markMilestoneViewed(milestoneId);
    loadAnalyticsData();
  };

  const completeRecommendation = (recommendationId: string) => {
    assessmentAnalytics.completeRecommendation(recommendationId);
    loadAnalyticsData();
  };

  const handleStartChallenge = (rec: any) => {
    if (rec.goalId && rec.duration) {
      // Navigate to create challenge/goal with pre-filled data
      const goalData = {
        goalId: rec.goalId,
        duration: rec.duration,
        category: rec.category,
        title: rec.title
      };
      // Store in localStorage for the challenge creation page to pick up
      localStorage.setItem('pending_challenge_data', JSON.stringify(goalData));
      window.location.href = '/challenges';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAssessments || 0}</div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.longestOverallStreak || 0}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.currentActiveStreaks || 0}</div>
            <div className="text-sm text-gray-600">Active Streaks</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalMilestones || 0}</div>
            <div className="text-sm text-gray-600">Milestones Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* New Milestones Alert */}
      {unviewedMilestones.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Trophy className="h-5 w-5" />
              New Milestone{unviewedMilestones.length > 1 ? 's' : ''} Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unviewedMilestones.slice(0, 3).map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <div className="font-semibold text-yellow-800">{milestone.title}</div>
                    <div className="text-sm text-yellow-600">{milestone.description}</div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => markMilestoneViewed(milestone.id)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {unviewedMilestones.length > 3 && (
                <div className="text-center text-sm text-yellow-700">
                  +{unviewedMilestones.length - 3} more milestones
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="recommendations">Guidance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Focus Areas Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.slice(0, 5).map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{CATEGORY_LABELS[assessment.primaryArea]}</div>
                        <div className="text-sm text-gray-600">
                          {assessment.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={assessment.assessmentType === 'full' ? 'default' : 'secondary'}>
                        {assessment.assessmentType === 'full' ? 'Complete' : 'Focused'}
                      </Badge>
                    </div>
                  ))}
                  {analytics.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No assessments completed yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="current" 
                      fill="#3b82f6"
                      name="Current Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Individual Progress Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.filter(trend => trend.scores.length > 0).map(trend => (
              <Card key={trend.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{CATEGORY_LABELS[trend.category]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Trend</span>
                    <div className="flex items-center gap-1">
                      {trend.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {trend.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      <span className={`text-sm font-medium ${
                        trend.trend === 'improving' ? 'text-green-600' : 
                        trend.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trend.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-1">
                    {trend.scores.length > 0 ? trend.scores[trend.scores.length - 1].score.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {trend.scores.length} assessment{trend.scores.length !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Assessment Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streakChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#10b981" name="Current Streak" />
                    <Bar dataKey="longest" fill="#3b82f6" name="Longest Streak" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Milestone History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Milestones Achieved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.milestoneType === 'streak' ? 'bg-green-100 text-green-600' :
                      milestone.milestoneType === 'improvement' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {milestone.milestoneType === 'streak' ? <Zap className="h-5 w-5" /> :
                       milestone.milestoneType === 'improvement' ? <TrendingUp className="h-5 w-5" /> :
                       <Star className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{milestone.title}</div>
                      <div className="text-sm text-gray-600">{milestone.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {milestone.unlockedAt.toLocaleDateString()}
                      </div>
                    </div>
                    {!milestone.isViewed && (
                      <Badge variant="default" className="bg-yellow-500">New</Badge>
                    )}
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Complete more assessments to unlock milestones
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.slice(0, 10).map(rec => (
                  <div key={rec.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: CATEGORY_COLORS[rec.category],
                            color: CATEGORY_COLORS[rec.category]
                          }}
                        >
                          {CATEGORY_LABELS[rec.category]}
                        </Badge>
                        <Badge variant={rec.priority >= 8 ? 'destructive' : rec.priority >= 6 ? 'default' : 'secondary'}>
                          Priority {rec.priority}
                        </Badge>
                        {(rec as any).itemType && (
                          <Badge variant="outline" className="capitalize">
                            {(rec as any).itemType === 'goal' ? '🎯 Goal' : '⚡ Challenge'}
                          </Badge>
                        )}
                        {(rec as any).duration && (
                          <Badge variant="secondary">
                            {(rec as any).duration} days
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {rec.recommendationType === 'lesson' && <BookOpen className="h-4 w-4" />}
                        {rec.recommendationType === 'challenge' && <Target className="h-4 w-4" />}
                        {rec.recommendationType === 'practice' && <Star className="h-4 w-4" />}
                      </div>
                    </div>
                    
                    {(rec as any).title && (
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {(rec as any).title}
                      </h4>
                    )}
                    
                    {(rec as any).description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {(rec as any).description}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-700 mb-4 italic">
                      {rec.reason}
                    </div>
                    
                    {(rec as any).goalId && (rec as any).duration && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartChallenge(rec)}
                        className="w-full bg-red-600 hover:bg-red-700"
                        data-testid={`button-start-challenge-${rec.id}`}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Start {(rec as any).itemType === 'goal' ? 'Goal' : 'Challenge'}
                      </Button>
                    )}
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Complete an assessment to receive personalized recommendations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}