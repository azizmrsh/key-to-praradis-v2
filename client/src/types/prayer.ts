export interface UserLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
  country: string;
}

export interface PrayerSettings {
  method: string;
  madhab: string;
  highLatitudeRule: string;
  adjustments: Record<string, number>;
}

export interface NotificationPreference {
  prayer: string;
  enabled: boolean;
  timing: string;
}