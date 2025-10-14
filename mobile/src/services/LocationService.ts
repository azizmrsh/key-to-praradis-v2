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
      const hasPermission = await this.requestLocationPermission();
      
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
            Alert.alert(
              'Location Error',
              'Unable to get your current location. Please try again or enter your location manually.',
              [{ text: 'OK' }]
            );
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
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