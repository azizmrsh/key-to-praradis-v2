interface Translations {
  [key: string]: {
    ar: string;
    en: string;
    ur: string;
  };
}

const translations: Translations = {
  // رسائل أذونات الموقع
  locationPermissionTitle: {
    ar: 'إذن الموقع',
    en: 'Location Permission',
    ur: 'مقام کی اجازت'
  },
  locationPermissionMessage: {
    ar: 'نحتاج إلى معرفة موقعك لتحديد اتجاه القبلة وأوقات الصلاة بدقة.',
    en: 'We need your location to accurately determine Qibla direction and prayer times.',
    ur: 'قبلہ کی سمت اور نماز کے اوقات کی درست تعین کے لئے ہمیں آپ کے مقام کی ضرورت ہے۔'
  },
  locationPermissionIOSMessage: {
    ar: 'اضغط "السماح" في النافذة التالية.',
    en: 'Press "Allow" in the next window.',
    ur: 'اگلی ونڈو میں "اجازت دیں" پر کلک کریں۔'
  },
  locationSettingsMessage: {
    ar: 'لتحديد اتجاه القبلة وأوقات الصلاة بدقة، نحتاج إلى إذن الوصول إلى موقعك. هل تريد فتح إعدادات التطبيق لتفعيل خدمة الموقع؟',
    en: 'To determine Qibla direction and prayer times accurately, we need access to your location. Would you like to open app settings to enable location service?',
    ur: 'قبلہ کی سمت اور نماز کے اوقات کی درست تعین کے لئے، ہمیں آپ کے مقام تک رسائی کی ضرورت ہے۔ کیا آپ مقام کی خدمت کو فعال کرنے کے لئے ایپ کی ترتیبات کھولنا چاہیں گے؟'
  },
  locationDeniedError: {
    ar: 'يرجى السماح للتطبيق باستخدام خدمة تحديد الموقع',
    en: 'Please allow the app to use location services',
    ur: 'براہ کرم ایپ کو مقام کی خدمات استعمال کرنے کی اجازت دیں'
  },
  locationDisabledError: {
    ar: 'يرجى تفعيل خدمة تحديد الموقع من إعدادات جهازك',
    en: 'Please enable location services in your device settings',
    ur: 'براہ کرم اپنے آلے کی ترتیبات میں مقام کی خدمات کو فعال کریں'
  },
  locationTimeoutError: {
    ar: 'انتهت مهلة تحديد الموقع. يرجى التأكد من اتصالك بالإنترنت وتفعيل GPS',
    en: 'Location request timed out. Please check your internet connection and enable GPS',
    ur: 'مقام کی درخواست کا وقت ختم ہو گیا۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں اور GPS کو فعال کریں'
  },

  // رسائل أذونات الإشعارات
  notificationPermissionTitle: {
    ar: 'إذن الإشعارات',
    en: 'Notification Permission',
    ur: 'اطلاعات کی اجازت'
  },
  notificationPermissionMessage: {
    ar: 'نحتاج إلى إذنك لإرسال إشعارات مهمة حول مواعيد الصلاة والأذكار',
    en: 'We need your permission to send important notifications about prayer times and daily remembrance',
    ur: 'نماز کے اوقات اور روزانہ کی یاد دہانی کے بارے میں اہم اطلاعات بھیجنے کے لئے ہمیں آپ کی اجازت کی ضرورت ہے'
  },
  notificationFeatures: {
    ar: [
      'مواعيد الصلوات',
      'الأذكار اليومية',
      'التذكير بالتحديات'
    ],
    en: [
      'Prayer times',
      'Daily remembrance',
      'Challenge reminders'
    ],
    ur: [
      'نماز کے اوقات',
      'روزانہ کی یاد دہانی',
      'چیلنج کی یاد دہانی'
    ]
  }
};

export class TranslationService {
  private static instance: TranslationService;
  private currentLanguage: 'ar' | 'en' | 'ur' = 'ar';

  private constructor() {
    // يمكن تحميل اللغة المفضلة من التخزين المحلي أو إعدادات المستخدم
    this.loadPreferredLanguage();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private loadPreferredLanguage(): void {
    try {
      // يمكن تحميل اللغة من localStorage أو من إعدادات التطبيق
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en' || savedLanguage === 'ur')) {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Error loading preferred language:', error);
    }
  }

  public setLanguage(language: 'ar' | 'en' | 'ur'): void {
    this.currentLanguage = language;
    try {
      localStorage.setItem('preferredLanguage', language);
    } catch (error) {
      console.error('Error saving preferred language:', error);
    }
  }

  public getCurrentLanguage(): 'ar' | 'en' | 'ur' {
    return this.currentLanguage;
  }

  public translate(key: keyof Translations): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation.en; // استخدام الإنجليزية كلغة احتياطية
  }

  public getNotificationFeatures(): string[] {
    return translations.notificationFeatures[this.currentLanguage];
  }
}

export const translationService = TranslationService.getInstance();

// تصدير الترجمات للاستخدام في الأماكن الأخرى
export type TranslationKey = keyof Translations;