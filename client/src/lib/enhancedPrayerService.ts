import { calculatePrayerTimes, formatPrayerTime, type PrayerSettings, type UserLocation } from './prayerTimes';
import { PrayerStreakService } from './prayerStreakService';
import { Coordinates } from 'adhan';

export interface PrayerTimeWithStatus {
  name: string;
  time: Date;
  formattedTime: string;
  isCurrentTime: boolean;
  isUpcoming: boolean;
  hasBeenPrayed: boolean;
  prayedOnTime: boolean;
  timeUntil?: string;
  timeAfter?: string;
}

export interface PrayerNotification {
  id: string;
  prayerName: string;
  scheduledTime: Date;
  notificationType: 'at' | 'before15' | 'before30' | 'after15' | 'after30';
  message: string;
  isActive: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
  accuracy?: number;
  lastUpdated: Date;
}

export interface PrayerStatistics {
  totalPrayersLogged: number;
  totalPrayersOnTime: number;
  currentAllPrayersStreak: number;
  currentFajrStreak: number;
  currentOnTimeStreak: number;
  bestAllPrayersStreak: number;
  bestFajrStreak: number;
  bestOnTimeStreak: number;
  todaysPrayersLogged: number;
  todaysPrayersOnTime: number;
  weeklyStats: {
    totalPrayers: number;
    onTimePrayers: number;
    percentage: number;
  };
  monthlyStats: {
    totalPrayers: number;
    onTimePrayers: number;
    percentage: number;
  };
  consecutiveDaysWithoutMissing: number;
  lastMissedPrayer: Date | null;
}

export class EnhancedPrayerService {
  private static readonly LOCATION_STORAGE_KEY = 'prayer_location_data';
  private static readonly SETTINGS_STORAGE_KEY = 'prayer_settings_data';
  private static readonly NOTIFICATIONS_STORAGE_KEY = 'prayer_notifications_data';
  private static readonly PRAYER_TRACKING_KEY = 'prayer_tracking_data';

  /**
   * Get saved location data with validation
   */
  static getLocationData(): LocationData | null {
    try {
      const saved = localStorage.getItem(this.LOCATION_STORAGE_KEY);
      if (!saved) return null;

      const location = JSON.parse(saved);
      
      // Validate required fields
      if (!location.latitude || !location.longitude || !location.timezone) {
        return null;
      }

      return {
        ...location,
        lastUpdated: new Date(location.lastUpdated)
      };
    } catch (error) {
      console.error('Error loading location data:', error);
      return null;
    }
  }

  /**
   * Save location data with validation
   */
  static saveLocationData(location: LocationData): boolean {
    try {
      // Validate required fields
      if (!location.latitude || !location.longitude || !location.timezone) {
        throw new Error('Missing required location fields');
      }

      // Validate coordinate ranges
      if (location.latitude < -90 || location.latitude > 90) {
        throw new Error('Invalid latitude value');
      }
      if (location.longitude < -180 || location.longitude > 180) {
        throw new Error('Invalid longitude value');
      }

      const locationData = {
        ...location,
        lastUpdated: new Date()
      };

      localStorage.setItem(this.LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      
      // Trigger update event for components listening for location changes
      window.dispatchEvent(new CustomEvent('prayerSettingsUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error saving location data:', error);
      return false;
    }
  }

  /**
   * Get current location using GPS with enhanced error handling
   */
static async getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    // Request permission explicitly first
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'denied') {
            reject(new Error('Location permission denied. Please enable location access in your settings.'));
            return;
          }
        })
        .catch((error) => {
          console.error('Error checking location permission:', error);
        });
    }      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            // Get city and country via reverse geocoding
            const locationData = await this.reverseGeocode(latitude, longitude);

            const result: LocationData = {
              latitude,
              longitude,
              timezone,
              city: locationData.city,
              country: locationData.country,
              accuracy,
              lastUpdated: new Date()
            };

            resolve(result);
          } catch (error) {
            // Even if geocoding fails, return basic location data
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              accuracy: position.coords.accuracy,
              lastUpdated: new Date()
            });
          }
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Reverse geocode coordinates to get city and country
   */
  private static async reverseGeocode(lat: number, lng: number): Promise<{city?: string, country?: string}> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || address.county,
        country: address.country
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  }

  /**
   * Get prayer times with enhanced status information
   */
  static getPrayerTimesWithStatus(
    location: LocationData,
    settings: PrayerSettings,
    date: Date = new Date()
  ): PrayerTimeWithStatus[] {
    const coordinates = new Coordinates(location.latitude, location.longitude);
    const prayerTimes = calculatePrayerTimes(date, coordinates, settings, location.timezone);
    
    const currentTime = new Date();
    const prayerRecords = PrayerStreakService.getPrayerRecords();
    const todayKey = this.formatDate(date);
    const todayRecord = prayerRecords[todayKey];

    const prayers: PrayerTimeWithStatus[] = [];
    
    const prayerNames: ('fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha')[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    prayerNames.forEach(prayerName => {
      const prayerTime = prayerTimes[prayerName];
      const prayerRecord = todayRecord?.[prayerName];
      
      const timeDiff = currentTime.getTime() - prayerTime.getTime();
      const isCurrentTime = Math.abs(timeDiff) <= 30 * 60 * 1000; // Within 30 minutes
      const isUpcoming = prayerTime.getTime() > currentTime.getTime();
      
      let timeUntil: string | undefined;
      let timeAfter: string | undefined;
      
      if (isUpcoming) {
        const minutesUntil = Math.floor((prayerTime.getTime() - currentTime.getTime()) / (1000 * 60));
        const hours = Math.floor(minutesUntil / 60);
        const minutes = minutesUntil % 60;
        timeUntil = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      } else {
        const minutesAfter = Math.floor((currentTime.getTime() - prayerTime.getTime()) / (1000 * 60));
        const hours = Math.floor(minutesAfter / 60);
        const minutes = minutesAfter % 60;
        timeAfter = hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`;
      }

      prayers.push({
        name: prayerName,
        time: prayerTime,
        formattedTime: formatPrayerTime(prayerTime, 'h:mm a', location.timezone),
        isCurrentTime,
        isUpcoming,
        hasBeenPrayed: prayerRecord?.logged || false,
        prayedOnTime: prayerRecord?.onTime || false,
        timeUntil,
        timeAfter
      });
    });

    return prayers;
  }

  /**
   * Get next prayer with enhanced information
   */
  static getNextPrayer(location: LocationData, settings: PrayerSettings): PrayerTimeWithStatus | null {
    const prayers = this.getPrayerTimesWithStatus(location, settings);
    return prayers.find(prayer => prayer.isUpcoming) || null;
  }

  /**
   * Get current prayer (if within prayer time window)
   */
  static getCurrentPrayer(location: LocationData, settings: PrayerSettings): PrayerTimeWithStatus | null {
    const prayers = this.getPrayerTimesWithStatus(location, settings);
    return prayers.find(prayer => prayer.isCurrentTime) || null;
  }

  /**
   * Record prayer with enhanced tracking
   */
  static recordPrayer(
    prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    onTime: boolean = true,
    date: Date = new Date()
  ): void {
    PrayerStreakService.logPrayer(prayerName, onTime, date);
    
    // Update consecutive days tracking
    this.updateConsecutiveDaysWithoutMissing();
    
    // Schedule next notification if needed
    this.scheduleNextNotification();
  }

  /**
   * Get comprehensive prayer statistics
   */
  static getPrayerStatistics(): PrayerStatistics {
    const basicStats = PrayerStreakService.getPrayerStats();
    const prayerRecords = PrayerStreakService.getPrayerRecords();
    const streaks = PrayerStreakService.getPrayerStreaks();

    // Calculate total on-time prayers
    let totalPrayersOnTime = 0;
    Object.values(prayerRecords).forEach(record => {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        const prayerRecord = record[prayer as keyof typeof record];
        if (prayerRecord && typeof prayerRecord === 'object' && 'onTime' in prayerRecord && prayerRecord.onTime) {
          totalPrayersOnTime++;
        }
      });
    });

    // Calculate weekly stats
    const weeklyStats = this.calculateWeeklyStats(prayerRecords);
    const monthlyStats = this.calculateMonthlyStats(prayerRecords);
    const consecutiveDaysWithoutMissing = this.calculateConsecutiveDaysWithoutMissing(prayerRecords);
    const lastMissedPrayer = this.getLastMissedPrayerDate(prayerRecords);

    return {
      ...basicStats,
      totalPrayersOnTime,
      bestAllPrayersStreak: streaks['all_prayers']?.bestStreak || 0,
      bestFajrStreak: streaks['fajr_only']?.bestStreak || 0,
      bestOnTimeStreak: streaks['on_time_all']?.bestStreak || 0,
      weeklyStats,
      monthlyStats,
      consecutiveDaysWithoutMissing,
      lastMissedPrayer
    };
  }

  /**
   * Calculate weekly prayer statistics
   */
  private static calculateWeeklyStats(prayerRecords: Record<string, any>): {
    totalPrayers: number;
    onTimePrayers: number;
    percentage: number;
  } {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let totalPrayers = 0;
    let onTimePrayers = 0;

    Object.entries(prayerRecords).forEach(([dateKey, record]) => {
      const recordDate = new Date(dateKey);
      if (recordDate >= oneWeekAgo) {
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
          if (record[prayer].logged) {
            totalPrayers++;
            if (record[prayer].onTime) {
              onTimePrayers++;
            }
          }
        });
      }
    });

    return {
      totalPrayers,
      onTimePrayers,
      percentage: totalPrayers > 0 ? Math.round((onTimePrayers / totalPrayers) * 100) : 0
    };
  }

  /**
   * Calculate monthly prayer statistics
   */
  private static calculateMonthlyStats(prayerRecords: Record<string, any>): {
    totalPrayers: number;
    onTimePrayers: number;
    percentage: number;
  } {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let totalPrayers = 0;
    let onTimePrayers = 0;

    Object.entries(prayerRecords).forEach(([dateKey, record]) => {
      const recordDate = new Date(dateKey);
      if (recordDate >= oneMonthAgo) {
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
          if (record[prayer].logged) {
            totalPrayers++;
            if (record[prayer].onTime) {
              onTimePrayers++;
            }
          }
        });
      }
    });

    return {
      totalPrayers,
      onTimePrayers,
      percentage: totalPrayers > 0 ? Math.round((onTimePrayers / totalPrayers) * 100) : 0
    };
  }

  /**
   * Calculate consecutive days without missing any prayers
   */
  private static calculateConsecutiveDaysWithoutMissing(prayerRecords: Record<string, any>): number {
    const today = new Date();
    let consecutiveDays = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = this.formatDate(checkDate);
      const record = prayerRecords[dateKey];

      if (!record) break;

      // Check if all prayers were logged for this day
      const allPrayersLogged = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(prayer => 
        record[prayer].logged
      );

      if (allPrayersLogged) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  /**
   * Get the date of the last missed prayer
   */
  private static getLastMissedPrayerDate(prayerRecords: Record<string, any>): Date | null {
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = this.formatDate(checkDate);
      const record = prayerRecords[dateKey];

      if (!record) continue;

      // Check if any prayer was missed
      const anyPrayerMissed = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].some(prayer => 
        !record[prayer].logged
      );

      if (anyPrayerMissed) {
        return checkDate;
      }
    }

    return null;
  }

  /**
   * Update consecutive days without missing tracking
   */
  private static updateConsecutiveDaysWithoutMissing(): void {
    const prayerRecords = PrayerStreakService.getPrayerRecords();
    const consecutiveDays = this.calculateConsecutiveDaysWithoutMissing(prayerRecords);
    
    // Save this for quick access
    localStorage.setItem('consecutive_days_without_missing', consecutiveDays.toString());
  }

  /**
   * Schedule next notification (placeholder for notification system)
   */
  private static scheduleNextNotification(): void {
    // This would integrate with the notification service
    // Implementation depends on notification system enhancement
  }

  /**
   * Format date for storage keys
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export { EnhancedPrayerService as default };