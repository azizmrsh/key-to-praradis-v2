export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'prayer' | 'behavioral' | 'reflection' | 'mastery' | 'general';
  tier: 'bronze' | 'silver' | 'gold' | 'sincere';
  dateEarned?: Date;
  isUnlocked: boolean;
}

export interface StreakData {
  type: 'prayer' | 'behavioral' | 'challenge' | 'goal';
  category?: string;
  currentStreak: number;
  bestStreak: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface UserRewards {
  badges: Badge[];
  streaks: Record<string, StreakData>;
  totalBadges: number;
  masteryLevel: number;
}

export class GamificationService {
  private static readonly BADGE_DEFINITIONS: Omit<Badge, 'dateEarned' | 'isUnlocked'>[] = [
    // 40-Day Challenge Badges
    {
      id: 'tongue-40day-master',
      title: 'Tongue Mastery - 40 Days',
      description: 'Completed 40-day clean streak for tongue-related sins',
      icon: '🗣️',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'heart-40day-master',
      title: 'Heart Purification - 40 Days',
      description: 'Completed 40-day clean streak for heart-related sins',
      icon: '💝',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'eyes-40day-master',
      title: 'Gaze Guardian - 40 Days',
      description: 'Completed 40-day clean streak for eyes-related sins',
      icon: '👁️',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'ears-40day-master',
      title: 'Pure Listening - 40 Days',
      description: 'Completed 40-day clean streak for ears-related sins',
      icon: '👂',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'pride-40day-master',
      title: 'Humility Champion - 40 Days',
      description: 'Completed 40-day clean streak for pride-related sins',
      icon: '🤲',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'stomach-40day-master',
      title: 'Mindful Consumption - 40 Days',
      description: 'Completed 40-day clean streak for stomach-related sins',
      icon: '🍯',
      category: 'behavioral',
      tier: 'gold'
    },
    {
      id: 'zina-40day-master',
      title: 'Chastity Guardian - 40 Days',
      description: 'Completed 40-day clean streak for chastity-related sins',
      icon: '🛡️',
      category: 'behavioral',
      tier: 'gold'
    },

    // Prayer Streak Badges
    {
      id: 'prayer-week-warrior',
      title: '5/5 Salat Week',
      description: 'All five prayers logged daily for 7 consecutive days',
      icon: '🕌',
      category: 'prayer',
      tier: 'bronze'
    },
    {
      id: 'prayer-month-champion',
      title: 'Devoted Worshipper',
      description: 'All five prayers logged daily for 30 consecutive days',
      icon: '🌙',
      category: 'prayer',
      tier: 'silver'
    },
    {
      id: 'prayer-consistency-master',
      title: 'Prayer Consistency Master',
      description: 'Maintained perfect prayer record for 90 days',
      icon: '⭐',
      category: 'prayer',
      tier: 'sincere'
    },

    // Reflection Badges
    {
      id: 'reflective-seeker',
      title: 'Reflective Seeker',
      description: '10 journal entries written in one sin category',
      icon: '📝',
      category: 'reflection',
      tier: 'bronze'
    },
    {
      id: 'deep-contemplator',
      title: 'Deep Contemplator',
      description: '25 journal entries written across all categories',
      icon: '💭',
      category: 'reflection',
      tier: 'silver'
    },
    {
      id: 'wisdom-keeper',
      title: 'Wisdom Keeper',
      description: '50 meaningful reflections recorded',
      icon: '📚',
      category: 'reflection',
      tier: 'gold'
    },

    // Mastery Badges
    {
      id: 'challenge-conqueror',
      title: 'Challenge Conqueror',
      description: 'Completed 3 challenges in the same sin category',
      icon: '🏆',
      category: 'mastery',
      tier: 'silver'
    },
    {
      id: 'sincere-overcomer',
      title: 'Sincere Overcomer',
      description: 'Completed 3 mastery-tier challenges',
      icon: '👑',
      category: 'mastery',
      tier: 'sincere'
    },
    {
      id: 'goal-achiever',
      title: 'Goal Achiever',
      description: 'Completed 5 full 30-day goals',
      icon: '🎯',
      category: 'mastery',
      tier: 'gold'
    },

    // General Achievement Badges
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Completed your first challenge successfully',
      icon: '👣',
      category: 'general',
      tier: 'bronze'
    },
    {
      id: 'consistency-builder',
      title: 'Consistency Builder',
      description: 'Maintained any 14-day streak',
      icon: '🔥',
      category: 'general',
      tier: 'silver'
    }
  ];

  /**
   * Initialize user rewards data
   */
  static initializeUserRewards(): UserRewards {
    return {
      badges: this.BADGE_DEFINITIONS.map(badge => ({
        ...badge,
        isUnlocked: false
      })),
      streaks: {},
      totalBadges: 0,
      masteryLevel: 0
    };
  }

  /**
   * Get user's current rewards from localStorage
   */
  static getUserRewards(): UserRewards {
    const saved = localStorage.getItem('userRewards');
    if (saved) {
      const rewards = JSON.parse(saved);
      // Ensure dates are properly parsed
      rewards.badges = rewards.badges.map((badge: any) => ({
        ...badge,
        dateEarned: badge.dateEarned ? new Date(badge.dateEarned) : undefined
      }));
      Object.keys(rewards.streaks).forEach(key => {
        rewards.streaks[key].lastUpdated = new Date(rewards.streaks[key].lastUpdated);
      });
      return rewards;
    }
    return this.initializeUserRewards();
  }

  /**
   * Save user rewards to localStorage
   */
  static saveUserRewards(rewards: UserRewards): void {
    localStorage.setItem('userRewards', JSON.stringify(rewards));
  }

  /**
   * Update streak data for a specific category
   */
  static updateStreak(
    type: StreakData['type'], 
    category: string, 
    success: boolean
  ): StreakData {
    const rewards = this.getUserRewards();
    const streakKey = `${type}-${category}`;
    
    let streak = rewards.streaks[streakKey] || {
      type,
      category,
      currentStreak: 0,
      bestStreak: 0,
      lastUpdated: new Date(),
      isActive: true
    };

    if (success) {
      streak.currentStreak += 1;
      streak.bestStreak = Math.max(streak.bestStreak, streak.currentStreak);
      streak.isActive = true;
    } else {
      streak.currentStreak = 0;
      streak.isActive = false;
    }

    streak.lastUpdated = new Date();
    rewards.streaks[streakKey] = streak;
    this.saveUserRewards(rewards);

    return streak;
  }

  /**
   * Check for badge achievements and award them
   */
  static checkAndAwardBadges(
    userProgress: any, 
    prayerRecords: any,
    journalEntries: any[]
  ): Badge[] {
    const rewards = this.getUserRewards();
    const newBadges: Badge[] = [];

    // Check 40-day challenge badges
    Object.entries(userProgress.behavioralProgress || {}).forEach(([category, progress]: [string, any]) => {
      if (progress.currentStreak >= 40) {
        const badgeId = `${category}-40day-master`;
        const badge = rewards.badges.find(b => b.id === badgeId);
        if (badge && !badge.isUnlocked) {
          badge.isUnlocked = true;
          badge.dateEarned = new Date();
          newBadges.push(badge);
          rewards.totalBadges++;
        }
      }
    });

    // Check prayer streak badges
    const prayerStreak = this.calculatePrayerStreak(prayerRecords);
    if (prayerStreak >= 7) {
      const badge = rewards.badges.find(b => b.id === 'prayer-week-warrior');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }
    if (prayerStreak >= 30) {
      const badge = rewards.badges.find(b => b.id === 'prayer-month-champion');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }
    if (prayerStreak >= 90) {
      const badge = rewards.badges.find(b => b.id === 'prayer-consistency-master');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }

    // Check reflection badges
    const totalJournalEntries = journalEntries.length;
    if (totalJournalEntries >= 10) {
      const badge = rewards.badges.find(b => b.id === 'reflective-seeker');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }
    if (totalJournalEntries >= 25) {
      const badge = rewards.badges.find(b => b.id === 'deep-contemplator');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }
    if (totalJournalEntries >= 50) {
      const badge = rewards.badges.find(b => b.id === 'wisdom-keeper');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.dateEarned = new Date();
        newBadges.push(badge);
        rewards.totalBadges++;
      }
    }

    // Update mastery level based on earned badges
    const goldBadges = rewards.badges.filter(b => b.isUnlocked && b.tier === 'gold').length;
    const sincereBadges = rewards.badges.filter(b => b.isUnlocked && b.tier === 'sincere').length;
    rewards.masteryLevel = sincereBadges * 10 + goldBadges * 5 + rewards.totalBadges;

    this.saveUserRewards(rewards);
    return newBadges;
  }

  /**
   * Calculate current prayer streak
   */
  static calculatePrayerStreak(prayerRecords: Record<string, boolean>): number {
    const today = new Date();
    let streak = 0;
    
    // Count backwards from today to find consecutive days with all prayers
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toDateString();
      
      // Check if all 5 prayers were recorded for this date
      const prayersForDay = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(prayer => 
        prayerRecords[`${dateKey}-${prayer}`] === true
      );
      
      if (prayersForDay) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get streak animation data for UI
   */
  static getStreakVisualization(streakData: StreakData): {
    color: string;
    intensity: number;
    message: string;
  } {
    const { currentStreak, type } = streakData;
    
    if (currentStreak >= 40) {
      return {
        color: '#FFD700', // Gold
        intensity: 1.0,
        message: 'contentDashboard.streakMessages.mastery'
      };
    } else if (currentStreak >= 21) {
      return {
        color: '#C0C0C0', // Silver
        intensity: 0.8,
        message: 'contentDashboard.streakMessages.excellent'
      };
    } else if (currentStreak >= 7) {
      return {
        color: '#CD7F32', // Bronze
        intensity: 0.6,
        message: 'contentDashboard.streakMessages.great'
      };
    } else if (currentStreak >= 3) {
      return {
        color: '#4CAF50', // Green
        intensity: 0.4,
        message: 'contentDashboard.streakMessages.building'
      };
    }
    
    return {
      color: '#9E9E9E', // Gray
      intensity: 0.2,
      message: 'contentDashboard.streakMessages.everyStep'
    };
  }

  /**
   * Get badges by category for display
   */
  static getBadgesByCategory(category?: Badge['category']): Badge[] {
    const rewards = this.getUserRewards();
    return category 
      ? rewards.badges.filter(badge => badge.category === category)
      : rewards.badges;
  }

  /**
   * Get recently earned badges (last 30 days)
   */
  static getRecentBadges(): Badge[] {
    const rewards = this.getUserRewards();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return rewards.badges.filter(badge => 
      badge.isUnlocked && 
      badge.dateEarned && 
      badge.dateEarned > thirtyDaysAgo
    );
  }
}