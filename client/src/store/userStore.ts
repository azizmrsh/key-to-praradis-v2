import { create } from 'zustand';
import { secureStorage } from '@/lib/storage';
import { calculateStreak, isSameDay } from '@/lib/utils';
import { SelfAssessment, Achievement } from '@shared/schema';

interface UserState {
  isInitialized: boolean;
  isFirstTimeUser: boolean;
  userProgress: {
    completedLessons: number[];
    completedSections: number[];
    streak: number;
    lastActivity?: Date;
    activityDates: Date[];
    todayCompletedLessons: number[];
    reflections: Record<number, Record<string, string>>;
    achievements: Achievement[];
    activeChallenges: number[];
    selfAssessment?: SelfAssessment;
  } | null;
  preferences: {
    language: 'en' | 'ar';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  initialize: () => void;
  updateUserProgress: (updates: Partial<UserState['userProgress']>) => void;
  updatePreferences: (updates: Partial<UserState['preferences']>) => void;
  resetUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  isInitialized: false,
  isFirstTimeUser: true,
  userProgress: null,
  preferences: {
    language: 'en',
    theme: 'light',
    notifications: true
  },
  
  initialize: () => {
    const storedUserProgress = secureStorage.getItem('userProgress');
    const storedPreferences = secureStorage.getItem('preferences');
    const isFirstTime = secureStorage.getItem('isFirstTimeUser', true);
    
    if (storedUserProgress) {
      // Convert string dates to Date objects
      const formattedProgress = {
        ...storedUserProgress,
        lastActivity: storedUserProgress.lastActivity ? new Date(storedUserProgress.lastActivity) : undefined,
        activityDates: (storedUserProgress.activityDates || []).map((d: string) => new Date(d))
      };
      
      // Calculate streak
      const streak = calculateStreak(formattedProgress.activityDates);
      
      // Filter today's completed lessons
      const today = new Date();
      const todayLessons = formattedProgress.completedLessons.filter((lessonId: number) => {
        const lessonDate = formattedProgress.reflections[lessonId]?.completedAt;
        return lessonDate && isSameDay(new Date(lessonDate), today);
      });
      
      set({
        userProgress: {
          ...formattedProgress,
          streak,
          todayCompletedLessons: todayLessons
        }
      });
    } else {
      set({
        userProgress: {
          completedLessons: [],
          completedSections: [],
          streak: 0,
          activityDates: [],
          todayCompletedLessons: [],
          reflections: {},
          achievements: [],
          activeChallenges: []
        }
      });
    }
    
    if (storedPreferences) {
      set({ preferences: storedPreferences });
    }
    
    set({ isFirstTimeUser: isFirstTime, isInitialized: true });
  },
  
  updateUserProgress: (updates) => {
    set((state) => {
      if (!state.userProgress) {
        const newProgress = {
          completedLessons: [],
          completedSections: [],
          streak: 0,
          activityDates: [],
          todayCompletedLessons: [],
          reflections: {},
          achievements: [],
          activeChallenges: [],
          ...updates
        };
        secureStorage.setItem('userProgress', newProgress);
        return { userProgress: newProgress };
      }
      
      // Handle activity tracking
      const updatedProgress = { ...state.userProgress, ...updates };
      
      // If this is a new day of activity, update the activity dates
      if (updates.lastActivity) {
        const today = new Date();
        const hasToday = state.userProgress.activityDates.some(date => 
          isSameDay(new Date(date), today)
        );
        
        if (!hasToday) {
          updatedProgress.activityDates = [...state.userProgress.activityDates, today];
        }
      }
      
      secureStorage.setItem('userProgress', updatedProgress);
      return { userProgress: updatedProgress };
    });
  },
  
  updatePreferences: (updates) => {
    set((state) => {
      const newPreferences = { ...state.preferences, ...updates };
      secureStorage.setItem('preferences', newPreferences);
      return { preferences: newPreferences };
    });
  },
  
  resetUserData: () => {
    secureStorage.clear();
    set({
      isFirstTimeUser: true,
      userProgress: {
        completedLessons: [],
        completedSections: [],
        streak: 0,
        activityDates: [],
        todayCompletedLessons: [],
        reflections: {},
        achievements: [],
        activeChallenges: []
      },
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true
      }
    });
  }
}));
