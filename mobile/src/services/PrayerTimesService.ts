import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from './LocationService';

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  date: Date;
  location: LocationData;
}

export interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
}

export class PrayerTimesService {
  private static readonly PRAYER_SETTINGS_KEY = 'prayer_settings';

  /**
   * حساب أوقات الصلاة لموقع وتاريخ محددين
   */
  static async calculatePrayerTimes(
    location: LocationData,
    date: Date = new Date(),
    settings?: PrayerSettings
  ): Promise<PrayerTimesData> {
    try {
      // إنشاء إحداثيات الموقع
      const coordinates = new Coordinates(location.latitude, location.longitude);

      // الحصول على إعدادات الصلاة المحفوظة أو استخدام الافتراضية
      const prayerSettings = settings || await this.getPrayerSettings();

      // تحديد طريقة الحساب
      const calculationMethod = this.getCalculationMethod(prayerSettings.calculationMethod);

      // تحديد المذهب
      if (prayerSettings.madhab === 'hanafi') {
        calculationMethod.madhab = Madhab.Hanafi;
      } else {
        calculationMethod.madhab = Madhab.Shafi;
      }

      // حساب أوقات الصلاة
      const prayerTimes = new PrayerTimes(coordinates, date, calculationMethod);

      return {
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
        date,
        location
      };
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      throw new Error('Failed to calculate prayer times');
    }
  }

  /**
   * الحصول على إعدادات الصلاة المحفوظة
   */
  static async getPrayerSettings(): Promise<PrayerSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.PRAYER_SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      
      // الإعدادات الافتراضية
      return {
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'shafi'
      };
    } catch (error) {
      console.error('Error loading prayer settings:', error);
      return {
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'shafi'
      };
    }
  }

  /**
   * حفظ إعدادات الصلاة
   */
  static async savePrayerSettings(settings: PrayerSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PRAYER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving prayer settings:', error);
      throw new Error('Failed to save prayer settings');
    }
  }

  /**
   * تحديد طريقة الحساب بناءً على النص
   */
  private static getCalculationMethod(methodName: string) {
    switch (methodName) {
      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return CalculationMethod.Egyptian();
      case 'Karachi':
        return CalculationMethod.Karachi();
      case 'UmmAlQura':
        return CalculationMethod.UmmAlQura();
      case 'Dubai':
        return CalculationMethod.Dubai();
      case 'MoonsightingCommittee':
        return CalculationMethod.MoonsightingCommittee();
      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();
      case 'Kuwait':
        return CalculationMethod.Kuwait();
      case 'Qatar':
        return CalculationMethod.Qatar();
      case 'Singapore':
        return CalculationMethod.Singapore();
      case 'Tehran':
        return CalculationMethod.Tehran();
      case 'Turkey':
        return CalculationMethod.Turkey();
      default:
        return CalculationMethod.MuslimWorldLeague();
    }
  }

  /**
   * تنسيق وقت الصلاة للعرض
   */
  static formatPrayerTime(time: Date, use24Hour: boolean = false): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour
    };

    return time.toLocaleTimeString('en-US', options);
  }

  /**
   * الحصول على الصلاة التالية
   */
  static getNextPrayer(prayerTimes: PrayerTimesData): { name: string; time: Date } | null {
    const now = new Date();
    const prayers = [
      { name: 'fajr', time: prayerTimes.fajr },
      { name: 'dhuhr', time: prayerTimes.dhuhr },
      { name: 'asr', time: prayerTimes.asr },
      { name: 'maghrib', time: prayerTimes.maghrib },
      { name: 'isha', time: prayerTimes.isha }
    ];

    // البحث عن الصلاة التالية في نفس اليوم
    for (const prayer of prayers) {
      if (prayer.time > now) {
        return prayer;
      }
    }

    // إذا لم توجد صلاة متبقية اليوم، فالصلاة التالية هي فجر الغد
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // حساب أوقات صلاة الغد للحصول على وقت الفجر
    return { name: 'fajr', time: tomorrow }; // سيتم حساب الوقت الدقيق عند الحاجة
  }

  /**
   * التحقق من وقت الصلاة الحالي
   */
  static getCurrentPrayerTime(prayerTimes: PrayerTimesData): string | null {
    const now = new Date();
    const prayers = [
      { name: 'fajr', start: prayerTimes.fajr, end: prayerTimes.sunrise },
      { name: 'dhuhr', start: prayerTimes.dhuhr, end: prayerTimes.asr },
      { name: 'asr', start: prayerTimes.asr, end: prayerTimes.maghrib },
      { name: 'maghrib', start: prayerTimes.maghrib, end: prayerTimes.isha },
      { name: 'isha', start: prayerTimes.isha, end: null } // العشاء حتى الفجر
    ];

    for (const prayer of prayers) {
      if (now >= prayer.start && (prayer.end === null || now < prayer.end)) {
        return prayer.name;
      }
    }

    return null; // ليس وقت صلاة حالياً
  }
}