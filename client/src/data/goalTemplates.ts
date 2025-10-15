import { SinCategory } from './selfAssessmentData';

export type GoalType = 'content_reflection' | 'behavioral_streak' | 'reflection' | 'spiritual_milestone';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'missed';

export type GoalTier = 1 | 2 | 3 | 4;

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  category?: SinCategory; // null for spiritual milestones that apply to any category
  defaultTarget: number;
  defaultDuration: number | null; // null for ongoing goals
  tier: GoalTier;
  icon: string;
  motivationalText: string;
  adjustableFields: {
    target?: { min: number; max: number; step: number };
    duration?: { options: number[] }; // predefined duration options
  };
}

export interface Goal {
  id: string;
  templateId: string;
  category: SinCategory;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  durationDays: number | null;
  startDate: Date | null;
  currentProgress: number;
  status: GoalStatus;
  tier: GoalTier;
  createdAt: Date;
  completedAt?: Date;
  lastUpdated: Date;
}

// Goal Templates based on the specification
export const goalTemplates: GoalTemplate[] = [
  // Reflection Goals
  {
    id: 'reflection_weekly',
    name: 'Weekly Reflection Challenge',
    description: 'Write thoughtful journal entries about your spiritual growth',
    type: 'reflection',
    defaultTarget: 3,
    defaultDuration: 7,
    tier: 2,
    icon: 'BookOpen',
    motivationalText: 'Self-reflection is the path to wisdom and growth.',
    adjustableFields: {
      target: { min: 1, max: 7, step: 1 },
      duration: { options: [7, 14, 30] }
    }
  },
  {
    id: 'reflection_daily',
    name: 'Daily Reflection Habit',
    description: 'Build a consistent daily reflection practice',
    type: 'reflection',
    defaultTarget: 1,
    defaultDuration: null, // ongoing
    tier: 1,
    icon: 'BookOpen',
    motivationalText: 'Daily reflection brings daily wisdom.',
    adjustableFields: {
      target: { min: 1, max: 2, step: 1 }
    }
  },

  // Behavioral Streak Goals
  {
    id: 'streak_short',
    name: 'Clean Streak - Foundation',
    description: 'Maintain consecutive days of avoiding this sin',
    type: 'behavioral_streak',
    defaultTarget: 3,
    defaultDuration: 3,
    tier: 1,
    icon: 'Flame',
    motivationalText: 'Every journey begins with a single step.',
    adjustableFields: {
      target: { min: 3, max: 7, step: 1 }
    }
  },
  {
    id: 'streak_weekly',
    name: 'Clean Streak - Weekly',
    description: 'Build strength with a 7-day clean streak',
    type: 'behavioral_streak',
    defaultTarget: 7,
    defaultDuration: 7,
    tier: 2,
    icon: 'Flame',
    motivationalText: 'Consistency is the key to transformation.',
    adjustableFields: {
      target: { min: 7, max: 14, step: 1 }
    }
  },
  {
    id: 'streak_biweekly',
    name: 'Clean Streak - Biweekly',
    description: 'Challenge yourself with a 14-day streak',
    type: 'behavioral_streak',
    defaultTarget: 14,
    defaultDuration: 14,
    tier: 3,
    icon: 'Flame',
    motivationalText: 'Discipline today creates freedom tomorrow.',
    adjustableFields: {
      target: { min: 14, max: 21, step: 1 }
    }
  },
  {
    id: 'streak_mastery',
    name: '40-Day Mastery Challenge',
    description: 'Achieve spiritual mastery with 40 consecutive clean days',
    type: 'behavioral_streak',
    defaultTarget: 40,
    defaultDuration: 40,
    tier: 4,
    icon: 'Crown',
    motivationalText: 'True mastery comes through persistent effort and divine guidance.',
    adjustableFields: {}
  },

  // Content Reflection Goals
  {
    id: 'content_weekly',
    name: 'Qur'anic Reflection Challenge',
    description: 'Read and reflect on Qur'anic verses or hadith related to your focus area',
    type: 'content_reflection',
    defaultTarget: 3,
    defaultDuration: 7,
    tier: 2,
    icon: 'Book',
    motivationalText: 'The Quran is a light that illuminates the heart.',
    adjustableFields: {
      target: { min: 1, max: 7, step: 1 },
      duration: { options: [7, 14, 30] }
    }
  },
  {
    id: 'content_intensive',
    name: 'Intensive Study Goal',
    description: 'Deep dive into Islamic teachings about your spiritual focus',
    type: 'content_reflection',
    defaultTarget: 5,
    defaultDuration: 14,
    tier: 3,
    icon: 'Book',
    motivationalText: 'Knowledge is the foundation of righteous action.',
    adjustableFields: {
      target: { min: 3, max: 10, step: 1 },
      duration: { options: [14, 21, 30] }
    }
  },

  // Spiritual Milestone Goals
  {
    id: 'milestone_foundation',
    name: 'Spiritual Foundation',
    description: 'Complete your first major spiritual milestone',
    type: 'spiritual_milestone',
    defaultTarget: 7,
    defaultDuration: 7,
    tier: 2,
    icon: 'Star',
    motivationalText: 'Every expert was once a beginner.',
    adjustableFields: {}
  },
  {
    id: 'milestone_commitment',
    name: 'Commitment Challenge',
    description: 'Demonstrate sustained commitment to spiritual growth',
    type: 'spiritual_milestone',
    defaultTarget: 21,
    defaultDuration: 21,
    tier: 3,
    icon: 'Star',
    motivationalText: 'Commitment is the bridge between intention and achievement.',
    adjustableFields: {}
  },
  {
    id: 'milestone_mastery',
    name: 'Spiritual Mastery',
    description: 'Achieve the highest level of spiritual discipline',
    type: 'spiritual_milestone',
    defaultTarget: 40,
    defaultDuration: 40,
    tier: 4,
    icon: 'Crown',
    motivationalText: 'Mastery is not a destination, but a way of traveling.',
    adjustableFields: {}
  }
];

// Helper functions
export const getTemplatesByCategory = (category: SinCategory): GoalTemplate[] => {
  return goalTemplates.filter(template => 
    !template.category || template.category === category
  );
};

export const getTemplatesByType = (type: GoalType): GoalTemplate[] => {
  return goalTemplates.filter(template => template.type === type);
};

export const getTemplateById = (id: string): GoalTemplate | undefined => {
  return goalTemplates.find(template => template.id === id);
};

export const getTierInfo = (tier: GoalTier) => {
  const tierInfo = {
    1: { name: 'Foundation', color: 'green', description: 'Building the basics' },
    2: { name: 'Growth', color: 'blue', description: 'Developing consistency' },
    3: { name: 'Challenge', color: 'purple', description: 'Pushing boundaries' },
    4: { name: 'Mastery', color: 'gold', description: 'Achieving excellence' }
  };
  return tierInfo[tier];
};

// Goal status helpers
export const getStatusColor = (status: GoalStatus): string => {
  switch (status) {
    case 'not_started': return 'gray';
    case 'in_progress': return 'blue';
    case 'completed': return 'green';
    case 'missed': return 'red';
    default: return 'gray';
  }
};

export const getStatusText = (status: GoalStatus): string => {
  switch (status) {
    case 'not_started': return 'Not Started';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'missed': return 'Missed';
    default: return 'Unknown';
  }
};
