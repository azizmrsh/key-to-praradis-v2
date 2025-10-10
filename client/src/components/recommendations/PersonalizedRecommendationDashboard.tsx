import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Star, 
  ChevronRight, 
  BookOpen, 
  Heart,
  Award,
  Flame,
  BarChart3,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  recommendationEngine, 
  type PersonalizedRecommendations,
  type GoalRecommendation,
  type CategoryInsight 
} from '@/lib/recommendationEngine';
import { progressTracker } from '@/lib/progressTracking';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { challengeSystem } from '@/lib/challengeSystem';
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { useTranslation } from 'react-i18next';

interface PersonalizedRecommendationDashboardProps {
  onGoalSelect: (goalId: string) => void;
  onChallengeCreate: (goalId: string, duration: number) => void;
  className?: string;
}

export function PersonalizedRecommendationDashboard({ 
  onGoalSelect, 
  onChallengeCreate,
  className = '' 
}: PersonalizedRecommendationDashboardProps) {
  const { t } = useTranslation();
  const { results, responses } = useSelfAssessment();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SinCategory | null>(null);

  useEffect(() => {
    if (results && responses) {
      setLoading(true);
      try {
        const personalizedRecs = recommendationEngine.generatePersonalizedRecommendations(
          results,
          responses
        );
        setRecommendations(personalizedRecs);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [results, responses]);

  const handleStartGoal = (goalId: string, duration: number) => {
    onChallengeCreate(goalId, duration);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Complete Your Assessment</h3>
              <p className="text-gray-600">
                Take the spiritual assessment to receive personalized recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header with Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Spiritual Journey</h2>
                <p className="text-gray-600">{recommendations.motivationalMessage}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {recommendations.overallProgress.spiritualGrowthScore}%
                </div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Growth Score</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.overallProgress.spiritualGrowthScore}%
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Consistency</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.overallProgress.consistencyScore}%
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Improvement</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {recommendations.overallProgress.improvementRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="primary">Primary Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended Goals for You
            </h3>
            
            <div className="space-y-4">
              {recommendations.primaryGoals.map((goal, index) => (
                <GoalRecommendationCard
                  key={goal.goalId}
                  goal={goal}
                  index={index}
                  onStart={handleStartGoal}
                />
              ))}
            </div>

            {recommendations.secondaryGoals.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium mb-4 text-gray-700">
                  Additional Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.secondaryGoals.slice(0, 4).map((goal, index) => (
                    <GoalRecommendationCard
                      key={goal.goalId}
                      goal={goal}
                      index={index}
                      onStart={handleStartGoal}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spiritual Insights
            </h3>
            
            <div className="space-y-4">
              {recommendations.insights.map((insight, index) => (
                <CategoryInsightCard
                  key={insight.category}
                  insight={insight}
                  index={index}
                  onCategorySelect={setSelectedCategory}
                />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="next-steps" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Your Next Steps
            </h3>
            
            <div className="space-y-3">
              {recommendations.nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Goal Recommendation Card Component
function GoalRecommendationCard({ 
  goal, 
  index, 
  onStart, 
  variant = 'default' 
}: { 
  goal: GoalRecommendation; 
  index: number; 
  onStart: (goalId: string, duration: number) => void;
  variant?: 'default' | 'compact';
}) {
  const [selectedDuration, setSelectedDuration] = useState(goal.estimatedDuration);
  const categoryColor = getCategoryColor(goal.category);

  const handleStart = () => {
    onStart(goal.goalId, selectedDuration);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`hover:shadow-lg transition-shadow ${variant === 'compact' ? 'p-4' : ''}`}>
        <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className={`w-1 h-6 rounded-full`}
                  style={{ backgroundColor: categoryColor }}
                />
                <Badge variant="secondary" className="text-xs">
                  {goal.category}
                </Badge>
                <Badge 
                  variant={goal.priority === 'high' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {goal.priority} priority
                </Badge>
              </div>
              
              <CardTitle className={variant === 'compact' ? 'text-lg' : 'text-xl'}>
                {goal.goalId.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </CardTitle>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {Math.round(goal.confidence * 100)}% match
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {goal.difficultyLevel}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {selectedDuration}
              </div>
              <div className="text-sm text-gray-500">days</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
          <p className="text-gray-600 mb-4">{goal.reason}</p>
          
          {variant === 'default' && goal.specificReasons.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2">Why this goal is recommended:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {goal.specificReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Duration:</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={40}>40 days</option>
              </select>
            </div>
            
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Start Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Category Insight Card Component
function CategoryInsightCard({ 
  insight, 
  index, 
  onCategorySelect 
}: { 
  insight: CategoryInsight; 
  index: number; 
  onCategorySelect: (category: SinCategory) => void;
}) {
  const categoryColor = getCategoryColor(insight.category);
  const trendIcon = insight.trendDirection === 'improving' ? TrendingUp : 
                   insight.trendDirection === 'declining' ? TrendingUp : 
                   BarChart3;
  const trendColor = insight.trendDirection === 'improving' ? 'text-green-600' : 
                    insight.trendDirection === 'declining' ? 'text-red-600' : 
                    'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCategorySelect(insight.category)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />
                {categoryInfo[insight.category].title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {insight.answeredQuestions} of {insight.totalQuestions} questions answered
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {insight.averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">avg score</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{Math.round((5 - insight.averageScore) * 20)}%</span>
            </div>
            <Progress value={(5 - insight.averageScore) * 20} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`${trendColor}`}>
                <trendIcon className="h-4 w-4" />
              </div>
              <span className={`text-sm font-medium ${trendColor}`}>
                {insight.trendDirection}
              </span>
            </div>
            
            {insight.recommendedFocus && (
              <Badge variant="destructive" className="text-xs">
                Needs Focus
              </Badge>
            )}
          </div>
          
          {insight.improvementAreas.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h5 className="font-medium text-sm mb-2">Areas for improvement:</h5>
              <div className="flex flex-wrap gap-1">
                {insight.improvementAreas.slice(0, 3).map((area, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to get category colors
function getCategoryColor(category: SinCategory): string {
  const colors = {
    tongue: '#ef4444',
    eyes: '#3b82f6',
    ears: '#8b5cf6',
    pride: '#f59e0b',
    stomach: '#10b981',
    zina: '#ec4899',
    heart: '#6366f1'
  };
  return colors[category] || '#6b7280';
}