// Core types migrated from web app
export type SinCategory = 
  | 'tongue'
  | 'eyes'
  | 'ears'
  | 'pride'
  | 'stomach'
  | 'zina'
  | 'heart';

export type ScoreScale = 1 | 2 | 3 | 4 | 5;

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: SinCategory;
  section: string;
  conditionalOn?: string;
  conditionalValue?: number;
}

export interface AssessmentResponse {
  questionId: string;
  answer: string;
  skipped?: boolean;
}

export interface SelfAssessmentResult {
  categoryScores: Record<SinCategory, number>;
  totalQuestions: Record<SinCategory, number>;
  answeredQuestions: Record<SinCategory, number>;
  primaryStruggle: SinCategory;
  secondaryStruggle: SinCategory;
  completedAt: Date;
}

export interface UserProgress {
  completedLessons: number[];
  completedSections: number[];
  streak: number;
  lastActivity?: Date;
  activityDates: Date[];
  todayCompletedLessons: number[];
  reflections: Record<number, Record<string, string>>;
  achievements: Achievement[];
  activeChallenges: number[];
  completedPractices: number[];
  triggers: Trigger[];
  selfAssessment?: SelfAssessment;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Trigger {
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

export interface UserPreferences {
  language: 'en' | 'ar' | 'fr';
  theme: 'light' | 'dark';
  notifications: boolean;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Assessment: {skip?: boolean};
  AssessmentChoice: undefined;
  Content: undefined;
  Profile: undefined;
  Settings: undefined;
  SOS: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Assessment: undefined;
  Content: undefined;
  Profile: undefined;
  SOS: undefined;
};