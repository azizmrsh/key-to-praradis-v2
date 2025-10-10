import { 
  SinCategory, 
  ScoreScale, 
  SelfAssessmentResponse, 
  SelfAssessmentResult 
} from '@/data/selfAssessmentData';
import { secureStorage } from '@/lib/storage';
import unifiedGoalsData from '@/data/unifiedGoals.json';

// Types for analytics
export type CategoryScores = Record<SinCategory, number>;

export interface AssessmentAnalytics {
  id: string;
  userId: number;
  assessmentType: 'full' | 'single_category';
  targetCategory?: SinCategory;
  scores: CategoryScores;
  primaryArea: SinCategory;
  secondaryArea?: SinCategory;
  totalQuestions: number;
  completionTime?: number; // seconds
  createdAt: Date;
}

export interface AssessmentStreak {
  category: SinCategory;
  currentStreak: number;
  longestStreak: number;
  lastAssessmentDate?: Date;
  totalAssessments: number;
}

export interface AssessmentMilestone {
  id: string;
  milestoneType: 'streak' | 'improvement' | 'consistency';
  category?: SinCategory;
  title: string;
  description: string;
  value?: number;
  unlockedAt: Date;
  isViewed: boolean;
}

export interface PersonalizedRecommendation {
  id: string;
  category: SinCategory;
  recommendationType: 'lesson' | 'practice' | 'challenge';
  itemType: 'challenge' | 'goal'; // Whether this is a challenge or goal
  goalId?: string; // ID from unifiedGoals.json
  duration?: number; // Duration in days
  title?: string; // Title of the challenge/goal
  description?: string; // Description
  contentId?: number;
  priority: number; // 1-10
  reason: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ProgressTrend {
  category: SinCategory;
  scores: Array<{ date: Date; score: number }>;
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
}

// Storage keys
const ANALYTICS_KEY = 'assessment_analytics';
const STREAKS_KEY = 'assessment_streaks';
const MILESTONES_KEY = 'assessment_milestones';
const RECOMMENDATIONS_KEY = 'assessment_recommendations';

class AssessmentAnalyticsService {
  private analytics: AssessmentAnalytics[] = [];
  private streaks: Map<SinCategory, AssessmentStreak> = new Map();
  private milestones: AssessmentMilestone[] = [];
  private recommendations: PersonalizedRecommendation[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      // Load analytics history
      const analyticsData = secureStorage.getItem(ANALYTICS_KEY, '[]');
      if (analyticsData && analyticsData !== '[]') {
        this.analytics = JSON.parse(analyticsData).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
      }

      // Load streaks
      const streaksData = secureStorage.getItem(STREAKS_KEY, '[]');
      if (streaksData && streaksData !== '[]') {
        const streaksArray = JSON.parse(streaksData);
        streaksArray.forEach((streak: any) => {
          this.streaks.set(streak.category, {
            ...streak,
            lastAssessmentDate: streak.lastAssessmentDate ? new Date(streak.lastAssessmentDate) : undefined
          });
        });
      }

      // Load milestones
      const milestonesData = secureStorage.getItem(MILESTONES_KEY, '[]');
      if (milestonesData && milestonesData !== '[]') {
        this.milestones = JSON.parse(milestonesData).map((item: any) => ({
          ...item,
          unlockedAt: new Date(item.unlockedAt)
        }));
      }

      // Load recommendations
      const recommendationsData = secureStorage.getItem(RECOMMENDATIONS_KEY, '[]');
      if (recommendationsData && recommendationsData !== '[]') {
        this.recommendations = JSON.parse(recommendationsData).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading assessment analytics data:', error);
    }
  }

  private saveData() {
    try {
      secureStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.analytics));
      secureStorage.setItem(STREAKS_KEY, JSON.stringify(Array.from(this.streaks.values())));
      secureStorage.setItem(MILESTONES_KEY, JSON.stringify(this.milestones));
      secureStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(this.recommendations));
    } catch (error) {
      console.error('Error saving assessment analytics data:', error);
    }
  }

  // Record a completed assessment
  recordAssessment(
    result: SelfAssessmentResult,
    assessmentType: 'full' | 'single_category',
    targetCategory?: SinCategory,
    totalQuestions: number = 0,
    completionTime?: number
  ) {
    const analytics: AssessmentAnalytics = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 1, // Default user for now
      assessmentType,
      targetCategory,
      scores: result.categoryScores,
      primaryArea: result.primaryStruggle,
      secondaryArea: result.secondaryStruggle,
      totalQuestions,
      completionTime,
      createdAt: new Date()
    };

    this.analytics.push(analytics);
    this.updateStreaks(result.primaryStruggle, result.secondaryStruggle);
    this.checkForMilestones();
    this.generateRecommendations(result);
    this.saveData();
  }

  // Update streak tracking
  private updateStreaks(primaryArea: SinCategory, secondaryArea?: SinCategory) {
    const today = new Date();
    const categories = [primaryArea];
    if (secondaryArea) categories.push(secondaryArea);

    categories.forEach(category => {
      let streak = this.streaks.get(category) || {
        category,
        currentStreak: 0,
        longestStreak: 0,
        totalAssessments: 0
      };

      const daysSinceLastAssessment = streak.lastAssessmentDate 
        ? Math.floor((today.getTime() - streak.lastAssessmentDate.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      if (daysSinceLastAssessment <= 7) {
        // Within a week - continue streak
        streak.currentStreak += 1;
      } else {
        // Reset streak
        streak.currentStreak = 1;
      }

      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.totalAssessments += 1;
      streak.lastAssessmentDate = today;

      this.streaks.set(category, streak);
    });
  }

  // Check for new milestones
  private checkForMilestones() {
    const existingMilestones = new Set(this.milestones.map(m => `${m.milestoneType}_${m.category}_${m.value}`));

    // Check streak milestones
    Array.from(this.streaks.entries()).forEach(([category, streak]) => {
      const streakMilestones = [5, 10, 20, 30, 50, 100];
      
      for (const milestone of streakMilestones) {
        if (streak.currentStreak >= milestone) {
          const key = `streak_${category}_${milestone}`;
          if (!existingMilestones.has(key)) {
            this.milestones.push({
              id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              milestoneType: 'streak',
              category,
              title: `${milestone} Day ${category.charAt(0).toUpperCase() + category.slice(1)} Streak!`,
              description: `You've maintained focus on ${category} improvement for ${milestone} consecutive assessments!`,
              value: milestone,
              unlockedAt: new Date(),
              isViewed: false
            });
          }
        }
      }
    });

    // Check improvement milestones
    this.checkImprovementMilestones();

    // Check consistency milestones
    this.checkConsistencyMilestones();
  }

  private checkImprovementMilestones() {
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'heart', 'pride', 'stomach', 'zina'];
    
    categories.forEach(category => {
      const categoryAnalytics = this.analytics
        .filter(a => a.scores[category] !== undefined)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      if (categoryAnalytics.length >= 3) {
        const recent = categoryAnalytics.slice(-3);
        const improvement = ((recent[2].scores[category] - recent[0].scores[category]) / recent[0].scores[category]) * 100;

        if (improvement <= -20) { // 20% improvement (lower scores are better)
          const key = `improvement_${category}_20`;
          const existingMilestones = new Set(this.milestones.map(m => `${m.milestoneType}_${m.category}_${m.value}`));
          
          if (!existingMilestones.has(key)) {
            this.milestones.push({
              id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              milestoneType: 'improvement',
              category,
              title: `Significant Progress in ${category.charAt(0).toUpperCase() + category.slice(1)}!`,
              description: `You've improved your ${category} score by ${Math.abs(improvement).toFixed(1)}% over recent assessments!`,
              value: Math.floor(Math.abs(improvement)),
              unlockedAt: new Date(),
              isViewed: false
            });
          }
        }
      }
    });
  }

  private checkConsistencyMilestones() {
    const totalAssessments = this.analytics.length;
    const consistencyMilestones = [7, 14, 30, 60, 90];

    for (const milestone of consistencyMilestones) {
      if (totalAssessments >= milestone) {
        const key = `consistency_total_${milestone}`;
        const existingMilestones = new Set(this.milestones.map(m => `${m.milestoneType}_${m.category}_${m.value}`));
        
        if (!existingMilestones.has(key)) {
          this.milestones.push({
            id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            milestoneType: 'consistency',
            title: `${milestone} Assessments Completed!`,
            description: `Your commitment to self-improvement is inspiring! You've completed ${milestone} spiritual assessments.`,
            value: milestone,
            unlockedAt: new Date(),
            isViewed: false
          });
        }
      }
    }
  }

  // Generate personalized recommendations
  private generateRecommendations(result: SelfAssessmentResult) {
    const categories = [result.primaryStruggle];
    if (result.secondaryStruggle) categories.push(result.secondaryStruggle);

    // Count completed challenges
    const completedChallengesCount = this.recommendations.filter(
      r => r.itemType === 'challenge' && r.isCompleted
    ).length;

    // For every 5 completed challenges: add 1 goal, remove 1 challenge suggestion
    const challengesPerCategory = Math.max(1, 2 - Math.floor(completedChallengesCount / 5));
    const shouldAddGoal = completedChallengesCount > 0 && completedChallengesCount % 5 === 0;

    // Clear old non-completed recommendations before generating new ones
    this.recommendations = this.recommendations.filter(r => r.isCompleted);

    // Get challenges from unifiedGoals.json for each focus area
    categories.forEach((category, categoryIndex) => {
      // Get goals for this category with 1-7 day durations
      const categoryGoals = (unifiedGoalsData.goals as any[]).filter(
        (goal: any) => goal.category === category
      );

      // Get short challenges (1-7 days) from this category
      const shortChallenges = categoryGoals.filter((goal: any) => 
        goal.duration_options && goal.duration_options.some((d: number) => d >= 1 && d <= 7)
      );

      // Add challengesPerCategory challenges from this category
      const selectedChallenges = shortChallenges.slice(0, challengesPerCategory);
      
      selectedChallenges.forEach((challenge: any, index: number) => {
        const shortDuration = challenge.duration_options.find((d: number) => d >= 1 && d <= 7) || 7;
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translation = challenge.translations[currentLang] || challenge.translations.en;

        this.recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`,
          category,
          recommendationType: 'challenge',
          itemType: 'challenge',
          goalId: challenge.goal_id,
          duration: shortDuration,
          title: translation.title,
          description: translation.description,
          priority: 10 - (categoryIndex * 2) - index,
          reason: `Start a ${shortDuration}-day challenge to improve in ${category}.`,
          isCompleted: false,
          createdAt: new Date()
        });
      });
    });

    // Add a goal recommendation if threshold reached
    if (shouldAddGoal && categories.length > 0) {
      const primaryCategory = categories[0];
      const categoryGoals = (unifiedGoalsData.goals as any[]).filter(
        (goal: any) => goal.category === primaryCategory
      );

      if (categoryGoals.length > 0) {
        const selectedGoal = categoryGoals[Math.floor(Math.random() * Math.min(3, categoryGoals.length))];
        const longerDuration = selectedGoal.duration_options?.find((d: number) => d > 7) || 21;
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translation = selectedGoal.translations[currentLang] || selectedGoal.translations.en;

        this.recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_goal`,
          category: primaryCategory,
          recommendationType: 'challenge',
          itemType: 'goal',
          goalId: selectedGoal.goal_id,
          duration: longerDuration,
          title: translation.title,
          description: translation.description,
          priority: 9,
          reason: `Congratulations on completing ${completedChallengesCount} challenges! Ready for a longer ${longerDuration}-day goal?`,
          isCompleted: false,
          createdAt: new Date()
        });
      }
    }

    // Keep only the most recent 20 recommendations (including completed)
    this.recommendations = this.recommendations
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
  }

  // Get analytics data
  getAnalyticsHistory(): AssessmentAnalytics[] {
    return [...this.analytics].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getStreaks(): AssessmentStreak[] {
    return Array.from(this.streaks.values());
  }

  getUnviewedMilestones(): AssessmentMilestone[] {
    return this.milestones.filter(m => !m.isViewed);
  }

  getAllMilestones(): AssessmentMilestone[] {
    return [...this.milestones].sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  getRecommendations(): PersonalizedRecommendation[] {
    return this.recommendations
      .filter(r => !r.isCompleted)
      .sort((a, b) => b.priority - a.priority);
  }

  // Get progress trends
  getProgressTrends(): ProgressTrend[] {
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'heart', 'pride', 'stomach', 'zina'];
    
    return categories.map(category => {
      const scores = this.analytics
        .filter(a => a.scores[category] !== undefined)
        .map(a => ({
          date: a.createdAt,
          score: a.scores[category]
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      let changePercentage = 0;

      if (scores.length >= 2) {
        const first = scores[0].score;
        const last = scores[scores.length - 1].score;
        changePercentage = ((last - first) / first) * 100;

        if (changePercentage < -10) {
          trend = 'improving'; // Lower scores are better
        } else if (changePercentage > 10) {
          trend = 'declining';
        }
      }

      return {
        category,
        scores,
        trend,
        changePercentage: Math.abs(changePercentage)
      };
    });
  }

  // Mark milestone as viewed
  markMilestoneViewed(milestoneId: string) {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.isViewed = true;
      this.saveData();
    }
  }

  // Complete recommendation
  completeRecommendation(recommendationId: string) {
    const recommendation = this.recommendations.find(r => r.id === recommendationId);
    if (recommendation) {
      recommendation.isCompleted = true;
      recommendation.completedAt = new Date();
      this.saveData();
    }
  }

  // Get statistics
  getStatistics() {
    const totalAssessments = this.analytics.length;
    const streakData = Array.from(this.streaks.values());
    const longestOverallStreak = Math.max(0, ...streakData.map(s => s.longestStreak));
    const currentActiveStreaks = streakData.filter(s => s.currentStreak > 0).length;
    const totalMilestones = this.milestones.length;
    const unviewedMilestones = this.milestones.filter(m => !m.isViewed).length;

    return {
      totalAssessments,
      longestOverallStreak,
      currentActiveStreaks,
      totalMilestones,
      unviewedMilestones,
      averageAssessmentsPerWeek: this.calculateAverageAssessmentsPerWeek()
    };
  }

  private calculateAverageAssessmentsPerWeek(): number {
    if (this.analytics.length === 0) return 0;

    const firstAssessment = this.analytics[this.analytics.length - 1].createdAt;
    const now = new Date();
    const weeksDiff = (now.getTime() - firstAssessment.getTime()) / (1000 * 60 * 60 * 24 * 7);

    return weeksDiff > 0 ? this.analytics.length / weeksDiff : this.analytics.length;
  }

  // Reset all data
  resetAllData() {
    this.analytics = [];
    this.streaks.clear();
    this.milestones = [];
    this.recommendations = [];
    this.saveData();
  }
}

// Create and export singleton instance
export const assessmentAnalytics = new AssessmentAnalyticsService();