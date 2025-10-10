import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  PenTool, 
  TrendingUp, 
  Calendar,
  Target,
  Heart,
  Flame,
  Clock,
  Plus
} from 'lucide-react';
import { SinCategory } from '@/data/selfAssessmentData';
import { CategoryContent, ContentLesson } from '@/data/contentRepository';
import { UserContentProgress, ContentService } from '@/lib/contentService';
import { categoryInfo } from '@/data/selfAssessmentData';
import { successTrackingService } from '@/lib/successTrackingService';
import { goalsEngine } from '@/services/goalsEngine';
import { challengeSelector } from '@/services/challengeSelector';

interface SinCategoryBoxProps {
  category: SinCategory;
  content: CategoryContent;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  nextLesson: ContentLesson | null;
  behavioralProgress: {
    successfulDays: number;
    totalDays: number;
    currentStreak: number;
    goal: number;
    lastUpdated: Date;
  };
  onRecordSuccess: (category: SinCategory) => void;
  onRecordInfraction: (category: SinCategory, note?: string) => void;
  onAddJournalEntry: (category: SinCategory, content: string, mood?: 'struggling' | 'hopeful' | 'strong') => void;
  onStartLesson: (lessonId: string) => void;
}

export function SinCategoryBox({
  category,
  content,
  progress,
  nextLesson,
  behavioralProgress,
  onRecordSuccess,
  onRecordInfraction,
  onAddJournalEntry,
  onStartLesson
}: SinCategoryBoxProps) {
  const { t } = useTranslation();
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<'struggling' | 'hopeful' | 'strong'>('hopeful');
  const [infractionNote, setInfractionNote] = useState('');
  const [canClickSuccess, setCanClickSuccess] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [activeGoals, setActiveGoals] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{type: 'goal' | 'challenge', id: string} | null>(null);
  const [progressJournalEntry, setProgressJournalEntry] = useState('');

  const behavioralPercentage = ContentService.getBehavioralProgressPercentage(
    behavioralProgress.successfulDays,
    behavioralProgress.goal
  );

  const motivationalMessage = ContentService.getMotivationalMessage(
    behavioralProgress.currentStreak,
    behavioralPercentage
  );

  // Check success button availability on component mount and set up timer
  useEffect(() => {
    const updateSuccessButtonState = () => {
      const canClick = successTrackingService.canClickSuccessToday(category);
      const remaining = successTrackingService.getFormattedTimeRemaining(category);
      
      setCanClickSuccess(canClick);
      setTimeRemaining(remaining);
    };

    // Initial check
    updateSuccessButtonState();

    // Update every minute to keep the countdown accurate
    const interval = setInterval(updateSuccessButtonState, 60000);

    return () => clearInterval(interval);
  }, [category]);

  // Fetch active goals and challenges for this category
  useEffect(() => {
    const fetchActiveItems = () => {
      const allGoals = goalsEngine.getActiveGoals();
      const allChallenges = challengeSelector.getActiveChallenges();
      
      const goals = allGoals.filter(g => 
        g.status === 'active' && g.goal_id && g.goal_id.startsWith(category)
      );
      const challenges = allChallenges.filter(c => 
        c.status === 'in_progress' && c.challenge_id && c.challenge_id.includes(`-${category}-`)
      );
      
      setActiveGoals(goals);
      setActiveChallenges(challenges);
    };

    fetchActiveItems();
  }, [category, refreshKey]);

  // Calculate success days since last issue
  const calculateSuccessDays = () => {
    const allGoals = goalsEngine.getActiveGoals().filter(g => g.goal_id && g.goal_id.startsWith(category));
    const allChallenges = challengeSelector.getActiveChallenges().filter(c => c.challenge_id && c.challenge_id.includes(`-${category}-`));
    
    let totalSuccessDays = 0;
    
    // Count success days from goals
    allGoals.forEach(goal => {
      if (goal.completion_dates && goal.completion_dates.length > 0) {
        totalSuccessDays += goal.completion_dates.length;
      }
    });
    
    // Count success days from challenges
    allChallenges.forEach(challenge => {
      if (challenge.completion_dates && challenge.completion_dates.length > 0) {
        totalSuccessDays += challenge.completion_dates.length;
      }
    });
    
    return totalSuccessDays;
  };

  // Calculate current streak for this category
  const calculateCurrentStreak = () => {
    const allGoals = goalsEngine.getActiveGoals().filter(g => g.goal_id && g.goal_id.startsWith(category));
    const allChallenges = challengeSelector.getActiveChallenges().filter(c => c.challenge_id && c.challenge_id.includes(`-${category}-`));
    
    let maxStreak = 0;
    
    // Check streaks from goals
    allGoals.forEach(goal => {
      if (goal.completion_dates && goal.completion_dates.length > 0) {
        // Calculate consecutive days from most recent dates
        const sortedDates = goal.completion_dates.map(date => new Date(date)).sort((a, b) => b.getTime() - a.getTime());
        let currentStreak = 0;
        const today = new Date();
        
        for (let i = 0; i < sortedDates.length; i++) {
          const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
          if (daysDiff === i) {
            currentStreak++;
          } else {
            break;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    });
    
    // Check streaks from challenges
    allChallenges.forEach(challenge => {
      if (challenge.completion_dates && challenge.completion_dates.length > 0) {
        const sortedDates = challenge.completion_dates.map(date => new Date(date)).sort((a, b) => b.getTime() - a.getTime());
        let currentStreak = 0;
        const today = new Date();
        
        for (let i = 0; i < sortedDates.length; i++) {
          const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
          if (daysDiff === i) {
            currentStreak++;
          } else {
            break;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    });
    
    return maxStreak;
  };

  const handleJournalSubmit = () => {
    if (journalContent.trim()) {
      onAddJournalEntry(category, journalContent, journalMood);
      setJournalContent('');
      setJournalOpen(false);
    }
  };

  const handleProgressRecord = (type: 'success' | 'failed') => {
    if (!selectedItem) return;
    
    const note = progressJournalEntry.trim() || undefined;
    
    if (selectedItem.type === 'goal') {
      if (type === 'success') {
        goalsEngine.updateDailyProgress(selectedItem.id, note);
      } else {
        goalsEngine.recordFailedAttempt(selectedItem.id, note);
      }
    } else {
      if (type === 'success') {
        challengeSelector.updateDailyProgress(selectedItem.id, note);
      } else {
        challengeSelector.recordFailedAttempt(selectedItem.id, note);
      }
    }
    
    // Reset dialog state
    setProgressDialogOpen(false);
    setSelectedItem(null);
    setProgressJournalEntry('');
    
    // Refresh the component to update stats
    setRefreshKey(prev => prev + 1);
  };

  const handleInfractionRecord = () => {
    onRecordInfraction(category, infractionNote);
    setInfractionNote('');
  };

  const handleSuccessClick = () => {
    if (canClickSuccess) {
      // Record the click in the tracking service
      successTrackingService.recordSuccessClick(category);
      
      // Call the original success handler
      onRecordSuccess(category);
      
      // Update the button state immediately
      setCanClickSuccess(false);
      setTimeRemaining(successTrackingService.getFormattedTimeRemaining(category));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold">{t(`goals.categories.${category}`)}</span>
          <Badge variant={behavioralProgress.currentStreak > 7 ? "default" : "secondary"}>
            {behavioralProgress.currentStreak} {t('contentDashboard.dayStreak')}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t(`contentDashboard.categoryDescriptions.${category}`)}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Goals and Challenges */}
        {(activeGoals.length > 0 || activeChallenges.length > 0) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">{t('contentDashboard.activeGoalsChallenges')}</h4>
            {activeGoals.map((goal) => {
              const hasCompletedToday = goalsEngine.hasCompletedToday(goal.goal_id);
              const today = new Date().toISOString().split('T')[0];
              const completedToday = goal.completion_dates?.includes(today);
              const failedToday = goal.failed_dates?.includes(today);
              const goalDetails = goalsEngine.getGoalDetails(goal.goal_id);
              
              return (
                <div key={goal.goal_id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-blue-800">{goalDetails?.title || goal.goal_id}</div>
                    <div className="text-xs text-blue-600">
                      {t('contentDashboard.goal')}: {goal.completion_dates?.length || 0}/{goal.duration_days} {t('contentDashboard.daysCompleted')}
                      {completedToday && <span className="ml-2 text-green-600">{t('contentDashboard.successToday')}</span>}
                      {failedToday && <span className="ml-2 text-red-600">{t('contentDashboard.failedToday')}</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={hasCompletedToday}
                    onClick={() => {
                      setSelectedItem({ type: 'goal', id: goal.goal_id });
                      setProgressDialogOpen(true);
                    }}
                    className={`ml-2 ${hasCompletedToday ? 'opacity-50 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-100'}`}
                  >
                    {hasCompletedToday ? t('contentDashboard.done') : t('contentDashboard.record')}
                  </Button>
                </div>
              );
            })}
            {activeChallenges.map((challenge) => {
              const hasCompletedToday = challengeSelector.hasCompletedToday(challenge.challenge_id);
              const today = new Date().toISOString().split('T')[0];
              const completedToday = challenge.completion_dates?.includes(today);
              const failedToday = challenge.failed_dates?.includes(today);
              const challengeDetails = challengeSelector.getChallengeDetails(challenge.challenge_id);
              
              return (
                <div key={challenge.challenge_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-green-800">{challengeDetails?.title || challenge.challenge_id}</div>
                    <div className="text-xs text-green-600">
                      {t('contentDashboard.challenge')}: {challenge.completion_dates?.length || 0}/{challenge.duration_days} {t('contentDashboard.daysCompleted')}
                      {completedToday && <span className="ml-2 text-green-600">{t('contentDashboard.successToday')}</span>}
                      {failedToday && <span className="ml-2 text-red-600">{t('contentDashboard.failedToday')}</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={hasCompletedToday}
                    onClick={() => {
                      setSelectedItem({ type: 'challenge', id: challenge.challenge_id });
                      setProgressDialogOpen(true);
                    }}
                    className={`ml-2 ${hasCompletedToday ? 'opacity-50 cursor-not-allowed' : 'text-green-600 border-green-300 hover:bg-green-100'}`}
                  >
                    {hasCompletedToday ? t('contentDashboard.done') : t('contentDashboard.record')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Motivational Message */}
        <div className="bg-primary/10 p-3 rounded-md text-center">
          <p className="text-sm font-medium">{t('contentDashboard.journeyBegins')}</p>
        </div>







        {/* Journal Button */}
        <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              {t('contentDashboard.journalReflection')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('contentDashboard.journalEntry')} - {content.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t('contentDashboard.reflectJourney')}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder={t('contentDashboard.shareThoughts')}
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                rows={4}
              />
              <Select value={journalMood} onValueChange={(value: 'struggling' | 'hopeful' | 'strong') => setJournalMood(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('contentDashboard.howFeeling')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="struggling">{t('contentDashboard.struggling')}</SelectItem>
                  <SelectItem value="hopeful">{t('contentDashboard.hopeful')}</SelectItem>
                  <SelectItem value="strong">{t('contentDashboard.strong')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleJournalSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white" style={{ backgroundColor: '#dc2626' }}>
                {t('contentDashboard.saveEntry')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Progress Recording Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('contentDashboard.recordProgress')}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t('contentDashboard.trackProgress')}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="progress-journal-entry">{t('contentDashboard.journalEntryOptional')}</Label>
                <Textarea
                  id="progress-journal-entry"
                  placeholder={t('contentDashboard.describeExperience')}
                  value={progressJournalEntry}
                  onChange={(e) => setProgressJournalEntry(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleProgressRecord('success')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {t('contentDashboard.success')}
                </Button>
                <Button
                  onClick={() => handleProgressRecord('failed')}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  {t('contentDashboard.failed')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-lg font-bold text-primary">{calculateCurrentStreak()}</div>
            <div className="text-xs text-muted-foreground">{t('contentDashboard.currentStreak')}</div>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-lg font-bold text-green-600">{calculateSuccessDays()}</div>
            <div className="text-xs text-muted-foreground">{t('contentDashboard.successDays')}</div>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <div className="text-lg font-bold text-blue-600">{progress.completed}</div>
            <div className="text-xs text-muted-foreground">{t('contentDashboard.lessonsCompleted')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}