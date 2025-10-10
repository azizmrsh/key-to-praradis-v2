export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  location: string;
}

export interface QiblaDirection {
  direction: number; // degrees from North
  distance: number; // kilometers to Mecca
}

export interface PrayerTimeSettings {
  calculationMethod: string;
  madhab: 'shafi' | 'hanafi';
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  notificationSettings: {
    enabled: boolean;
    timing: 'at' | 'before15' | 'before30' | 'after15' | 'after30';
  };
}

export class PrayerTimeService {
  private static readonly ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
  
  /**
   * Get prayer times for a specific location and date
   */
  static async getPrayerTimes(
    latitude: number, 
    longitude: number, 
    settings: Partial<PrayerTimeSettings> = {}
  ): Promise<PrayerTimes> {
    try {
      const method = this.getCalculationMethodNumber(settings.calculationMethod || 'muslim-world-league');
      const madhab = settings.madhab === 'hanafi' ? 1 : 0; // 0 = Shafi, 1 = Hanafi
      
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      
      const response = await fetch(
        `${this.ALADHAN_API_BASE}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${madhab}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }
      
      const data = await response.json();
      const timings = data.data.timings;
      const location = data.data.meta.timezone;
      
      return {
        fajr: this.formatTime(timings.Fajr),
        sunrise: this.formatTime(timings.Sunrise),
        dhuhr: this.formatTime(timings.Dhuhr),
        asr: this.formatTime(timings.Asr),
        maghrib: this.formatTime(timings.Maghrib),
        isha: this.formatTime(timings.Isha),
        date: data.data.date.readable,
        location: location
      };
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw new Error('Could not fetch prayer times. Please check your internet connection.');
    }
  }

  /**
   * Calculate Qibla direction from user's location to Mecca
   */
  static calculateQiblaDirection(latitude: number, longitude: number): QiblaDirection {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;
    
    // Convert to radians
    const lat1 = this.toRadians(latitude);
    const lat2 = this.toRadians(meccaLat);
    const deltaLng = this.toRadians(meccaLng - longitude);
    
    // Calculate bearing (Qibla direction)
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let bearing = this.toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360
    
    // Calculate distance to Mecca
    const distance = this.calculateDistance(latitude, longitude, meccaLat, meccaLng);
    
    return {
      direction: Math.round(bearing),
      distance: Math.round(distance)
    };
  }

  /**
   * Get the next prayer time and remaining time
   */
  static getNextPrayer(prayerTimes: PrayerTimes): { 
    name: string; 
    time: string; 
    remainingMinutes: number;
    isToday: boolean;
  } {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];
    
    for (const prayer of prayers) {
      const prayerMinutes = this.timeToMinutes(prayer.time);
      if (prayerMinutes > currentTime) {
        return {
          name: prayer.name,
          time: prayer.time,
          remainingMinutes: prayerMinutes - currentTime,
          isToday: true
        };
      }
    }
    
    // If no prayer left today, return tomorrow's Fajr
    const tomorrowFajrMinutes = this.timeToMinutes(prayerTimes.fajr) + (24 * 60);
    return {
      name: 'Fajr',
      time: prayerTimes.fajr,
      remainingMinutes: tomorrowFajrMinutes - currentTime,
      isToday: false
    };
  }

  /**
   * Check if it's currently prayer time (within 5 minutes)
   */
  static isCurrentlyPrayerTime(prayerTimes: PrayerTimes): string | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];
    
    for (const prayer of prayers) {
      const prayerMinutes = this.timeToMinutes(prayer.time);
      if (Math.abs(currentTime - prayerMinutes) <= 5) {
        return prayer.name;
      }
    }
    
    return null;
  }

  // Helper methods
  private static getCalculationMethodNumber(method: string): number {
    const methods: Record<string, number> = {
      'muslim-world-league': 3,
      'egyptian': 5,
      'karachi': 1,
      'umm-al-qura': 4,
      'dubai': 8,
      'north-america': 2,
      'kuwait': 9,
      'qatar': 10,
      'singapore': 11
    };
    return methods[method] || 3;
  }

  private static formatTime(time: string): string {
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  private static timeToMinutes(time: string): number {
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    
    return totalMinutes;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format remaining time in a human-readable way
   */
  static formatRemainingTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
}