import CryptoJS from 'crypto-js';

interface StorageItem {
  key: string;
  value: any;
  createdAt: number;
  updatedAt: number;
}

// Encryption secret using device fingerprint for better security
const getEncryptionSecret = (): string => {
  // This creates a simple device fingerprint based on available browser data
  const userAgent = navigator.userAgent;
  const screenProps = `${window.screen.height}x${window.screen.width}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  return CryptoJS.SHA256(`${userAgent}|${screenProps}|${timezone}|${language}`).toString();
};

// Encrypt data before storing
const encrypt = (data: any): string => {
  const secret = getEncryptionSecret();
  return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
};

// Decrypt data after retrieval
const decrypt = (encryptedData: string): any => {
  try {
    const secret = getEncryptionSecret();
    const bytes = CryptoJS.AES.decrypt(encryptedData, secret);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

export const secureStorage = {
  // Store item with encryption
  setItem: (key: string, value: any): void => {
    try {
      const timestamp = Date.now();
      const item: StorageItem = {
        key,
        value,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      const encryptedValue = encrypt(item);
      localStorage.setItem(`ktp_${key}`, encryptedValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },
  
  // Retrieve and decrypt item
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const encryptedValue = localStorage.getItem(`ktp_${key}`);
      if (!encryptedValue) return defaultValue;
      
      const decryptedItem = decrypt(encryptedValue) as StorageItem;
      return decryptedItem ? decryptedItem.value : defaultValue;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return defaultValue;
    }
  },
  
  // Remove item
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`ktp_${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
  
  // Clear all app data
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ktp_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Also clear app-specific data that doesn't use the ktp_ prefix
      const appKeys = [
        'selectedLanguage',
        'assessment_results',
        'assessment_completed',
        'assessment_state',
        'assessment_questions_order',
        'assessment_questions',
        'single_category_assessment_results',
        'single_category_questions',
        'selected_focus_areas',
        'prayer_settings',
        'prayer_tracking',
        'active_goals',
        'active_challenges',
        'user_achievements',
        'i18nextLng' // i18next language preference
      ];
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
  
  // Update only specific fields in an object
  updateItem: (key: string, updates: Record<string, any>): void => {
    try {
      const currentValue = secureStorage.getItem(key, {});
      if (currentValue && typeof currentValue === 'object') {
        secureStorage.setItem(key, { ...currentValue, ...updates });
      } else {
        secureStorage.setItem(key, updates);
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  }
};
