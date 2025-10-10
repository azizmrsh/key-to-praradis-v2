import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Play, Pause, CheckCircle, XCircle, Clock, BookOpen, PenTool, Zap, BookHeart } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { goalsEngine } from '@/services/goalsEngine';
import { challengeSelector } from '@/services/challengeSelector';
import { Goal, ActiveGoal, Challenge } from '@/types/goals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { categoryInfo, SinCategory } from '@/data/selfAssessmentData';
import { journalManager } from '@/services/journalManager';
import { AddJournalModal } from '@/components/journal/AddJournalModal';
import { useToast } from '@/hooks/use-toast';

interface GoalsEngineProps {
  focusSinPrimary: string;
  focusSinSecondary?: string;
}

export function GoalsEngine({ focusSinPrimary, focusSinSecondary }: GoalsEngineProps) {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const [relevantChallenges, setRelevantChallenges] = useState<Challenge[]>([]);
  const [challengeDurationFilter, setChallengeDurationFilter] = useState<string>('all');
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'goal' | 'challenge', id: string } | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [failureConfirmOpen, setFailureConfirmOpen] = useState(false);
  const [selectedGoalForFailure, setSelectedGoalForFailure] = useState<string | null>(null);
  const [failureNote, setFailureNote] = useState('');
  
  // Journal modal state
  const [addJournalModalOpen, setAddJournalModalOpen] = useState(false);
  const [selectedGoalForJournal, setSelectedGoalForJournal] = useState<ActiveGoal | null>(null);

  // Get current language with fallback
  const currentLanguage = (i18n.language || 'en') as 'en' | 'ar' | 'fr';
  const lang = ['en', 'ar', 'fr'].includes(currentLanguage) ? currentLanguage : 'en';

  // Helper function to get localized goal content
  const getGoalContent = (goal: Goal) => {
    return goal.translations[lang] || goal.translations.en;
  };

  useEffect(() => {
    loadGoals();
    loadActiveGoals();
    loadRelevantChallenges();
  }, [focusSinPrimary, focusSinSecondary]);

  const loadGoals = () => {
    const goals = goalsEngine.getAvailableGoals({
      focus_sin_primary: focusSinPrimary,
      focus_sin_secondary: focusSinSecondary
    });
    setAvailableGoals(goals);
  };

  const loadActiveGoals = () => {
    const active = goalsEngine.getActiveGoals();
    setActiveGoals(active);
  };

  const loadRelevantChallenges = () => {
    const categories = [focusSinPrimary, focusSinSecondary].filter(Boolean);
    const allChallenges = challengeSelector.getAvailableChallenges({ category_filter: 'all' });
    const relevant = allChallenges.filter(challenge => 
      categories.includes(challenge.category)
    );
    setRelevantChallenges(relevant);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tongue: 'bg-green-100 border-green-300 text-green-800',
      eyes: 'bg-green-200 border-green-400 text-green-900',
      ears: 'bg-green-300 border-green-500 text-green-900',
      pride: 'bg-green-400 border-green-600 text-green-900',
      stomach: 'bg-green-500 border-green-700 text-white',
      zina: 'bg-green-600 border-green-800 text-white',
      heart: 'bg-green-700 border-green-900 text-white'
    };
    return colors[category] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getAvailableDurations = () => {
    const durations = new Set<number>();
    availableGoals.forEach(goal => {
      // Use duration_options from unified goals
      goal.duration_options.forEach(d => durations.add(d));
    });
    return Array.from(durations).sort((a, b) => a - b);
  };

  const getAvailableChallengeDurations = () => {
    const durations = new Set<number>();
    relevantChallenges.forEach(challenge => {
      durations.add(challenge.duration_days);
    });
    return Array.from(durations).sort((a, b) => a - b);
  };



  const filterChallengesByDuration = (challenges: Challenge[]) => {
    if (challengeDurationFilter === 'all') return challenges;
    return challenges.filter(challenge => challenge.duration_days === parseInt(challengeDurationFilter));
  };

  const groupGoalsByCategory = (goals: Goal[]) => {
    const grouped: Record<string, Goal[]> = {};
    goals.forEach(goal => {
      if (!grouped[goal.category]) {
        grouped[goal.category] = [];
      }
      grouped[goal.category].push(goal);
    });
    return grouped;
  };

  const groupChallengesByCategory = (challenges: Challenge[]) => {
    const grouped: Record<string, Challenge[]> = {};
    challenges.forEach(challenge => {
      if (!grouped[challenge.category]) {
        grouped[challenge.category] = [];
      }
      grouped[challenge.category].push(challenge);
    });
    return grouped;
  };

  const handleSelectDuration = (goalId: string, duration: number) => {
    setSelectedDurations(prev => ({
      ...prev,
      [goalId]: duration
    }));
  };

  const handleActivateGoal = (goalId: string) => {
    const duration = selectedDurations[goalId];
    if (duration) {
      goalsEngine.activateGoal(goalId, duration);
      loadActiveGoals();
      // Clear selection after activation
      setSelectedDurations(prev => {
        const updated = { ...prev };
        delete updated[goalId];
        return updated;
      });
    }
  };

  const handleUpdateStatus = (goalId: string, status: ActiveGoal['status']) => {
    goalsEngine.updateGoalStatus(goalId, status);
    
    // Lock journal entries when goal is completed
    if (status === 'completed') {
      const lockedCount = journalManager.lockEntriesLinkedToCompletedItems(goalId, 'Goal');
      if (lockedCount > 0) {
        toast({
          title: 'Journal entries locked',
          description: `${lockedCount} journal ${lockedCount === 1 ? 'entry' : 'entries'} linked to this goal ${lockedCount === 1 ? 'has' : 'have'} been locked.`
        });
      }
    }
    
    loadActiveGoals();
  };

  const handleDailyProgress = (goalId: string) => {
    const note = (dailyNotes[goalId] || '').trim();
    goalsEngine.updateDailyProgress(goalId, note || undefined);
    setDailyNotes(prev => ({ ...prev, [goalId]: '' }));
    loadActiveGoals();
  };

  const handleMarkSuccess = (goalId: string) => {
    goalsEngine.markDaySuccess(goalId);
    loadActiveGoals();
  };

  const handleMarkFailure = (goalId: string) => {
    setSelectedGoalForFailure(goalId);
    setFailureConfirmOpen(true);
  };

  const confirmFailure = () => {
    if (selectedGoalForFailure) {
      goalsEngine.markDayFailure(selectedGoalForFailure, failureNote.trim() || undefined);
      loadActiveGoals();
    }
    setFailureConfirmOpen(false);
    setSelectedGoalForFailure(null);
    setFailureNote('');
  };

  const cancelFailure = () => {
    setFailureConfirmOpen(false);
    setSelectedGoalForFailure(null);
    setFailureNote('');
  };

  const handleOpenJournalModal = (activeGoal: ActiveGoal) => {
    setSelectedGoalForJournal(activeGoal);
    setAddJournalModalOpen(true);
  };

  const handleJournalSuccess = () => {
    loadActiveGoals(); // Refresh to show updated journal count
  };

  const handleProgressRecord = (success: boolean) => {
    if (!selectedItem) return;
    
    const note = journalContent.trim();
    
    if (selectedItem.type === 'goal') {
      if (success) {
        goalsEngine.recordSuccess(selectedItem.id, note || undefined);
      } else {
        goalsEngine.recordFailure(selectedItem.id, note || undefined);
      }
      loadActiveGoals();
    } else if (selectedItem.type === 'challenge') {
      if (success) {
        challengeSelector.recordSuccess(selectedItem.id, note || undefined);
      } else {
        challengeSelector.recordFailure(selectedItem.id, note || undefined);
      }
      // Would need to reload challenges if we had active challenges here
    }
    
    setJournalContent('');
    setProgressDialogOpen(false);
    setSelectedItem(null);
  };

  const handleJournalOnly = () => {
    if (!selectedItem) return;
    
    const note = journalContent.trim();
    if (!note) return;
    
    // Save journal entry without affecting progress
    if (selectedItem.type === 'goal') {
      goalsEngine.addJournalEntry(selectedItem.id, note);
      loadActiveGoals();
    } else if (selectedItem.type === 'challenge') {
      challengeSelector.addJournalEntry(selectedItem.id, note);
    }
    
    setJournalContent('');
    setJournalDialogOpen(false);
    setSelectedItem(null);
  };

  const getCategoryLabel = (category: string) => {
    return t(`goals.categories.${category}`) || category;
  };

  const getStatusColor = (status: ActiveGoal['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'abandoned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ActiveGoal['status']) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'abandoned': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <Target className="h-3 w-3 text-white" />
          </div>
          <h2 className="text-lg font-bold text-blue-600">{t('goals.activeGoals')}</h2>
        </div>
        
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{t('goals.noActiveGoals')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Primary Focus Area */}
            <div>
              <h4 className="px-6 py-3 mb-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }}>
                <span className="text-lg font-bold text-black uppercase">
                  {getCategoryLabel(focusSinPrimary)} ({t('goals.primaryFocusLabel')})
                </span>
              </h4>
              <div className="grid gap-4">
                {activeGoals
                  .filter(goal => {
                    const details = goalsEngine.getGoalDetails(goal.goal_id);
                    return details?.category === focusSinPrimary;
                  })
                  .map((activeGoal) => {
                    const goalDetails = goalsEngine.getGoalDetails(activeGoal.goal_id);
                    const progress = goalsEngine.getGoalProgress(activeGoal.goal_id);
                    const hasCompletedToday = goalsEngine.hasCompletedToday(activeGoal.goal_id);
                    const today = new Date().toISOString().split('T')[0];
                    const completedToday = activeGoal.completion_dates?.includes(today);
                    const failedToday = activeGoal.failed_dates?.includes(today);
                    
                    if (!goalDetails) return null;

                    const goalContent = getGoalContent(goalDetails);
                    
                    return (
                      <Card key={activeGoal.goal_id} className={`border-l-4 ${getCategoryColor(focusSinPrimary).includes('bg-green-100') ? 'border-l-green-500' : 'border-l-green-700'}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-base ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{goalContent.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const journalCount = journalManager.getEntryCount(activeGoal.goal_id, 'Goal');
                                return journalCount > 0 ? (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                    <BookHeart className="h-3 w-3 mr-1" />
                                    {journalCount}
                                  </Badge>
                                ) : null;
                              })()}
                              <Badge className={`${getStatusColor(activeGoal.status)} text-white`}>
                                {getStatusIcon(activeGoal.status)}
                                <span className="ml-1 capitalize">{activeGoal.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{t('goals.progressLabel')}</span>
                              <span>{activeGoal.completion_dates?.length || 0}/{activeGoal.duration_days} {t('goals.days')}</span>
                              {completedToday && <span className="text-green-600">✓ {t('goals.successTodayLabel')}</span>}
                              {failedToday && <span className="text-red-600">✗ {t('goals.failedTodayLabel')}</span>}
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {activeGoal.status === 'active' && (activeGoal.current_day || 0) < activeGoal.duration_days && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  setSelectedItem({ type: 'goal', id: activeGoal.goal_id });
                                  setProgressDialogOpen(true);
                                }}
                                size="sm"
                                className="flex-1"
                                disabled={hasCompletedToday}
                              >
                                {hasCompletedToday ? t('goals.doneLabel') : t('goals.recordLabel')}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenJournalModal(activeGoal)}
                                data-testid={`button-add-journal-goal-${activeGoal.goal_id}`}
                              >
                                <BookHeart className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {activeGoal.status === 'paused' && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleUpdateStatus(activeGoal.goal_id, 'active')}
                                size="sm"
                                className="flex-1"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {t('goals.resume')}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleUpdateStatus(activeGoal.goal_id, 'abandoned')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {activeGoal.notes && activeGoal.notes.length > 0 && (
                            <div className="pt-2 border-t">
                              <h4 className="text-sm font-medium mb-2">{t('goals.recentNotes')}</h4>
                              <div className="space-y-1">
                                {activeGoal.notes.slice(-3).map((note, index) => (
                                  <p key={index} className="text-xs text-muted-foreground">
                                    {note}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* Secondary Focus Area */}
            {focusSinSecondary && (
              <div>
                <h4 className="px-6 py-3 mb-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }}>
                  <span className="text-lg font-bold text-black uppercase">
                    {getCategoryLabel(focusSinSecondary)} ({t('goals.secondaryFocusLabel')})
                  </span>
                </h4>
                <div className="grid gap-4">
                  {activeGoals
                    .filter(goal => {
                      const details = goalsEngine.getGoalDetails(goal.goal_id);
                      return details?.category === focusSinSecondary;
                    })
                    .map((activeGoal) => {
                      const goalDetails = goalsEngine.getGoalDetails(activeGoal.goal_id);
                      const progress = goalsEngine.getGoalProgress(activeGoal.goal_id);
                      const hasCompletedToday = goalsEngine.hasCompletedToday(activeGoal.goal_id);
                      const today = new Date().toISOString().split('T')[0];
                      const completedToday = activeGoal.completion_dates?.includes(today);
                      const failedToday = activeGoal.failed_dates?.includes(today);
                      
                      if (!goalDetails) return null;

                      const goalContent = getGoalContent(goalDetails);
                      
                      return (
                        <Card key={activeGoal.goal_id} className={`border-l-4 ${getCategoryColor(focusSinSecondary).includes('bg-green-100') ? 'border-l-green-500' : 'border-l-green-700'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className={`text-base ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{goalContent.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const journalCount = journalManager.getEntryCount(activeGoal.goal_id, 'Goal');
                                  return journalCount > 0 ? (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                      <BookHeart className="h-3 w-3 mr-1" />
                                      {journalCount}
                                    </Badge>
                                  ) : null;
                                })()}
                                <Badge className={`${getStatusColor(activeGoal.status)} text-white`}>
                                  {getStatusIcon(activeGoal.status)}
                                  <span className="ml-1 capitalize">{activeGoal.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{t('goals.progressLabel')}</span>
                                <span>{activeGoal.completion_dates?.length || 0}/{activeGoal.duration_days} {t('goals.days')}</span>
                                {completedToday && <span className="text-green-600">✓ {t('goals.successTodayLabel')}</span>}
                                {failedToday && <span className="text-red-600">✗ {t('goals.failedTodayLabel')}</span>}
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            {activeGoal.status === 'active' && (activeGoal.current_day || 0) < activeGoal.duration_days && (
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleMarkSuccess(activeGoal.goal_id)}
                                  size="sm"
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                  style={{ backgroundColor: '#dc2626' }}
                                  disabled={hasCompletedToday}
                                >
                                  {completedToday ? '✓ ' + t('goals.successLabel') : t('goals.markSuccessLabel')}
                                </Button>
                                <Button 
                                  onClick={() => handleMarkFailure(activeGoal.goal_id)}
                                  size="sm"
                                  className="flex-1 bg-red-600 hover:bg-red-700"
                                  disabled={hasCompletedToday}
                                >
                                  {failedToday ? '✗ ' + t('goals.failedLabel') : t('goals.markFailureLabel')}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenJournalModal(activeGoal)}
                                  data-testid={`button-add-journal-goal-${activeGoal.goal_id}`}
                                >
                                  <BookHeart className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {activeGoal.status === 'paused' && (
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleUpdateStatus(activeGoal.goal_id, 'active')}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  {t('goals.resumeLabel')}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(activeGoal.goal_id, 'abandoned')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {activeGoal.notes && activeGoal.notes.length > 0 && (
                              <div className="pt-2 border-t">
                                <h4 className="text-sm font-medium mb-2">{t('goals.recentNotes')}</h4>
                                <div className="space-y-1">
                                  {activeGoal.notes.slice(-3).map((note, index) => (
                                    <p key={index} className="text-xs text-muted-foreground">
                                      {note}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Available Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('goals.availableGoals')}</h3>
        </div>

        <div className="space-y-6">
          {Object.entries(groupGoalsByCategory(availableGoals)).map(([category, goals]) => (
            <div key={category}>
              <h4 className="px-6 py-3 mb-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }}>
                <span className="text-lg font-bold text-black uppercase">{getCategoryLabel(category)}</span>
              </h4>
              <div className="grid gap-4">
                {goals.map((goal) => {
                  const isActive = activeGoals.some(ag => ag.goal_id === goal.goal_id && ag.status === 'active');
                  const isExpanded = expandedGoalId === goal.goal_id;
                  const goalContent = getGoalContent(goal);
                  
                  return (
                    <div key={goal.goal_id} style={{ backgroundColor: isExpanded ? '#B8C5C5' : 'white' }} className={`border border-gray-300 rounded-lg ${isActive ? 'opacity-50' : ''}`}>
                      {/* Collapsed Goal Header */}
                      <div 
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.goal_id)}
                      >
                        <div className="font-medium text-black">{goalContent.title}</div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-black" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-black" />
                        )}
                      </div>

                      {/* Expanded Goal Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-300 bg-white">
                          <div className="space-y-4 pt-4">
                            {/* Description */}
                            <p className="text-sm text-gray-700">{goalContent.description}</p>
                            
                            {/* Islamic Guidance */}
                            <div>
                              <p className="text-sm italic text-gray-600">{goalContent.islamic_guidance}</p>
                            </div>

                            {/* View Details Link */}
                            <div className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-sm text-blue-600 hover:text-blue-800">
                                    {t('challenges.viewDetailsLink')} &gt;
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{goalContent.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>{goalContent.description}</p>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">{t('goals.islamicGuidance')}:</h4>
                                      <p className="text-sm text-muted-foreground italic">{goalContent.islamic_guidance}</p>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">{t('goals.benefits')}:</h4>
                                      <ul className="text-sm space-y-1">
                                        {goalContent.benefits.map((benefit, index) => (
                                          <li key={index} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            {benefit}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">{t('goals.dailyActions')}:</h4>
                                      <ul className="text-sm space-y-1">
                                        {goalContent.daily_actions.map((action, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                                            {action}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>

                            {/* Duration Selection */}
                            {!isActive && (
                              <div className="space-y-3">
                                <div className="text-sm font-bold text-black">{t('goals.selectDuration')}</div>
                                <div className="grid grid-cols-4 gap-2">
                                  {goal.duration_options.map((duration) => (
                                    <Button 
                                      key={duration}
                                      onClick={() => handleSelectDuration(goal.goal_id, duration)}
                                      size="sm"
                                      variant={selectedDurations[goal.goal_id] === duration ? "default" : "outline"}
                                      style={{
                                        backgroundColor: selectedDurations[goal.goal_id] === duration ? '#FF6B6B' : 'transparent',
                                        borderColor: '#FF6B6B',
                                        color: selectedDurations[goal.goal_id] === duration ? 'white' : '#FF6B6B'
                                      }}
                                    >
                                      {duration} {t('goals.daysLabel').toLowerCase()}
                                    </Button>
                                  ))}
                                </div>
                                
                                <Button 
                                  onClick={() => handleActivateGoal(goal.goal_id)}
                                  size="sm"
                                  className="w-full"
                                  style={{ backgroundColor: '#FF6B6B', color: 'white' }}
                                  disabled={!selectedDurations[goal.goal_id]}
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  {t('goals.startGoal')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Progress Recording Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('goals.recordProgress')}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('goals.recordProgressDescription')}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('goals.writeExperience')}
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => handleProgressRecord(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                style={{ backgroundColor: '#dc2626' }}
              >
                {t('goals.success')}
              </Button>
              <Button 
                onClick={() => handleProgressRecord(false)}
                variant="destructive"
                className="flex-1"
              >
                Failed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Only Dialog */}
      <Dialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Journal Entry</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Reflect on your spiritual journey and record your thoughts.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reflection..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={handleJournalOnly}
              className="w-full"
              disabled={!journalContent.trim()}
            >
              Save Journal Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failure Confirmation Dialog */}
      <Dialog open={failureConfirmOpen} onOpenChange={setFailureConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Goal Failure</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to mark today as failed? This will restart your goal from the beginning.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Why did you fail today? (optional)"
              value={failureNote}
              onChange={(e) => setFailureNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                onClick={cancelFailure}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmFailure}
                variant="destructive"
                className="flex-1"
              >
                Yes, Mark as Failed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Journal Entry Modal */}
      {selectedGoalForJournal && (
        <AddJournalModal
          open={addJournalModalOpen}
          onOpenChange={setAddJournalModalOpen}
          defaultOrigin="Goal"
          defaultOriginId={selectedGoalForJournal.goal_id}
          defaultArea={
            focusSinPrimary === (goalsEngine.getGoalDetails(selectedGoalForJournal.goal_id)?.category)
              ? "Primary"
              : "Secondary"
          }
          onSuccess={handleJournalSuccess}
          title="Add Journal Entry for Goal"
        />
      )}
    </div>
  );
}