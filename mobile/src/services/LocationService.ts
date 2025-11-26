import { ManualLocationService, LocationData } from './ManualLocationService';

export { LocationData } from './ManualLocationService';

export class LocationService {
  /**
   * الحصول على الموقع الافتراضي (مكة المكرمة)
   * تم إزالة استخدام GPS لضمان الامتثال لسياسات Google Play Store
   */
  static async getDefaultLocation(): Promise<LocationData> {
    return ManualLocationService.getDefaultLocation();
  }

  /**
   * البحث عن البلدان
   */
  static searchCountries(query: string) {
    return ManualLocationService.searchCountries(query);
  }

  /**
   * البحث عن المدن
   */
  static searchCities(query: string, countryCode?: string) {
    return ManualLocationService.searchCities(query, countryCode);
  }

  /**
   * الحصول على جميع البلدان
   */
  static getAllCountries() {
    return ManualLocationService.getAllCountries();
  }

  /**
   * الحصول على بلد معين بواسطة الكود
   */
  static getCountryByCode(code: string) {
    return ManualLocationService.getCountryByCode(code);
  }

  /**
   * الحصول على مدن بلد معين
   */
  static getCitiesByCountry(countryCode: string) {
    return ManualLocationService.getCitiesByCountry(countryCode);
  }

  /**
   * تحويل بيانات المدينة إلى LocationData
   */
  static cityToLocationData(city: any) {
    return ManualLocationService.cityToLocationData(city);
  }

  /**
   * دالة للتوافق مع الكود القديم - تعيد الموقع الافتراضي
   * @deprecated استخدم getDefaultLocation() بدلاً من ذلك
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    console.log('getCurrentLocation is deprecated. Using default location (Mecca) instead.');
    return this.getDefaultLocation();
  }

  /**
   * دالة للتوافق مع الكود القديم - تعيد true دائماً
   * @deprecated لم تعد هناك حاجة لطلب إذن الموقع
   */
  static async requestLocationPermission(): Promise<boolean> {
    console.log('requestLocationPermission is deprecated. No location permission needed.');
    return true;
  }
}