import { PrayerTimeService, PrayerTimes } from './prayerTimeService';

export interface NotificationSettings {
  enabled: boolean;
  timing: 'at' | 'before15' | 'before30' | 'after15' | 'after30';
  sound: boolean;
  vibration: boolean;
}

export class PrayerNotificationService {
  private static notificationPermission: NotificationPermission = 'default';
  private static scheduledNotifications: Map<string, number> = new Map();

  /**
   * Request notification permission from the user
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Schedule prayer time notifications for today
   */
  static async schedulePrayerNotifications(
    prayerTimes: PrayerTimes,
    settings: NotificationSettings
  ): Promise<void> {
    if (!settings.enabled || this.notificationPermission !== 'granted') {
      return;
    }

    // Clear existing notifications
    this.clearAllNotifications();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    for (const prayer of prayers) {
      await this.schedulePrayerNotification(prayer.name, prayer.time, settings);
    }
  }

  /**
   * Schedule a single prayer notification
   */
  private static async schedulePrayerNotification(
    prayerName: string,
    prayerTime: string,
    settings: NotificationSettings
  ): Promise<void> {
    const notificationTime = this.calculateNotificationTime(prayerTime, settings.timing);
    const now = new Date();

    if (notificationTime <= now) {
      return; // Skip past times
    }

    const delay = notificationTime.getTime() - now.getTime();
    
    const timeoutId = window.setTimeout(() => {
      this.showPrayerNotification(prayerName, prayerTime, settings);
    }, delay);

    this.scheduledNotifications.set(`${prayerName}-${settings.timing}`, timeoutId);
  }

  /**
   * Show a prayer notification
   */
  private static showPrayerNotification(
    prayerName: string,
    prayerTime: string,
    settings: NotificationSettings
  ): void {
    const title = `🕌 ${prayerName} Prayer Time`;
    const body = this.getNotificationMessage(prayerName, prayerTime, settings.timing);
    
    const notification = new Notification(title, {
      body,
      icon: '/prayer-icon.png', // You can add this icon to public folder
      badge: '/prayer-badge.png',
      tag: `prayer-${prayerName}`,
      requireInteraction: true,
      actions: [
        {
          action: 'pray',
          title: '🤲 I will pray now'
        },
        {
          action: 'remind',
          title: '⏰ Remind me in 5 min'
        }
      ]
    });

    // Handle notification clicks
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Play sound if enabled
    if (settings.sound) {
      this.playNotificationSound();
    }

    // Vibrate if enabled and supported
    if (settings.vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);
  }

  /**
   * Calculate when to show the notification based on timing preference
   */
  private static calculateNotificationTime(prayerTime: string, timing: string): Date {
    const [timeStr, period] = prayerTime.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const today = new Date();
    const prayerDateTime = new Date(today);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    prayerDateTime.setHours(hour24, minutes, 0, 0);
    
    // Adjust based on timing preference
    switch (timing) {
      case 'before15':
        prayerDateTime.setMinutes(prayerDateTime.getMinutes() - 15);
        break;
      case 'before30':
        prayerDateTime.setMinutes(prayerDateTime.getMinutes() - 30);
        break;
      case 'after15':
        prayerDateTime.setMinutes(prayerDateTime.getMinutes() + 15);
        break;
      case 'after30':
        prayerDateTime.setMinutes(prayerDateTime.getMinutes() + 30);
        break;
      // 'at' requires no adjustment
    }
    
    return prayerDateTime;
  }

  /**
   * Get appropriate notification message based on timing
   */
  private static getNotificationMessage(prayerName: string, prayerTime: string, timing: string): string {
    switch (timing) {
      case 'before15':
        return `${prayerName} prayer time is in 15 minutes (${prayerTime})`;
      case 'before30':
        return `${prayerName} prayer time is in 30 minutes (${prayerTime})`;
      case 'after15':
        return `${prayerName} prayer time was 15 minutes ago (${prayerTime})`;
      case 'after30':
        return `${prayerName} prayer time was 30 minutes ago (${prayerTime})`;
      default:
        return `It's time for ${prayerName} prayer (${prayerTime})`;
    }
  }

  /**
   * Play notification sound
   */
  private static playNotificationSound(): void {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  /**
   * Clear all scheduled notifications
   */
  static clearAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  /**
   * Get notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }

  /**
   * Check if notifications are supported
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Show immediate test notification
   */
  static async showTestNotification(): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification('🕌 Prayer Reminder Test', {
      body: 'Prayer notifications are working correctly!',
      icon: '/prayer-icon.png',
      tag: 'test-notification'
    });

    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}