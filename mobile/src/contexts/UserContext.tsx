import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserPreferences, Achievement, Trigger } from '../types';

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
  triggers: [],
};

const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'light',
  notifications: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    initializeUserData();
  }, []);

  const initializeUserData = async () => {
    try {
      // Check if user has visited before
      const hasVisited = await AsyncStorage.getItem('hasVisited');
      setIsFirstTimeUser(!hasVisited);

      // Load user progress
      const progressData = await AsyncStorage.getItem('userProgress');
      if (progressData) {
        const parsed = JSON.parse(progressData);
        setUserProgress({
          ...parsed,
          lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : undefined,
          activityDates: parsed.activityDates.map((date: string) => new Date(date)),
        });
      } else {
        setUserProgress(defaultUserProgress);
      }

      // Load preferences
      const prefsData = await AsyncStorage.getItem('userPreferences');
      if (prefsData) {
        setPreferences(JSON.parse(prefsData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserProgress(defaultUserProgress);
    } finally {
      setIsInitialized(true);
    }
  };

  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    const newProgress = userProgress ? { ...userProgress, ...updates } : { ...defaultUserProgress, ...updates };
    setUserProgress(newProgress);
    
    try {
      await AsyncStorage.setItem('userProgress', JSON.stringify(newProgress));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const resetUserData = async () => {
    try {
      await AsyncStorage.multiRemove(['userProgress', 'userPreferences', 'hasVisited']);
      setUserProgress(defaultUserProgress);
      setPreferences(defaultPreferences);
      setIsFirstTimeUser(true);
    } catch (error) {
      console.error('Error resetting user data:', error);
    }
  };

  const markUserAsReturning = async () => {
    setIsFirstTimeUser(false);
    try {
      await AsyncStorage.setItem('hasVisited', 'true');
    } catch (error) {
      console.error('Error marking user as returning:', error);
    }
  };

  const contextValue: UserContextType = {
    isInitialized,
    isFirstTimeUser,
    userProgress,
    preferences,
    updateUserProgress,
    updatePreferences,
    resetUserData,
    markUserAsReturning,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};