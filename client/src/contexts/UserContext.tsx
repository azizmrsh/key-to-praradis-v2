import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureStorage } from '@/lib/storage';
import { useLocation } from 'wouter';
import { calculateStreak, isSameDay } from '@/lib/utils';
import { SelfAssessment, Achievement } from '@shared/schema';
import { UserContentProgress } from '@/lib/contentService';
import { SinCategory } from '@/data/selfAssessmentData';

// Forward declare the Trigger type since we'll import it from the components
interface Trigger {
  id: string;
  name: string;
  category: string;
  description: string;
  situations: string[];
  strategies: string[];
  createdAt: Date;
  lastEncountered?: Date;
  encounterCount: number;
}

interface UserProgress {
  completedLessons: number[];
  completedSections: number[];
  streak: number;
  lastActivity?: Date;
  activityDates: Date[];
  todayCompletedLessons: number[];
  reflections: Record<number, Record<string, string>>;
  achievements: Achievement[];
  activeChallenges: number[]; // Legacy - use goalsEngine/challengeSelector for new features
  completedPractices: number[];
  triggers: Trigger[];
  selfAssessment?: SelfAssessment;
}

interface UserPreferences {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  notifications: boolean;
}

interface UserContextType {
  isInitialized: boolean;
  isFirstTimeUser: boolean;
  userProgress: UserProgress | null;
  preferences: UserPreferences;
  updateUserProgress: (updates: Partial<UserProgress>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetUserData: () => void;
  markUserAsReturning: () => void;
}

const defaultUserProgress: UserProgress = {
  completedLessons: [],
  completedSections: [],
  streak: 0,
  activityDates: [],
  todayCompletedLessons: [],
  reflections: {},
  achievements: [],
  activeChallenges: [],
  completedPractices: [],
  triggers: []
};

const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'light',
  notifications: true
};

const UserContext = createContext<UserContextType>({
  isInitialized: false,
  isFirstTimeUser: true,
  userProgress: null,
  preferences: defaultPreferences,
  updateUserProgress: () => {},
  updatePreferences: () => {},
  resetUserData: () => {},
  markUserAsReturning: () => {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [location, navigate] = useLocation();

  // Initialize user data from local storage
  useEffect(() => {
    const storedUserProgress = secureStorage.getItem<UserProgress>('userProgress');
    const storedPreferences = secureStorage.getItem<UserPreferences>('preferences');
    const isFirstTime = secureStorage.getItem<boolean>('isFirstTimeUser', true);
    
    if (storedUserProgress) {
      // Convert string dates to Date objects
      const formattedProgress = {
        ...storedUserProgress,
        lastActivity: storedUserProgress.lastActivity ? new Date(storedUserProgress.lastActivity) : undefined,
        activityDates: (storedUserProgress.activityDates || []).map(d => new Date(d))
      };
      
      // Calculate streak
      const streak = calculateStreak(formattedProgress.activityDates);
      
      // Filter today's completed lessons
      const today = new Date();
      const todayLessons = formattedProgress.completedLessons.filter(lessonId => {
        const lessonDate = formattedProgress.reflections[lessonId]?.completedAt;
        return lessonDate && isSameDay(new Date(lessonDate), today);
      });
      
      setUserProgress({
        ...formattedProgress,
        streak,
        todayCompletedLessons: todayLessons
      });
    } else {
      setUserProgress(defaultUserProgress);
    }
    
    if (storedPreferences) {
      setPreferences(storedPreferences);
    }
    
    setIsFirstTimeUser(isFirstTime);
    setIsInitialized(true);
    
    // Redirect logic based on user status
    if (isFirstTime && location !== '/onboarding') {
      // First-time users go to onboarding
      navigate('/onboarding');
    } else if (!isFirstTime && (location === '/' || location === '/onboarding' || location === '/assessment-choice')) {
      // Returning users go directly to content dashboard if they're on landing pages
      navigate('/content-dashboard');
    }
  }, []);

  // Save user progress to secure storage whenever it changes
  useEffect(() => {
    if (userProgress && isInitialized) {
      secureStorage.setItem('userProgress', userProgress);
    }
  }, [userProgress, isInitialized]);

  // Save preferences to secure storage whenever they change
  useEffect(() => {
    if (isInitialized) {
      secureStorage.setItem('preferences', preferences);
    }
  }, [preferences, isInitialized]);

  const updateUserProgress = (updates: Partial<UserProgress>) => {
    setUserProgress(prev => {
      if (!prev) return { ...defaultUserProgress, ...updates };
      
      // Handle activity tracking
      const updatedProgress = { ...prev, ...updates };
      
      // If this is a new day of activity, update the activity dates
      if (updates.lastActivity) {
        const today = new Date();
        const hasToday = prev.activityDates.some(date => isSameDay(new Date(date), today));
        
        if (!hasToday) {
          updatedProgress.activityDates = [...prev.activityDates, today];
        }
      }
      
      return updatedProgress;
    });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetUserData = () => {
    secureStorage.clear();
    setUserProgress(defaultUserProgress);
    setPreferences(defaultPreferences);
    setIsFirstTimeUser(true);
    navigate('/language-selection');
  };

  const markUserAsReturning = () => {
    setIsFirstTimeUser(false);
    secureStorage.setItem('isFirstTimeUser', false);
  };

  const value = {
    isInitialized,
    isFirstTimeUser,
    userProgress,
    preferences,
    updateUserProgress,
    updatePreferences,
    resetUserData,
    markUserAsReturning
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
