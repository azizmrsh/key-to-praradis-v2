import { SinCategory, SelfAssessmentResponse, SelfAssessmentResult } from '@/data/selfAssessmentData';
import { secureStorage } from '@/lib/storage';
import { format, differenceInDays, startOfDay, endOfDay, subDays, addDays } from 'date-fns';

// Types for progress tracking
export interface ProgressSnapshot {
  id: string;
  userId: string;
  date: Date;
  categoryScores: Record<SinCategory, number>;
  overallScore: number;
  completedGoals: string[];
  activeGoals: string[];
  assessmentId?: string;
  notes?: string;
}

export interface StreakData {
  category: SinCategory;
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  streakType: 'daily_goal' | 'weekly_assessment' | 'monthly_review';
  isActive: boolean;
}

export interface Milestone {
  id: string;
  type: 'streak' | 'improvement' | 'goal_completion' | 'assessment_frequency';
  title: string;
  description: string;
  category?: SinCategory;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string;
  iconName: string;
  color: string;
}

export interface ProgressTrend {
  category: SinCategory;
  period: 'week' | 'month' | 'quarter';
  dataPoints: Array<{
    date: Date;
    score: number;
    trend: number; // -1 to 1, negative is improvement
  }>;
  overallTrend: 'improving' | 'stable' | 'declining';
  confidenceLevel: number; // 0-1
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category?: SinCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'sincere';
  iconName: string;
  color: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress?: number; // 0-100
  requirements: string[];
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  categoryProgress: Record<SinCategory, {
    averageScore: number;
    improvement: number;
    goalsCompleted: number;
    totalGoals: number;
  }>;
  overallProgress: {
    spiritualGrowthScore: number;
    consistencyScore: number;
    improvementRate: number;
  };
  achievements: AchievementBadge[];
  streaks: StreakData[];
  nextWeekRecommendations: string[];
}

export interface MonthlyReport extends WeeklyReport {
  monthStart: Date;
  monthEnd: Date;
  quarterlyTrend: ProgressTrend[];
  personalizedInsights: string[];
  islamicGuidance: string[];
  goalReflections: string[];
}

// Storage keys
const PROGRESS_SNAPSHOTS_KEY = 'progress_snapshots';
const STREAKS_KEY = 'progress_streaks';
const MILESTONES_KEY = 'progress_milestones';
const ACHIEVEMENTS_KEY = 'achievement_badges';
const WEEKLY_REPORTS_KEY = 'weekly_reports';
const MONTHLY_REPORTS_KEY = 'monthly_reports';

class ProgressTrackingService {
  private progressSnapshots: ProgressSnapshot[] = [];
  private streaks: Map<string, StreakData> = new Map();
  private milestones: Milestone[] = [];
  private achievements: AchievementBadge[] = [];
  private weeklyReports: WeeklyReport[] = [];
  private monthlyReports: MonthlyReport[] = [];

  constructor() {
    this.loadData();
    this.initializeDefaultMilestones();
    this.initializeDefaultAchievements();
  }

  private loadData() {
    // Load progress snapshots
    const snapshots = secureStorage.getItem<ProgressSnapshot[]>(PROGRESS_SNAPSHOTS_KEY, []);
    this.progressSnapshots = snapshots.map(s => ({ ...s, date: new Date(s.date) }));

    // Load streaks
    const streaksData = secureStorage.getItem<StreakData[]>(STREAKS_KEY, []);
    streaksData.forEach(streak => {
      this.streaks.set(this.getStreakKey(streak.category, streak.streakType), {
        ...streak,
        lastActivity: new Date(streak.lastActivity)
      });
    });

    // Load milestones
    const milestonesData = secureStorage.getItem<Milestone[]>(MILESTONES_KEY, []);
    this.milestones = milestonesData.map(m => ({
      ...m,
      completedAt: m.completedAt ? new Date(m.completedAt) : undefined
    }));

    // Load achievements
    const achievementsData = secureStorage.getItem<AchievementBadge[]>(ACHIEVEMENTS_KEY, []);
    this.achievements = achievementsData.map(a => ({
      ...a,
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
    }));

    // Load reports
    const weeklyData = secureStorage.getItem<WeeklyReport[]>(WEEKLY_REPORTS_KEY, []);
    this.weeklyReports = weeklyData.map(r => ({
      ...r,
      weekStart: new Date(r.weekStart),
      weekEnd: new Date(r.weekEnd)
    }));

    const monthlyData = secureStorage.getItem<MonthlyReport[]>(MONTHLY_REPORTS_KEY, []);
    this.monthlyReports = monthlyData.map(r => ({
      ...r,
      monthStart: new Date(r.monthStart),
      weekStart: new Date(r.weekStart),
      weekEnd: new Date(r.weekEnd)
    }));
  }

  private saveData() {
    secureStorage.setItem(PROGRESS_SNAPSHOTS_KEY, this.progressSnapshots);
    secureStorage.setItem(STREAKS_KEY, Array.from(this.streaks.values()));
    secureStorage.setItem(MILESTONES_KEY, this.milestones);
    secureStorage.setItem(ACHIEVEMENTS_KEY, this.achievements);
    secureStorage.setItem(WEEKLY_REPORTS_KEY, this.weeklyReports);
    secureStorage.setItem(MONTHLY_REPORTS_KEY, this.monthlyReports);
  }

  private getStreakKey(category: SinCategory, type: StreakData['streakType']): string {
    return `${category}_${type}`;
  }

  private initializeDefaultMilestones() {
    const defaultMilestones: Omit<Milestone, 'id' | 'currentValue'>[] = [
      {
        type: 'streak',
        title: 'First Steps',
        description: 'Complete your first goal',
        targetValue: 1,
        isCompleted: false,
        iconName: 'target',
        color: '#22c55e',
        reward: 'Beginner Badge'
      },
      {
        type: 'streak',
        title: 'Consistent Practice',
        description: 'Maintain a 7-day streak',
        targetValue: 7,
        isCompleted: false,
        iconName: 'calendar',
        color: '#3b82f6',
        reward: 'Consistency Badge'
      },
      {
        type: 'improvement',
        title: 'Spiritual Growth',
        description: 'Improve average score by 20%',
        targetValue: 20,
        isCompleted: false,
        iconName: 'trending-up',
        color: '#8b5cf6',
        reward: 'Growth Badge'
      },
      {
        type: 'assessment_frequency',
        title: 'Self-Reflection Master',
        description: 'Complete 5 assessments',
        targetValue: 5,
        isCompleted: false,
        iconName: 'brain',
        color: '#f59e0b',
        reward: 'Reflection Badge'
      }
    ];

    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    
    // Add category-specific milestones
    categories.forEach(category => {
      defaultMilestones.push({
        type: 'goal_completion',
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Master`,
        description: `Complete 3 goals in ${category} category`,
        category,
        targetValue: 3,
        isCompleted: false,
        iconName: 'crown',
        color: '#ef4444',
        reward: `${category} Mastery Badge`
      });
    });

    // Only add milestones that don't already exist
    defaultMilestones.forEach(milestone => {
      const exists = this.milestones.some(m => 
        m.title === milestone.title && m.category === milestone.category
      );
      if (!exists) {
        this.milestones.push({
          ...milestone,
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          currentValue: 0
        });
      }
    });
  }

  private initializeDefaultAchievements() {
    const defaultAchievements: Omit<AchievementBadge, 'id' | 'isUnlocked'>[] = [
      {
        title: 'First Assessment',
        description: 'Complete your first spiritual assessment',
        tier: 'bronze',
        iconName: 'clipboard-check',
        color: '#cd7f32',
        progress: 0,
        requirements: ['Complete 1 assessment']
      },
      {
        title: 'Weekly Warrior',
        description: 'Complete goals for 7 consecutive days',
        tier: 'silver',
        iconName: 'calendar-days',
        color: '#c0c0c0',
        progress: 0,
        requirements: ['Maintain 7-day streak']
      },
      {
        title: 'Monthly Champion',
        description: 'Complete goals for 30 consecutive days',
        tier: 'gold',
        iconName: 'medal',
        color: '#ffd700',
        progress: 0,
        requirements: ['Maintain 30-day streak']
      },
      {
        title: 'Sincere Seeker',
        description: 'Complete 40-day spiritual journey',
        tier: 'sincere',
        iconName: 'heart',
        color: '#4c1d95',
        progress: 0,
        requirements: ['Complete 40-day challenge', 'Maintain consistency']
      }
    ];

    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    
    // Add category-specific achievements
    categories.forEach(category => {
      defaultAchievements.push({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Specialist`,
        description: `Show significant improvement in ${category} category`,
        category,
        tier: 'silver',
        iconName: 'star',
        color: '#c0c0c0',
        progress: 0,
        requirements: [`Improve ${category} score by 30%`]
      });
    });

    // Only add achievements that don't already exist
    defaultAchievements.forEach(achievement => {
      const exists = this.achievements.some(a => 
        a.title === achievement.title && a.category === achievement.category
      );
      if (!exists) {
        this.achievements.push({
          ...achievement,
          id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isUnlocked: false
        });
      }
    });
  }

  // Record progress snapshot
  public recordProgressSnapshot(
    categoryScores: Record<SinCategory, number>,
    completedGoals: string[],
    activeGoals: string[],
    assessmentId?: string,
    notes?: string
  ): ProgressSnapshot {
    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 7;
    
    const snapshot: ProgressSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user', // TODO: Replace with actual user ID
      date: new Date(),
      categoryScores,
      overallScore,
      completedGoals,
      activeGoals,
      assessmentId,
      notes
    };

    this.progressSnapshots.push(snapshot);
    this.saveData();
    
    // Check for milestone and achievement updates
    this.updateMilestones();
    this.updateAchievements();
    
    return snapshot;
  }

  // Update streak data
  public updateStreak(category: SinCategory, type: StreakData['streakType'], completed: boolean = true) {
    const key = this.getStreakKey(category, type);
    const today = startOfDay(new Date());
    
    let streak = this.streaks.get(key);
    if (!streak) {
      streak = {
        category,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: today,
        streakType: type,
        isActive: false
      };
    }

    if (completed) {
      const lastActivityDay = startOfDay(streak.lastActivity);
      const daysSinceLastActivity = differenceInDays(today, lastActivityDay);
      
      if (daysSinceLastActivity === 0) {
        // Already counted today
        return;
      } else if (daysSinceLastActivity === 1) {
        // Consecutive day
        streak.currentStreak++;
      } else {
        // Streak broken, start new one
        streak.currentStreak = 1;
      }
      
      streak.lastActivity = today;
      streak.isActive = true;
      
      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      // Check if streak should be marked as broken
      const daysSinceLastActivity = differenceInDays(today, startOfDay(streak.lastActivity));
      if (daysSinceLastActivity > 1) {
        streak.isActive = false;
      }
    }

    this.streaks.set(key, streak);
    this.saveData();
  }

  // Update milestones based on current progress
  private updateMilestones() {
    this.milestones.forEach(milestone => {
      if (milestone.isCompleted) return;

      let newValue = milestone.currentValue;

      switch (milestone.type) {
        case 'streak':
          // Find the highest current streak
          const relevantStreaks = Array.from(this.streaks.values())
            .filter(s => !milestone.category || s.category === milestone.category);
          const maxStreak = Math.max(...relevantStreaks.map(s => s.currentStreak), 0);
          newValue = maxStreak;
          break;

        case 'goal_completion':
          // Count completed goals in category
          const completedGoals = this.progressSnapshots.reduce((count, snapshot) => {
            if (milestone.category) {
              return count + snapshot.completedGoals.filter(goalId => 
                goalId.startsWith(milestone.category!)
              ).length;
            }
            return count + snapshot.completedGoals.length;
          }, 0);
          newValue = completedGoals;
          break;

        case 'assessment_frequency':
          // Count assessments
          const assessmentCount = this.progressSnapshots.filter(s => s.assessmentId).length;
          newValue = assessmentCount;
          break;

        case 'improvement':
          // Calculate improvement percentage
          if (this.progressSnapshots.length >= 2) {
            const recent = this.progressSnapshots[this.progressSnapshots.length - 1];
            const baseline = this.progressSnapshots[0];
            
            if (milestone.category) {
              const recentScore = recent.categoryScores[milestone.category];
              const baselineScore = baseline.categoryScores[milestone.category];
              if (baselineScore > 0) {
                const improvement = ((baselineScore - recentScore) / baselineScore) * 100;
                newValue = Math.max(0, improvement);
              }
            } else {
              const improvement = ((baseline.overallScore - recent.overallScore) / baseline.overallScore) * 100;
              newValue = Math.max(0, improvement);
            }
          }
          break;
      }

      milestone.currentValue = newValue;
      
      if (newValue >= milestone.targetValue && !milestone.isCompleted) {
        milestone.isCompleted = true;
        milestone.completedAt = new Date();
        
        // Unlock related achievement
        this.unlockAchievement(milestone.reward || milestone.title);
      }
    });
  }

  // Update achievements based on milestones and progress
  private updateAchievements() {
    this.achievements.forEach(achievement => {
      if (achievement.isUnlocked) return;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.title) {
        case 'First Assessment':
          progress = this.progressSnapshots.filter(s => s.assessmentId).length > 0 ? 100 : 0;
          shouldUnlock = progress === 100;
          break;

        case 'Weekly Warrior':
          const weeklyStreaks = Array.from(this.streaks.values())
            .filter(s => s.streakType === 'daily_goal');
          const maxWeeklyStreak = Math.max(...weeklyStreaks.map(s => s.currentStreak), 0);
          progress = Math.min(100, (maxWeeklyStreak / 7) * 100);
          shouldUnlock = maxWeeklyStreak >= 7;
          break;

        case 'Monthly Champion':
          const monthlyStreaks = Array.from(this.streaks.values())
            .filter(s => s.streakType === 'daily_goal');
          const maxMonthlyStreak = Math.max(...monthlyStreaks.map(s => s.currentStreak), 0);
          progress = Math.min(100, (maxMonthlyStreak / 30) * 100);
          shouldUnlock = maxMonthlyStreak >= 30;
          break;

        case 'Sincere Seeker':
          const sincereStreaks = Array.from(this.streaks.values())
            .filter(s => s.streakType === 'daily_goal');
          const maxSincereStreak = Math.max(...sincereStreaks.map(s => s.currentStreak), 0);
          progress = Math.min(100, (maxSincereStreak / 40) * 100);
          shouldUnlock = maxSincereStreak >= 40;
          break;

        default:
          // Category-specific achievements
          if (achievement.category && achievement.title.includes('Specialist')) {
            const categoryProgress = this.calculateCategoryImprovement(achievement.category);
            progress = Math.min(100, (categoryProgress / 30) * 100);
            shouldUnlock = categoryProgress >= 30;
          }
          break;
      }

      achievement.progress = progress;
      
      if (shouldUnlock) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
      }
    });
  }

  private calculateCategoryImprovement(category: SinCategory): number {
    if (this.progressSnapshots.length < 2) return 0;
    
    const recent = this.progressSnapshots[this.progressSnapshots.length - 1];
    const baseline = this.progressSnapshots[0];
    
    const recentScore = recent.categoryScores[category];
    const baselineScore = baseline.categoryScores[category];
    
    if (baselineScore > 0) {
      return ((baselineScore - recentScore) / baselineScore) * 100;
    }
    
    return 0;
  }

  private unlockAchievement(title: string) {
    const achievement = this.achievements.find(a => a.title === title);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();
      achievement.progress = 100;
    }
  }

  // Generate progress trends
  public generateProgressTrends(period: 'week' | 'month' | 'quarter' = 'month'): ProgressTrend[] {
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    const trends: ProgressTrend[] = [];

    const daysBack = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const cutoffDate = subDays(new Date(), daysBack);
    
    const relevantSnapshots = this.progressSnapshots
      .filter(s => s.date >= cutoffDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    categories.forEach(category => {
      const categoryData = relevantSnapshots.map(snapshot => ({
        date: snapshot.date,
        score: snapshot.categoryScores[category] || 0,
        trend: 0 // Will be calculated
      }));

      // Calculate trend values
      for (let i = 1; i < categoryData.length; i++) {
        const current = categoryData[i].score;
        const previous = categoryData[i - 1].score;
        categoryData[i].trend = previous > 0 ? (previous - current) / previous : 0;
      }

      // Determine overall trend
      const recentTrends = categoryData.slice(-5).map(d => d.trend);
      const avgTrend = recentTrends.reduce((sum, t) => sum + t, 0) / recentTrends.length;
      
      let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (avgTrend > 0.1) {
        overallTrend = 'improving';
      } else if (avgTrend < -0.1) {
        overallTrend = 'declining';
      }

      // Calculate confidence based on data consistency
      const trendVariance = recentTrends.reduce((sum, t) => sum + Math.pow(t - avgTrend, 2), 0) / recentTrends.length;
      const confidenceLevel = Math.max(0, Math.min(1, 1 - trendVariance));

      trends.push({
        category,
        period,
        dataPoints: categoryData,
        overallTrend,
        confidenceLevel
      });
    });

    return trends;
  }

  // Generate weekly report
  public generateWeeklyReport(): WeeklyReport {
    const today = new Date();
    const weekStart = startOfDay(subDays(today, 7));
    const weekEnd = endOfDay(today);

    const weeklySnapshots = this.progressSnapshots.filter(s => 
      s.date >= weekStart && s.date <= weekEnd
    );

    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    const categoryProgress: Record<SinCategory, any> = {} as any;

    categories.forEach(category => {
      const categorySnapshots = weeklySnapshots.filter(s => s.categoryScores[category] !== undefined);
      const averageScore = categorySnapshots.length > 0 
        ? categorySnapshots.reduce((sum, s) => sum + s.categoryScores[category], 0) / categorySnapshots.length 
        : 0;

      const goalsCompleted = new Set();
      const totalGoals = new Set();
      
      categorySnapshots.forEach(snapshot => {
        snapshot.completedGoals.forEach(goalId => {
          if (goalId.startsWith(category)) {
            goalsCompleted.add(goalId);
          }
        });
        snapshot.activeGoals.forEach(goalId => {
          if (goalId.startsWith(category)) {
            totalGoals.add(goalId);
          }
        });
      });

      // Calculate improvement from last week
      const lastWeekSnapshots = this.progressSnapshots.filter(s => 
        s.date >= subDays(weekStart, 7) && s.date < weekStart
      );
      const lastWeekAvg = lastWeekSnapshots.length > 0 
        ? lastWeekSnapshots.reduce((sum, s) => sum + (s.categoryScores[category] || 0), 0) / lastWeekSnapshots.length 
        : averageScore;

      categoryProgress[category] = {
        averageScore,
        improvement: lastWeekAvg > 0 ? ((lastWeekAvg - averageScore) / lastWeekAvg) * 100 : 0,
        goalsCompleted: goalsCompleted.size,
        totalGoals: totalGoals.size
      };
    });

    // Calculate overall progress
    const overallProgress = {
      spiritualGrowthScore: Object.values(categoryProgress).reduce((sum: number, cat: any) => sum + (5 - cat.averageScore), 0) / 7 * 20,
      consistencyScore: this.calculateConsistencyScore(),
      improvementRate: Object.values(categoryProgress).reduce((sum: number, cat: any) => sum + Math.max(0, cat.improvement), 0) / 7
    };

    // Get recent achievements
    const recentAchievements = this.achievements.filter(a => 
      a.unlockedAt && a.unlockedAt >= weekStart && a.unlockedAt <= weekEnd
    );

    // Get current streaks
    const currentStreaks = Array.from(this.streaks.values()).filter(s => s.isActive);

    const report: WeeklyReport = {
      weekStart,
      weekEnd,
      categoryProgress,
      overallProgress,
      achievements: recentAchievements,
      streaks: currentStreaks,
      nextWeekRecommendations: this.generateNextWeekRecommendations(categoryProgress)
    };

    this.weeklyReports.push(report);
    this.saveData();

    return report;
  }

  private calculateConsistencyScore(): number {
    const recentSnapshots = this.progressSnapshots.slice(-7); // Last 7 days
    if (recentSnapshots.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < recentSnapshots.length; i++) {
      const days = differenceInDays(recentSnapshots[i].date, recentSnapshots[i-1].date);
      intervals.push(days);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const idealInterval = 1; // Daily
    const consistency = Math.max(0, 100 - Math.abs(avgInterval - idealInterval) * 20);
    
    return consistency;
  }

  private generateNextWeekRecommendations(categoryProgress: Record<SinCategory, any>): string[] {
    const recommendations: string[] = [];
    
    // Find categories that need attention
    const needsAttention = Object.entries(categoryProgress)
      .filter(([, progress]) => progress.averageScore > 3.5)
      .sort((a, b) => b[1].averageScore - a[1].averageScore)
      .slice(0, 2);

    needsAttention.forEach(([category]) => {
      recommendations.push(`Focus on ${category} improvement through daily practices`);
    });

    // Add consistency recommendations
    const consistencyScore = this.calculateConsistencyScore();
    if (consistencyScore < 70) {
      recommendations.push('Maintain daily consistency with goals and assessments');
    }

    // Add general recommendations
    recommendations.push('Set aside time for daily spiritual reflection');
    recommendations.push('Review and adjust your spiritual goals weekly');

    return recommendations;
  }

  // Public getters
  public getProgressSnapshots(): ProgressSnapshot[] {
    return [...this.progressSnapshots];
  }

  public getStreaks(): StreakData[] {
    return Array.from(this.streaks.values());
  }

  public getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  public getAchievements(): AchievementBadge[] {
    return [...this.achievements];
  }

  public getWeeklyReports(): WeeklyReport[] {
    return [...this.weeklyReports];
  }

  public getMonthlyReports(): MonthlyReport[] {
    return [...this.monthlyReports];
  }

  // Clear all data
  public clearAllData() {
    this.progressSnapshots = [];
    this.streaks.clear();
    this.milestones = [];
    this.achievements = [];
    this.weeklyReports = [];
    this.monthlyReports = [];
    this.saveData();
    this.initializeDefaultMilestones();
    this.initializeDefaultAchievements();
  }
}

// Export singleton instance
export const progressTracker = new ProgressTrackingService();