import { 
  CalculationMethod, 
  CalculationParameters, 
  Coordinates, 
  Madhab,
  HighLatitudeRule,
  PrayerTimes,
  SunnahTimes
} from 'adhan';
import { formatInTimeZone } from 'date-fns-tz';

export type Prayer = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight' | 'tahajjud';

export type NotificationTiming = 
  | 'at' // exactly at prayer time
  | 'before15' // 15 minutes before
  | 'before30' // 30 minutes before
  | 'after15' // 15 minutes after
  | 'after30'; // 30 minutes after

export interface UserLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
}

export interface PrayerSettings {
  method: 'muslim-world-league' | 'egyptian' | 'karachi' | 'umm-al-qura' | 'dubai' | 'north-america' | 'kuwait' | 'qatar' | 'singapore';
  madhab: 'shafi' | 'hanafi';
  highLatitudeRule: 'middle-of-the-night' | 'seventh-of-the-night' | 'twilight-angle';
  adjustments: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
}

export interface NotificationPreference {
  prayer: Prayer;
  enabled: boolean;
  timing: NotificationTiming;
}

const getCalculationMethod = (method: PrayerSettings['method']): CalculationParameters => {
  switch (method) {
    case 'muslim-world-league':
      return CalculationMethod.MuslimWorldLeague();
    case 'egyptian':
      return CalculationMethod.Egyptian();
    case 'karachi':
      return CalculationMethod.Karachi();
    case 'umm-al-qura':
      return CalculationMethod.UmmAlQura();
    case 'dubai':
      return CalculationMethod.Dubai();
    case 'north-america':
      return CalculationMethod.NorthAmerica();
    case 'kuwait':
      return CalculationMethod.Kuwait();
    case 'qatar':
      return CalculationMethod.Qatar();
    case 'singapore':
      return CalculationMethod.Singapore();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
};

export const calculatePrayerTimes = (
  date: Date,
  coordinates: Coordinates,
  settings: PrayerSettings,
  timezone: string
): Record<Prayer, Date> => {
  // Get calculation parameters based on method
  const parameters = getCalculationMethod(settings.method);
  
  // Set madhab
  if (settings.madhab === 'hanafi') {
    parameters.madhab = Madhab.Hanafi;
  } else {
    parameters.madhab = Madhab.Shafi;
  }
  
  // Set high latitude rule
  if (settings.highLatitudeRule === 'middle-of-the-night') {
    parameters.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  } else if (settings.highLatitudeRule === 'seventh-of-the-night') {
    parameters.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  } else {
    parameters.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  }
  
  // Apply adjustments
  if (settings.adjustments) {
    if (settings.adjustments.fajr !== undefined) parameters.adjustments.fajr = settings.adjustments.fajr;
    if (settings.adjustments.sunrise !== undefined) parameters.adjustments.sunrise = settings.adjustments.sunrise;
    if (settings.adjustments.dhuhr !== undefined) parameters.adjustments.dhuhr = settings.adjustments.dhuhr;
    if (settings.adjustments.asr !== undefined) parameters.adjustments.asr = settings.adjustments.asr;
    if (settings.adjustments.maghrib !== undefined) parameters.adjustments.maghrib = settings.adjustments.maghrib;
    if (settings.adjustments.isha !== undefined) parameters.adjustments.isha = settings.adjustments.isha;
  }
  
  // Calculate prayer times
  const prayerTimes = new PrayerTimes(coordinates, date, parameters);
  
  // Calculate Sunnah times (for tahajjud and midnight)
  const sunnahTimes = new SunnahTimes(prayerTimes);
  
  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    midnight: sunnahTimes.middleOfTheNight,
    tahajjud: sunnahTimes.lastThirdOfTheNight
  };
};

export const formatPrayerTime = (date: Date, format: string = 'h:mm a', timezone: string): string => {
  return formatInTimeZone(date, timezone, format);
};

export const getNotificationTime = (prayerTime: Date, timing: NotificationTiming): Date => {
  const notificationTime = new Date(prayerTime);
  
  switch (timing) {
    case 'before15':
      notificationTime.setMinutes(notificationTime.getMinutes() - 15);
      break;
    case 'before30':
      notificationTime.setMinutes(notificationTime.getMinutes() - 30);
      break;
    case 'after15':
      notificationTime.setMinutes(notificationTime.getMinutes() + 15);
      break;
    case 'after30':
      notificationTime.setMinutes(notificationTime.getMinutes() + 30);
      break;
    default:
      // 'at' - no adjustment needed
      break;
  }
  
  return notificationTime;
};

export const getNextPrayerTime = (prayerTimes: Record<Prayer, Date>): { name: Prayer, time: Date } => {
  const now = new Date();
  
  // Standard prayers in order
  const orderedPrayers: Prayer[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  // Find the next prayer
  for (const prayer of orderedPrayers) {
    if (prayerTimes[prayer] > now) {
      return { name: prayer, time: prayerTimes[prayer] };
    }
  }
  
  // If no prayer time is found for today (all have passed), return tomorrow's Fajr
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { name: 'fajr', time: prayerTimes.fajr };
};

// Helper function to get a readable name for prayer times
export const getPrayerName = (prayer: Prayer): string => {
  switch (prayer) {
    case 'fajr': return 'Fajr';
    case 'sunrise': return 'Sunrise';
    case 'dhuhr': return 'Dhuhr';
    case 'asr': return 'Asr';
    case 'maghrib': return 'Maghrib';
    case 'isha': return 'Isha';
    case 'midnight': return 'Midnight';
    case 'tahajjud': return 'Tahajjud';
    default: return prayer;
  }
};

// Helper function to get a readable name for notification timing
export const getTimingName = (timing: NotificationTiming): string => {
  switch (timing) {
    case 'at': return 'At prayer time';
    case 'before15': return '15 minutes before';
    case 'before30': return '30 minutes before';
    case 'after15': return '15 minutes after';
    case 'after30': return '30 minutes after';
    default: return timing;
  }
};