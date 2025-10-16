import { Geolocation, Position } from '@capacitor/geolocation';
import { Platform } from '@capacitor/core';

export class LocationManager {
  private static instance: LocationManager;
  private lastPosition: Position | null = null;
  private isInitialized = false;
  private permissionRequested = false;
  private locationWatchId: string | null = null;
  private locationUpdateCallbacks: Set<(position: Position) => void> = new Set();

  private constructor() {}

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  /**
   * طلب إذن الموقع وتحديث الموقع الحالي
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location === 'prompt' || permissionStatus.location === 'prompt-with-rationale') {
        // Show custom dialog explaining why we need location
        const userChoice = await this.showLocationPermissionDialog();
        if (!userChoice) {
          return false;
        }
      }

      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * الحصول على الموقع الحالي
   */
  public async getCurrentPosition(options: { enableHighAccuracy?: boolean; timeout?: number } = {}): Promise<{ latitude: number; longitude: number }> {
    try {
      // Check permissions first
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission denied. Please enable location access in your settings.');
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 30000
      });

      this.lastPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      return this.lastPosition;
    } catch (error) {
      console.error('Error getting current position:', error);
      throw error;
    }
  }

  /**
   * بدء مراقبة تغيرات الموقع
   */
  public async watchPosition(callback: (position: { latitude: number; longitude: number }) => void): Promise<string> {
    try {
      // Check permissions first
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error('Location permission denied. Please enable location access in your settings.');
        }
      }

      // Start watching position
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position) => {
          if (position) {
            this.lastPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            callback(this.lastPosition);
          }
        }
      );

      return watchId;
    } catch (error) {
      console.error('Error watching position:', error);
      throw error;
    }
  }

  /**
   * إيقاف مراقبة تغيرات الموقع
   */
  public async clearWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error clearing watch:', error);
      throw error;
    }
  }

  /**
   * عرض رسالة طلب إذن الموقع
   */
  private async showLocationPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const message = 'نحتاج إلى معرفة موقعك لتقديم تجربة أفضل وتحديد اتجاه القبلة وأوقات الصلاة بدقة. هل تسمح بالوصول إلى موقعك؟';
      const result = confirm(message);
      resolve(result);
    });
  }

  /**
   * الحصول على آخر موقع معروف
   */
  public getLastKnownPosition(): { latitude: number; longitude: number } | null {
    return this.lastPosition;
  }
}

// تصدير نسخة واحدة من مدير الموقع
export const locationManager = LocationManager.getInstance();