export interface GoalTranslation {
  title: string;
  description: string;
  islamic_guidance: string;
  benefits: string[];
  daily_actions: string[];
}

export interface Goal {
  goal_id: string;
  category: string;
  translations: {
    en: GoalTranslation;
    ar: GoalTranslation;
    fr: GoalTranslation;
  };
  duration_options: number[];
}

export interface ChallengeTranslation {
  title: string;
  description: string;
  islamic_guidance?: string;
  objectives?: string[];
  reflection_questions?: string[];
}

export interface Challenge {
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  islamic_guidance?: string;
  objectives?: string[];
  reflection_questions?: string[];
  translations?: {
    en: ChallengeTranslation;
    ar: ChallengeTranslation;
    fr: ChallengeTranslation;
  };
}

export interface ActiveGoal {
  goal_id: string;
  duration_days: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  start_date: string;
  current_day?: number;
  notes?: string[];
  completion_dates?: string[]; // Array of YYYY-MM-DD dates when user completed a day
  failed_dates?: string[]; // Array of YYYY-MM-DD dates when user failed a day
}

export interface ActiveChallenge {
  challenge_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  start_date: string;
  duration_days: number;
  current_day?: number;
  reflection_notes?: string;
  completion_dates?: string[]; // Array of YYYY-MM-DD dates when user completed a day
  daily_notes?: string[]; // Array of daily notes
  failed_dates?: string[]; // Array of YYYY-MM-DD dates when user failed a day
}

export interface GoalsEngineInput {
  focus_sin_primary: string;
  focus_sin_secondary?: string;
}

export interface GoalsEngineOutput {
  active_goals: ActiveGoal[];
}

export interface ChallengeSelectorInput {
  category_filter: string;
}

export interface ChallengeSelectorOutput {
  active_challenges: ActiveChallenge[];
}