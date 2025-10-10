/**
 * Service for handling notifications (browser notifications)
 */

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  time: string; // 24-hour format, e.g., "14:30"
  timestamp: number;
}

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_status';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

class NotificationService {
  private hasPermission: boolean = false;
  private scheduledNotifications: ScheduledNotification[] = [];
  private notificationCheckInterval: number | null = null;

  constructor() {
    this.initializePermissions();
    this.loadScheduledNotifications();
    this.startNotificationCheck();
  }
  
  /**
   * Check if notifications are enabled
   */
  public checkNotificationPermission(): boolean {
    return this.hasPermission;
  }

  /**
   * Initialize notification permissions
   */
  private async initializePermissions() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check if we already have permission
    const savedPermission = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
    
    if (savedPermission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission === 'granted') {
      this.hasPermission = true;
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
    }
  }

  /**
   * Request notification permission from the user
   */
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Load scheduled notifications from storage
   */
  private loadScheduledNotifications() {
    try {
      const saved = localStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      if (saved) {
        this.scheduledNotifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
      this.scheduledNotifications = [];
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private saveScheduledNotifications() {
    localStorage.setItem(
      SCHEDULED_NOTIFICATIONS_KEY,
      JSON.stringify(this.scheduledNotifications)
    );
  }

  /**
   * Start checking for notifications that need to be shown
   */
  private startNotificationCheck() {
    // Check every minute
    this.notificationCheckInterval = window.setInterval(
      this.checkForDueNotifications.bind(this),
      60000
    );
    
    // Also check immediately
    this.checkForDueNotifications();
  }

  /**
   * Check for notifications that are due to be shown
   */
  private checkForDueNotifications() {
    if (!this.hasPermission || this.scheduledNotifications.length === 0) {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Find notifications that match the current time (hour and minute)
    const dueNotifications = this.scheduledNotifications.filter(
      notification => notification.time === currentTime
    );

    // Show due notifications
    dueNotifications.forEach(notification => {
      this.showNotification(notification.title, notification.body);
    });
  }

  /**
   * Show a notification
   */
  private showNotification(title: string, body: string) {
    if (!this.hasPermission) {
      console.log('No permission to show notification:', title, body);
      return;
    }

    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // Default icon
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Schedule a daily reminder notification
   */
  public scheduleReminder(title: string, body: string, time: string): string {
    // Generate a unique ID for this notification
    const id = `reminder_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Remove any existing notifications with similar title and body
    this.scheduledNotifications = this.scheduledNotifications.filter(
      notification => !(notification.title === title && notification.body === body)
    );
    
    // Add the new notification
    this.scheduledNotifications.push({
      id,
      title,
      body,
      time,
      timestamp: Date.now(),
    });
    
    // Save to storage
    this.saveScheduledNotifications();
    
    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  public cancelScheduledNotification(id: string): boolean {
    const initialLength = this.scheduledNotifications.length;
    
    this.scheduledNotifications = this.scheduledNotifications.filter(
      notification => notification.id !== id
    );
    
    if (initialLength !== this.scheduledNotifications.length) {
      this.saveScheduledNotifications();
      return true;
    }
    
    return false;
  }

  /**
   * Get all scheduled notifications
   */
  public getScheduledNotifications(): ScheduledNotification[] {
    return [...this.scheduledNotifications];
  }

  /**
   * Clean up resources when the service is no longer needed
   */
  public cleanup() {
    if (this.notificationCheckInterval !== null) {
      clearInterval(this.notificationCheckInterval);
      this.notificationCheckInterval = null;
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();

// Helper functions for external use
export function checkNotificationPermission(): Promise<boolean> {
  return Promise.resolve(notificationService.checkNotificationPermission());
}

export function requestNotificationPermission(): Promise<boolean> {
  return notificationService.requestPermission();
}

export function scheduleAllPrayerNotifications(
  location: any, 
  prayerSettings: any, 
  notificationPreferences: any[]
): void {
  // Implementation would be added later if needed
  console.log('Would schedule prayer notifications with:', location, prayerSettings, notificationPreferences);
}

export function getNextPrayer(prayerTimes: any): { name: string; time: string; timeUntil: string } | null {
  // Implementation would be added later if needed
  return null;
}