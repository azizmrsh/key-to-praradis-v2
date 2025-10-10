import EnhancedPrayerService, { type LocationData, type PrayerTimeWithStatus } from './enhancedPrayerService';
import { calculatePrayerTimes, type PrayerSettings, type NotificationPreference } from './prayerTimes';
import { Coordinates } from 'adhan';

export interface ScheduledPrayerNotification {
  id: string;
  prayerName: string;
  scheduledTime: Date;
  actualPrayerTime: Date;
  timing: 'at' | 'before15' | 'before30' | 'after15' | 'after30';
  message: string;
  isActive: boolean;
  hasFired: boolean;
  dateCreated: Date;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  askingPermission: boolean;
  browserSupported: boolean;
}

export class EnhancedNotificationService {
  private static readonly PERMISSION_KEY = 'prayer_notification_permission';
  private static readonly SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_prayer_notifications';
  private static readonly NOTIFICATION_SETTINGS_KEY = 'prayer_notification_settings';
  private static checkInterval: NodeJS.Timeout | null = null;
  private static lastCheckTime: Date = new Date();

  /**
   * Initialize the notification service
   */
  static async initialize(): Promise<void> {
    if (!this.isBrowserSupported()) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    // Start periodic check for due notifications
    this.startNotificationCheck();
    
    // Clean up old notifications
    this.cleanupOldNotifications();
  }

  /**
   * Check if browser supports notifications
   */
  static isBrowserSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  static getPermissionStatus(): NotificationPermissionStatus {
    const browserSupported = this.isBrowserSupported();
    
    if (!browserSupported) {
      return {
        granted: false,
        denied: true,
        askingPermission: false,
        browserSupported: false
      };
    }

    const permission = Notification.permission;
    
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      askingPermission: permission === 'default',
      browserSupported: true
    };
  }

  /**
   * Request notification permission from user
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!this.isBrowserSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      // Save permission status
      localStorage.setItem(this.PERMISSION_KEY, granted.toString());
      
      if (granted) {
        // Schedule notifications for today if we have location and settings
        await this.scheduleNotificationsForToday();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Schedule prayer notifications for a specific day
   */
  static async schedulePrayerNotifications(
    date: Date,
    location: LocationData,
    settings: PrayerSettings,
    notificationPreferences: NotificationPreference[]
  ): Promise<void> {
    if (!this.getPermissionStatus().granted) {
      console.warn('Cannot schedule notifications without permission');
      return;
    }

    const coordinates = new Coordinates(location.latitude, location.longitude);
    const prayerTimes = calculatePrayerTimes(date, coordinates, settings, location.timezone);
    
    // Get existing scheduled notifications
    const existingNotifications = this.getScheduledNotifications();
    
    // Create notifications for each enabled prayer
    const newNotifications: ScheduledPrayerNotification[] = [];
    
    notificationPreferences.forEach(pref => {
      if (!pref.enabled) return;
      
      const prayerTime = prayerTimes[pref.prayer];
      if (!prayerTime) return;
      
      const scheduledTime = this.calculateNotificationTime(prayerTime, pref.timing);
      const notificationId = `${date.toISOString().split('T')[0]}-${pref.prayer}-${pref.timing}`;
      
      // Check if this notification already exists
      const existingNotification = existingNotifications.find(n => n.id === notificationId);
      if (existingNotification && !existingNotification.hasFired) {
        return; // Skip if already scheduled
      }
      
      const notification: ScheduledPrayerNotification = {
        id: notificationId,
        prayerName: pref.prayer,
        scheduledTime,
        actualPrayerTime: prayerTime,
        timing: pref.timing,
        message: this.generateNotificationMessage(pref.prayer, pref.timing),
        isActive: true,
        hasFired: false,
        dateCreated: new Date()
      };
      
      newNotifications.push(notification);
    });
    
    // Save all notifications
    const allNotifications = [...existingNotifications, ...newNotifications];
    this.saveScheduledNotifications(allNotifications);
    
    console.log(`Scheduled ${newNotifications.length} prayer notifications for ${date.toDateString()}`);
  }

  /**
   * Schedule notifications for today automatically
   */
  static async scheduleNotificationsForToday(): Promise<void> {
    const location = EnhancedPrayerService.getLocationData();
    const savedSettings = localStorage.getItem('prayer_settings_data');
    const savedNotificationPrefs = localStorage.getItem('prayer_notifications_data');
    
    if (!location || !savedSettings || !savedNotificationPrefs) {
      console.log('Missing data for automatic notification scheduling');
      return;
    }

    try {
      const settings: PrayerSettings = JSON.parse(savedSettings);
      const notificationPrefs: NotificationPreference[] = JSON.parse(savedNotificationPrefs);
      
      await this.schedulePrayerNotifications(new Date(), location, settings, notificationPrefs);
    } catch (error) {
      console.error('Error scheduling today\'s notifications:', error);
    }
  }

  /**
   * Calculate when to show notification based on timing preference
   */
  private static calculateNotificationTime(prayerTime: Date, timing: string): Date {
    const notificationTime = new Date(prayerTime);
    
    switch (timing) {
      case 'before30':
        notificationTime.setMinutes(notificationTime.getMinutes() - 30);
        break;
      case 'before15':
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        break;
      case 'after15':
        notificationTime.setMinutes(notificationTime.getMinutes() + 15);
        break;
      case 'after30':
        notificationTime.setMinutes(notificationTime.getMinutes() + 30);
        break;
      case 'at':
      default:
        // Use prayer time as-is
        break;
    }
    
    return notificationTime;
  }

  /**
   * Generate appropriate notification message
   */
  private static generateNotificationMessage(prayer: string, timing: string): string {
    const prayerNames: Record<string, string> = {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      midnight: 'Midnight',
      tahajjud: 'Tahajjud'
    };
    
    const prayerName = prayerNames[prayer] || prayer;
    
    switch (timing) {
      case 'before30':
        return `🕌 ${prayerName} prayer is in 30 minutes`;
      case 'before15':
        return `🕌 ${prayerName} prayer is in 15 minutes`;
      case 'at':
        return `🕌 It's time for ${prayerName} prayer`;
      case 'after15':
        return `🕌 ${prayerName} prayer time has passed (15 min ago)`;
      case 'after30':
        return `🕌 ${prayerName} prayer time has passed (30 min ago)`;
      default:
        return `🕌 ${prayerName} prayer reminder`;
    }
  }

  /**
   * Start periodic check for due notifications
   */
  private static startNotificationCheck(): void {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkForDueNotifications();
    }, 60000);
    
    // Also check immediately
    this.checkForDueNotifications();
  }

  /**
   * Stop notification checking
   */
  static stopNotificationCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for notifications that should be shown now
   */
  private static checkForDueNotifications(): void {
    if (!this.getPermissionStatus().granted) return;
    
    const now = new Date();
    const notifications = this.getScheduledNotifications();
    const dueNotifications = notifications.filter(notification => 
      notification.isActive &&
      !notification.hasFired &&
      notification.scheduledTime <= now
    );
    
    dueNotifications.forEach(notification => {
      this.showNotification(notification);
      notification.hasFired = true;
    });
    
    if (dueNotifications.length > 0) {
      this.saveScheduledNotifications(notifications);
    }
    
    this.lastCheckTime = now;
  }

  /**
   * Show a notification to the user
   */
  private static showNotification(notification: ScheduledPrayerNotification): void {
    try {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/icon-192.png', // App icon
        badge: '/icon-72.png',
        tag: notification.id,
        requireInteraction: true
      };
      
      const notif = new Notification('Keys to Paradise', options);
      
      // Handle notification clicks
      notif.onclick = () => {
        window.focus();
        notif.close();
        // Navigate to prayer tracking page
        window.location.href = '/prayers';
      };
      
      // Auto-close after 10 seconds if not interactive
      setTimeout(() => {
        notif.close();
      }, 10000);
      
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Get scheduled notifications from storage
   */
  private static getScheduledNotifications(): ScheduledPrayerNotification[] {
    try {
      const saved = localStorage.getItem(this.SCHEDULED_NOTIFICATIONS_KEY);
      if (!saved) return [];
      
      const notifications = JSON.parse(saved);
      
      // Parse dates
      return notifications.map((n: any) => ({
        ...n,
        scheduledTime: new Date(n.scheduledTime),
        actualPrayerTime: new Date(n.actualPrayerTime),
        dateCreated: new Date(n.dateCreated)
      }));
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private static saveScheduledNotifications(notifications: ScheduledPrayerNotification[]): void {
    try {
      localStorage.setItem(this.SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  /**
   * Clean up old notifications (older than 7 days)
   */
  private static cleanupOldNotifications(): void {
    const notifications = this.getScheduledNotifications();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const activeNotifications = notifications.filter(n => 
      n.dateCreated > oneWeekAgo || (!n.hasFired && n.isActive)
    );
    
    if (activeNotifications.length !== notifications.length) {
      this.saveScheduledNotifications(activeNotifications);
      console.log(`Cleaned up ${notifications.length - activeNotifications.length} old notifications`);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static cancelAllNotifications(): void {
    this.saveScheduledNotifications([]);
    console.log('All prayer notifications cancelled');
  }

  /**
   * Get notification statistics
   */
  static getNotificationStats(): {
    totalScheduled: number;
    firedToday: number;
    pendingToday: number;
    permissionGranted: boolean;
  } {
    const notifications = this.getScheduledNotifications();
    const today = new Date().toDateString();
    
    const todaysNotifications = notifications.filter(n => 
      n.scheduledTime.toDateString() === today
    );
    
    return {
      totalScheduled: notifications.filter(n => n.isActive).length,
      firedToday: todaysNotifications.filter(n => n.hasFired).length,
      pendingToday: todaysNotifications.filter(n => !n.hasFired && n.isActive).length,
      permissionGranted: this.getPermissionStatus().granted
    };
  }

  /**
   * Test notification (for settings page)
   */
  static async testNotification(): Promise<boolean> {
    if (!this.getPermissionStatus().granted) {
      return false;
    }
    
    try {
      const testNotification = new Notification('Keys to Paradise', {
        body: '🕌 Test prayer notification - your notifications are working!',
        icon: '/icon-192.png',
        tag: 'test-notification'
      });
      
      setTimeout(() => {
        testNotification.close();
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

// Initialize the service when module loads
if (typeof window !== 'undefined') {
  EnhancedNotificationService.initialize().catch(console.error);
}

export { EnhancedNotificationService as default };