import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalNotifications } from '@capacitor/local-notifications';

const PERMISSION_STORAGE_KEY = 'app_permissions_status';
const LOCATION_PERMISSION_CHECK_INTERVAL = 1000 * 60 * 60; // 1 hour

export interface PermissionStatus {
  location: boolean;
  notification: boolean;
  lastChecked: number;
}

export class PermissionService {
  // حفظ حالة الأذونات
  static async savePermissionStatus(status: Partial<PermissionStatus>): Promise<void> {
    try {
      const current = await this.getPermissionStatus();
      const newStatus = {
        ...current,
        ...status,
        lastChecked: Date.now()
      };
      await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }

  // استرجاع حالة الأذونات
  static async getPermissionStatus(): Promise<PermissionStatus> {
    try {
      const saved = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
      if (saved) {
        const status = JSON.parse(saved);
        // تحقق من صلاحية آخر فحص
        if (Date.now() - status.lastChecked > LOCATION_PERMISSION_CHECK_INTERVAL) {
          return this.checkAllPermissions();
        }
        return status;
      }
    } catch (error) {
      console.error('Error getting permission status:', error);
    }
    return this.checkAllPermissions();
  }

  // فحص جميع الأذونات
  static async checkAllPermissions(): Promise<PermissionStatus> {
    const location = await this.checkLocationPermission();
    const notification = await this.checkNotificationPermission();
    
    const status = {
      location,
      notification,
      lastChecked: Date.now()
    };
    
    await this.savePermissionStatus(status);
    return status;
  }

  // فحص إذن الموقع
  static async checkLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  // فحص إذن الإشعارات
  static async checkNotificationPermission(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  // طلب إذن الموقع
  static async requestLocationPermission(): Promise<boolean> {
    try {
      // التحقق أولاً من حالة الإذن
      const currentStatus = await this.checkLocationPermission();
      if (currentStatus) return true;

      // عرض شرح قبل طلب الإذن
      return new Promise((resolve) => {
        Alert.alert(
          'السماح بالوصول للموقع',
          'نحتاج إلى معرفة موقعك من أجل:\n\n' +
          '• تحديد أوقات الصلاة بدقة لمنطقتك\n' +
          '• معرفة اتجاه القبلة\n' +
          '• ضبط التوقيت المحلي',
          [
            {
              text: 'لا شكراً',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'السماح',
              onPress: async () => {
                const permission = Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
                
                const result = await request(permission);
                const granted = result === RESULTS.GRANTED;
                
                if (granted) {
                  await this.savePermissionStatus({ location: true });
                  if (Platform.OS === 'ios') {
                    // اقتراح الإذن الدائم في iOS
                    setTimeout(() => this.suggestAlwaysLocation(), 1000);
                  }
                }
                
                resolve(granted);
              }
            }
          ],
          { cancelable: false }
        );
      });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // طلب إذن الإشعارات
  static async requestNotificationPermission(): Promise<boolean> {
    try {
      // التحقق أولاً من حالة الإذن
      const currentStatus = await this.checkNotificationPermission();
      if (currentStatus) return true;

      // عرض شرح قبل طلب الإذن
      return new Promise((resolve) => {
        Alert.alert(
          'السماح بالإشعارات',
          'نحتاج إلى إرسال إشعارات من أجل:\n\n' +
          '• تذكيرك بأوقات الصلاة\n' +
          '• إخطارك بالتحديات اليومية\n' +
          '• تنبيهات مهمة أخرى',
          [
            {
              text: 'لا شكراً',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'السماح',
              onPress: async () => {
                const { display } = await LocalNotifications.requestPermissions();
                const granted = display === 'granted';
                if (granted) {
                  await this.savePermissionStatus({ notification: true });
                }
                resolve(granted);
              }
            }
          ],
          { cancelable: false }
        );
      });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // اقتراح إذن الموقع الدائم في iOS
  private static async suggestAlwaysLocation(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    Alert.alert(
      'تحسين تجربة التطبيق',
      'هل تريد السماح بتحديث موقعك في الخلفية للحصول على:\n\n' +
      '• تحديثات مستمرة لاتجاه القبلة\n' +
      '• تنبيهات دقيقة لأوقات الصلاة\n' +
      '• تحديث تلقائي للمواقيت',
      [
        {
          text: 'لاحقاً',
          style: 'cancel'
        },
        {
          text: 'السماح',
          onPress: async () => {
            const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
            if (result === RESULTS.GRANTED) {
              await this.savePermissionStatus({ location: true });
            }
          }
        }
      ]
    );
  }

  // معالجة حالة رفض الإذن
  static async handleDeniedPermission(type: 'location' | 'notification'): Promise<void> {
    const permissionName = type === 'location' ? 'الموقع' : 'الإشعارات';
    
    Alert.alert(
      `تم رفض إذن ${permissionName}`,
      `لتفعيل ${permissionName}:\n\n` +
      '1. افتح إعدادات التطبيق\n' +
      `2. اختر "${permissionName}"\n` +
      '3. قم بتفعيل الإذن',
      [
        {
          text: 'لاحقاً',
          style: 'cancel'
        },
        {
          text: 'فتح الإعدادات',
          onPress: () => Linking.openSettings()
        }
      ]
    );
  }
}