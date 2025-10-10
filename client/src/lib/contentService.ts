import { SinCategory } from '@/data/selfAssessmentData';
import { 
  contentRepository, 
  getContentByCategory, 
  getLessonsByCategory, 
  getNextLesson, 
  getCategoryProgress,
  ContentLesson,
  CategoryContent 
} from '@/data/contentRepository';

// User's active content state
export interface UserContentProgress {
  activeSinCategories: SinCategory[]; // Max 2 categories
  completedLessons: string[];
  lessonsInProgress: string[];
  behavioralProgress: Record<SinCategory, {
    successfulDays: number;
    totalDays: number;
    currentStreak: number;
    goal: number; // e.g., 40 days
    lastUpdated: Date;
  }>;
  infractions: Record<SinCategory, {
    date: Date;
    note?: string;
  }[]>;
  journalEntries: Record<SinCategory, {
    id: string;
    content: string;
    date: Date;
    mood?: 'struggling' | 'hopeful' | 'strong';
  }[]>;
}

// Content delivery functions
export class ContentService {
  
  // Get dashboard content for active sin categories
  static getDashboardContent(userProgress: UserContentProgress): {
    category: SinCategory;
    content: CategoryContent;
    progress: ReturnType<typeof getCategoryProgress>;
    nextLesson: ContentLesson | null;
    behavioralProgress: UserContentProgress['behavioralProgress'][SinCategory];
  }[] {
    return userProgress.activeSinCategories.map(category => {
      const content = getContentByCategory(category);
      const progress = getCategoryProgress(category, userProgress.completedLessons);
      const nextLesson = getNextLesson(category, userProgress.completedLessons);
      const behavioralProgress = userProgress.behavioralProgress[category] || {
        successfulDays: 0,
        totalDays: 0,
        currentStreak: 0,
        goal: 40,
        lastUpdated: new Date()
      };

      return {
        category,
        content,
        progress,
        nextLesson,
        behavioralProgress
      };
    });
  }

  // Mark lesson as completed
  static markLessonComplete(
    userProgress: UserContentProgress, 
    lessonId: string
  ): UserContentProgress {
    return {
      ...userProgress,
      completedLessons: [...userProgress.completedLessons, lessonId],
      lessonsInProgress: userProgress.lessonsInProgress.filter(id => id !== lessonId)
    };
  }

  // Start lesson (mark as in progress)
  static startLesson(
    userProgress: UserContentProgress, 
    lessonId: string
  ): UserContentProgress {
    if (userProgress.lessonsInProgress.includes(lessonId)) {
      return userProgress;
    }

    return {
      ...userProgress,
      lessonsInProgress: [...userProgress.lessonsInProgress, lessonId]
    };
  }

  // Record successful day (no infractions)
  static recordSuccessfulDay(
    userProgress: UserContentProgress,
    category: SinCategory
  ): UserContentProgress {
    const currentProgress = userProgress.behavioralProgress[category] || {
      successfulDays: 0,
      totalDays: 0,
      currentStreak: 0,
      goal: 40,
      lastUpdated: new Date()
    };

    return {
      ...userProgress,
      behavioralProgress: {
        ...userProgress.behavioralProgress,
        [category]: {
          ...currentProgress,
          successfulDays: currentProgress.successfulDays + 1,
          totalDays: currentProgress.totalDays + 1,
          currentStreak: currentProgress.currentStreak + 1,
          lastUpdated: new Date()
        }
      }
    };
  }

  // Record infraction
  static recordInfraction(
    userProgress: UserContentProgress,
    category: SinCategory,
    note?: string
  ): UserContentProgress {
    const currentProgress = userProgress.behavioralProgress[category] || {
      successfulDays: 0,
      totalDays: 0,
      currentStreak: 0,
      goal: 40,
      lastUpdated: new Date()
    };

    const currentInfractions = userProgress.infractions[category] || [];

    return {
      ...userProgress,
      behavioralProgress: {
        ...userProgress.behavioralProgress,
        [category]: {
          ...currentProgress,
          totalDays: currentProgress.totalDays + 1,
          currentStreak: 0, // Reset streak on infraction
          lastUpdated: new Date()
        }
      },
      infractions: {
        ...userProgress.infractions,
        [category]: [
          ...currentInfractions,
          {
            date: new Date(),
            note
          }
        ]
      }
    };
  }

  // Add journal entry
  static addJournalEntry(
    userProgress: UserContentProgress,
    category: SinCategory,
    content: string,
    mood?: 'struggling' | 'hopeful' | 'strong'
  ): UserContentProgress {
    const currentEntries = userProgress.journalEntries[category] || [];

    return {
      ...userProgress,
      journalEntries: {
        ...userProgress.journalEntries,
        [category]: [
          ...currentEntries,
          {
            id: `journal_${Date.now()}`,
            content,
            date: new Date(),
            mood
          }
        ]
      }
    };
  }

  // Swap one active sin category for another
  static swapSinCategory(
    userProgress: UserContentProgress,
    oldCategory: SinCategory,
    newCategory: SinCategory
  ): UserContentProgress {
    const newActiveCategories = userProgress.activeSinCategories.map(cat => 
      cat === oldCategory ? newCategory : cat
    );

    return {
      ...userProgress,
      activeSinCategories: newActiveCategories
    };
  }

  // Initialize user progress from assessment results
  static initializeFromAssessment(
    primaryStruggle: SinCategory,
    secondaryStruggle: SinCategory
  ): UserContentProgress {
    return {
      activeSinCategories: [primaryStruggle, secondaryStruggle],
      completedLessons: [],
      lessonsInProgress: [],
      behavioralProgress: {
        [primaryStruggle]: {
          successfulDays: 0,
          totalDays: 0,
          currentStreak: 0,
          goal: 40,
          lastUpdated: new Date()
        },
        [secondaryStruggle]: {
          successfulDays: 0,
          totalDays: 0,
          currentStreak: 0,
          goal: 40,
          lastUpdated: new Date()
        }
      },
      infractions: {},
      journalEntries: {}
    };
  }

  // Get available categories for swapping
  static getAvailableCategories(currentActive: SinCategory[]): SinCategory[] {
    const allCategories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    return allCategories.filter(cat => !currentActive.includes(cat));
  }

  // Calculate behavioral progress percentage
  static getBehavioralProgressPercentage(
    successfulDays: number,
    goal: number
  ): number {
    return Math.min(100, Math.round((successfulDays / goal) * 100));
  }

  // Get motivational message based on progress
  static getMotivationalMessage(
    streak: number,
    progressPercentage: number
  ): string {
    if (streak === 0) {
      return "Every journey begins with a single step. You can do this!";
    } else if (streak < 7) {
      return `Excellent start! ${streak} days strong. Keep building momentum.`;
    } else if (streak < 30) {
      return `Mashallah! ${streak} days of progress. You're developing real strength.`;
    } else {
      return `Subhanallah! ${streak} days of consistent effort. You're truly transforming.`;
    }
  }
}

export default ContentService;