import { secureStorage } from './storage';
import { format, isToday, parseISO, subDays } from 'date-fns';

// Storage keys
const DAILY_LOG_KEY = 'daily_checkin_log';
const STREAK_DAYS_KEY = 'streak_days';
const FAILURE_COUNT_KEY = 'failure_count';

export interface DailyCheckIn {
  date: string; // ISO date string (YYYY-MM-DD)
  success: boolean;
  note?: string;
  focusSin: string;
}

export interface CheckInStatus {
  streakDays: number;
  failureCount: number;
  dailyLog: DailyCheckIn[];
  hasCheckedInToday: boolean;
}

/**
 * Submit a daily check-in
 */
export async function submitDailyCheckIn(
  focusSin: string,
  success: boolean,
  note?: string,
  reminderTime?: string
): Promise<CheckInStatus> {
  // Format today's date as YYYY-MM-DD
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Create the check-in entry
  const checkIn: DailyCheckIn = {
    date: today,
    success,
    note,
    focusSin
  };
  
  // Get existing daily log
  const dailyLog = secureStorage.getItem<DailyCheckIn[]>(DAILY_LOG_KEY, []) || [];
  
  // Check if already checked in today
  const todayIndex = dailyLog.findIndex(log => log.date === today);
  
  if (todayIndex >= 0) {
    // Update today's entry
    dailyLog[todayIndex] = checkIn;
  } else {
    // Add new entry
    dailyLog.push(checkIn);
  }
  
  // Save updated log
  secureStorage.setItem(DAILY_LOG_KEY, dailyLog);
  
  // Update streak count
  let streakDays = secureStorage.getItem<number>(STREAK_DAYS_KEY, 0) || 0;
  
  if (success) {
    // Check if yesterday was also successful or if this is the first entry
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const yesterdayLog = dailyLog.find(log => log.date === yesterday);
    
    if (!yesterdayLog || yesterdayLog.success) {
      // Continue streak
      streakDays += 1;
    } else {
      // Broke the streak yesterday, start a new streak
      streakDays = 1;
    }
  } else {
    // Reset streak on failure
    streakDays = 0;
  }
  
  secureStorage.setItem(STREAK_DAYS_KEY, streakDays);
  
  // Calculate failure count (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const failureCount = dailyLog
    .filter(log => parseISO(log.date) >= sevenDaysAgo && !log.success)
    .length;
  
  secureStorage.setItem(FAILURE_COUNT_KEY, failureCount);
  
  // If reminder time is provided, save it
  if (reminderTime) {
    secureStorage.setItem(`reminder_time_${focusSin}`, reminderTime);
  }
  
  return {
    streakDays,
    failureCount,
    dailyLog,
    hasCheckedInToday: true
  };
}

/**
 * Get the current check-in status
 */
export function getCheckInStatus(): CheckInStatus {
  const dailyLog = secureStorage.getItem<DailyCheckIn[]>(DAILY_LOG_KEY, []) || [];
  const streakDays = secureStorage.getItem<number>(STREAK_DAYS_KEY, 0) || 0;
  const failureCount = secureStorage.getItem<number>(FAILURE_COUNT_KEY, 0) || 0;
  
  // Check if already checked in today
  const today = format(new Date(), 'yyyy-MM-dd');
  const hasCheckedInToday = dailyLog.some(log => log.date === today);
  
  return {
    streakDays,
    failureCount,
    dailyLog,
    hasCheckedInToday
  };
}

/**
 * Get the reminder time for a specific focus sin
 */
export function getReminderTime(focusSin: string): string | null {
  return secureStorage.getItem<string | null>(`reminder_time_${focusSin}`, null);
}

/**
 * Set the reminder time for a specific focus sin
 */
export function setReminderTime(focusSin: string, reminderTime: string): void {
  secureStorage.setItem(`reminder_time_${focusSin}`, reminderTime);
}

/**
 * Check if a streak was broken (no check-in yesterday but had streak before)
 */
export function checkIfStreakBroken(): { broken: boolean, previousStreak: number } {
  const dailyLog = secureStorage.getItem<DailyCheckIn[]>(DAILY_LOG_KEY, []) || [];
  const streakDays = secureStorage.getItem<number>(STREAK_DAYS_KEY, 0) || 0;
  
  // If streak is 0, it's not broken
  if (streakDays === 0) {
    return { broken: false, previousStreak: 0 };
  }
  
  // Check if yesterday has an entry
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const yesterdayLog = dailyLog.find(log => log.date === yesterday);
  
  // If no entry for yesterday or it was a failure, and streak > 0, then streak is broken
  if (!yesterdayLog || !yesterdayLog.success) {
    return { broken: true, previousStreak: streakDays };
  }
  
  return { broken: false, previousStreak: streakDays };
}

/**
 * Calculate the weekly success rate (percentage of successful check-ins)
 */
export function calculateWeeklySuccessRate(): number {
  const dailyLog = secureStorage.getItem<DailyCheckIn[]>(DAILY_LOG_KEY, []) || [];
  
  // Get logs from last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentLogs = dailyLog.filter(log => parseISO(log.date) >= sevenDaysAgo);
  
  if (recentLogs.length === 0) {
    return 0;
  }
  
  const successCount = recentLogs.filter(log => log.success).length;
  return (successCount / recentLogs.length) * 100;
}