import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { translationService } from './translation-service';

interface LocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export class LocationServiceMultiLang {
  private static instance: LocationServiceMultiLang;
  private lastPosition: LocationPosition | null = null;
  private isInitialized = false;
  private permissionRequested = false;
  private locationWatchId: string | null = null;
  private locationUpdateCallbacks: Set<(position: LocationPosition) => void> = new Set();
  private initializationPromise: Promise<void> | null = null;
  private lastUpdateTime: number | null = null;

  private constructor() {
    this.initializationPromise = this.initialize();
  }

  public static getInstance(): LocationServiceMultiLang {
    if (!LocationServiceMultiLang.instance) {
      LocationServiceMultiLang.instance = new LocationServiceMultiLang();
    }
    return LocationServiceMultiLang.instance;
  }

  /**
   * تهيئة خدمة الموقع
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const status = await Geolocation.checkPermissions();
      
      if (status.location === 'granted') {
        await this.setupLocationUpdates();
      } else if (Capacitor.getPlatform() === 'ios') {
        await this.requestLocationPermission();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing LocationService:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  private async setupLocationUpdates(): Promise<void> {
    if (this.locationWatchId) return;

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      this.lastPosition = this.convertToLocationPosition(position);
      this.lastUpdateTime = Date.now();
      this.notifyLocationUpdate(this.lastPosition);

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
            this.lastUpdateTime = Date.now();
            this.notifyLocationUpdate(this.lastPosition);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up location updates:', error);
      if (Capacitor.getPlatform() === 'ios' && !this.permissionRequested) {
        await this.requestLocationPermission();
      }
    }
  }

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
      if (await this.showLocationPermissionDialog()) {
        this.permissionRequested = true;
        const permission = await Geolocation.requestPermissions();
        const granted = permission.location === 'granted';

        if (granted) {
          await this.setupLocationUpdates();
        } else if (Capacitor.getPlatform() === 'ios') {
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

  public async getCurrentPosition(options: { enableHighAccuracy?: boolean; timeout?: number } = {}): Promise<LocationPosition> {
    await this.ensureInitialized();

    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw new Error(translationService.translate('locationDeniedError'));
        }
      }

      const now = Date.now();
      if (this.lastPosition && this.lastUpdateTime && (now - this.lastUpdateTime) < 5000) {
        return this.lastPosition;
      }

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
      throw new Error(this.getLocalizedError(error));
    }
  }

  private handleLocationError(error: any): void {
    if (Capacitor.getPlatform() === 'ios') {
      if (!this.permissionRequested) {
        this.requestLocationPermission().catch(console.error);
      } else {
        this.showIOSLocationSettings().catch(console.error);
      }
    }
  }

  private getLocalizedError(error: any): string {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('location disabled')) {
      return translationService.translate('locationDisabledError');
    } else if (errorMessage.includes('timeout')) {
      return translationService.translate('locationTimeoutError');
    }
    return translationService.translate('locationDeniedError');
  }

  private async showLocationPermissionDialog(): Promise<boolean> {
    let message = translationService.translate('locationPermissionMessage');
    
    if (Capacitor.getPlatform() === 'ios') {
      message += '\n\n' + translationService.translate('locationPermissionIOSMessage');
    }

    return confirm(message);
  }

  private async showIOSLocationSettings(): Promise<void> {
    const confirmResult = confirm(translationService.translate('locationSettingsMessage'));

    if (confirmResult) {
      await App.exitApp();
    }
  }

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

  public addLocationUpdateListener(callback: (position: LocationPosition) => void): void {
    this.locationUpdateCallbacks.add(callback);
    if (this.lastPosition) {
      callback(this.lastPosition);
    }
  }

  public removeLocationUpdateListener(callback: (position: LocationPosition) => void): void {
    this.locationUpdateCallbacks.delete(callback);
  }

  private notifyLocationUpdate(position: LocationPosition): void {
    this.locationUpdateCallbacks.forEach(callback => callback(position));
  }

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

// تصدير نسخة واحدة من خدمة الموقع متعددة اللغات
export const locationServiceMultiLang = LocationServiceMultiLang.getInstance();