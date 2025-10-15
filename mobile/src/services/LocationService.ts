import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

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
            title: 'Location Permission',
            message: 'This app needs access to location to show prayer times for your area.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check if we already have permission
      let hasPermission = false;
      
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        hasPermission = permission;
      } else {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        hasPermission = result === RESULTS.GRANTED;
      }
      
      // Only request permission if we don't have it
      if (!hasPermission) {
        hasPermission = await this.requestLocationPermission();
      }
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission in settings to use this feature.',
          [{ text: 'OK' }]
        );
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