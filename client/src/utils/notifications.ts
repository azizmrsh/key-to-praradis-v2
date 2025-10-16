import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { permissionsManager } from './permissions';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    try {
      // Add listeners for push notifications
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        this.handleNotification(notification);
      });

      // Add listeners for local notifications
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        this.handleLocalNotification(notification);
      });

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private handleNotification(notification: any) {
    // Handle incoming push notification
    console.log('Push notification received:', notification);
  }

  private handleLocalNotification(notification: any) {
    // Handle local notification
    console.log('Local notification received:', notification);
  }

  public async scheduleLocalNotification(title: string, body: string, scheduledTime?: Date) {
    try {
      if (!await permissionsManager.checkPermissionStatus('notifications')) {
        const granted = await permissionsManager.requestNotificationPermissions();
        if (!granted) {
          throw new Error('Notification permissions not granted');
        }
      }

      const notificationId = new Date().getTime();
      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId,
          title,
          body,
          schedule: scheduledTime ? { at: scheduledTime } : undefined,
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }]
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();