import { create } from 'zustand';
import { Section, Lesson, Challenge, Achievement } from '@shared/schema';
import { secureStorage } from '@/lib/storage';
import { contentData } from '@/data/content';

interface ContentState {
  isContentLoaded: boolean;
  sections: Section[];
  lessons: Lesson[];
  challenges: Challenge[];
  achievements: Achievement[];
  initializeContent: () => void;
  getSectionById: (id: number) => Section | undefined;
  getLessonById: (id: number) => Lesson | undefined;
  getLessonsBySection: (sectionId: number) => Lesson[];
  getSectionProgress: (sectionId: number) => { completed: number; total: number };
  completeLesson: (lessonId: number, reflections: Record<string, string>) => void;
  getDailyChallenge: () => Challenge;
  getAchievements: () => Achievement[];
  acceptChallenge: (challengeId: number) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  isContentLoaded: false,
  sections: [],
  lessons: [],
  challenges: [],
  achievements: [],
  
  initializeContent: () => {
    // In a real app, this would fetch from an API or local storage
    // For now, we'll use the mock data
    set({
      sections: contentData.sections,
      lessons: contentData.lessons,
      challenges: contentData.challenges,
      achievements: contentData.achievements,
      isContentLoaded: true
    });
  },
  
  getSectionById: (id: number) => {
    return get().sections.find(section => section.id === id);
  },
  
  getLessonById: (id: number) => {
    return get().lessons.find(lesson => lesson.id === id);
  },
  
  getLessonsBySection: (sectionId: number) => {
    return get().lessons.filter(lesson => lesson.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  },
  
  getSectionProgress: (sectionId: number) => {
    const completedLessons = secureStorage.getItem<number[]>('userProgress.completedLessons', []);
    const sectionLessons = get().lessons.filter(lesson => lesson.sectionId === sectionId);
    const completedSectionLessons = sectionLessons.filter(lesson => 
      completedLessons.includes(lesson.id)
    );
    
    return {
      completed: completedSectionLessons.length,
      total: sectionLessons.length
    };
  },
  
  completeLesson: (lessonId: number, reflections: Record<string, string>) => {
    const userProgress = secureStorage.getItem('userProgress', {
      completedLessons: [],
      reflections: {}
    });
    
    // Add the lesson to completed lessons if it's not already there
    if (!userProgress.completedLessons.includes(lessonId)) {
      userProgress.completedLessons.push(lessonId);
    }
    
    // Store reflections with completion timestamp
    userProgress.reflections = {
      ...userProgress.reflections,
      [lessonId]: {
        ...reflections,
        completedAt: new Date().toISOString()
      }
    };
    
    // Update the last activity date
    userProgress.lastActivity = new Date().toISOString();
    
    // Save to storage
    secureStorage.updateItem('userProgress', userProgress);
    
    // Check if section is completed
    const lesson = get().getLessonById(lessonId);
    if (lesson) {
      const { completed, total } = get().getSectionProgress(lesson.sectionId);
      if (completed === total) {
        // Section completed, update user progress
        const userProgress = secureStorage.getItem('userProgress', {
          completedSections: []
        });
        
        if (!userProgress.completedSections.includes(lesson.sectionId)) {
          userProgress.completedSections.push(lesson.sectionId);
          
          // Check for achievements
          const newAchievements = checkForAchievements(userProgress);
          if (newAchievements.length > 0) {
            userProgress.achievements = [
              ...(userProgress.achievements || []),
              ...newAchievements
            ];
          }
          
          secureStorage.updateItem('userProgress', userProgress);
        }
      }
    }
  },
  
  getDailyChallenge: () => {
    // In a real app, this would be personalized based on user progress
    // For now, pick a challenge randomly
    const challenges = get().challenges;
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  },
  
  getAchievements: () => {
    const userProgress = secureStorage.getItem('userProgress', {
      achievements: []
    });
    
    // Combine all achievements with unlock status
    return get().achievements.map(achievement => {
      const unlockedAchievement = userProgress.achievements?.find(a => a.id === achievement.id);
      return {
        ...achievement,
        unlockedAt: unlockedAchievement?.unlockedAt
      };
    });
  },
  
  acceptChallenge: (challengeId: number) => {
    const userProgress = secureStorage.getItem('userProgress', {
      activeChallenges: []
    });
    
    if (!userProgress.activeChallenges.includes(challengeId)) {
      userProgress.activeChallenges.push(challengeId);
      secureStorage.updateItem('userProgress', { 
        activeChallenges: userProgress.activeChallenges
      });
    }
  }
}));

// Helper function to check for achievements
function checkForAchievements(userProgress: any): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  // First lesson completed achievement
  if (userProgress.completedLessons.length === 1) {
    newAchievements.push({
      id: 1,
      title: "First Step",
      description: "Completed first lesson",
      icon: "auto_awesome",
      unlockedAt: new Date()
    });
  }
  
  // First section completed achievement
  if (userProgress.completedSections.length === 1) {
    newAchievements.push({
      id: 2,
      title: "Section Master",
      description: "Completed first section",
      icon: "stars",
      unlockedAt: new Date()
    });
  }
  
  // Check for streak achievements
  if (userProgress.streak >= 7) {
    newAchievements.push({
      id: 3,
      title: "Consistency",
      description: "7-day streak",
      icon: "local_fire_department",
      unlockedAt: new Date()
    });
  }
  
  return newAchievements;
}

// Initialize content when the store is first used
useContentStore.subscribe((state) => {
  if (!state.isContentLoaded) {
    state.initializeContent();
  }
});
