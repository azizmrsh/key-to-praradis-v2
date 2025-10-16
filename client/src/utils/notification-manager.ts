import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Toast } from '@capacitor/toast';

export interface NotificationSettings {
  pushEnabled: boolean;
  localEnabled: boolean;
  soundEnabled: boolean;
  criticalAlertsEnabled?: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private initialized = false;
  private settings: NotificationSettings = {
    pushEnabled: false,
    localEnabled: false,
    soundEnabled: true,
    criticalAlertsEnabled: false
  };

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * تهيئة مدير الإشعارات
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // إعداد مستمعي الإشعارات
      await this.setupNotificationListeners();
      
      // التحقق من حالة الأذونات عند بدء التشغيل
      await this.checkNotificationPermissions();
      
      this.initialized = true;
    } catch (error) {
      console.error('خطأ في تهيئة مدير الإشعارات:', error);
    }
  }

  /**
   * إعداد مستمعي الإشعارات
   */
  private async setupNotificationListeners(): Promise<void> {
    // مستمع التسجيل
    PushNotifications.addListener('registration', (token) => {
      console.log('تم تسجيل الإشعارات بنجاح:', token.value);
    });

    // مستمع أخطاء التسجيل
    PushNotifications.addListener('registrationError', (error) => {
      console.error('خطأ في تسجيل الإشعارات:', error);
    });

    // مستمع استلام الإشعارات
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('تم استلام إشعار:', notification);
      this.showNotificationToast(notification.title, notification.body);
    });

    // مستمع الضغط على الإشعار
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('تم الضغط على الإشعار:', action);
    });

    // مستمع الإشعارات المحلية
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('تم استلام إشعار محلي:', notification);
      this.showNotificationToast(notification.title, notification.body);
    });
  }

  /**
   * طلب أذونات الإشعارات
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const platform = Capacitor.getPlatform();

      // عرض شرح للمستخدم قبل طلب الإذن
      if (!await this.showPermissionDialog(platform)) {
        return false;
      }

      // طلب الأذونات حسب المنصة
      if (platform === 'ios') {
        return await this.requestIOSPermissions();
      } else {
        return await this.requestAndroidPermissions();
      }
    } catch (error) {
      console.error('خطأ في طلب أذونات الإشعارات:', error);
      return false;
    }
  }

  /**
   * طلب أذونات iOS
   */
  private async requestIOSPermissions(): Promise<boolean> {
    try {
      let permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        permissionStatus = result;
      }

      if (permissionStatus.receive === 'denied') {
        // توجيه المستخدم إلى الإعدادات
        const openSettings = await this.showSettingsPrompt('ios');
        if (openSettings) {
          await this.openAppSettings();
        }
        return false;
      }

      if (permissionStatus.receive === 'granted') {
        await this.registerForPushNotifications();
        this.settings.pushEnabled = true;
        
        // طلب إذن الإشعارات المحلية
        const localResult = await LocalNotifications.requestPermissions();
        this.settings.localEnabled = localResult.display === 'granted';
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('خطأ في طلب أذونات iOS:', error);
      return false;
    }
  }

  /**
   * طلب أذونات Android
   */
  private async requestAndroidPermissions(): Promise<boolean> {
    try {
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'denied') {
        const openSettings = await this.showSettingsPrompt('android');
        if (openSettings) {
          await this.openAppSettings();
        }
        return false;
      }

      if (result.receive === 'granted') {
        await this.registerForPushNotifications();
        this.settings.pushEnabled = true;
        
        // في Android، الإشعارات المحلية تعمل تلقائياً عند السماح بالإشعارات
        this.settings.localEnabled = true;
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('خطأ في طلب أذونات Android:', error);
      return false;
    }
  }

  /**
   * التحقق من حالة أذونات الإشعارات
   */
  private async checkNotificationPermissions(): Promise<void> {
    try {
      const status = await PushNotifications.checkPermissions();
      this.settings.pushEnabled = status.receive === 'granted';
      
      if (this.settings.pushEnabled) {
        await this.registerForPushNotifications();
      }
    } catch (error) {
      console.error('خطأ في التحقق من أذونات الإشعارات:', error);
    }
  }

  /**
   * التسجيل لاستقبال الإشعارات
   */
  private async registerForPushNotifications(): Promise<void> {
    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('خطأ في تسجيل الإشعارات:', error);
      throw error;
    }
  }

  /**
   * جدولة إشعار محلي
   */
  public async scheduleLocalNotification(options: ScheduleOptions): Promise<void> {
    try {
      if (!this.settings.localEnabled) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('لم يتم السماح بالإشعارات');
        }
      }

      await LocalNotifications.schedule(options);
    } catch (error) {
      console.error('خطأ في جدولة الإشعار المحلي:', error);
      throw error;
    }
  }

  /**
   * عرض مربع حوار طلب الإذن
   */
  private async showPermissionDialog(platform: string): Promise<boolean> {
    let message = 'نحتاج إلى إذنك لإرسال إشعارات مهمة حول:';
    message += '\n- مواعيد الصلوات';
    message += '\n- الأذكار اليومية';
    message += '\n- التذكير بالتحديات';
    
    if (platform === 'ios') {
      message += '\n\nاضغط "السماح" في النافذة التالية لتفعيل الإشعارات.';
    }

    return confirm(message);
  }

  /**
   * عرض مربع حوار الإعدادات
   */
  private async showSettingsPrompt(platform: string): Promise<boolean> {
    const message = platform === 'ios' ?
      'لتلقي إشعارات مهمة، يرجى السماح بالإشعارات من إعدادات التطبيق. هل تريد فتح الإعدادات الآن؟' :
      'لتلقي إشعارات مهمة، يرجى السماح بالإشعارات من إعدادات التطبيق. هل تريد فتح إعدادات التطبيق؟';

    return confirm(message);
  }

  /**
   * فتح إعدادات التطبيق
   */
  private async openAppSettings(): Promise<void> {
    // استخدام الأمر المناسب لكل منصة
    if (Capacitor.getPlatform() === 'ios') {
      await Capacitor.openUrl('app-settings:');
    } else {
      // في Android نستخدم مكتبة App لفتح إعدادات التطبيق
      const packageName = await this.getPackageName();
      await Capacitor.openUrl(`package:${packageName}`);
    }
  }

  /**
   * عرض إشعار Toast
   */
  private async showNotificationToast(title: string, body: string): Promise<void> {
    try {
      await Toast.show({
        text: `${title}\n${body}`,
        duration: 'short',
        position: 'top'
      });
    } catch (error) {
      console.error('خطأ في عرض Toast:', error);
    }
  }

  /**
   * الحصول على اسم حزمة التطبيق
   */
  private async getPackageName(): Promise<string> {
    // يمكنك استبدال هذا بمعرف التطبيق الخاص بك
    return 'com.rutab.keystoparadise';
  }

  /**
   * الحصول على إعدادات الإشعارات الحالية
   */
  public getNotificationSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * إلغاء تسجيل الإشعارات
   */
  public async cleanup(): Promise<void> {
    try {
      await PushNotifications.unregister();
      this.settings = {
        pushEnabled: false,
        localEnabled: false,
        soundEnabled: true,
        criticalAlertsEnabled: false
      };
      this.initialized = false;
    } catch (error) {
      console.error('خطأ في تنظيف مدير الإشعارات:', error);
    }
  }
}

// تصدير نسخة واحدة من مدير الإشعارات
export const notificationManager = NotificationManager.getInstance();