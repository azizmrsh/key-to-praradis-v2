import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';

interface LocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export class LocationServiceEnhanced {
  private static instance: LocationServiceEnhanced;
  private lastPosition: LocationPosition | null = null;
  private isInitialized = false;
  private permissionRequested = false;
  private locationWatchId: string | null = null;
  private locationUpdateCallbacks: Set<(position: LocationPosition) => void> = new Set();
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // بدء التهيئة فور إنشاء الكائن
    this.initializationPromise = this.initialize();
  }

  public static getInstance(): LocationServiceEnhanced {
    if (!LocationServiceEnhanced.instance) {
      LocationServiceEnhanced.instance = new LocationServiceEnhanced();
    }
    return LocationServiceEnhanced.instance;
  }

  /**
   * تهيئة خدمة الموقع
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // التحقق من حالة الأذونات عند بدء التشغيل
      const status = await Geolocation.checkPermissions();
      
      if (status.location === 'granted') {
        await this.setupLocationUpdates();
      } else if (Capacitor.getPlatform() === 'ios') {
        // في iOS نقوم بطلب الإذن مباشرة عند بدء التطبيق
        await this.requestLocationPermission();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing LocationService:', error);
      throw error;
    }
  }

  /**
   * التأكد من اكتمال التهيئة
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  /**
   * إعداد تحديثات الموقع
   */
  private async setupLocationUpdates(): Promise<void> {
    if (this.locationWatchId) return; // تجنب إعداد المراقبة مرتين

    try {
      // محاولة الحصول على الموقع الأولي
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      this.lastPosition = this.convertToLocationPosition(position);
      this.notifyLocationUpdate(this.lastPosition);

      // بدء مراقبة تغيرات الموقع
      this.locationWatchId = await Geolocation.watchPosition(
        { 
          enableHighAccuracy: true,
          timeout: 10000
        },
        (newPosition, err) => {
          if (err) {
            console.error('Watch position error:', err);
            return;
          }
          if (newPosition) {
            this.lastPosition = this.convertToLocationPosition(newPosition);
            this.notifyLocationUpdate(this.lastPosition);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up location updates:', error);
      // في حالة iOS، نحاول طلب الإذن مرة أخرى إذا فشلت العملية
      if (Capacitor.getPlatform() === 'ios' && !this.permissionRequested) {
        await this.requestLocationPermission();
      }
    }
  }

  /**
   * طلب إذن الموقع
   */
  public async requestLocationPermission(): Promise<boolean> {
    if (this.permissionRequested) {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'denied' && Capacitor.getPlatform() === 'ios') {
        await this.showIOSLocationSettings();
        return false;
      }
      return status.location === 'granted';
    }

    try {
      // عرض رسالة توضيحية قبل طلب الإذن
      if (await this.showLocationPermissionDialog()) {
        this.permissionRequested = true;
        const permission = await Geolocation.requestPermissions();
        const granted = permission.location === 'granted';

        if (granted) {
          // بدء تحديثات الموقع مباشرة بعد منح الإذن
          await this.setupLocationUpdates();
        } else if (Capacitor.getPlatform() === 'ios') {
          // في iOS، نوجه المستخدم إلى الإعدادات إذا تم رفض الإذن
          await this.showIOSLocationSettings();
        }
        
        return granted;
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * الحصول على الموقع الحالي
   */
  public async getCurrentPosition(options: { enableHighAccuracy?: boolean; timeout?: number } = {}): Promise<LocationPosition> {
    await this.ensureInitialized();

    try {
      // التحقق من الأذونات وطلبها إذا لزم الأمر
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('يرجى السماح للتطبيق باستخدام خدمة تحديد الموقع');
        }
      }

      // إذا كان لدينا موقع حديث وتم طلبه خلال الـ 5 ثواني الماضية، نستخدمه
      const now = Date.now();
      if (this.lastPosition && this.lastUpdateTime && (now - this.lastUpdateTime) < 5000) {
        return this.lastPosition;
      }

      // الحصول على الموقع الحالي
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000
      });

      this.lastPosition = this.convertToLocationPosition(position);
      this.lastUpdateTime = now;
      this.notifyLocationUpdate(this.lastPosition);
      return this.lastPosition;
    } catch (error) {
      console.error('Error getting current position:', error);
      this.handleLocationError(error);
      throw error;
    }
  }

  private lastUpdateTime: number | null = null;

  /**
   * معالجة أخطاء الموقع
   */
  private handleLocationError(error: any): void {
    if (Capacitor.getPlatform() === 'ios') {
      if (!this.permissionRequested) {
        // إذا لم نطلب الإذن بعد، نحاول طلبه
        this.requestLocationPermission().catch(console.error);
      } else {
        // إذا تم رفض الإذن، نوجه المستخدم إلى الإعدادات
        this.showIOSLocationSettings().catch(console.error);
      }
    }
  }

  /**
   * عرض رسالة توضيحية قبل طلب إذن الموقع
   */
  private async showLocationPermissionDialog(): Promise<boolean> {
    const message = Capacitor.getPlatform() === 'ios' ?
      'نحتاج إلى معرفة موقعك لتحديد اتجاه القبلة وأوقات الصلاة بدقة. اضغط "السماح" في النافذة التالية.' :
      'نحتاج إلى معرفة موقعك لتحديد اتجاه القبلة وأوقات الصلاة بدقة.';

    return confirm(message);
  }

  /**
   * عرض إعدادات الموقع في iOS
   */
  private async showIOSLocationSettings(): Promise<void> {
    const confirmResult = confirm(
      'لتحديد اتجاه القبلة وأوقات الصلاة بدقة، نحتاج إلى إذن الوصول إلى موقعك. هل تريد فتح إعدادات التطبيق لتفعيل خدمة الموقع؟'
    );

    if (confirmResult) {
      await App.exitApp();
    }
  }

  /**
   * تحويل بيانات الموقع إلى الصيغة المطلوبة
   */
  private convertToLocationPosition(position: any): LocationPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed
    };
  }

  /**
   * إضافة مستمع لتحديثات الموقع
   */
  public addLocationUpdateListener(callback: (position: LocationPosition) => void): void {
    this.locationUpdateCallbacks.add(callback);
    if (this.lastPosition) {
      callback(this.lastPosition);
    }
  }

  /**
   * إزالة مستمع تحديثات الموقع
   */
  public removeLocationUpdateListener(callback: (position: LocationPosition) => void): void {
    this.locationUpdateCallbacks.delete(callback);
  }

  /**
   * إخطار جميع المستمعين بتحديث الموقع
   */
  private notifyLocationUpdate(position: LocationPosition): void {
    this.locationUpdateCallbacks.forEach(callback => callback(position));
  }

  /**
   * تنظيف الموارد
   */
  public async cleanup(): Promise<void> {
    if (this.locationWatchId) {
      await Geolocation.clearWatch({ id: this.locationWatchId });
      this.locationWatchId = null;
    }
    this.locationUpdateCallbacks.clear();
    this.lastPosition = null;
    this.lastUpdateTime = null;
    this.isInitialized = false;
    this.permissionRequested = false;
  }
}

// تصدير نسخة واحدة من خدمة الموقع
export const locationServiceEnhanced = LocationServiceEnhanced.getInstance();