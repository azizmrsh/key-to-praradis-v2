import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

// Combine class names with clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in various ways
export function formatDate(date: Date | string, formatString: string = "PP"): string {
  if (!date) return "";
  return format(new Date(date), formatString);
}

// Get today's date formatted for display
export function getTodayFormatted(formatString: string = "EEEE, d MMMM"): string {
  return formatDate(new Date(), formatString);
}

// Calculate user streak based on activity dates
export function calculateStreak(activityDates: Date[]): number {
  if (!activityDates || activityDates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = [...activityDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if there's activity today
  const latestDate = new Date(sortedDates[0]);
  latestDate.setHours(0, 0, 0, 0);
  
  // If no activity today, streak is 0
  if (latestDate.getTime() !== today.getTime() && 
      latestDate.getTime() !== today.getTime() - 86400000) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = latestDate;
  
  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const nextDate = new Date(sortedDates[i]);
    nextDate.setHours(0, 0, 0, 0);
    
    const expectedPrevDate = new Date(currentDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    
    if (nextDate.getTime() === expectedPrevDate.getTime()) {
      streak++;
      currentDate = nextDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// Generate a simple tracking ID for analytics without PII
export function generateTrackingId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Get completion percentage
export function getCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Check if the app is running on a mobile device
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Format time duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Extract first name from a full name
export function getFirstName(fullName: string): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
