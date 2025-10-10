import CryptoJS from 'crypto-js';

// Secret key for encryption - in production, this should be more secure
const SECRET_KEY = 'keys_to_paradise_journal_2024';

/**
 * Encrypts data using AES encryption
 */
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 */
export function decryptData(encryptedData: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Saves journal entries to encrypted localStorage
 */
export function saveEncryptedJournalEntries(entries: any[]): void {
  try {
    const encrypted = encryptData(entries);
    localStorage.setItem('journal_entries', encrypted);
  } catch (error) {
    console.error('Failed to save encrypted journal entries:', error);
    throw error;
  }
}

/**
 * Loads and decrypts journal entries from localStorage
 */
export function loadEncryptedJournalEntries(): any[] {
  try {
    const encrypted = localStorage.getItem('journal_entries');
    if (!encrypted) return [];
    
    const decrypted = decryptData(encrypted);
    return Array.isArray(decrypted) ? decrypted : [];
  } catch (error) {
    console.error('Failed to load encrypted journal entries:', error);
    return [];
  }
}
