import { Challenge, ActiveChallenge, ChallengeSelectorInput, ChallengeSelectorOutput } from '@/types/goals';

// Import authentic challenge data
import heartChallenges from '@/data/challenges/heart.json';
import earsChallenges from '@/data/challenges/ears.json';
import eyesChallenges from '@/data/challenges/eyes.json';
import prideChallenges from '@/data/challenges/pride.json';
import stomachChallenges from '@/data/challenges/stomach.json';
import tongueChallenges from '@/data/challenges/tongue.json';
import zinaChallenges from '@/data/challenges/zina.json';

class ChallengeSelector {
  private storageKey = 'challenges_log';

  // Combine all challenge data
  private getAllChallenges(): Challenge[] {
    return [
      ...heartChallenges.map(c => ({ ...c, challenge_id: c.id })),
      ...earsChallenges.map(c => ({ ...c, challenge_id: c.id })),
      ...eyesChallenges.map(c => ({ ...c, challenge_id: c.id })),
      ...prideChallenges.map(c => ({ ...c, challenge_id: c.id, category: 'nose' })), // Map to nose category
      ...stomachChallenges.map(c => ({ ...c, challenge_id: c.id })),
      ...tongueChallenges.map(c => ({ ...c, challenge_id: c.id })),
      ...zinaChallenges.map(c => ({ ...c, challenge_id: c.id }))
    ];
  }

  // Get localized challenge content
  getChallengeContent(challenge: Challenge, language: 'en' | 'ar' | 'fr' = 'en'): { title: string; description: string } {
    if (challenge.translations && challenge.translations[language]) {
      return {
        title: challenge.translations[language].title,
        description: challenge.translations[language].description
      };
    }
    // Fallback to English or original values
    return {
      title: challenge.translations?.en?.title || challenge.title,
      description: challenge.translations?.en?.description || challenge.description
    };
  }

  // Load challenges from JSON and filter by category
  getAvailableChallenges(input: ChallengeSelectorInput): Challenge[] {
    const { category_filter } = input;
    const allChallenges = this.getAllChallenges();
    
    if (category_filter === 'all') {
      return allChallenges;
    }
    
    return allChallenges.filter(challenge => 
      challenge.category === category_filter
    );
  }

  // Get active challenges from localStorage
  getActiveChallenges(): ActiveChallenge[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Save active challenges to localStorage
  private saveActiveChallenges(challenges: ActiveChallenge[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(challenges));
  }

  // Activate a new challenge
  activateChallenge(challengeId: string): ChallengeSelectorOutput {
    const activeChallenges = this.getActiveChallenges();
    
    // Check if challenge is already active
    const existingChallenge = activeChallenges.find(c => c.challenge_id === challengeId);
    if (existingChallenge && existingChallenge.status === 'in_progress') {
      return { active_challenges: activeChallenges };
    }

    const challengeDetails = this.getChallengeDetails(challengeId);
    if (!challengeDetails) {
      return { active_challenges: activeChallenges };
    }

    const newChallenge: ActiveChallenge = {
      challenge_id: challengeId,
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0],
      duration_days: challengeDetails.duration_days,
      current_day: 0
    };

    const updatedChallenges = [...activeChallenges.filter(c => c.challenge_id !== challengeId), newChallenge];
    this.saveActiveChallenges(updatedChallenges);
    
    return { active_challenges: updatedChallenges };
  }

  // Complete a challenge
  completeChallenge(challengeId: string, reflectionNote?: string): ChallengeSelectorOutput {
    const activeChallenges = this.getActiveChallenges();
    const challengeIndex = activeChallenges.findIndex(c => c.challenge_id === challengeId);
    
    if (challengeIndex === -1) {
      return { active_challenges: activeChallenges };
    }

    activeChallenges[challengeIndex].status = 'completed';
    if (reflectionNote) {
      activeChallenges[challengeIndex].reflection_notes = reflectionNote;
    }

    this.saveActiveChallenges(activeChallenges);
    return { active_challenges: activeChallenges };
  }

  // Update daily progress
  updateDailyProgress(challengeId: string, note?: string): ChallengeSelectorOutput {
    const activeChallenges = this.getActiveChallenges();
    const challengeIndex = activeChallenges.findIndex(c => c.challenge_id === challengeId);
    
    if (challengeIndex === -1) {
      return { active_challenges: activeChallenges };
    }

    const challenge = activeChallenges[challengeIndex];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Initialize completion dates array if it doesn't exist
    if (!challenge.completion_dates) {
      challenge.completion_dates = [];
    }
    
    // Check if user already completed today
    if (challenge.completion_dates.includes(today)) {
      // Already completed today, return without changes
      return { active_challenges: activeChallenges };
    }
    
    // Add today's completion
    challenge.completion_dates.push(today);
    
    // Increment current day (manual progression)
    challenge.current_day = (challenge.current_day || 0) + 1;
    
    // Auto-complete if duration reached
    if (challenge.current_day >= challenge.duration_days && challenge.status === 'in_progress') {
      challenge.status = 'completed';
    }

    if (note) {
      if (!challenge.daily_notes) challenge.daily_notes = [];
      challenge.daily_notes.push(`Day ${challenge.current_day} (${today}): ${note}`);
    }

    this.saveActiveChallenges(activeChallenges);
    return { active_challenges: activeChallenges };
  }

  // Check if user has completed today for a specific challenge
  hasCompletedToday(challengeId: string): boolean {
    const activeChallenges = this.getActiveChallenges();
    const challenge = activeChallenges.find(c => c.challenge_id === challengeId);
    
    if (!challenge) {
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed (success)
    if (challenge.completion_dates && challenge.completion_dates.includes(today)) {
      return true;
    }
    
    // Check if already failed today (prevents multiple attempts)
    if (challenge.failed_dates && challenge.failed_dates.includes(today)) {
      return true;
    }
    
    return false;
  }

  // Record a failed attempt for today
  recordFailedAttempt(challengeId: string, note?: string): ChallengeSelectorOutput {
    const activeChallenges = this.getActiveChallenges();
    const challengeIndex = activeChallenges.findIndex(c => c.challenge_id === challengeId);
    
    if (challengeIndex === -1) {
      return { active_challenges: activeChallenges };
    }

    const challenge = activeChallenges[challengeIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize failed dates array if it doesn't exist
    if (!challenge.failed_dates) {
      challenge.failed_dates = [];
    }
    
    // Check if user already recorded something today
    if (challenge.completion_dates?.includes(today) || challenge.failed_dates.includes(today)) {
      return { active_challenges: activeChallenges };
    }
    
    // Add today's failure
    challenge.failed_dates.push(today);
    
    if (note) {
      if (!challenge.daily_notes) challenge.daily_notes = [];
      challenge.daily_notes.push(`Failed today (${today}): ${note}`);
    }

    this.saveActiveChallenges(activeChallenges);
    return { active_challenges: activeChallenges };
  }

  // Get challenge details by ID
  getChallengeDetails(challengeId: string): Challenge | undefined {
    const allChallenges = this.getAllChallenges();
    return allChallenges.find(challenge => challenge.challenge_id === challengeId);
  }

  // Get progress percentage for a challenge
  getChallengeProgress(challengeId: string): number {
    const activeChallenges = this.getActiveChallenges();
    const challenge = activeChallenges.find(c => c.challenge_id === challengeId);
    
    if (!challenge || !challenge.current_day) return 0;
    return Math.min((challenge.current_day / challenge.duration_days) * 100, 100);
  }

  // Mark day as successful
  markDaySuccess(challengeId: string, note?: string): ChallengeSelectorOutput {
    return this.updateDailyProgress(challengeId, note);
  }

  // Mark day as failed and restart challenge
  markDayFailure(challengeId: string, note?: string): ChallengeSelectorOutput {
    const activeChallenges = this.getActiveChallenges();
    const challengeIndex = activeChallenges.findIndex(c => c.challenge_id === challengeId);
    
    if (challengeIndex === -1) {
      return { active_challenges: activeChallenges };
    }

    const challenge = activeChallenges[challengeIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize failed dates array if it doesn't exist
    if (!challenge.failed_dates) {
      challenge.failed_dates = [];
    }
    
    // Add today's failure
    challenge.failed_dates.push(today);
    
    // Add failure note
    if (note) {
      if (!challenge.daily_notes) challenge.daily_notes = [];
      challenge.daily_notes.push(`Failed (${today}): ${note}`);
    } else {
      if (!challenge.daily_notes) challenge.daily_notes = [];
      challenge.daily_notes.push(`Failed (${today}): Challenge restarted due to failure`);
    }
    
    // Restart the challenge - reset progress but keep original duration
    challenge.start_date = today;
    challenge.current_day = 0;
    challenge.completion_dates = [];
    challenge.status = 'in_progress';
    
    this.saveActiveChallenges(activeChallenges);
    return { active_challenges: activeChallenges };
  }

  // Get all categories for filter dropdown
  getAllCategories(): string[] {
    const allChallenges = this.getAllChallenges();
    const categories = new Set(allChallenges.map(c => c.category));
    return ['all', ...Array.from(categories)];
  }
}

export const challengeSelector = new ChallengeSelector();