import { 
  SinCategory, 
  SelfAssessmentResponse, 
  SelfAssessmentResult,
  selfAssessmentQuestions,
  QuestionType
} from '@/data/selfAssessmentData';
import { secureStorage } from '@/lib/storage';
import { AssessmentAnalytics, assessmentAnalytics } from '@/lib/assessmentAnalytics';
import unifiedGoalsData from '@/data/unifiedGoals.json';

// Types for recommendation engine
export interface GoalRecommendation {
  goalId: string;
  category: SinCategory;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1 scale
  reason: string;
  specificReasons: string[];
  estimatedDuration: number; // recommended days
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  relatedQuestions: string[];
}

export interface CategoryInsight {
  category: SinCategory;
  averageScore: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  recentPerformance: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendedFocus: boolean;
  totalQuestions: number;
  answeredQuestions: number;
}

export interface PersonalizedRecommendations {
  primaryGoals: GoalRecommendation[];
  secondaryGoals: GoalRecommendation[];
  insights: CategoryInsight[];
  overallProgress: {
    spiritualGrowthScore: number;
    consistencyScore: number;
    improvementRate: number;
  };
  nextSteps: string[];
  motivationalMessage: string;
}

// Storage keys
const RECOMMENDATION_HISTORY_KEY = 'recommendation_history';
const USER_PREFERENCES_KEY = 'user_preferences';

interface UserPreferences {
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  preferredDuration: number;
  focusCategories: SinCategory[];
  avoidCategories: SinCategory[];
  lastUpdated: Date;
}

class RecommendationEngine {
  private userPreferences: UserPreferences | null = null;
  private recommendationHistory: GoalRecommendation[] = [];

  constructor() {
    this.loadUserPreferences();
    this.loadRecommendationHistory();
  }

  private loadUserPreferences() {
    const preferences = secureStorage.getItem<UserPreferences>(USER_PREFERENCES_KEY, null);
    if (preferences) {
      this.userPreferences = {
        ...preferences,
        lastUpdated: new Date(preferences.lastUpdated)
      };
    }
  }

  private loadRecommendationHistory() {
    const history = secureStorage.getItem<GoalRecommendation[]>(RECOMMENDATION_HISTORY_KEY, []);
    this.recommendationHistory = history.map(rec => ({
      ...rec,
      // Ensure all required fields are present
      specificReasons: rec.specificReasons || [],
      relatedQuestions: rec.relatedQuestions || []
    }));
  }

  private saveUserPreferences() {
    if (this.userPreferences) {
      secureStorage.setItem(USER_PREFERENCES_KEY, this.userPreferences);
    }
  }

  private saveRecommendationHistory() {
    secureStorage.setItem(RECOMMENDATION_HISTORY_KEY, this.recommendationHistory);
  }

  // Calculate category insights from assessment data
  private calculateCategoryInsights(
    responses: SelfAssessmentResponse[],
    assessmentHistory: AssessmentAnalytics[]
  ): CategoryInsight[] {
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    const insights: CategoryInsight[] = [];

    categories.forEach(category => {
      const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === category);
      const categoryResponses = responses.filter(r => 
        categoryQuestions.some(q => q.id === r.questionId)
      );

      const totalQuestions = categoryQuestions.length;
      const answeredQuestions = categoryResponses.length;
      const averageScore = answeredQuestions > 0 
        ? categoryResponses.reduce((sum, r) => sum + r.score, 0) / answeredQuestions 
        : 0;

      // Calculate trend from history
      const recentHistory = assessmentHistory
        .filter(h => h.scores[category] !== undefined)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3);

      let trendDirection: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentHistory.length >= 2) {
        const recent = recentHistory[0].scores[category];
        const previous = recentHistory[1].scores[category];
        const threshold = 0.3; // 30% change threshold

        if (recent < previous - threshold) {
          trendDirection = 'improving'; // Lower scores are better
        } else if (recent > previous + threshold) {
          trendDirection = 'declining';
        }
      }

      // Analyze specific strengths and weaknesses
      const strengthAreas: string[] = [];
      const improvementAreas: string[] = [];

      categoryResponses.forEach(response => {
        const question = categoryQuestions.find(q => q.id === response.questionId);
        if (question) {
          if (response.score <= 2) {
            strengthAreas.push(question.section || 'General');
          } else if (response.score >= 4) {
            improvementAreas.push(question.section || 'General');
          }
        }
      });

      insights.push({
        category,
        averageScore,
        trendDirection,
        recentPerformance: recentHistory.length > 0 ? recentHistory[0].scores[category] : averageScore,
        strengthAreas: [...new Set(strengthAreas)], // Remove duplicates
        improvementAreas: [...new Set(improvementAreas)], // Remove duplicates
        recommendedFocus: averageScore >= 3.5 || trendDirection === 'declining',
        totalQuestions,
        answeredQuestions
      });
    });

    return insights.sort((a, b) => b.averageScore - a.averageScore);
  }

  // Generate goal recommendations based on assessment results
  private generateGoalRecommendations(
    insights: CategoryInsight[],
    assessmentResult: SelfAssessmentResult
  ): { primary: GoalRecommendation[]; secondary: GoalRecommendation[] } {
    const primaryGoals: GoalRecommendation[] = [];
    const secondaryGoals: GoalRecommendation[] = [];

    // Focus on top problem areas
    const focusCategories = insights
      .filter(i => i.recommendedFocus)
      .slice(0, 3) // Top 3 problem areas
      .map(i => i.category);

    // Get goals for each focus category
    focusCategories.forEach(category => {
      const categoryGoals = unifiedGoalsData.goals.filter(g => g.category === category);
      const insight = insights.find(i => i.category === category)!;
      
      // Select best goals for this category
      const recommendedGoals = this.selectBestGoalsForCategory(
        categoryGoals,
        insight,
        assessmentResult
      );

      // Add to primary or secondary based on priority
      recommendedGoals.forEach(goal => {
        if (goal.priority === 'high') {
          primaryGoals.push(goal);
        } else {
          secondaryGoals.push(goal);
        }
      });
    });

    // Sort by confidence and priority
    primaryGoals.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });

    secondaryGoals.sort((a, b) => b.confidence - a.confidence);

    return {
      primary: primaryGoals.slice(0, 3), // Top 3 primary goals
      secondary: secondaryGoals.slice(0, 5) // Top 5 secondary goals
    };
  }

  // Select best goals for a specific category
  private selectBestGoalsForCategory(
    categoryGoals: any[],
    insight: CategoryInsight,
    assessmentResult: SelfAssessmentResult
  ): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];
    
    // Analyze specific problem areas from improvement areas
    const problemAreas = insight.improvementAreas;
    const userDifficulty = this.userPreferences?.preferredDifficulty || 'beginner';
    
    categoryGoals.forEach(goal => {
      const goalId = goal.goal_id;
      const category = goal.category as SinCategory;
      
      // Calculate priority based on multiple factors
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let confidence = 0.5;
      const reasons: string[] = [];
      const relatedQuestions: string[] = [];

      // Check if goal addresses specific problem areas
      const goalTitle = goal.translations.en.title.toLowerCase();
      const goalDescription = goal.translations.en.description.toLowerCase();
      
      problemAreas.forEach(area => {
        if (goalTitle.includes(area.toLowerCase()) || goalDescription.includes(area.toLowerCase())) {
          confidence += 0.2;
          reasons.push(`Addresses your challenge with ${area}`);
        }
      });

      // Factor in category score
      if (insight.averageScore >= 4.0) {
        priority = 'high';
        confidence += 0.3;
        reasons.push('High priority due to significant struggle in this area');
      } else if (insight.averageScore >= 3.0) {
        priority = 'medium';
        confidence += 0.2;
        reasons.push('Moderate priority for spiritual improvement');
      } else {
        priority = 'low';
        confidence += 0.1;
        reasons.push('Lower priority but beneficial for continued growth');
      }

      // Consider trend
      if (insight.trendDirection === 'declining') {
        confidence += 0.2;
        reasons.push('Recommended due to recent decline in this area');
      } else if (insight.trendDirection === 'improving') {
        confidence += 0.1;
        reasons.push('Builds on your recent improvement');
      }

      // Find related questions
      const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === category);
      categoryQuestions.forEach(q => {
        if (goalTitle.includes(q.text.toLowerCase().split(' ')[0]) || 
            goalDescription.includes(q.text.toLowerCase().split(' ')[0])) {
          relatedQuestions.push(q.id);
        }
      });

      // Determine difficulty level
      let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (goal.duration_options.includes(40)) {
        difficultyLevel = 'advanced';
      } else if (goal.duration_options.includes(21)) {
        difficultyLevel = 'intermediate';
      }

      // Adjust confidence based on user preferences
      if (this.userPreferences?.preferredDifficulty === difficultyLevel) {
        confidence += 0.1;
      }

      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);

      // Determine recommended duration
      let estimatedDuration = 21; // Default
      if (userDifficulty === 'beginner') {
        estimatedDuration = Math.min(...goal.duration_options);
      } else if (userDifficulty === 'advanced') {
        estimatedDuration = Math.max(...goal.duration_options);
      }

      recommendations.push({
        goalId,
        category,
        priority,
        confidence,
        reason: reasons.length > 0 ? reasons[0] : 'Recommended for spiritual growth',
        specificReasons: reasons,
        estimatedDuration,
        difficultyLevel,
        relatedQuestions
      });
    });

    // Return top recommendations for this category
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3 per category
  }

  // Generate personalized recommendations
  public generatePersonalizedRecommendations(
    assessmentResult: SelfAssessmentResult,
    responses: SelfAssessmentResponse[]
  ): PersonalizedRecommendations {
    const assessmentHistory = assessmentAnalytics.getAssessmentHistory();
    const insights = this.calculateCategoryInsights(responses, assessmentHistory);
    const { primary, secondary } = this.generateGoalRecommendations(insights, assessmentResult);

    // Calculate overall progress metrics
    const spiritualGrowthScore = this.calculateSpiritualGrowthScore(insights);
    const consistencyScore = this.calculateConsistencyScore(assessmentHistory);
    const improvementRate = this.calculateImprovementRate(assessmentHistory);

    // Generate next steps
    const nextSteps = this.generateNextSteps(insights, primary);

    // Generate motivational message
    const motivationalMessage = this.generateMotivationalMessage(insights, spiritualGrowthScore);

    // Save recommendations to history
    this.recommendationHistory.push(...primary, ...secondary);
    this.saveRecommendationHistory();

    return {
      primaryGoals: primary,
      secondaryGoals: secondary,
      insights,
      overallProgress: {
        spiritualGrowthScore,
        consistencyScore,
        improvementRate
      },
      nextSteps,
      motivationalMessage
    };
  }

  private calculateSpiritualGrowthScore(insights: CategoryInsight[]): number {
    const totalScore = insights.reduce((sum, insight) => sum + (5 - insight.averageScore), 0);
    return Math.round((totalScore / (insights.length * 5)) * 100);
  }

  private calculateConsistencyScore(history: AssessmentAnalytics[]): number {
    if (history.length < 2) return 0;
    
    const recentAssessments = history.slice(-5); // Last 5 assessments
    const intervals = [];
    
    for (let i = 1; i < recentAssessments.length; i++) {
      const days = Math.abs(
        recentAssessments[i].createdAt.getTime() - recentAssessments[i-1].createdAt.getTime()
      ) / (1000 * 60 * 60 * 24);
      intervals.push(days);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const idealInterval = 7; // Weekly assessments
    const consistency = Math.max(0, 100 - Math.abs(avgInterval - idealInterval) * 5);
    
    return Math.round(consistency);
  }

  private calculateImprovementRate(history: AssessmentAnalytics[]): number {
    if (history.length < 2) return 0;
    
    const recent = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    let improvementCount = 0;
    let totalCategories = 0;
    
    categories.forEach(category => {
      if (recent.scores[category] !== undefined && previous.scores[category] !== undefined) {
        totalCategories++;
        if (recent.scores[category] < previous.scores[category]) { // Lower is better
          improvementCount++;
        }
      }
    });
    
    return totalCategories > 0 ? Math.round((improvementCount / totalCategories) * 100) : 0;
  }

  private generateNextSteps(insights: CategoryInsight[], primaryGoals: GoalRecommendation[]): string[] {
    const steps: string[] = [];
    
    if (primaryGoals.length > 0) {
      steps.push(`Start with "${primaryGoals[0].goalId}" - your highest priority goal`);
    }
    
    const focusCategory = insights.find(i => i.recommendedFocus);
    if (focusCategory) {
      steps.push(`Focus on ${focusCategory.category} improvement for the next 2-3 weeks`);
    }
    
    steps.push('Complete daily spiritual reflections');
    steps.push('Set up prayer time reminders');
    steps.push('Review your progress weekly');
    
    return steps;
  }

  private generateMotivationalMessage(insights: CategoryInsight[], spiritualGrowthScore: number): string {
    if (spiritualGrowthScore >= 80) {
      return "MashAllah! Your spiritual dedication is inspiring. Keep up the excellent work!";
    } else if (spiritualGrowthScore >= 60) {
      return "You're making good progress on your spiritual journey. Stay consistent!";
    } else if (spiritualGrowthScore >= 40) {
      return "Every step forward is progress. Allah sees your efforts and intention.";
    } else {
      return "This is the beginning of your spiritual growth. Trust in Allah's guidance.";
    }
  }

  // Public methods for user preferences
  public updateUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = {
      ...this.userPreferences,
      ...preferences,
      lastUpdated: new Date()
    } as UserPreferences;
    this.saveUserPreferences();
  }

  public getUserPreferences(): UserPreferences | null {
    return this.userPreferences;
  }

  // Get recommendations for a specific category
  public getRecommendationsForCategory(category: SinCategory): GoalRecommendation[] {
    return this.recommendationHistory.filter(rec => rec.category === category);
  }

  // Clear recommendation history
  public clearRecommendationHistory() {
    this.recommendationHistory = [];
    this.saveRecommendationHistory();
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();