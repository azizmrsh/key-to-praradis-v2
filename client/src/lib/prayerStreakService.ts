import { GamificationService } from './gamificationService';

export interface PrayerRecord {
  date: string; // YYYY-MM-DD format
  fajr: { logged: boolean; onTime: boolean; timestamp?: string };
  dhuhr: { logged: boolean; onTime: boolean; timestamp?: string };
  asr: { logged: boolean; onTime: boolean; timestamp?: string };
  maghrib: { logged: boolean; onTime: boolean; timestamp?: string };
  isha: { logged: boolean; onTime: boolean; timestamp?: string };
}

export interface PrayerStreak {
  currentStreak: number;
  bestStreak: number;
  type: 'all_prayers' | 'fajr_only' | 'on_time_all' | 'consistent_daily';
  lastUpdated: Date;
  isActive: boolean;
}

export interface PrayerChallengeProgress {
  challengeId: string;
  totalDaysRequired: number;
  daysRemaining: number;
  existingStreakApplied: number;
  startDate: Date;
  isCompleted: boolean;
}

export class PrayerStreakService {
  private static readonly STORAGE_KEY = 'prayerRecords';
  private static readonly STREAK_KEY = 'prayerStreaks';

  /**
   * Get all prayer records from localStorage
   */
  static getPrayerRecords(): Record<string, PrayerRecord> {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * Save prayer records to localStorage
   */
  static savePrayerRecords(records: Record<string, PrayerRecord>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  /**
   * Get current prayer streaks
   */
  static getPrayerStreaks(): Record<string, PrayerStreak> {
    const saved = localStorage.getItem(this.STREAK_KEY);
    if (saved) {
      const streaks = JSON.parse(saved);
      // Parse dates
      Object.keys(streaks).forEach(key => {
        streaks[key].lastUpdated = new Date(streaks[key].lastUpdated);
      });
      return streaks;
    }
    return {};
  }

  /**
   * Save prayer streaks to localStorage
   */
  static savePrayerStreaks(streaks: Record<string, PrayerStreak>): void {
    localStorage.setItem(this.STREAK_KEY, JSON.stringify(streaks));
  }

  /**
   * Log a prayer as completed
   */
  static logPrayer(
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    onTime: boolean = true,
    date: Date = new Date()
  ): void {
    const dateKey = this.formatDate(date);
    const records = this.getPrayerRecords();
    
    if (!records[dateKey]) {
      records[dateKey] = {
        date: dateKey,
        fajr: { logged: false, onTime: false },
        dhuhr: { logged: false, onTime: false },
        asr: { logged: false, onTime: false },
        maghrib: { logged: false, onTime: false },
        isha: { logged: false, onTime: false }
      };
    }

    records[dateKey][prayer] = {
      logged: true,
      onTime,
      timestamp: new Date().toISOString()
    };

    this.savePrayerRecords(records);
    this.updatePrayerStreaks();
    
    // Update gamification streaks
    GamificationService.updateStreak('prayer', 'all_prayers', true);
    
    // Check for prayer badges
    const allRecords = Object.values(records);
    GamificationService.checkAndAwardBadges(
      {}, // User progress - will integrate with main progress
      this.convertToGamificationFormat(records),
      [] // Journal entries
    );
  }

  /**
   * Calculate current prayer streaks
   */
  static updatePrayerStreaks(): void {
    const records = this.getPrayerRecords();
    const streaks = this.getPrayerStreaks();
    const today = new Date();

    // Calculate different types of streaks
    const allPrayersStreak = this.calculateAllPrayersStreak(records, today);
    const fajrStreak = this.calculateFajrStreak(records, today);
    const onTimeStreak = this.calculateOnTimeStreak(records, today);

    streaks['all_prayers'] = {
      currentStreak: allPrayersStreak.current,
      bestStreak: Math.max(streaks['all_prayers']?.bestStreak || 0, allPrayersStreak.current),
      type: 'all_prayers',
      lastUpdated: today,
      isActive: allPrayersStreak.current > 0
    };

    streaks['fajr_only'] = {
      currentStreak: fajrStreak.current,
      bestStreak: Math.max(streaks['fajr_only']?.bestStreak || 0, fajrStreak.current),
      type: 'fajr_only',
      lastUpdated: today,
      isActive: fajrStreak.current > 0
    };

    streaks['on_time_all'] = {
      currentStreak: onTimeStreak.current,
      bestStreak: Math.max(streaks['on_time_all']?.bestStreak || 0, onTimeStreak.current),
      type: 'on_time_all',
      lastUpdated: today,
      isActive: onTimeStreak.current > 0
    };

    this.savePrayerStreaks(streaks);
  }

  /**
   * Calculate how many days a user has left in a prayer challenge
   */
  static calculateChallengeProgress(
    challengeDuration: number,
    challengeType: 'all_prayers' | 'fajr_only' | 'on_time_all' = 'all_prayers'
  ): PrayerChallengeProgress {
    const streaks = this.getPrayerStreaks();
    const currentStreak = streaks[challengeType]?.currentStreak || 0;
    
    // Apply existing streak to challenge
    const existingStreakApplied = Math.min(currentStreak, challengeDuration);
    const daysRemaining = Math.max(0, challengeDuration - existingStreakApplied);
    
    return {
      challengeId: `prayer-${challengeType}-${challengeDuration}days`,
      totalDaysRequired: challengeDuration,
      daysRemaining,
      existingStreakApplied,
      startDate: new Date(),
      isCompleted: daysRemaining === 0
    };
  }

  /**
   * Get prayer statistics for display
   */
  static getPrayerStats(): {
    totalPrayersLogged: number;
    currentAllPrayersStreak: number;
    currentFajrStreak: number;
    currentOnTimeStreak: number;
    todaysPrayersLogged: number;
    todaysPrayersOnTime: number;
  } {
    const records = this.getPrayerRecords();
    const streaks = this.getPrayerStreaks();
    const today = this.formatDate(new Date());
    const todaysRecord = records[today];

    let totalPrayersLogged = 0;
    Object.values(records).forEach(record => {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        if (record[prayer as keyof Omit<PrayerRecord, 'date'>].logged) {
          totalPrayersLogged++;
        }
      });
    });

    const todaysPrayersLogged = todaysRecord ? 
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(prayer => 
        todaysRecord[prayer as keyof Omit<PrayerRecord, 'date'>].logged
      ).length : 0;

    const todaysPrayersOnTime = todaysRecord ? 
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(prayer => 
        todaysRecord[prayer as keyof Omit<PrayerRecord, 'date'>].onTime
      ).length : 0;

    return {
      totalPrayersLogged,
      currentAllPrayersStreak: streaks['all_prayers']?.currentStreak || 0,
      currentFajrStreak: streaks['fajr_only']?.currentStreak || 0,
      currentOnTimeStreak: streaks['on_time_all']?.currentStreak || 0,
      todaysPrayersLogged,
      todaysPrayersOnTime
    };
  }

  // Private helper methods
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private static calculateAllPrayersStreak(records: Record<string, PrayerRecord>, today: Date): { current: number } {
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateKey = this.formatDate(checkDate);
      const record = records[dateKey];
      
      if (!record) break;
      
      const allPrayersLogged = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(prayer => 
        record[prayer as keyof Omit<PrayerRecord, 'date'>].logged
      );
      
      if (allPrayersLogged) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { current: streak };
  }

  private static calculateFajrStreak(records: Record<string, PrayerRecord>, today: Date): { current: number } {
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateKey = this.formatDate(checkDate);
      const record = records[dateKey];
      
      if (!record || !record.fajr.logged) break;
      
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { current: streak };
  }

  private static calculateOnTimeStreak(records: Record<string, PrayerRecord>, today: Date): { current: number } {
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateKey = this.formatDate(checkDate);
      const record = records[dateKey];
      
      if (!record) break;
      
      const allPrayersOnTime = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(prayer => 
        record[prayer as keyof Omit<PrayerRecord, 'date'>].onTime
      );
      
      if (allPrayersOnTime) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { current: streak };
  }

  private static convertToGamificationFormat(records: Record<string, PrayerRecord>): Record<string, boolean> {
    const gamificationFormat: Record<string, boolean> = {};
    
    Object.entries(records).forEach(([date, record]) => {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        const key = `${date}-${prayer}`;
        gamificationFormat[key] = record[prayer as keyof Omit<PrayerRecord, 'date'>].logged;
      });
    });
    
    return gamificationFormat;
  }
}