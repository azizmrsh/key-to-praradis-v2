import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

interface LocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export class LocationService {
  private static instance: LocationService;
  private lastPosition: LocationPosition | null = null;
  private isInitialized = false;
  private permissionRequested = false;
  private locationWatchId: string | null = null;
  private locationUpdateCallbacks: Set<(position: LocationPosition) => void> = new Set();

  private constructor() {
    // بدء التهيئة فور إنشاء الكائن
    this.initializationPromise = this.initialize();
  }
    this.initialize().catch(console.error);
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * تهيئة مدير الموقع
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted') {
        await this.setupLocationUpdates();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing LocationService:', error);
      throw error;
    }
  }

  /**
   * إعداد تحديثات الموقع
   */
  private async setupLocationUpdates(): Promise<void> {
    try {
      // محاولة الحصول على الموقع أولاً
      const position = await this.getCurrentPosition();
      if (position) {
        // بدء مراقبة تغيرات الموقع
        if (!this.locationWatchId) {
          this.locationWatchId = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 10000 },
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
        }
      }
    } catch (error) {
      console.error('Error setting up location updates:', error);
      // لا نريد إيقاف التطبيق في حالة فشل تحديثات الموقع
    }
  }

  /**
   * طلب إذن الموقع مع معالجة خاصة للمنصات المختلفة
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      // التحقق من تفعيل خدمة الموقع أولاً
      await this.checkLocationServices();

      // عرض رسالة توضيحية قبل طلب الإذن
      if (await this.showLocationPermissionDialog()) {
        const permission = await Geolocation.requestPermissions();
        const granted = permission.location === 'granted';
        
        if (granted) {
          await this.setupLocationUpdates();
        }
        
        this.permissionRequested = true;
        return granted;
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      throw new Error('يرجى تفعيل خدمة تحديد الموقع من إعدادات جهازك');
    }
  }

  /**
   * الحصول على الموقع الحالي مع معالجة الأخطاء
   */
  public async getCurrentPosition(options: { enableHighAccuracy?: boolean; timeout?: number } = {}): Promise<LocationPosition> {
    try {
      // التحقق من تفعيل خدمة الموقع
      await this.checkLocationServices();

      // التحقق من الأذونات
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('يرجى السماح للتطبيق باستخدام خدمة تحديد الموقع من إعدادات جهازك');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000
      });

      this.lastPosition = this.convertToLocationPosition(position);
      this.notifyLocationUpdate(this.lastPosition);
      return this.lastPosition;
    } catch (error) {
      console.error('Error getting current position:', error);
      if (error.message.includes('location disabled')) {
        throw new Error('يرجى تفعيل خدمة تحديد الموقع من إعدادات جهازك');
      } else if (error.message.includes('timeout')) {
        throw new Error('فشل تحديد الموقع. يرجى التأكد من اتصالك بالإنترنت وتفعيل GPS');
      }
      throw new Error('حدث خطأ أثناء تحديد الموقع. يرجى المحاولة مرة أخرى');
    }
  }

  /**
   * التحقق من تفعيل خدمة الموقع
   */
  private async checkLocationServices(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android') {
      try {
        const isEnabled = await Geolocation.checkPermissions();
        if (isEnabled.location === 'denied') {
          throw new Error('يرجى تفعيل خدمة تحديد الموقع من إعدادات جهازك');
        }
      } catch (error) {
        throw new Error('يرجى تفعيل خدمة تحديد الموقع من إعدادات جهازك');
      }
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
   * عرض رسالة توضيحية قبل طلب إذن الموقع
   */
  private async showLocationPermissionDialog(): Promise<boolean> {
    const platform = Capacitor.getPlatform();
    const message = platform === 'ios' ?
      'نحتاج إلى معرفة موقعك لتحديد اتجاه القبلة وأوقات الصلاة بدقة. اضغط "السماح أثناء استخدام التطبيق" في النافذة التالية.' :
      'نحتاج إلى معرفة موقعك لتحديد اتجاه القبلة وأوقات الصلاة بدقة. اضغط "السماح" في النافذة التالية.';
    
    return new Promise((resolve) => {
      const result = confirm(message);
      resolve(result);
    });
  }

  /**
   * تنظيف الموارد عند إغلاق التطبيق
   */
  public async cleanup(): Promise<void> {
    if (this.locationWatchId) {
      await Geolocation.clearWatch({ id: this.locationWatchId });
      this.locationWatchId = null;
    }
    this.locationUpdateCallbacks.clear();
    this.isInitialized = false;
    this.permissionRequested = false;
  }
}

// تصدير نسخة واحدة من خدمة الموقع
export const locationService = LocationService.getInstance();