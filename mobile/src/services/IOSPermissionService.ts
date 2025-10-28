import { Alert, Linking, Platform } from 'react-native';
import { PERMISSIONS, request, check, RESULTS, openSettings } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_STORAGE_KEY = 'ios_permission_settings';

export interface IOSPermissionStatus {
  location: 'granted' | 'denied' | 'blocked' | 'unavailable';
  notification: 'granted' | 'denied' | 'blocked' | 'unavailable';
  lastChecked: number;
}

export class IOSPermissionService {
  static async checkLocationPermission(): Promise<string> {
    if (Platform.OS !== 'ios') return 'unavailable';

    try {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return status;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'unavailable';
    }
  }

  static async requestLocationPermission(forceRequest: boolean = false): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    try {
      // تحقق من الإذن الحالي
      const currentStatus = await this.checkLocationPermission();

      // إذا كان الإذن ممنوحاً مسبقاً
      if (currentStatus === RESULTS.GRANTED && !forceRequest) {
        return true;
      }

      // إذا كان الإذن مرفوضاً بشكل دائم
      if (currentStatus === RESULTS.BLOCKED) {
        return new Promise((resolve) => {
          Alert.alert(
            'تفعيل خدمة الموقع',
            'تم تعطيل خدمة الموقع. لتفعيلها:\n\n' +
            '1. افتح إعدادات الجهاز\n' +
            '2. اختر "الخصوصية والأمان"\n' +
            '3. اختر "خدمات الموقع"\n' +
            '4. ابحث عن التطبيق\n' +
            '5. اختر "أثناء استخدام التطبيق"',
            [
              {
                text: 'لاحقاً',
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'فتح الإعدادات',
                onPress: async () => {
                  await Linking.openSettings();
                  resolve(false); // نعيد false لأننا لا نعرف إذا قام المستخدم بتغيير الإعداد
                }
              }
            ]
          );
        });
      }

      // طلب الإذن مع شرح السبب
      return new Promise((resolve) => {
        Alert.alert(
          'خدمة الموقع مهمة',
          'نحتاج لمعرفة موقعك من أجل:\n\n' +
          '• تحديد أوقات الصلاة بدقة\n' +
          '• معرفة اتجاه القبلة\n' +
          '• ضبط التوقيت المحلي',
          [
            {
              text: 'لا شكراً',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'موافق',
              onPress: async () => {
                const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                const granted = result === RESULTS.GRANTED;

                if (granted) {
                  // حفظ حالة الإذن
                  await this.savePermissionStatus({ location: 'granted' });

                  // اقتراح تفعيل "Always Allow" إذا كان مناسباً
                  setTimeout(() => this.suggestAlwaysLocation(), 1000);
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

  private static async suggestAlwaysLocation(): Promise<void> {
    Alert.alert(
      'تحسين خدمة الموقع',
      'هل تريد تفعيل تحديث الموقع في الخلفية للحصول على:\n\n' +
      '• تحديثات مستمرة لاتجاه القبلة\n' +
      '• تنبيهات دقيقة لأوقات الصلاة\n' +
      '• تحديث تلقائي للمواقيت',
      [
        {
          text: 'لاحقاً',
          style: 'cancel'
        },
        {
          text: 'تفعيل',
          onPress: async () => {
            const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
            if (result === RESULTS.GRANTED) {
              await this.savePermissionStatus({ location: 'granted' });
            }
          }
        }
      ]
    );
  }

  static async savePermissionStatus(update: Partial<IOSPermissionStatus>): Promise<void> {
    try {
      const currentStatus = await this.getPermissionStatus();
      const newStatus: IOSPermissionStatus = {
        ...currentStatus,
        ...update,
        lastChecked: Date.now()
      };

      await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }

  static async getPermissionStatus(): Promise<IOSPermissionStatus> {
    try {
      const saved = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error getting permission status:', error);
    }

    return {
      location: 'unavailable',
      notification: 'unavailable',
      lastChecked: 0
    };
  }
}