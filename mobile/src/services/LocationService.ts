import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { IOSPermissionService } from './IOSPermissionService';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export class LocationService {
  static async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'إذن الموقع',
            message: 'نحتاج إلى معرفة موقعك لعرض أوقات الصلاة الصحيحة لمنطقتك.',
            buttonNeutral: 'اسألني لاحقاً',
            buttonNegative: 'رفض',
            buttonPositive: 'موافق',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // استخدام خدمة الأذونات الخاصة بـ iOS
        return await IOSPermissionService.requestLocationPermission();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      let hasPermission = false;
      
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        hasPermission = permission;
      } else {
        // استخدام خدمة الأذونات الخاصة بـ iOS
        const status = await IOSPermissionService.checkLocationPermission();
        hasPermission = status === RESULTS.GRANTED;
        
        if (!hasPermission) {
          hasPermission = await IOSPermissionService.requestLocationPermission();
          if (!hasPermission) {
            return null; // تم التعامل مع رسائل الخطأ في IOSPermissionService
          }
        }
      }
      
      // Request permission if needed
      if (!hasPermission) {
        hasPermission = await this.requestLocationPermission();
      }
      
      if (!hasPermission) {
        if (Platform.OS === 'ios') {
          Alert.alert(
            'تنبيه',
            'لن نتمكن من تحديد أوقات الصلاة بدقة بدون معرفة موقعك. يمكنك تفعيل خدمة الموقع لاحقاً من إعدادات التطبيق.',
            [{ text: 'حسناً' }]
          );
        } else {
          Alert.alert(
            'مطلوب إذن الموقع',
            'الرجاء تفعيل خدمة الموقع لاستخدام هذه الميزة.',
            [{ text: 'حسناً' }]
          );
        }
        return null;
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const locationData = await this.reverseGeocode(latitude, longitude);
              resolve(locationData);
            } catch (error) {
              console.error('Error getting location data:', error);
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                city: 'Unknown',
                country: 'Unknown'
              });
            }
          },
          (error) => {
            console.error('Error getting current position:', error);
            let errorMessage = 'Unable to get your current location.';
            
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = 'Location permission was denied. Please enable it in settings.';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = 'Location is currently unavailable. Please try again.';
                break;
              case 3: // TIMEOUT
                errorMessage = 'Location request timed out. Please try again.';
                break;
            }
            
            Alert.alert(
              'Location Error',
              errorMessage,
              [{ text: 'OK' }]
            );
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000, // Increased timeout
            maximumAge: 60000, // Cache for 1 minute
          }
        );
      });
    } catch (error) {
      console.error('Error in getCurrentLocation:', error);
      return null;
    }
  }

  private static async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      return {
        latitude,
        longitude,
        city: data.city || data.locality || 'Unknown',
        country: data.countryName || 'Unknown'
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      // Fallback to coordinates only
      return {
        latitude,
        longitude,
        city: 'Unknown',
        country: 'Unknown'
      };
    }
  }
}