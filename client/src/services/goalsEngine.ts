import { Goal, ActiveGoal, GoalsEngineInput, GoalsEngineOutput } from '@/types/goals';
// @ts-ignore
import unifiedGoalsData from '@/data/unifiedGoals.json';

class GoalsEngine {
  private storageKey = 'goals_log';

  // Load goals from JSON and filter by sin categories
  getAvailableGoals(input: GoalsEngineInput): Goal[] {
    const { focus_sin_primary, focus_sin_secondary } = input;
    const categories = [focus_sin_primary, focus_sin_secondary].filter(Boolean);
    
    return unifiedGoalsData.goals.filter(goal => 
      categories.includes(goal.category)
    );
  }

  // Get all goals for a specific category
  getGoalsByCategory(category: string): Goal[] {
    return unifiedGoalsData.goals.filter(goal => goal.category === category);
  }

  // Get localized goal details
  getLocalizedGoal(goalId: string, language: 'en' | 'ar' | 'fr' = 'en'): Goal | null {
    const goal = unifiedGoalsData.goals.find(g => g.goal_id === goalId);
    if (!goal) return null;
    
    // Return the goal with the current structure - components will handle translation
    return goal;
  }

  // Get active goals from localStorage
  getActiveGoals(): ActiveGoal[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Save active goals to localStorage
  private saveActiveGoals(goals: ActiveGoal[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(goals));
  }

  // Activate a new goal
  activateGoal(goalId: string, durationDays: number): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    
    // Check if goal is already active
    const existingGoal = activeGoals.find(g => g.goal_id === goalId);
    if (existingGoal && existingGoal.status === 'active') {
      return { active_goals: activeGoals };
    }

    const newGoal: ActiveGoal = {
      goal_id: goalId,
      duration_days: durationDays,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      current_day: 0,
      notes: []
    };

    const updatedGoals = [...activeGoals.filter(g => g.goal_id !== goalId), newGoal];
    this.saveActiveGoals(updatedGoals);
    
    return { active_goals: updatedGoals };
  }

  // Update goal status
  updateGoalStatus(goalId: string, status: ActiveGoal['status'], note?: string): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    const goalIndex = activeGoals.findIndex(g => g.goal_id === goalId);
    
    if (goalIndex === -1) {
      return { active_goals: activeGoals };
    }

    activeGoals[goalIndex].status = status;
    
    if (note) {
      if (!activeGoals[goalIndex].notes) {
        activeGoals[goalIndex].notes = [];
      }
      activeGoals[goalIndex].notes!.push(`${new Date().toISOString().split('T')[0]}: ${note}`);
    }

    this.saveActiveGoals(activeGoals);
    return { active_goals: activeGoals };
  }

  // Update daily progress
  updateDailyProgress(goalId: string, note?: string): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    const goalIndex = activeGoals.findIndex(g => g.goal_id === goalId);
    
    if (goalIndex === -1) {
      return { active_goals: activeGoals };
    }

    const goal = activeGoals[goalIndex];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Initialize completion dates array if it doesn't exist
    if (!goal.completion_dates) {
      goal.completion_dates = [];
    }
    
    // Check if user already completed today
    if (goal.completion_dates.includes(today)) {
      // Already completed today, return without changes
      return { active_goals: activeGoals };
    }
    
    // Add today's completion
    goal.completion_dates.push(today);
    
    // Increment current day (manual progression)
    goal.current_day = (goal.current_day || 0) + 1;
    
    // Auto-complete if duration reached
    if (goal.current_day >= goal.duration_days && goal.status === 'active') {
      goal.status = 'completed';
    }

    if (note) {
      if (!goal.notes) goal.notes = [];
      goal.notes.push(`Day ${goal.current_day} (${today}): ${note}`);
    }

    this.saveActiveGoals(activeGoals);
    return { active_goals: activeGoals };
  }

  // Check if user has completed today for a specific goal
  hasCompletedToday(goalId: string): boolean {
    const activeGoals = this.getActiveGoals();
    const goal = activeGoals.find(g => g.goal_id === goalId);
    
    if (!goal) {
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed (success)
    if (goal.completion_dates && goal.completion_dates.includes(today)) {
      return true;
    }
    
    // Check if already failed today (prevents multiple attempts)
    if (goal.failed_dates && goal.failed_dates.includes(today)) {
      return true;
    }
    
    return false;
  }

  // Record a failed attempt for today
  recordFailedAttempt(goalId: string, note?: string): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    const goalIndex = activeGoals.findIndex(g => g.goal_id === goalId);
    
    if (goalIndex === -1) {
      return { active_goals: activeGoals };
    }

    const goal = activeGoals[goalIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize failed dates array if it doesn't exist
    if (!goal.failed_dates) {
      goal.failed_dates = [];
    }
    
    // Check if user already failed today
    if (goal.failed_dates.includes(today)) {
      // Already failed today, return without changes
      return { active_goals: activeGoals };
    }
    
    // Add today's failure
    goal.failed_dates.push(today);
    
    if (note) {
      if (!goal.notes) goal.notes = [];
      goal.notes.push(`Failed (${today}): ${note}`);
    }

    this.saveActiveGoals(activeGoals);
    return { active_goals: activeGoals };
  }

  // Get goal details by ID
  getGoalDetails(goalId: string): Goal | undefined {
    return unifiedGoalsData.goals.find(goal => goal.goal_id === goalId);
  }

  // Get goal progress percentage
  getGoalProgress(goalId: string): number {
    const activeGoals = this.getActiveGoals();
    const goal = activeGoals.find(g => g.goal_id === goalId);
    
    if (!goal) return 0;
    
    const completedDays = goal.completion_dates?.length || 0;
    return Math.round((completedDays / goal.duration_days) * 100);
  }

  // Record success for a goal
  recordSuccess(goalId: string, note?: string): GoalsEngineOutput {
    return this.updateDailyProgress(goalId, note);
  }

  // Record failure for a goal
  recordFailure(goalId: string, note?: string): GoalsEngineOutput {
    return this.recordFailedAttempt(goalId, note);
  }

  // Mark day as successful
  markDaySuccess(goalId: string, note?: string): GoalsEngineOutput {
    const result = this.updateDailyProgress(goalId, note);
    
    // Check if goal is now completed and record achievement
    const activeGoals = this.getActiveGoals();
    const goal = activeGoals.find(g => g.goal_id === goalId);
    
    if (goal && goal.status === 'completed') {
      this.recordGoalCompletion(goalId, goal.duration_days);
    }
    
    return result;
  }

  // Mark day as failed and restart goal
  markDayFailure(goalId: string, note?: string): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    const goalIndex = activeGoals.findIndex(g => g.goal_id === goalId);
    
    if (goalIndex === -1) {
      return { active_goals: activeGoals };
    }

    const goal = activeGoals[goalIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize failed dates array if it doesn't exist
    if (!goal.failed_dates) {
      goal.failed_dates = [];
    }
    
    // Add today's failure
    goal.failed_dates.push(today);
    
    // Add failure note
    if (note) {
      if (!goal.notes) goal.notes = [];
      goal.notes.push(`Failed (${today}): ${note}`);
    } else {
      if (!goal.notes) goal.notes = [];
      goal.notes.push(`Failed (${today}): Goal restarted due to failure`);
    }
    
    // Restart the goal - reset progress but keep original duration
    goal.start_date = today;
    goal.current_day = 0;
    goal.completion_dates = [];
    goal.status = 'active';
    
    this.saveActiveGoals(activeGoals);
    return { active_goals: activeGoals };
  }

  // Record goal completion in achievements
  private recordGoalCompletion(goalId: string, durationDays: number): void {
    const goalDetails = this.getGoalDetails(goalId);
    if (!goalDetails) return;
    
    // Get current achievements
    const achievements = localStorage.getItem('goal_achievements') || '[]';
    const completedGoals = JSON.parse(achievements);
    
    // Create achievement entry
    const achievement = {
      goalId,
      category: goalDetails.category,
      title: goalDetails.translations.en.title,
      durationDays,
      completedAt: new Date().toISOString(),
      badge: this.getBadgeForGoalCompletion(goalDetails.category, durationDays)
    };
    
    // Add to achievements if not already recorded
    const existingIndex = completedGoals.findIndex((g: any) => g.goalId === goalId && g.durationDays === durationDays);
    if (existingIndex === -1) {
      completedGoals.push(achievement);
      localStorage.setItem('goal_achievements', JSON.stringify(completedGoals));
    }
  }

  // Get badge tier based on goal completion
  private getBadgeForGoalCompletion(category: string, durationDays: number): string {
    if (durationDays >= 40) return 'gold';
    if (durationDays >= 21) return 'silver';
    if (durationDays >= 7) return 'bronze';
    return 'bronze';
  }

  // Get completed goal achievements
  getGoalAchievements(): any[] {
    const achievements = localStorage.getItem('goal_achievements') || '[]';
    return JSON.parse(achievements);
  }

  // Add journal entry without affecting progress
  addJournalEntry(goalId: string, note: string): GoalsEngineOutput {
    const activeGoals = this.getActiveGoals();
    const goalIndex = activeGoals.findIndex(g => g.goal_id === goalId);
    
    if (goalIndex === -1) {
      return { active_goals: activeGoals };
    }

    const goal = activeGoals[goalIndex];
    const today = new Date().toISOString().split('T')[0];
    
    if (!goal.notes) goal.notes = [];
    goal.notes.push(`Journal (${today}): ${note}`);

    this.saveActiveGoals(activeGoals);
    return { active_goals: activeGoals };
  }


}

export const goalsEngine = new GoalsEngine();