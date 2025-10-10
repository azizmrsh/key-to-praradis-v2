import { SinCategory } from '@/data/selfAssessmentData';
import { secureStorage } from '@/lib/storage';
import { differenceInDays, startOfDay, format } from 'date-fns';
import unifiedGoalsData from '@/data/unifiedGoals.json';

// Enhanced challenge system types
export interface Challenge {
  id: string;
  goalId: string;
  category: SinCategory;
  title: string;
  description: string;
  duration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  islamicGuidance: string;
  benefits: string[];
  dailyActions: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  currentDay: number;
  completedDays: number;
  completionDates: string[]; // ISO date strings
  notes: string[];
  progress: number; // 0-100
  streakCount: number;
  isCompleted: boolean;
  completedAt?: Date;
  rating?: number; // 1-5 stars
  reflection?: string;
}

export interface ChallengeTemplate {
  goalId: string;
  category: SinCategory;
  title: string;
  description: string;
  islamicGuidance: string;
  benefits: string[];
  dailyActions: string[];
  durationOptions: number[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  tags: string[];
}

export interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: number;
  totalDaysCompleted: number;
  longestStreak: number;
  currentStreak: number;
  categoryStats: Record<SinCategory, {
    attempted: number;
    completed: number;
    averageRating: number;
    totalDays: number;
  }>;
  completionRate: number;
  averageRating: number;
}

export interface DailyChallenge {
  challengeId: string;
  date: string;
  isCompleted: boolean;
  note?: string;
  mood?: 'struggled' | 'neutral' | 'good' | 'excellent';
  reflection?: string;
  completedAt?: Date;
}

// Storage keys
const CHALLENGES_KEY = 'active_challenges';
const CHALLENGE_HISTORY_KEY = 'challenge_history';
const CHALLENGE_STATS_KEY = 'challenge_stats';
const DAILY_CHALLENGES_KEY = 'daily_challenges';

class ChallengeSystemService {
  private activeChallenges: Map<string, Challenge> = new Map();
  private challengeHistory: Challenge[] = [];
  private challengeStats: ChallengeStats | null = null;
  private dailyChallenges: Map<string, DailyChallenge> = new Map();
  private challengeTemplates: ChallengeTemplate[] = [];

  constructor() {
    this.initializeChallengeTemplates();
    this.loadData();
  }

  private initializeChallengeTemplates() {
    // Convert unified goals to challenge templates
    this.challengeTemplates = unifiedGoalsData.goals.map(goal => ({
      goalId: goal.goal_id,
      category: goal.category as SinCategory,
      title: goal.translations.en.title,
      description: goal.translations.en.description,
      islamicGuidance: goal.translations.en.islamic_guidance,
      benefits: goal.translations.en.benefits,
      dailyActions: goal.translations.en.daily_actions,
      durationOptions: goal.duration_options,
      difficulty: this.determineDifficulty(goal.duration_options),
      prerequisites: this.extractPrerequisites(goal.goal_id),
      tags: this.generateTags(goal.goal_id, goal.translations.en)
    }));
  }

  private determineDifficulty(durationOptions: number[]): 'beginner' | 'intermediate' | 'advanced' {
    const maxDuration = Math.max(...durationOptions);
    if (maxDuration <= 7) return 'beginner';
    if (maxDuration <= 21) return 'intermediate';
    return 'advanced';
  }

  private extractPrerequisites(goalId: string): string[] {
    // Define prerequisite relationships
    const prerequisites: Record<string, string[]> = {
      'tongue-avoid-backbiting': ['tongue-mindful-speech'],
      'eyes-avoid-lustful-gaze': ['eyes-lower-gaze'],
      'heart-overcome-envy': ['heart-gratitude-practice'],
      // Add more as needed
    };
    
    return prerequisites[goalId] || [];
  }

  private generateTags(goalId: string, translations: any): string[] {
    const tags: string[] = [];
    
    // Extract tags from title and description
    const text = `${translations.title} ${translations.description}`.toLowerCase();
    
    if (text.includes('daily')) tags.push('daily-practice');
    if (text.includes('mindful')) tags.push('mindfulness');
    if (text.includes('prayer')) tags.push('prayer');
    if (text.includes('avoid')) tags.push('avoidance');
    if (text.includes('gratitude')) tags.push('gratitude');
    if (text.includes('reflection')) tags.push('reflection');
    
    return tags;
  }

  private loadData() {
    // Load active challenges
    const activeChallengesData = secureStorage.getItem<Challenge[]>(CHALLENGES_KEY, []);
    activeChallengesData.forEach(challenge => {
      this.activeChallenges.set(challenge.id, {
        ...challenge,
        startDate: new Date(challenge.startDate),
        endDate: new Date(challenge.endDate),
        completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
      });
    });

    // Load challenge history
    const historyData = secureStorage.getItem<Challenge[]>(CHALLENGE_HISTORY_KEY, []);
    this.challengeHistory = historyData.map(challenge => ({
      ...challenge,
      startDate: new Date(challenge.startDate),
      endDate: new Date(challenge.endDate),
      completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
    }));

    // Load challenge stats
    this.challengeStats = secureStorage.getItem<ChallengeStats>(CHALLENGE_STATS_KEY, null);

    // Load daily challenges
    const dailyChallengesData = secureStorage.getItem<DailyChallenge[]>(DAILY_CHALLENGES_KEY, []);
    dailyChallengesData.forEach(daily => {
      const key = `${daily.challengeId}_${daily.date}`;
      this.dailyChallenges.set(key, {
        ...daily,
        completedAt: daily.completedAt ? new Date(daily.completedAt) : undefined
      });
    });

    // Initialize stats if not present
    if (!this.challengeStats) {
      this.challengeStats = this.calculateStats();
    }
  }

  private saveData() {
    secureStorage.setItem(CHALLENGES_KEY, Array.from(this.activeChallenges.values()));
    secureStorage.setItem(CHALLENGE_HISTORY_KEY, this.challengeHistory);
    secureStorage.setItem(CHALLENGE_STATS_KEY, this.challengeStats);
    secureStorage.setItem(DAILY_CHALLENGES_KEY, Array.from(this.dailyChallenges.values()));
  }

  // Create a new challenge
  public createChallenge(goalId: string, duration: number, startDate: Date = new Date()): Challenge {
    const template = this.challengeTemplates.find(t => t.goalId === goalId);
    if (!template) {
      throw new Error(`Challenge template not found for goal: ${goalId}`);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);

    const challenge: Challenge = {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId,
      category: template.category,
      title: template.title,
      description: template.description,
      duration,
      difficulty: template.difficulty,
      islamicGuidance: template.islamicGuidance,
      benefits: template.benefits,
      dailyActions: template.dailyActions,
      isActive: true,
      startDate,
      endDate,
      currentDay: 1,
      completedDays: 0,
      completionDates: [],
      notes: [],
      progress: 0,
      streakCount: 0,
      isCompleted: false
    };

    this.activeChallenges.set(challenge.id, challenge);
    this.updateStats();
    this.saveData();

    return challenge;
  }

  // Complete a day of a challenge
  public completeChallengeDay(
    challengeId: string, 
    date: Date = new Date(),
    note?: string,
    mood?: DailyChallenge['mood']
  ): boolean {
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge || !challenge.isActive) {
      return false;
    }

    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    
    // Check if already completed today
    if (challenge.completionDates.includes(dateString)) {
      return false;
    }

    // Add to completion dates
    challenge.completionDates.push(dateString);
    challenge.completedDays++;
    challenge.progress = (challenge.completedDays / challenge.duration) * 100;

    // Update current day
    const daysDiff = differenceInDays(date, challenge.startDate) + 1;
    challenge.currentDay = Math.min(daysDiff, challenge.duration);

    // Update streak
    this.updateChallengeStreak(challenge, dateString);

    // Add note if provided
    if (note) {
      challenge.notes.push(`Day ${challenge.currentDay}: ${note}`);
    }

    // Record daily challenge
    const dailyKey = `${challengeId}_${dateString}`;
    this.dailyChallenges.set(dailyKey, {
      challengeId,
      date: dateString,
      isCompleted: true,
      note,
      mood,
      completedAt: new Date()
    });

    // Check if challenge is completed
    if (challenge.completedDays >= challenge.duration) {
      challenge.isCompleted = true;
      challenge.completedAt = new Date();
      challenge.isActive = false;
      
      // Move to history
      this.challengeHistory.push(challenge);
      this.activeChallenges.delete(challengeId);
    }

    this.updateStats();
    this.saveData();

    return true;
  }

  private updateChallengeStreak(challenge: Challenge, dateString: string) {
    const completionDates = challenge.completionDates.sort();
    let currentStreak = 0;
    
    // Calculate current streak from the end
    for (let i = completionDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(completionDates[i]);
      const expectedDate = new Date(dateString);
      expectedDate.setDate(expectedDate.getDate() - currentStreak);
      
      if (format(currentDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    challenge.streakCount = currentStreak;
  }

  // Get active challenges
  public getActiveChallenges(): Challenge[] {
    return Array.from(this.activeChallenges.values());
  }

  // Get challenge history
  public getChallengeHistory(): Challenge[] {
    return [...this.challengeHistory];
  }

  // Get challenge templates
  public getChallengeTemplates(): ChallengeTemplate[] {
    return [...this.challengeTemplates];
  }

  // Get templates for a specific category
  public getTemplatesForCategory(category: SinCategory): ChallengeTemplate[] {
    return this.challengeTemplates.filter(t => t.category === category);
  }

  // Get recommended challenges based on assessment
  public getRecommendedChallenges(
    primaryCategory: SinCategory,
    secondaryCategory?: SinCategory,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): ChallengeTemplate[] {
    const recommended: ChallengeTemplate[] = [];
    
    // Get challenges for primary category
    const primaryChallenges = this.challengeTemplates
      .filter(t => t.category === primaryCategory && t.difficulty === difficulty)
      .slice(0, 3);
    
    recommended.push(...primaryChallenges);
    
    // Get challenges for secondary category if provided
    if (secondaryCategory) {
      const secondaryChallenges = this.challengeTemplates
        .filter(t => t.category === secondaryCategory && t.difficulty === difficulty)
        .slice(0, 2);
      
      recommended.push(...secondaryChallenges);
    }
    
    return recommended;
  }

  // Get challenge statistics
  public getStats(): ChallengeStats {
    return this.challengeStats || this.calculateStats();
  }

  private calculateStats(): ChallengeStats {
    const allChallenges = [...this.challengeHistory, ...Array.from(this.activeChallenges.values())];
    const completed = this.challengeHistory.filter(c => c.isCompleted);
    
    // Calculate category stats
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    const categoryStats: Record<SinCategory, any> = {} as any;
    
    categories.forEach(category => {
      const categoryAttempted = allChallenges.filter(c => c.category === category);
      const categoryCompleted = completed.filter(c => c.category === category);
      const ratings = categoryCompleted.filter(c => c.rating).map(c => c.rating!);
      
      categoryStats[category] = {
        attempted: categoryAttempted.length,
        completed: categoryCompleted.length,
        averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0,
        totalDays: categoryCompleted.reduce((sum, c) => sum + c.completedDays, 0)
      };
    });

    // Calculate overall stats
    const totalDaysCompleted = allChallenges.reduce((sum, c) => sum + c.completedDays, 0);
    const longestStreak = Math.max(...allChallenges.map(c => c.streakCount), 0);
    const currentStreak = this.calculateCurrentStreak();
    const completionRate = allChallenges.length > 0 ? (completed.length / allChallenges.length) * 100 : 0;
    const allRatings = completed.filter(c => c.rating).map(c => c.rating!);
    const averageRating = allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;

    this.challengeStats = {
      totalChallenges: allChallenges.length,
      completedChallenges: completed.length,
      activeChallenges: this.activeChallenges.size,
      totalDaysCompleted,
      longestStreak,
      currentStreak,
      categoryStats,
      completionRate,
      averageRating
    };

    return this.challengeStats;
  }

  private calculateCurrentStreak(): number {
    const today = format(new Date(), 'yyyy-MM-dd');
    const allCompletions = Array.from(this.dailyChallenges.values())
      .filter(d => d.isCompleted)
      .sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 100; i++) { // Max 100 days lookback
      const checkDate = format(currentDate, 'yyyy-MM-dd');
      const hasCompletion = allCompletions.some(c => c.date === checkDate);
      
      if (hasCompletion) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private updateStats() {
    this.challengeStats = this.calculateStats();
  }

  // Rate a completed challenge
  public rateChallenge(challengeId: string, rating: number, reflection?: string): boolean {
    const challenge = this.challengeHistory.find(c => c.id === challengeId);
    if (!challenge || !challenge.isCompleted) {
      return false;
    }

    challenge.rating = rating;
    challenge.reflection = reflection;
    
    this.updateStats();
    this.saveData();
    
    return true;
  }

  // Get today's challenges
  public getTodaysChallenges(): Challenge[] {
    const today = startOfDay(new Date());
    return Array.from(this.activeChallenges.values()).filter(challenge => {
      const daysSinceStart = differenceInDays(today, startOfDay(challenge.startDate));
      return daysSinceStart >= 0 && daysSinceStart < challenge.duration;
    });
  }

  // Check if a challenge day is completed
  public isDayCompleted(challengeId: string, date: Date = new Date()): boolean {
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    const challenge = this.activeChallenges.get(challengeId);
    return challenge ? challenge.completionDates.includes(dateString) : false;
  }

  // Get daily challenge details
  public getDailyChallenge(challengeId: string, date: Date = new Date()): DailyChallenge | null {
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    const key = `${challengeId}_${dateString}`;
    return this.dailyChallenges.get(key) || null;
  }

  // Delete a challenge
  public deleteChallenge(challengeId: string): boolean {
    const activeChallenge = this.activeChallenges.get(challengeId);
    if (activeChallenge) {
      this.activeChallenges.delete(challengeId);
      this.updateStats();
      this.saveData();
      return true;
    }
    return false;
  }

  // Clear all data
  public clearAllData() {
    this.activeChallenges.clear();
    this.challengeHistory = [];
    this.challengeStats = null;
    this.dailyChallenges.clear();
    this.saveData();
  }

  // Export challenge data
  public exportChallengeData(): string {
    return JSON.stringify({
      activeChallenges: Array.from(this.activeChallenges.values()),
      challengeHistory: this.challengeHistory,
      challengeStats: this.challengeStats,
      dailyChallenges: Array.from(this.dailyChallenges.values())
    }, null, 2);
  }

  // Import challenge data
  public importChallengeData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      // Restore active challenges
      this.activeChallenges.clear();
      parsed.activeChallenges?.forEach((challenge: Challenge) => {
        this.activeChallenges.set(challenge.id, {
          ...challenge,
          startDate: new Date(challenge.startDate),
          endDate: new Date(challenge.endDate),
          completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
        });
      });

      // Restore history
      this.challengeHistory = parsed.challengeHistory?.map((challenge: Challenge) => ({
        ...challenge,
        startDate: new Date(challenge.startDate),
        endDate: new Date(challenge.endDate),
        completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
      })) || [];

      // Restore stats
      this.challengeStats = parsed.challengeStats || null;

      // Restore daily challenges
      this.dailyChallenges.clear();
      parsed.dailyChallenges?.forEach((daily: DailyChallenge) => {
        const key = `${daily.challengeId}_${daily.date}`;
        this.dailyChallenges.set(key, {
          ...daily,
          completedAt: daily.completedAt ? new Date(daily.completedAt) : undefined
        });
      });

      this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import challenge data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const challengeSystem = new ChallengeSystemService();