import { Challenge, UserChallengeProgress, ChallengeDailyLog } from '@shared/schema';
import { SinCategory } from '@/data/selfAssessmentData';

export type ChallengeType = 'micro' | 'habit' | 'seasonal';
export type ChallengeCompletionLogic = 'streak' | 'count' | 'time-locked';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'paused';
export type LogType = 'success' | 'infraction' | 'journal' | 'skip';

export interface ChallengeWithProgress extends Challenge {
  userProgress?: UserChallengeProgress;
  recentLogs?: ChallengeDailyLog[];
}

export interface DateOption {
  date: Date;
  label: string;
  disabled: boolean;
}

class ChallengeService {
  // Get available date options for logging (today only for 1-day challenges, last 3 days for others)
  getAvailableDates(challengeDuration?: number): DateOption[] {
    const today = new Date();
    const options: DateOption[] = [];

    // For 1-day challenges, only show today
    const maxDays = challengeDuration === 1 ? 1 : 3;

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      let label: string;
      if (i === 0) label = `Today (${this.formatDate(date)})`;
      else if (i === 1) label = `Yesterday (${this.formatDate(date)})`;
      else label = `Two days ago (${this.formatDate(date)})`;

      options.push({
        date,
        label,
        disabled: false
      });
    }

    return options;
  }

  // Format date for display
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Check if user can log for a specific date (not already logged)
  canLogForDate(date: Date, existingLogs: ChallengeDailyLog[]): boolean {
    const targetDate = this.normalizeDate(date);
    return !existingLogs.some(log => {
      const logDate = this.normalizeDate(new Date(log.logDate));
      return logDate.getTime() === targetDate.getTime();
    });
  }

  // Normalize date to remove time component
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  // Calculate challenge progress based on completion logic
  calculateProgress(challenge: Challenge, logs: ChallengeDailyLog[]): {
    currentStreak: number;
    totalSuccessDays: number;
    isCompleted: boolean;
    hasFailed: boolean;
    progressPercentage: number;
  } {
    const successLogs = logs.filter(log => log.logType === 'success').sort((a, b) => 
      new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
    );
    
    const infractionLogs = logs.filter(log => log.logType === 'infraction');
    
    let currentStreak = 0;
    let totalSuccessDays = successLogs.length;
    let isCompleted = false;
    let hasFailed = false;

    // Calculate current streak (consecutive success days from most recent)
    if (successLogs.length > 0) {
      const sortedLogs = [...successLogs].reverse(); // Most recent first
      const today = new Date();
      
      for (const log of sortedLogs) {
        const logDate = new Date(log.logDate);
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Check completion based on challenge logic
    switch (challenge.completionLogic) {
      case 'streak':
        isCompleted = currentStreak >= challenge.duration;
        hasFailed = infractionLogs.length > 0 && !isCompleted;
        break;
        
      case 'count':
        const targetCount = challenge.targetCount || challenge.duration;
        isCompleted = totalSuccessDays >= targetCount;
        hasFailed = false; // Count-based challenges don't fail from infractions
        break;
        
      case 'time-locked':
        // Must complete within the time window
        const startDate = new Date(); // This should come from userProgress.startDate
        const daysSinceStart = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        isCompleted = totalSuccessDays >= (challenge.targetCount || challenge.duration);
        hasFailed = daysSinceStart > challenge.duration && !isCompleted;
        break;
    }

    // Calculate progress percentage
    const target = challenge.completionLogic === 'streak' ? challenge.duration : (challenge.targetCount || challenge.duration);
    const current = challenge.completionLogic === 'streak' ? currentStreak : totalSuccessDays;
    const progressPercentage = Math.min(100, (current / target) * 100);

    return {
      currentStreak,
      totalSuccessDays,
      isCompleted,
      hasFailed,
      progressPercentage
    };
  }

  // Get motivational message based on progress
  getMotivationalMessage(challenge: Challenge, progress: ReturnType<ChallengeService['calculateProgress']>): string {
    if (progress.isCompleted) {
      return challenge.motivationalQuote || "Alhamdulillah! You've completed this challenge!";
    }
    
    if (progress.hasFailed) {
      return "Every step back is a chance to move forward with Allah's guidance. Try again!";
    }

    const { currentStreak, progressPercentage } = progress;
    
    if (currentStreak === 0) {
      return "Begin with Allah's name. Every journey starts with a single step.";
    } else if (currentStreak < 3) {
      return `MashAllah! ${currentStreak} day${currentStreak > 1 ? 's' : ''} strong. Keep going!`;
    } else if (currentStreak < 7) {
      return `Excellent progress! ${currentStreak} days of consistency. You're building great habits!`;
    } else if (progressPercentage > 75) {
      return `Outstanding! You're so close to completing this challenge. Stay strong!`;
    } else {
      return `SubhanAllah! ${currentStreak} day streak. Your dedication is inspiring!`;
    }
  }

  // Get next milestone for motivation
  getNextMilestone(challenge: Challenge, progress: ReturnType<ChallengeService['calculateProgress']>): string {
    if (progress.isCompleted) {
      return "Challenge completed!";
    }

    const remaining = challenge.duration - (challenge.completionLogic === 'streak' ? progress.currentStreak : progress.totalSuccessDays);
    
    if (remaining === 1) {
      return "Just 1 more day!";
    } else if (remaining <= 3) {
      return `${remaining} days to go!`;
    } else if (remaining <= 7) {
      return `${remaining} days remaining`;
    } else {
      return `${remaining} days to completion`;
    }
  }

  // Check if challenge is seasonal and currently active
  isSeasonalChallengeActive(challenge: Challenge): boolean {
    if (challenge.type !== 'seasonal' || !challenge.seasonalStartDate || !challenge.seasonalEndDate) {
      return true; // Non-seasonal challenges are always "active"
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();
    const currentDate = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

    return currentDate >= challenge.seasonalStartDate && currentDate <= challenge.seasonalEndDate;
  }

  // Generate achievement badge data when challenge is completed
  generateAchievementBadge(challenge: Challenge): {
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } {
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    
    if (challenge.duration >= 40) rarity = 'legendary';
    else if (challenge.duration >= 30) rarity = 'epic';
    else if (challenge.duration >= 7) rarity = 'rare';

    const titles = {
      'micro': `Daily ${challenge.sinCategory} Warrior`,
      'habit': `${challenge.duration}-Day ${challenge.sinCategory} Master`,
      'seasonal': `Seasonal ${challenge.sinCategory} Champion`
    };

    return {
      title: titles[challenge.type as keyof typeof titles] || challenge.title,
      description: `Completed: ${challenge.title}`,
      icon: challenge.badgeIcon || challenge.icon,
      rarity
    };
  }

  // Delete a logged entry (success or infraction)
  deleteLoggedEntry(challengeId: string, date: Date, type: 'success' | 'infraction'): void {
    const dateString = date.toDateString();
    const storageKey = `challenge_${challengeId}`;
    
    const existingData = localStorage.getItem(storageKey);
    if (!existingData) return;
    
    const challengeData = JSON.parse(existingData);

    if (type === 'success') {
      challengeData.loggedDates = (challengeData.loggedDates || []).filter((d: string) => d !== dateString);
    } else {
      challengeData.infractionDates = (challengeData.infractionDates || []).filter((d: string) => d !== dateString);
    }

    localStorage.setItem(storageKey, JSON.stringify(challengeData));
  }
}

export const challengeService = new ChallengeService();