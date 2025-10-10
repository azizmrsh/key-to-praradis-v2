import { saveEncryptedJournalEntries, loadEncryptedJournalEntries } from '@/utils/encryption';

export type JournalArea = "Primary" | "Secondary" | "Misc";
export type JournalOrigin = "Goal" | "Challenge" | "Lesson" | "CheckIn" | "Manual";

export interface JournalEntry {
  id: string;
  content: string;
  emotion: string;
  area: JournalArea;
  origin: JournalOrigin;
  origin_id: string | null;
  created_at: string;
  updated_at: string;
  locked: boolean;
}

export interface AddJournalEntryData {
  content: string;
  emotion: string;
  area: JournalArea;
  origin: JournalOrigin;
  origin_id?: string | null;
}

export interface EditJournalEntryResult {
  success: boolean;
  entry?: JournalEntry;
  reason?: string;
}

export interface JournalFilters {
  area?: JournalArea;
  emotion?: string;
  origin?: JournalOrigin;
}

// Fixed emotion options
const FIXED_EMOTIONS = [
  'happy',
  'grateful',
  'peaceful',
  'hopeful',
  'reflective',
  'struggling',
  'determined'
];

class JournalManager {
  private storageKey = 'custom_emotions';

  /**
   * Generates a UUID v4
   */
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Adds a new journal entry
   */
  addJournalEntry(entryData: AddJournalEntryData): JournalEntry {
    const now = new Date().toISOString();
    
    const newEntry: JournalEntry = {
      id: this.generateUUID(),
      content: entryData.content,
      emotion: entryData.emotion,
      area: entryData.area,
      origin: entryData.origin,
      origin_id: entryData.origin_id || null,
      created_at: now,
      updated_at: now,
      locked: false
    };

    const entries = this.getAllEntries();
    entries.push(newEntry);
    saveEncryptedJournalEntries(entries);
    
    return newEntry;
  }

  /**
   * Edits an existing journal entry
   */
  editJournalEntry(entryId: string, updatedContent: string, updatedEmotion?: string): EditJournalEntryResult {
    const entries = this.getAllEntries();
    const index = entries.findIndex(entry => entry.id === entryId);
    
    if (index === -1) {
      return { success: false, reason: "Entry not found" };
    }

    const entry = entries[index];
    
    if (entry.locked) {
      return { success: false, reason: "Locked" };
    }

    entries[index] = {
      ...entry,
      content: updatedContent,
      emotion: updatedEmotion || entry.emotion,
      updated_at: new Date().toISOString()
    };

    saveEncryptedJournalEntries(entries);
    
    return { success: true, entry: entries[index] };
  }

  /**
   * Gets all journal entries with optional filters
   */
  getAllEntries(filters?: JournalFilters): JournalEntry[] {
    let entries = loadEncryptedJournalEntries();
    
    if (filters) {
      if (filters.area) {
        entries = entries.filter(entry => entry.area === filters.area);
      }
      if (filters.emotion) {
        entries = entries.filter(entry => entry.emotion === filters.emotion);
      }
      if (filters.origin) {
        entries = entries.filter(entry => entry.origin === filters.origin);
      }
    }

    // Sort by created_at (newest first)
    return entries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Gets a single journal entry by ID
   */
  getEntry(entryId: string): JournalEntry | null {
    const entries = loadEncryptedJournalEntries();
    return entries.find(entry => entry.id === entryId) || null;
  }

  /**
   * Deletes a journal entry
   */
  deleteJournalEntry(entryId: string): boolean {
    const entries = loadEncryptedJournalEntries();
    const filtered = entries.filter(entry => entry.id !== entryId);
    
    if (filtered.length === entries.length) {
      return false; // Entry not found
    }
    
    saveEncryptedJournalEntries(filtered);
    return true;
  }

  /**
   * Gets available emotions (fixed + custom)
   */
  getAvailableEmotions(): string[] {
    const customEmotions = this.getCustomEmotions();
    return [...FIXED_EMOTIONS, ...customEmotions];
  }

  /**
   * Gets custom emotions from localStorage
   */
  getCustomEmotions(): string[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    try {
      const emotions = JSON.parse(stored);
      return Array.isArray(emotions) ? emotions : [];
    } catch {
      return [];
    }
  }

  /**
   * Adds a custom emotion
   */
  addCustomEmotion(emotion: string): boolean {
    const trimmed = emotion.trim().toLowerCase();
    if (!trimmed) return false;
    
    const customEmotions = this.getCustomEmotions();
    const allEmotions = this.getAvailableEmotions();
    
    // Check if already exists
    if (allEmotions.includes(trimmed)) {
      return false;
    }
    
    customEmotions.push(trimmed);
    localStorage.setItem(this.storageKey, JSON.stringify(customEmotions));
    return true;
  }

  /**
   * Removes a custom emotion
   */
  removeCustomEmotion(emotion: string): boolean {
    const customEmotions = this.getCustomEmotions();
    const filtered = customEmotions.filter(e => e !== emotion);
    
    if (filtered.length === customEmotions.length) {
      return false; // Not found
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  /**
   * Locks all journal entries linked to a completed goal or challenge
   */
  lockEntriesLinkedToCompletedItems(originId: string, originType: JournalOrigin): number {
    const entries = loadEncryptedJournalEntries();
    let lockedCount = 0;
    
    const updatedEntries = entries.map(entry => {
      if (entry.origin_id === originId && entry.origin === originType && !entry.locked) {
        lockedCount++;
        return { ...entry, locked: true };
      }
      return entry;
    });
    
    if (lockedCount > 0) {
      saveEncryptedJournalEntries(updatedEntries);
    }
    
    return lockedCount;
  }

  /**
   * Gets entries by origin ID
   */
  getEntriesByOrigin(originId: string, originType?: JournalOrigin): JournalEntry[] {
    const entries = this.getAllEntries();
    return entries.filter(entry => {
      const matchesId = entry.origin_id === originId;
      const matchesType = originType ? entry.origin === originType : true;
      return matchesId && matchesType;
    });
  }

  /**
   * Gets the count of entries for a specific origin
   */
  getEntryCount(originId: string, originType?: JournalOrigin): number {
    return this.getEntriesByOrigin(originId, originType).length;
  }

  /**
   * Exports all entries as JSON
   */
  exportAllEntries(): string {
    const entries = this.getAllEntries();
    return JSON.stringify(entries, null, 2);
  }
}

export const journalManager = new JournalManager();
