import { Goal, GoalTemplate, GoalStatus, goalTemplates, getTemplateById } from '@/data/goalTemplates';
import { SinCategory } from '@/data/selfAssessmentData';

export interface GoalProgress {
  goalId: string;
  progressIncrement: number;
  timestamp: Date;
  source: 'behavioral' | 'content' | 'reflection';
  metadata?: Record<string, any>;
}

export interface GoalCreationData {
  templateId: string;
  category: SinCategory;
  customTarget?: number;
  customDuration?: number;
}

export class GoalService {
  private static STORAGE_KEY = 'spiritual_goals';
  private static PROGRESS_LOG_KEY = 'goal_progress_log';

  // Goal Management
  static createGoal(data: GoalCreationData): Goal {
    const template = getTemplateById(data.templateId);
    if (!template) {
      throw new Error(`Template not found: ${data.templateId}`);
    }

    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Use custom values or template defaults
    const targetValue = data.customTarget ?? template.defaultTarget;
    const durationDays = data.customDuration ?? template.defaultDuration;

    const goal: Goal = {
      id: goalId,
      templateId: data.templateId,
      category: data.category,
      type: template.type,
      title: this.generateGoalTitle(template, data.category, targetValue, durationDays),
      description: template.description,
      targetValue,
      durationDays,
      startDate: null, // Will be set when goal is started
      currentProgress: 0,
      status: 'not_started',
      tier: template.tier,
      createdAt: now,
      lastUpdated: now
    };

    this.saveGoal(goal);
    return goal;
  }

  static startGoal(goalId: string): Goal {
    const goal = this.getGoal(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    if (goal.status !== 'not_started') {
      throw new Error(`Goal cannot be started. Current status: ${goal.status}`);
    }

    const updatedGoal = {
      ...goal,
      status: 'in_progress' as GoalStatus,
      startDate: new Date(),
      lastUpdated: new Date()
    };

    this.saveGoal(updatedGoal);
    return updatedGoal;
  }

  static updateGoalProgress(goalId: string, progress: GoalProgress): Goal {
    const goal = this.getGoal(goalId);
    if (!goal || goal.status !== 'in_progress') {
      throw new Error(`Cannot update progress for goal: ${goalId}`);
    }

    // Handle behavioral streak reset on infraction
    if (progress.source === 'behavioral' && progress.progressIncrement < 0) {
      goal.currentProgress = 0; // Reset streak
    } else {
      goal.currentProgress = Math.max(0, goal.currentProgress + progress.progressIncrement);
    }

    goal.lastUpdated = new Date();

    // Check if goal is completed
    if (goal.currentProgress >= goal.targetValue) {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    // Check if goal has expired
    if (this.isGoalExpired(goal)) {
      goal.status = 'missed';
    }

    this.saveGoal(goal);
    this.logProgress(progress);

    return goal;
  }

  static deleteGoal(goalId: string): boolean {
    const goals = this.getAllGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    if (goals.length === filteredGoals.length) {
      return false; // Goal not found
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGoals));
    return true;
  }

  // Goal Retrieval
  static getGoal(goalId: string): Goal | null {
    const goals = this.getAllGoals();
    return goals.find(g => g.id === goalId) || null;
  }

  static getAllGoals(): Goal[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      const goals = JSON.parse(stored) as Goal[];
      return goals.map(this.deserializeGoal);
    } catch {
      return [];
    }
  }

  static getGoalsByCategory(category: SinCategory): Goal[] {
    return this.getAllGoals().filter(goal => goal.category === category);
  }

  static getActiveGoals(): Goal[] {
    return this.getAllGoals().filter(goal => 
      goal.status === 'in_progress' || goal.status === 'not_started'
    );
  }

  static getGoalsByStatus(status: GoalStatus): Goal[] {
    return this.getAllGoals().filter(goal => goal.status === status);
  }

  // Progress Tracking Integration
  static recordBehavioralSuccess(category: SinCategory): Goal[] {
    const behavioralGoals = this.getActiveGoals().filter(goal => 
      goal.type === 'behavioral_streak' && goal.category === category
    );

    const updatedGoals: Goal[] = [];
    
    behavioralGoals.forEach(goal => {
      const progress: GoalProgress = {
        goalId: goal.id,
        progressIncrement: 1,
        timestamp: new Date(),
        source: 'behavioral',
        metadata: { type: 'success', category }
      };

      const updatedGoal = this.updateGoalProgress(goal.id, progress);
      updatedGoals.push(updatedGoal);
    });

    return updatedGoals;
  }

  static recordBehavioralInfraction(category: SinCategory): Goal[] {
    const behavioralGoals = this.getActiveGoals().filter(goal => 
      goal.type === 'behavioral_streak' && goal.category === category
    );

    const updatedGoals: Goal[] = [];
    
    behavioralGoals.forEach(goal => {
      const progress: GoalProgress = {
        goalId: goal.id,
        progressIncrement: -goal.currentProgress, // Reset to 0
        timestamp: new Date(),
        source: 'behavioral',
        metadata: { type: 'infraction', category }
      };

      const updatedGoal = this.updateGoalProgress(goal.id, progress);
      updatedGoals.push(updatedGoal);
    });

    return updatedGoals;
  }

  static recordContentReflection(category: SinCategory, lessonId: string): Goal[] {
    const contentGoals = this.getActiveGoals().filter(goal => 
      goal.type === 'content_reflection' && goal.category === category
    );

    const updatedGoals: Goal[] = [];
    
    contentGoals.forEach(goal => {
      const progress: GoalProgress = {
        goalId: goal.id,
        progressIncrement: 1,
        timestamp: new Date(),
        source: 'content',
        metadata: { lessonId, category }
      };

      const updatedGoal = this.updateGoalProgress(goal.id, progress);
      updatedGoals.push(updatedGoal);
    });

    return updatedGoals;
  }

  static recordJournalEntry(category: SinCategory, entryId: string): Goal[] {
    const reflectionGoals = this.getActiveGoals().filter(goal => 
      goal.type === 'reflection' && goal.category === category
    );

    const updatedGoals: Goal[] = [];
    
    reflectionGoals.forEach(goal => {
      const progress: GoalProgress = {
        goalId: goal.id,
        progressIncrement: 1,
        timestamp: new Date(),
        source: 'reflection',
        metadata: { entryId, category }
      };

      const updatedGoal = this.updateGoalProgress(goal.id, progress);
      updatedGoals.push(updatedGoal);
    });

    return updatedGoals;
  }

  // Utility Functions
  static getGoalProgress(goal: Goal): number {
    if (goal.targetValue === 0) return 0;
    return Math.min(100, (goal.currentProgress / goal.targetValue) * 100);
  }

  static getTimeRemaining(goal: Goal): string | null {
    if (!goal.startDate || !goal.durationDays) return null;

    const endDate = new Date(goal.startDate);
    endDate.setDate(endDate.getDate() + goal.durationDays);
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Last day';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  }

  static isGoalExpired(goal: Goal): boolean {
    if (!goal.startDate || !goal.durationDays || goal.status === 'completed') return false;

    const endDate = new Date(goal.startDate);
    endDate.setDate(endDate.getDate() + goal.durationDays);
    
    return new Date() > endDate;
  }

  static getCompletedGoalsCount(category?: SinCategory): number {
    const goals = category ? 
      this.getGoalsByCategory(category) : 
      this.getAllGoals();
    
    return goals.filter(goal => goal.status === 'completed').length;
  }

  // Helper Methods
  static generateGoalTitle(template: GoalTemplate, category: SinCategory, target: number, duration: number | null): string {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    
    switch (template.type) {
      case 'behavioral_streak':
        return `${target}-Day Clean Streak - ${categoryName}`;
      case 'content_reflection':
        return `${target} Reflections - ${categoryName}`;
      case 'reflection':
        if (duration) {
          return `${target} Journal Entries in ${duration} Days - ${categoryName}`;
        }
        return `Daily Journaling - ${categoryName}`;
      case 'spiritual_milestone':
        return `${target}-Day Spiritual Milestone - ${categoryName}`;
      default:
        return `${template.name} - ${categoryName}`;
    }
  }

  private static saveGoal(goal: Goal): void {
    const goals = this.getAllGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
  }

  private static deserializeGoal(goal: any): Goal {
    return {
      ...goal,
      createdAt: new Date(goal.createdAt),
      startDate: goal.startDate ? new Date(goal.startDate) : null,
      completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
      lastUpdated: new Date(goal.lastUpdated)
    };
  }

  private static logProgress(progress: GoalProgress): void {
    const logs = this.getProgressLogs();
    logs.push(progress);
    
    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem(this.PROGRESS_LOG_KEY, JSON.stringify(logs));
  }

  private static getProgressLogs(): GoalProgress[] {
    const stored = localStorage.getItem(this.PROGRESS_LOG_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // Data Management
  static exportGoalData(): string {
    return JSON.stringify({
      goals: this.getAllGoals(),
      progressLogs: this.getProgressLogs(),
      exportDate: new Date().toISOString()
    });
  }

  static clearAllGoals(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_LOG_KEY);
  }
}