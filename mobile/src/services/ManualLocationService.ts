export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export interface CountryData {
  name: string;
  nameAr: string;
  code: string;
  timezone: string;
  cities: CityData[];
}

export interface CityData {
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export class ManualLocationService {
  // قائمة البلدان والمدن الرئيسية في المنطقة العربية والإسلامية
  private static countries: CountryData[] = [
    {
      name: 'Saudi Arabia',
      nameAr: 'المملكة العربية السعودية',
      code: 'SA',
      timezone: 'Asia/Riyadh',
      cities: [
        { name: 'Riyadh', nameAr: 'الرياض', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
        { name: 'Jeddah', nameAr: 'جدة', latitude: 21.4858, longitude: 39.1925, timezone: 'Asia/Riyadh' },
        { name: 'Mecca', nameAr: 'مكة المكرمة', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' },
        { name: 'Medina', nameAr: 'المدينة المنورة', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
        { name: 'Dammam', nameAr: 'الدمام', latitude: 26.4207, longitude: 50.0888, timezone: 'Asia/Riyadh' },
        { name: 'Khobar', nameAr: 'الخبر', latitude: 26.2172, longitude: 50.1971, timezone: 'Asia/Riyadh' },
        { name: 'Taif', nameAr: 'الطائف', latitude: 21.2703, longitude: 40.4158, timezone: 'Asia/Riyadh' },
        { name: 'Abha', nameAr: 'أبها', latitude: 18.2164, longitude: 42.5053, timezone: 'Asia/Riyadh' },
        { name: 'Tabuk', nameAr: 'تبوك', latitude: 28.3998, longitude: 36.5700, timezone: 'Asia/Riyadh' },
        { name: 'Buraidah', nameAr: 'بريدة', latitude: 26.3260, longitude: 43.9750, timezone: 'Asia/Riyadh' }
      ]
    },
    {
      name: 'United Arab Emirates',
      nameAr: 'الإمارات العربية المتحدة',
      code: 'AE',
      timezone: 'Asia/Dubai',
      cities: [
        { name: 'Dubai', nameAr: 'دبي', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
        { name: 'Abu Dhabi', nameAr: 'أبوظبي', latitude: 24.2992, longitude: 54.6972, timezone: 'Asia/Dubai' },
        { name: 'Sharjah', nameAr: 'الشارقة', latitude: 25.3463, longitude: 55.4209, timezone: 'Asia/Dubai' },
        { name: 'Ajman', nameAr: 'عجمان', latitude: 25.4052, longitude: 55.5136, timezone: 'Asia/Dubai' },
        { name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة', latitude: 25.7889, longitude: 55.9598, timezone: 'Asia/Dubai' },
        { name: 'Fujairah', nameAr: 'الفجيرة', latitude: 25.1164, longitude: 56.3264, timezone: 'Asia/Dubai' },
        { name: 'Umm Al Quwain', nameAr: 'أم القيوين', latitude: 25.5641, longitude: 55.6550, timezone: 'Asia/Dubai' }
      ]
    },
    {
      name: 'Kuwait',
      nameAr: 'الكويت',
      code: 'KW',
      timezone: 'Asia/Kuwait',
      cities: [
        { name: 'Kuwait City', nameAr: 'مدينة الكويت', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
        { name: 'Hawalli', nameAr: 'حولي', latitude: 29.3375, longitude: 48.0281, timezone: 'Asia/Kuwait' },
        { name: 'Ahmadi', nameAr: 'الأحمدي', latitude: 29.0769, longitude: 48.0836, timezone: 'Asia/Kuwait' },
        { name: 'Jahra', nameAr: 'الجهراء', latitude: 29.3375, longitude: 47.6581, timezone: 'Asia/Kuwait' }
      ]
    },
    {
      name: 'Qatar',
      nameAr: 'قطر',
      code: 'QA',
      timezone: 'Asia/Qatar',
      cities: [
        { name: 'Doha', nameAr: 'الدوحة', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },
        { name: 'Al Rayyan', nameAr: 'الريان', latitude: 25.2919, longitude: 51.4240, timezone: 'Asia/Qatar' },
        { name: 'Umm Salal', nameAr: 'أم صلال', latitude: 25.4058, longitude: 51.4064, timezone: 'Asia/Qatar' }
      ]
    },
    {
      name: 'Bahrain',
      nameAr: 'البحرين',
      code: 'BH',
      timezone: 'Asia/Bahrain',
      cities: [
        { name: 'Manama', nameAr: 'المنامة', latitude: 26.2285, longitude: 50.5860, timezone: 'Asia/Bahrain' },
        { name: 'Riffa', nameAr: 'الرفاع', latitude: 26.1300, longitude: 50.5550, timezone: 'Asia/Bahrain' },
        { name: 'Muharraq', nameAr: 'المحرق', latitude: 26.2572, longitude: 50.6110, timezone: 'Asia/Bahrain' }
      ]
    },
    {
      name: 'Oman',
      nameAr: 'عُمان',
      code: 'OM',
      timezone: 'Asia/Muscat',
      cities: [
        { name: 'Muscat', nameAr: 'مسقط', latitude: 23.5859, longitude: 58.4059, timezone: 'Asia/Muscat' },
        { name: 'Salalah', nameAr: 'صلالة', latitude: 17.0151, longitude: 54.0924, timezone: 'Asia/Muscat' },
        { name: 'Sohar', nameAr: 'صحار', latitude: 24.3477, longitude: 56.7505, timezone: 'Asia/Muscat' },
        { name: 'Nizwa', nameAr: 'نزوى', latitude: 22.9333, longitude: 57.5333, timezone: 'Asia/Muscat' }
      ]
    },
    {
      name: 'Jordan',
      nameAr: 'الأردن',
      code: 'JO',
      timezone: 'Asia/Amman',
      cities: [
        { name: 'Amman', nameAr: 'عمّان', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman' },
        { name: 'Zarqa', nameAr: 'الزرقاء', latitude: 32.0728, longitude: 36.0876, timezone: 'Asia/Amman' },
        { name: 'Irbid', nameAr: 'إربد', latitude: 32.5556, longitude: 35.8500, timezone: 'Asia/Amman' },
        { name: 'Aqaba', nameAr: 'العقبة', latitude: 29.5267, longitude: 35.0081, timezone: 'Asia/Amman' }
      ]
    },
    {
      name: 'Lebanon',
      nameAr: 'لبنان',
      code: 'LB',
      timezone: 'Asia/Beirut',
      cities: [
        { name: 'Beirut', nameAr: 'بيروت', latitude: 33.8938, longitude: 35.5018, timezone: 'Asia/Beirut' },
        { name: 'Tripoli', nameAr: 'طرابلس', latitude: 34.4367, longitude: 35.8497, timezone: 'Asia/Beirut' },
        { name: 'Sidon', nameAr: 'صيدا', latitude: 33.5633, longitude: 35.3650, timezone: 'Asia/Beirut' }
      ]
    },
    {
      name: 'Syria',
      nameAr: 'سوريا',
      code: 'SY',
      timezone: 'Asia/Damascus',
      cities: [
        { name: 'Damascus', nameAr: 'دمشق', latitude: 33.5138, longitude: 36.2765, timezone: 'Asia/Damascus' },
        { name: 'Aleppo', nameAr: 'حلب', latitude: 36.2021, longitude: 37.1343, timezone: 'Asia/Damascus' },
        { name: 'Homs', nameAr: 'حمص', latitude: 34.7394, longitude: 36.7167, timezone: 'Asia/Damascus' },
        { name: 'Latakia', nameAr: 'اللاذقية', latitude: 35.5138, longitude: 35.7831, timezone: 'Asia/Damascus' }
      ]
    },
    {
      name: 'Iraq',
      nameAr: 'العراق',
      code: 'IQ',
      timezone: 'Asia/Baghdad',
      cities: [
        { name: 'Baghdad', nameAr: 'بغداد', latitude: 33.3152, longitude: 44.3661, timezone: 'Asia/Baghdad' },
        { name: 'Basra', nameAr: 'البصرة', latitude: 30.5085, longitude: 47.7804, timezone: 'Asia/Baghdad' },
        { name: 'Mosul', nameAr: 'الموصل', latitude: 36.3350, longitude: 43.1189, timezone: 'Asia/Baghdad' },
        { name: 'Erbil', nameAr: 'أربيل', latitude: 36.1911, longitude: 44.0093, timezone: 'Asia/Baghdad' }
      ]
    },
    {
      name: 'Egypt',
      nameAr: 'مصر',
      code: 'EG',
      timezone: 'Africa/Cairo',
      cities: [
        { name: 'Cairo', nameAr: 'القاهرة', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
        { name: 'Alexandria', nameAr: 'الإسكندرية', latitude: 31.2001, longitude: 29.9187, timezone: 'Africa/Cairo' },
        { name: 'Giza', nameAr: 'الجيزة', latitude: 30.0131, longitude: 31.2089, timezone: 'Africa/Cairo' },
        { name: 'Luxor', nameAr: 'الأقصر', latitude: 25.6872, longitude: 32.6396, timezone: 'Africa/Cairo' },
        { name: 'Aswan', nameAr: 'أسوان', latitude: 24.0889, longitude: 32.8998, timezone: 'Africa/Cairo' }
      ]
    },
    {
      name: 'Morocco',
      nameAr: 'المغرب',
      code: 'MA',
      timezone: 'Africa/Casablanca',
      cities: [
        { name: 'Casablanca', nameAr: 'الدار البيضاء', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca' },
        { name: 'Rabat', nameAr: 'الرباط', latitude: 34.0209, longitude: -6.8416, timezone: 'Africa/Casablanca' },
        { name: 'Marrakech', nameAr: 'مراكش', latitude: 31.6295, longitude: -7.9811, timezone: 'Africa/Casablanca' },
        { name: 'Fez', nameAr: 'فاس', latitude: 34.0181, longitude: -5.0078, timezone: 'Africa/Casablanca' }
      ]
    },
    {
      name: 'Tunisia',
      nameAr: 'تونس',
      code: 'TN',
      timezone: 'Africa/Tunis',
      cities: [
        { name: 'Tunis', nameAr: 'تونس', latitude: 36.8065, longitude: 10.1815, timezone: 'Africa/Tunis' },
        { name: 'Sfax', nameAr: 'صفاقس', latitude: 34.7406, longitude: 10.7603, timezone: 'Africa/Tunis' },
        { name: 'Sousse', nameAr: 'سوسة', latitude: 35.8256, longitude: 10.6369, timezone: 'Africa/Tunis' }
      ]
    },
    {
      name: 'Algeria',
      nameAr: 'الجزائر',
      code: 'DZ',
      timezone: 'Africa/Algiers',
      cities: [
        { name: 'Algiers', nameAr: 'الجزائر', latitude: 36.7538, longitude: 3.0588, timezone: 'Africa/Algiers' },
        { name: 'Oran', nameAr: 'وهران', latitude: 35.6969, longitude: -0.6331, timezone: 'Africa/Algiers' },
        { name: 'Constantine', nameAr: 'قسنطينة', latitude: 36.3650, longitude: 6.6147, timezone: 'Africa/Algiers' }
      ]
    },
    {
      name: 'Libya',
      nameAr: 'ليبيا',
      code: 'LY',
      timezone: 'Africa/Tripoli',
      cities: [
        { name: 'Tripoli', nameAr: 'طرابلس', latitude: 32.8872, longitude: 13.1913, timezone: 'Africa/Tripoli' },
        { name: 'Benghazi', nameAr: 'بنغازي', latitude: 32.1167, longitude: 20.0683, timezone: 'Africa/Tripoli' },
        { name: 'Misrata', nameAr: 'مصراتة', latitude: 32.3745, longitude: 15.0919, timezone: 'Africa/Tripoli' }
      ]
    },
    {
      name: 'Sudan',
      nameAr: 'السودان',
      code: 'SD',
      timezone: 'Africa/Khartoum',
      cities: [
        { name: 'Khartoum', nameAr: 'الخرطوم', latitude: 15.5007, longitude: 32.5599, timezone: 'Africa/Khartoum' },
        { name: 'Omdurman', nameAr: 'أم درمان', latitude: 15.6445, longitude: 32.4777, timezone: 'Africa/Khartoum' },
        { name: 'Port Sudan', nameAr: 'بورتسودان', latitude: 19.6158, longitude: 37.2164, timezone: 'Africa/Khartoum' }
      ]
    },
    {
      name: 'Yemen',
      nameAr: 'اليمن',
      code: 'YE',
      timezone: 'Asia/Aden',
      cities: [
        { name: 'Sanaa', nameAr: 'صنعاء', latitude: 15.3694, longitude: 44.1910, timezone: 'Asia/Aden' },
        { name: 'Aden', nameAr: 'عدن', latitude: 12.7797, longitude: 45.0367, timezone: 'Asia/Aden' },
        { name: 'Taiz', nameAr: 'تعز', latitude: 13.5795, longitude: 44.0207, timezone: 'Asia/Aden' }
      ]
    },
    {
      name: 'Palestine',
      nameAr: 'فلسطين',
      code: 'PS',
      timezone: 'Asia/Gaza',
      cities: [
        { name: 'Gaza', nameAr: 'غزة', latitude: 31.5017, longitude: 34.4668, timezone: 'Asia/Gaza' },
        { name: 'Ramallah', nameAr: 'رام الله', latitude: 31.9073, longitude: 35.2044, timezone: 'Asia/Gaza' },
        { name: 'Hebron', nameAr: 'الخليل', latitude: 31.5326, longitude: 35.0998, timezone: 'Asia/Gaza' },
        { name: 'Nablus', nameAr: 'نابلس', latitude: 32.2211, longitude: 35.2544, timezone: 'Asia/Gaza' }
      ]
    },
    {
      name: 'Turkey',
      nameAr: 'تركيا',
      code: 'TR',
      timezone: 'Europe/Istanbul',
      cities: [
        { name: 'Istanbul', nameAr: 'إسطنبول', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
        { name: 'Ankara', nameAr: 'أنقرة', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
        { name: 'Izmir', nameAr: 'إزمير', latitude: 38.4192, longitude: 27.1287, timezone: 'Europe/Istanbul' },
        { name: 'Bursa', nameAr: 'بورصة', latitude: 40.1826, longitude: 29.0665, timezone: 'Europe/Istanbul' }
      ]
    },
    {
      name: 'Iran',
      nameAr: 'إيران',
      code: 'IR',
      timezone: 'Asia/Tehran',
      cities: [
        { name: 'Tehran', nameAr: 'طهران', latitude: 35.6892, longitude: 51.3890, timezone: 'Asia/Tehran' },
        { name: 'Mashhad', nameAr: 'مشهد', latitude: 36.2605, longitude: 59.6168, timezone: 'Asia/Tehran' },
        { name: 'Isfahan', nameAr: 'أصفهان', latitude: 32.6546, longitude: 51.6680, timezone: 'Asia/Tehran' },
        { name: 'Shiraz', nameAr: 'شيراز', latitude: 29.5918, longitude: 52.5837, timezone: 'Asia/Tehran' }
      ]
    },
    {
      name: 'Pakistan',
      nameAr: 'باكستان',
      code: 'PK',
      timezone: 'Asia/Karachi',
      cities: [
        { name: 'Karachi', nameAr: 'كراتشي', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
        { name: 'Lahore', nameAr: 'لاهور', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
        { name: 'Islamabad', nameAr: 'إسلام آباد', latitude: 33.7294, longitude: 73.0931, timezone: 'Asia/Karachi' },
        { name: 'Faisalabad', nameAr: 'فيصل آباد', latitude: 31.4504, longitude: 73.1350, timezone: 'Asia/Karachi' }
      ]
    },
    {
      name: 'Afghanistan',
      nameAr: 'أفغانستان',
      code: 'AF',
      timezone: 'Asia/Kabul',
      cities: [
        { name: 'Kabul', nameAr: 'كابول', latitude: 34.5553, longitude: 69.2075, timezone: 'Asia/Kabul' },
        { name: 'Kandahar', nameAr: 'قندهار', latitude: 31.6180, longitude: 65.6972, timezone: 'Asia/Kabul' },
        { name: 'Herat', nameAr: 'هرات', latitude: 34.3482, longitude: 62.1997, timezone: 'Asia/Kabul' }
      ]
    },
    {
      name: 'Bangladesh',
      nameAr: 'بنغلاديش',
      code: 'BD',
      timezone: 'Asia/Dhaka',
      cities: [
        { name: 'Dhaka', nameAr: 'دكا', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
        { name: 'Chittagong', nameAr: 'شيتاغونغ', latitude: 22.3569, longitude: 91.7832, timezone: 'Asia/Dhaka' },
        { name: 'Sylhet', nameAr: 'سيلهت', latitude: 24.8949, longitude: 91.8687, timezone: 'Asia/Dhaka' }
      ]
    },
    {
      name: 'Indonesia',
      nameAr: 'إندونيسيا',
      code: 'ID',
      timezone: 'Asia/Jakarta',
      cities: [
        { name: 'Jakarta', nameAr: 'جاكرتا', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
        { name: 'Surabaya', nameAr: 'سورابايا', latitude: -7.2575, longitude: 112.7521, timezone: 'Asia/Jakarta' },
        { name: 'Bandung', nameAr: 'باندونغ', latitude: -6.9175, longitude: 107.6191, timezone: 'Asia/Jakarta' },
        { name: 'Medan', nameAr: 'ميدان', latitude: 3.5952, longitude: 98.6722, timezone: 'Asia/Jakarta' }
      ]
    },
    {
      name: 'Malaysia',
      nameAr: 'ماليزيا',
      code: 'MY',
      timezone: 'Asia/Kuala_Lumpur',
      cities: [
        { name: 'Kuala Lumpur', nameAr: 'كوالالمبور', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
        { name: 'George Town', nameAr: 'جورج تاون', latitude: 5.4164, longitude: 100.3327, timezone: 'Asia/Kuala_Lumpur' },
        { name: 'Johor Bahru', nameAr: 'جوهور بهرو', latitude: 1.4927, longitude: 103.7414, timezone: 'Asia/Kuala_Lumpur' }
      ]
    }
  ];

  /**
   * البحث عن البلدان بناءً على النص المدخل
   */
  static searchCountries(query: string): CountryData[] {
    if (!query || query.trim().length < 2) {
      return this.countries;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm) ||
      country.nameAr.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * البحث عن المدن بناءً على النص المدخل
   */
  static searchCities(query: string, countryCode?: string): CityData[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    let countries = this.countries;

    // إذا تم تحديد بلد معين، ابحث فقط في مدن ذلك البلد
    if (countryCode) {
      countries = this.countries.filter(country => country.code === countryCode);
    }

    const cities: CityData[] = [];
    
    countries.forEach(country => {
      const matchingCities = country.cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.nameAr.includes(searchTerm)
      );
      cities.push(...matchingCities);
    });

    return cities;
  }

  /**
   * الحصول على جميع البلدان
   */
  static getAllCountries(): CountryData[] {
    return this.countries;
  }

  /**
   * الحصول على بلد معين بواسطة الكود
   */
  static getCountryByCode(code: string): CountryData | null {
    return this.countries.find(country => country.code === code) || null;
  }

  /**
   * الحصول على مدن بلد معين
   */
  static getCitiesByCountry(countryCode: string): CityData[] {
    const country = this.getCountryByCode(countryCode);
    return country ? country.cities : [];
  }

  /**
   * تحويل بيانات المدينة إلى LocationData
   */
  static cityToLocationData(city: CityData): LocationData {
    return {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.nameAr,
      country: this.getCountryByCity(city)?.nameAr || '',
      timezone: city.timezone
    };
  }

  /**
   * الحصول على البلد الذي تنتمي إليه المدينة
   */
  private static getCountryByCity(city: CityData): CountryData | null {
    return this.countries.find(country => 
      country.cities.some(c => c.name === city.name && c.latitude === city.latitude)
    ) || null;
  }

  /**
   * الحصول على الموقع الافتراضي (مكة المكرمة)
   */
  static getDefaultLocation(): LocationData {
    const mecca = this.countries
      .find(country => country.code === 'SA')
      ?.cities.find(city => city.name === 'Mecca');
    
    if (mecca) {
      return this.cityToLocationData(mecca);
    }

    // إذا لم توجد مكة، استخدم الرياض كافتراضي
    return {
      latitude: 24.7136,
      longitude: 46.6753,
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      timezone: 'Asia/Riyadh'
    };
  }
}