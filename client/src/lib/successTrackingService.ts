// Service to track Success Today button cooldowns
interface SuccessRecord {
  category: string;
  lastClickedAt: Date;
}

class SuccessTrackingService {
  private storageKey = 'success_today_records';

  // Get all success records from localStorage
  private getSuccessRecords(): SuccessRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const records = JSON.parse(stored);
      // Convert date strings back to Date objects
      return records.map((record: any) => ({
        ...record,
        lastClickedAt: new Date(record.lastClickedAt)
      }));
    } catch (error) {
      console.error('Error reading success records:', error);
      return [];
    }
  }

  // Save success records to localStorage
  private saveSuccessRecords(records: SuccessRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving success records:', error);
    }
  }

  // Check if user can click Success Today for a specific category
  canClickSuccessToday(category: string): boolean {
    const records = this.getSuccessRecords();
    const categoryRecord = records.find(record => record.category === category);
    
    if (!categoryRecord) {
      return true; // Never clicked before
    }

    const now = new Date();
    const timeSinceLastClick = now.getTime() - categoryRecord.lastClickedAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return timeSinceLastClick >= twentyFourHours;
  }

  // Record a Success Today click
  recordSuccessClick(category: string): void {
    const records = this.getSuccessRecords();
    const now = new Date();
    
    // Find existing record for this category
    const existingIndex = records.findIndex(record => record.category === category);
    
    if (existingIndex >= 0) {
      // Update existing record
      records[existingIndex].lastClickedAt = now;
    } else {
      // Add new record
      records.push({
        category,
        lastClickedAt: now
      });
    }
    
    this.saveSuccessRecords(records);
  }

  // Get time remaining until next click is allowed (in milliseconds)
  getTimeUntilNextClick(category: string): number {
    const records = this.getSuccessRecords();
    const categoryRecord = records.find(record => record.category === category);
    
    if (!categoryRecord) {
      return 0; // Can click immediately
    }

    const now = new Date();
    const timeSinceLastClick = now.getTime() - categoryRecord.lastClickedAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const timeRemaining = twentyFourHours - timeSinceLastClick;
    return Math.max(0, timeRemaining);
  }

  // Get formatted time remaining string
  getFormattedTimeRemaining(category: string): string {
    const timeRemaining = this.getTimeUntilNextClick(category);
    
    if (timeRemaining === 0) {
      return 'Available now';
    }

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  // Clean up old records (optional - could be called periodically)
  cleanupOldRecords(): void {
    const records = this.getSuccessRecords();
    const now = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // Keep records for 7 days
    
    const cleanedRecords = records.filter(record => {
      const timeSinceClick = now.getTime() - record.lastClickedAt.getTime();
      return timeSinceClick < sevenDays;
    });
    
    this.saveSuccessRecords(cleanedRecords);
  }
}

export const successTrackingService = new SuccessTrackingService();