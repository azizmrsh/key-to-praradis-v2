import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export class NotificationService {
  private static instance: NotificationService;
  private hasNotificationPermission = false;
  private isInitialized = false;
  private notificationHandlers: Set<(notification: any) => void> = new Set();

  private constructor() {
    this.initialize().catch(console.error);
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * تهيئة خدمة الإشعارات
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // إعداد مستمعي الإشعارات
      await this.setupNotificationListeners();
      
      // التحقق من حالة الأذونات الحالية
      const permission = await this.checkPermissionStatus();
      this.hasNotificationPermission = permission === 'granted';

      // في iOS، نحتاج إلى تسجيل التطبيق للإشعارات حتى لو لم يتم منح الإذن بعد
      if (Capacitor.getPlatform() === 'ios') {
        await PushNotifications.register();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
    }
  }

  /**
   * إعداد مستمعي الإشعارات
   */
  private async setupNotificationListeners(): Promise<void> {
    // مستمع تسجيل الإشعارات
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success:', token.value);
    });

    // مستمع أخطاء التسجيل
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', error);
    });

    // مستمع استلام الإشعارات
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.notifyHandlers(notification);
    });

    // مستمع الضغط على الإشعار
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      this.notifyHandlers(notification.notification);
    });

    // إعداد مستمعي الإشعارات المحلية
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received:', notification);
      this.notifyHandlers(notification);
    });
  }

  /**
   * طلب أذونات الإشعارات مع معالجة خاصة لكل منصة
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      // عرض شرح للمستخدم قبل طلب الإذن
      if (!await this.showPermissionDialog()) {
        return false;
      }

      const platform = Capacitor.getPlatform();

      if (platform === 'ios') {
        // في iOS نحتاج معالجة خاصة
        await this.handleIOSPermissions();
      } else {
        // في Android نطلب الإذن مباشرة
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
          await PushNotifications.register();
          this.hasNotificationPermission = true;
        }
      }

      // طلب إذن الإشعارات المحلية أيضاً
      await LocalNotifications.requestPermissions();

      return this.hasNotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * معالجة خاصة لأذونات iOS
   */
  private async handleIOSPermissions(): Promise<void> {
    try {
      // في iOS، نتحقق أولاً مما إذا كان التطبيق مسجلاً للإشعارات
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'denied') {
        // إذا تم الرفض، نوجه المستخدم إلى الإعدادات
        await this.showIOSSettingsDialog();
      } else if (result.receive === 'granted') {
        this.hasNotificationPermission = true;
      }
    } catch (error) {
      console.error('Error handling iOS permissions:', error);
      throw error;
    }
  }

  /**
   * عرض مربع حوار خاص بإعدادات iOS
   */
  private async showIOSSettingsDialog(): Promise<void> {
    const confirmResult = confirm(
      'لتلقي إشعارات مهمة حول الصلوات والأذكار، يرجى تفعيل الإشعارات من إعدادات التطبيق. هل تريد الانتقال إلى الإعدادات الآن؟'
    );

    if (confirmResult) {
      await App.openUrl('app-settings:');
    }
  }

  /**
   * التحقق من حالة أذونات الإشعارات
   */
  public async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      const status = await PushNotifications.checkPermissions();
      return status.receive;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return 'denied';
    }
  }

  /**
   * جدولة إشعار محلي
   */
  public async scheduleLocalNotification(
    title: string,
    body: string,
    scheduleTime?: Date,
    extra?: { [key: string]: any }
  ): Promise<void> {
    try {
      if (!this.hasNotificationPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('لم يتم منح إذن الإشعارات');
        }
      }

      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: new Date().getTime(),
          schedule: scheduleTime ? { at: scheduleTime } : undefined,
          extra
        }]
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  /**
   * إضافة معالج للإشعارات
   */
  public addNotificationHandler(handler: (notification: any) => void): void {
    this.notificationHandlers.add(handler);
  }

  /**
   * إزالة معالج الإشعارات
   */
  public removeNotificationHandler(handler: (notification: any) => void): void {
    this.notificationHandlers.delete(handler);
  }

  /**
   * إخطار جميع المعالجين
   */
  private notifyHandlers(notification: any): void {
    this.notificationHandlers.forEach(handler => handler(notification));
  }

  /**
   * عرض مربع حوار طلب الإذن
   */
  private async showPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const message = Capacitor.getPlatform() === 'ios' ?
        'نحتاج إلى إذنك لإرسال إشعارات مهمة حول مواعيد الصلاة والأذكار. اضغط "السماح" في النافذة التالية لتفعيل الإشعارات.' :
        'نحتاج إلى إذنك لإرسال إشعارات مهمة حول مواعيد الصلاة والأذكار.';
      
      const result = confirm(message);
      resolve(result);
    });
  }

  /**
   * إلغاء تسجيل الإشعارات
   */
  public async cleanup(): Promise<void> {
    try {
      await PushNotifications.unregister();
      this.notificationHandlers.clear();
      this.isInitialized = false;
      this.hasNotificationPermission = false;
    } catch (error) {
      console.error('Error cleaning up notification service:', error);
    }
  }
}

// تصدير نسخة واحدة من خدمة الإشعارات
export const notificationService = NotificationService.getInstance();