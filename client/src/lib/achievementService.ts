// Define Achievement interface locally
export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: string;
};
import { SinCategory } from '@/data/selfAssessmentData';

// Local storage key
const ACHIEVEMENTS_KEY = 'ktp:achievements';

// Achievement types
export enum AchievementType {
  STREAK = 'streak',
  CHECK_IN = 'check_in',
  CONTENT = 'content',
  PRAYER = 'prayer',
  REFLECTION = 'reflection',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  TRIGGER = 'trigger',
  SPECIAL = 'special'
}

// Achievement master data
export const achievementsMasterData: Achievement[] = [
  // Streak achievements
  {
    id: 101,
    title: "First Steps",
    description: "Complete your first daily check-in",
    icon: "footprints",
    category: AchievementType.STREAK
  },
  {
    id: 102,
    title: "Consistent Path",
    description: "Maintain a 3-day streak",
    icon: "calendar-check",
    category: AchievementType.STREAK
  },
  {
    id: 103,
    title: "Weekly Warrior",
    description: "Maintain a 7-day streak",
    icon: "calendar-days",
    category: AchievementType.STREAK
  },
  {
    id: 104,
    title: "Fortnight Focus",
    description: "Maintain a 14-day streak",
    icon: "calendar-heart",
    category: AchievementType.STREAK
  },
  {
    id: 105,
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "calendar-range",
    category: AchievementType.STREAK
  },
  
  // Content achievements
  {
    id: 201,
    title: "Eager Reader",
    description: "Read 5 articles",
    icon: "book-open",
    category: AchievementType.CONTENT
  },
  {
    id: 202,
    title: "Knowledge Seeker",
    description: "Read content from 3 different sin categories",
    icon: "library",
    category: AchievementType.CONTENT
  },
  {
    id: 203,
    title: "Dedicated Student",
    description: "Read 15 articles",
    icon: "graduation-cap",
    category: AchievementType.CONTENT
  },
  {
    id: 204,
    title: "Content Collector",
    description: "Add 5 articles to favorites",
    icon: "bookmark",
    category: AchievementType.CONTENT
  },
  
  // Reflection achievements
  {
    id: 301,
    title: "Self-Examiner",
    description: "Complete 3 content reflections",
    icon: "pencil",
    category: AchievementType.REFLECTION
  },
  {
    id: 302,
    title: "Deep Thinker",
    description: "Write reflections with at least 100 words",
    icon: "pen-line",
    category: AchievementType.REFLECTION
  },
  {
    id: 303,
    title: "Consistent Journaler",
    description: "Complete reflections for 5 days in a row",
    icon: "notebook-pen",
    category: AchievementType.REFLECTION
  },
  
  // Assessment achievements
  {
    id: 401,
    title: "Self-Aware",
    description: "Complete your first self-assessment",
    icon: "brain",
    category: AchievementType.ASSESSMENT
  },
  {
    id: 402,
    title: "Goal Setter",
    description: "Set a spiritual improvement goal",
    icon: "target",
    category: AchievementType.ASSESSMENT
  },
  {
    id: 403,
    title: "Progress Tracker",
    description: "Complete 3 self-assessments",
    icon: "line-chart",
    category: AchievementType.ASSESSMENT
  },
  
  // Practice achievements
  {
    id: 501,
    title: "Practice Beginner",
    description: "Complete your first practice",
    icon: "sparkles",
    category: AchievementType.PRACTICE
  },
  {
    id: 502,
    title: "Dedicated Practitioner",
    description: "Complete 5 practices",
    icon: "activity",
    category: AchievementType.PRACTICE
  },
  {
    id: 503,
    title: "Practice Master",
    description: "Complete practices from 3 different sin categories",
    icon: "award",
    category: AchievementType.PRACTICE
  },
  
  // Prayer achievements
  {
    id: 601,
    title: "Prayer Conscious",
    description: "Set up prayer notifications",
    icon: "bell",
    category: AchievementType.PRAYER
  },
  {
    id: 602,
    title: "Location Aware",
    description: "Configure your prayer location",
    icon: "map-pin",
    category: AchievementType.PRAYER
  },
  
  // Trigger achievements
  {
    id: 701,
    title: "Trigger Identifier",
    description: "Add your first trigger",
    icon: "alert-triangle",
    category: AchievementType.TRIGGER
  },
  {
    id: 702,
    title: "Strategy Builder",
    description: "Add strategies to 3 triggers",
    icon: "shield",
    category: AchievementType.TRIGGER
  },
  
  // Special achievements
  {
    id: 801,
    title: "Early Adopter",
    description: "Join the Keys to Paradise community",
    icon: "key",
    category: AchievementType.SPECIAL,
    unlockedAt: new Date().toISOString() // Auto-unlocked
  },
  {
    id: 802,
    title: "Holistic Approach",
    description: "Engage with all app features at least once",
    icon: "compass",
    category: AchievementType.SPECIAL
  }
];

// Function to get all achievements (locked and unlocked)
export function getAllAchievements(): Achievement[] {
  return achievementsMasterData;
}

// Function to get unlocked achievements
export function getUnlockedAchievements(): Achievement[] {
  try {
    const achievementsData = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!achievementsData) {
      // Return only auto-unlocked achievements
      return achievementsMasterData.filter(a => a.unlockedAt);
    }
    
    const unlockedIds = JSON.parse(achievementsData) as number[];
    return achievementsMasterData.filter(a => 
      unlockedIds.includes(a.id) || a.unlockedAt
    );
  } catch (error) {
    console.error('Error retrieving unlocked achievements:', error);
    return achievementsMasterData.filter(a => a.unlockedAt);
  }
}

// Function to get locked achievements
export function getLockedAchievements(): Achievement[] {
  const unlockedIds = getUnlockedAchievements().map(a => a.id);
  return achievementsMasterData.filter(a => !unlockedIds.includes(a.id));
}

// Function to unlock an achievement
export function unlockAchievement(achievementId: number): Achievement | null {
  try {
    const achievement = achievementsMasterData.find(a => a.id === achievementId);
    if (!achievement) {
      return null;
    }
    
    const unlockedAchievements = getUnlockedAchievements();
    const alreadyUnlocked = unlockedAchievements.some(a => a.id === achievementId);
    
    if (alreadyUnlocked) {
      return achievement;
    }
    
    const achievementsData = localStorage.getItem(ACHIEVEMENTS_KEY);
    let unlockedIds: number[] = achievementsData ? JSON.parse(achievementsData) : [];
    
    // Add the new achievement ID
    unlockedIds.push(achievementId);
    
    // Save to local storage
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedIds));
    
    // Return the unlocked achievement with timestamp
    return {
      ...achievement,
      unlockedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
}

// Function to check achievement progress
export function checkAchievementProgress(
  achievementType: AchievementType, 
  data: any
): Achievement | null {
  const lockedAchievements = getLockedAchievements()
    .filter(a => a.category === achievementType);
  
  if (lockedAchievements.length === 0) {
    return null;
  }
  
  switch (achievementType) {
    case AchievementType.STREAK:
      return checkStreakAchievements(lockedAchievements, data);
    
    case AchievementType.CONTENT:
      return checkContentAchievements(lockedAchievements, data);
    
    case AchievementType.REFLECTION:
      return checkReflectionAchievements(lockedAchievements, data);
      
    case AchievementType.PRACTICE:
      return checkPracticeAchievements(lockedAchievements, data);
      
    case AchievementType.ASSESSMENT:
      return checkAssessmentAchievements(lockedAchievements, data);
      
    case AchievementType.TRIGGER:
      return checkTriggerAchievements(lockedAchievements, data);
    
    case AchievementType.PRAYER:
      return checkPrayerAchievements(lockedAchievements, data);
      
    case AchievementType.SPECIAL:
      return checkSpecialAchievements(lockedAchievements, data);
      
    default:
      return null;
  }
}

// Helper function to check streak achievements
function checkStreakAchievements(
  lockedAchievements: Achievement[], 
  data: { streak: number, checkedInToday: boolean }
): Achievement | null {
  // First check-in achievement
  if (data.checkedInToday) {
    const firstCheckInAchievement = lockedAchievements.find(a => a.id === 101);
    if (firstCheckInAchievement) {
      return unlockAchievement(firstCheckInAchievement.id);
    }
  }
  
  // Streak-based achievements
  const streakThresholds = [
    { id: 102, days: 3 },
    { id: 103, days: 7 },
    { id: 104, days: 14 },
    { id: 105, days: 30 }
  ];
  
  for (const threshold of streakThresholds) {
    if (data.streak >= threshold.days) {
      const streakAchievement = lockedAchievements.find(a => a.id === threshold.id);
      if (streakAchievement) {
        return unlockAchievement(streakAchievement.id);
      }
    }
  }
  
  return null;
}

// Helper function to check content achievements
function checkContentAchievements(
  lockedAchievements: Achievement[], 
  data: { viewedContent: number[], favorites: number[], categories: string[] }
): Achievement | null {
  // Articles read
  if (data.viewedContent.length >= 5) {
    const readerAchievement = lockedAchievements.find(a => a.id === 201);
    if (readerAchievement) {
      return unlockAchievement(readerAchievement.id);
    }
  }
  
  if (data.viewedContent.length >= 15) {
    const studentAchievement = lockedAchievements.find(a => a.id === 203);
    if (studentAchievement) {
      return unlockAchievement(studentAchievement.id);
    }
  }
  
  // Categories read
  if (data.categories.length >= 3) {
    const categoryAchievement = lockedAchievements.find(a => a.id === 202);
    if (categoryAchievement) {
      return unlockAchievement(categoryAchievement.id);
    }
  }
  
  // Favorites
  if (data.favorites.length >= 5) {
    const favoritesAchievement = lockedAchievements.find(a => a.id === 204);
    if (favoritesAchievement) {
      return unlockAchievement(favoritesAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check reflection achievements
function checkReflectionAchievements(
  lockedAchievements: Achievement[], 
  data: { reflections: any[], streakDays: number, wordCount: number }
): Achievement | null {
  // Number of reflections
  if (data.reflections.length >= 3) {
    const reflectionAchievement = lockedAchievements.find(a => a.id === 301);
    if (reflectionAchievement) {
      return unlockAchievement(reflectionAchievement.id);
    }
  }
  
  // Word count
  if (data.wordCount >= 100) {
    const wordCountAchievement = lockedAchievements.find(a => a.id === 302);
    if (wordCountAchievement) {
      return unlockAchievement(wordCountAchievement.id);
    }
  }
  
  // Streak
  if (data.streakDays >= 5) {
    const streakAchievement = lockedAchievements.find(a => a.id === 303);
    if (streakAchievement) {
      return unlockAchievement(streakAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check practice achievements
function checkPracticeAchievements(
  lockedAchievements: Achievement[], 
  data: { completedPractices: number[], categories: SinCategory[] }
): Achievement | null {
  // First practice
  if (data.completedPractices.length >= 1) {
    const firstPracticeAchievement = lockedAchievements.find(a => a.id === 501);
    if (firstPracticeAchievement) {
      return unlockAchievement(firstPracticeAchievement.id);
    }
  }
  
  // 5 practices
  if (data.completedPractices.length >= 5) {
    const fivePracticesAchievement = lockedAchievements.find(a => a.id === 502);
    if (fivePracticesAchievement) {
      return unlockAchievement(fivePracticesAchievement.id);
    }
  }
  
  // Practices from 3 categories
  if (data.categories.length >= 3) {
    const categoriesAchievement = lockedAchievements.find(a => a.id === 503);
    if (categoriesAchievement) {
      return unlockAchievement(categoriesAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check assessment achievements
function checkAssessmentAchievements(
  lockedAchievements: Achievement[], 
  data: { assessmentCount: number, hasGoal: boolean }
): Achievement | null {
  // First assessment
  if (data.assessmentCount >= 1) {
    const firstAssessmentAchievement = lockedAchievements.find(a => a.id === 401);
    if (firstAssessmentAchievement) {
      return unlockAchievement(firstAssessmentAchievement.id);
    }
  }
  
  // Goal setting
  if (data.hasGoal) {
    const goalAchievement = lockedAchievements.find(a => a.id === 402);
    if (goalAchievement) {
      return unlockAchievement(goalAchievement.id);
    }
  }
  
  // Multiple assessments
  if (data.assessmentCount >= 3) {
    const multipleAssessmentsAchievement = lockedAchievements.find(a => a.id === 403);
    if (multipleAssessmentsAchievement) {
      return unlockAchievement(multipleAssessmentsAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check trigger achievements
function checkTriggerAchievements(
  lockedAchievements: Achievement[], 
  data: { triggerCount: number, strategiesCount: number }
): Achievement | null {
  // First trigger
  if (data.triggerCount >= 1) {
    const firstTriggerAchievement = lockedAchievements.find(a => a.id === 701);
    if (firstTriggerAchievement) {
      return unlockAchievement(firstTriggerAchievement.id);
    }
  }
  
  // Strategies
  if (data.strategiesCount >= 3) {
    const strategiesAchievement = lockedAchievements.find(a => a.id === 702);
    if (strategiesAchievement) {
      return unlockAchievement(strategiesAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check prayer achievements
function checkPrayerAchievements(
  lockedAchievements: Achievement[], 
  data: { notificationsEnabled: boolean, locationConfigured: boolean }
): Achievement | null {
  // Notifications
  if (data.notificationsEnabled) {
    const notificationsAchievement = lockedAchievements.find(a => a.id === 601);
    if (notificationsAchievement) {
      return unlockAchievement(notificationsAchievement.id);
    }
  }
  
  // Location
  if (data.locationConfigured) {
    const locationAchievement = lockedAchievements.find(a => a.id === 602);
    if (locationAchievement) {
      return unlockAchievement(locationAchievement.id);
    }
  }
  
  return null;
}

// Helper function to check special achievements
function checkSpecialAchievements(
  lockedAchievements: Achievement[], 
  data: { usedFeatures: string[] }
): Achievement | null {
  // All features used
  const requiredFeatures = [
    'self-assessment', 'daily-check-in', 'content', 'prayer', 
    'triggers', 'practices', 'achievements'
  ];
  
  const allFeaturesUsed = requiredFeatures.every(feature => 
    data.usedFeatures.includes(feature)
  );
  
  if (allFeaturesUsed) {
    const allFeaturesAchievement = lockedAchievements.find(a => a.id === 802);
    if (allFeaturesAchievement) {
      return unlockAchievement(allFeaturesAchievement.id);
    }
  }
  
  return null;
}

// Function to get achievements by category
export function getAchievementsByCategory(category: AchievementType): Achievement[] {
  return achievementsMasterData.filter(a => a.category === category);
}

// Function to get achievement progress
export function getAchievementProgress(): {
  total: number;
  unlocked: number;
  percentage: number;
} {
  const total = achievementsMasterData.length;
  const unlocked = getUnlockedAchievements().length;
  const percentage = Math.round((unlocked / total) * 100);
  
  return {
    total,
    unlocked,
    percentage
  };
}