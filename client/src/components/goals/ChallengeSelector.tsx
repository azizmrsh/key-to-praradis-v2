import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Play, CheckCircle, Clock, BookOpen, Target, Filter, ChevronDown, ChevronUp, XCircle, BookHeart } from 'lucide-react';
import { challengeSelector } from '@/services/challengeSelector';
import { Challenge, ActiveChallenge } from '@/types/goals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { categoryInfo, SinCategory } from '@/data/selfAssessmentData';
import { journalManager } from '@/services/journalManager';
import { AddJournalModal } from '@/components/journal/AddJournalModal';

interface ChallengeSelctorProps {
  userFocusAreas?: {
    primary: string;
    secondary: string;
  };
}

export function ChallengeSelector({ userFocusAreas }: ChallengeSelctorProps) {
  const { i18n, t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [reflectionNote, setReflectionNote] = useState('');
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [failureConfirmOpen, setFailureConfirmOpen] = useState(false);
  const [selectedChallengeForFailure, setSelectedChallengeForFailure] = useState<string | null>(null);
  const [failureNote, setFailureNote] = useState('');
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  
  // Journal modal state
  const [addJournalModalOpen, setAddJournalModalOpen] = useState(false);
  const [selectedChallengeForJournal, setSelectedChallengeForJournal] = useState<ActiveChallenge | null>(null);

  // Get current language with fallback
  const currentLanguage = (i18n.language || 'en') as 'en' | 'ar' | 'fr';
  const lang = ['en', 'ar', 'fr'].includes(currentLanguage) ? currentLanguage : 'en';

  // Helper function to get localized challenge content
  const getChallengeContent = (challenge: Challenge) => {
    return challengeSelector.getChallengeContent(challenge, lang);
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (category: string) => {
    return t(`goals.categories.${category}`) || category.replace(/_/g, ' ');
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      tongue: 'bg-red-500',
      eyes: 'bg-blue-500', 
      ears: 'bg-green-500',
      heart: 'bg-purple-500',
      pride: 'bg-yellow-500',
      stomach: 'bg-orange-500',
      zina: 'bg-pink-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  useEffect(() => {
    loadCategories();
    loadActiveChallenges();
    
    // Check for pending challenge activation from recommendations
    const pendingChallengeData = localStorage.getItem('pending_challenge_data');
    if (pendingChallengeData) {
      try {
        const challengeData = JSON.parse(pendingChallengeData);
        // Check for either goalId (from recommendations) or challenge_id
        const challengeId = challengeData?.goalId || challengeData?.challenge_id || challengeData?.id;
        if (challengeId) {
          // Activate the challenge
          challengeSelector.activateChallenge(challengeId);
          // Reload active challenges to show the newly activated one
          loadActiveChallenges();
        }
      } catch (error) {
        console.error('Error activating pending challenge:', error);
      } finally {
        // Always remove the pending data
        localStorage.removeItem('pending_challenge_data');
      }
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [categoryFilter, durationFilter, showAllChallenges]);

  const loadCategories = () => {
    const cats = challengeSelector.getAllCategories();
    setCategories(cats);
  };

  const loadChallenges = () => {
    let challenges = challengeSelector.getAvailableChallenges({
      category_filter: categoryFilter
    });
    
    // Apply duration filter
    if (durationFilter !== 'all') {
      const targetDuration = parseInt(durationFilter);
      challenges = challenges.filter(challenge => challenge.duration_days === targetDuration);
    }
    
    // Filter by focus areas if not showing all challenges
    if (!showAllChallenges && userFocusAreas) {
      challenges = challenges.filter(challenge => 
        challenge.category === userFocusAreas.primary || 
        challenge.category === userFocusAreas.secondary
      );
    }
    
    setAvailableChallenges(challenges);
  };

  const loadActiveChallenges = () => {
    const active = challengeSelector.getActiveChallenges();
    setActiveChallenges(active);
  };

  const handleActivateChallenge = (challengeId: string) => {
    challengeSelector.activateChallenge(challengeId);
    loadActiveChallenges();
  };

  const handleCompleteChallenge = (challengeId: string) => {
    const note = reflectionNote.trim();
    challengeSelector.completeChallenge(challengeId, note || undefined);
    setReflectionNote('');
    loadActiveChallenges();
  };

  const handleMarkSuccess = (challengeId: string) => {
    challengeSelector.markDaySuccess(challengeId);
    loadActiveChallenges();
  };

  const handleMarkFailure = (challengeId: string) => {
    setSelectedChallengeForFailure(challengeId);
    setFailureConfirmOpen(true);
  };

  const confirmFailure = () => {
    if (selectedChallengeForFailure) {
      challengeSelector.markDayFailure(selectedChallengeForFailure, failureNote.trim() || undefined);
      loadActiveChallenges();
    }
    setFailureConfirmOpen(false);
    setSelectedChallengeForFailure(null);
    setFailureNote('');
  };

  const cancelFailure = () => {
    setFailureConfirmOpen(false);
    setSelectedChallengeForFailure(null);
    setFailureNote('');
  };

  const handleDailyProgress = (challengeId: string) => {
    const note = (dailyNotes[challengeId] || '').trim();
    challengeSelector.updateDailyProgress(challengeId, note || undefined);
    setDailyNotes(prev => ({ ...prev, [challengeId]: '' }));
    loadActiveChallenges();
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ActiveChallenge['status']) => {
    switch (status) {
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'all') {
      return t('challenges.allCategories');
    }
    return t(`goals.categories.${category}`) || category;
  };

  const getAvailableDurations = () => {
    const allChallenges = challengeSelector.getAvailableChallenges({ category_filter: 'all' });
    const durationSet = new Set(allChallenges.map(c => c.duration_days));
    const durations = Array.from(durationSet).sort((a, b) => a - b);
    return durations;
  };

  // Journal handlers
  const handleOpenJournalModal = (challenge: ActiveChallenge) => {
    setSelectedChallengeForJournal(challenge);
    setAddJournalModalOpen(true);
  };

  const handleJournalSuccess = () => {
    // Refresh to show updated journal count
    loadActiveChallenges();
  };



  const groupActiveChallengesByDuration = (challenges: ActiveChallenge[]) => {
    const grouped: Record<number, ActiveChallenge[]> = {};
    challenges.forEach(challenge => {
      const duration = challenge.duration_days;
      if (!grouped[duration]) {
        grouped[duration] = [];
      }
      grouped[duration].push(challenge);
    });
    return grouped;
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Active Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">❤</span>
          </div>
          <h2 className="text-lg font-bold text-red-600">{t('challenges.activeChallengesTitle')}</h2>
        </div>
        
        {activeChallenges.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{t('goals.noActiveChallenges')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupActiveChallengesByDuration(activeChallenges))
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([duration, challenges]) => (
                <div key={duration}>
                  <h4 className="text-lg font-medium mb-3 text-blue-600">
                    {duration}-{parseInt(duration) === 1 ? t('goals.dayLabel') : t('goals.daysLabel')} {t('goals.challengesLabel')}
                  </h4>
                  <div className="grid gap-4">
                    {challenges.map((activeChallenge) => {
              const challengeDetails = challengeSelector.getChallengeDetails(activeChallenge.challenge_id);
              const progress = challengeSelector.getChallengeProgress(activeChallenge.challenge_id);
              
              if (!challengeDetails) return null;

              const challengeContent = getChallengeContent(challengeDetails);

              return (
                <Card key={activeChallenge.challenge_id} className="border-l-4 border-l-green-500" style={{ backgroundColor: '#bccbcc' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-base ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{challengeContent.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const journalCount = journalManager.getEntryCount(activeChallenge.challenge_id, 'Challenge');
                          return journalCount > 0 ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 whitespace-nowrap">
                              <BookHeart className="h-3 w-3 mr-1" />
                              {journalCount}
                            </Badge>
                          ) : null;
                        })()}
                        <Badge variant="outline" className="capitalize whitespace-nowrap">
                          {(() => {
                            const translationKey = `goals.categories.${challengeDetails.category}`;
                            const translated = t(translationKey);
                            return translated !== translationKey ? translated : challengeDetails.category.replace(/_/g, ' ');
                          })()}
                        </Badge>
                        <Badge className={`${getDifficultyColor(challengeDetails.difficulty)} text-white whitespace-nowrap`}>
                          {t(`challenges.difficulty.${challengeDetails.difficulty}`) || challengeDetails.difficulty}
                        </Badge>
                        <Badge 
                          className={`${
                            activeChallenge.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          } text-white whitespace-nowrap flex items-center gap-1`}
                        >
                          {getStatusIcon(activeChallenge.status)}
                          <span>
                            {t(`challenges.status.${activeChallenge.status}`) || activeChallenge.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('challenges.progress')}</span>
                        <span>{activeChallenge.current_day || 0}/{activeChallenge.duration_days} {t('goals.daysLabel').toLowerCase()}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {activeChallenge.status === 'in_progress' && (activeChallenge.current_day || 0) < activeChallenge.duration_days && (
                      <div className="space-y-3 mt-4">
                        <Textarea
                          placeholder={t('goals.addProgressNote')}
                          value={dailyNotes[activeChallenge.challenge_id] || ''}
                          onChange={(e) => setDailyNotes(prev => ({ ...prev, [activeChallenge.challenge_id]: e.target.value }))}
                          className="min-h-[80px] w-full"
                          disabled={challengeSelector.hasCompletedToday(activeChallenge.challenge_id)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleMarkSuccess(activeChallenge.challenge_id)}
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            style={{ backgroundColor: '#dc2626' }}
                            disabled={challengeSelector.hasCompletedToday(activeChallenge.challenge_id)}
                          >
                            {challengeSelector.hasCompletedToday(activeChallenge.challenge_id) 
                              ? t('goals.successToday') 
                              : t('goals.markSuccess')}
                          </Button>
                          <Button 
                            onClick={() => handleMarkFailure(activeChallenge.challenge_id)}
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            disabled={challengeSelector.hasCompletedToday(activeChallenge.challenge_id)}
                          >
                            {t('goals.markFailure')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenJournalModal(activeChallenge)}
                            data-testid={`button-add-journal-challenge-${activeChallenge.challenge_id}`}
                          >
                            <BookHeart className="h-4 w-4" />
                          </Button>
                        </div>
                        {challengeSelector.hasCompletedToday(activeChallenge.challenge_id) && (
                          <p className="text-sm text-muted-foreground text-center">
                            {t('goals.completedTodayMessage')}
                          </p>
                        )}
                        
                        {(activeChallenge.current_day || 0) >= activeChallenge.duration_days && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder={t('goals.shareReflection')}
                              value={reflectionNote}
                              onChange={(e) => setReflectionNote(e.target.value)}
                              className="h-20"
                            />
                            <Button 
                              onClick={() => handleCompleteChallenge(activeChallenge.challenge_id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                              style={{ backgroundColor: '#dc2626' }}
                            >
{t('challenges.completeChallenge')}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeChallenge.reflection_notes && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-1">{t('challenges.reflection')}:</h4>
                        <p className="text-sm text-muted-foreground italic">
                          {activeChallenge.reflection_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Challenge Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {showAllChallenges ? t('challenges.availableChallenges') : t('challenges.focusAreaChallenges')}
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={durationFilter} onValueChange={setDurationFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('challenges.durationFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('goals.allDurations')}</SelectItem>
                {getAvailableDurations().map(duration => (
                  <SelectItem key={duration} value={duration.toString()}>
{duration} {duration === 1 ? t('goals.dayLabel').toLowerCase() : t('goals.daysLabel').toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Available Challenges */}
        <div className="space-y-6">
          {(() => {
            const filteredChallenges = availableChallenges
              .filter(challenge => !activeChallenges.some(ac => ac.challenge_id === challenge.challenge_id));
            
            // Group challenges by category
            const challengesByCategory = filteredChallenges.reduce((acc, challenge) => {
              if (!acc[challenge.category]) {
                acc[challenge.category] = [];
              }
              acc[challenge.category].push(challenge);
              return acc;
            }, {} as Record<string, Challenge[]>);
            
            return Object.entries(challengesByCategory)
              .sort(([a], [b]) => {
                // If we're showing focus areas only, prioritize them
                if (!showAllChallenges && userFocusAreas) {
                  if (a === userFocusAreas.primary) return -1;
                  if (b === userFocusAreas.primary) return 1;
                  if (a === userFocusAreas.secondary) return -1;
                  if (b === userFocusAreas.secondary) return 1;
                }
                return a.localeCompare(b);
              })
              .map(([category, challenges]) => (
                <div key={category} className="space-y-4">
                  {/* Category Header - Matching FOCUS AREAS style with 50% opacity background */}
                  <div className="px-6 py-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }}>
                    <h4 className="text-lg font-bold text-black mb-0 uppercase">
                      {getCategoryDisplayName(category)}
                    </h4>
                  </div>
                  
                  {/* Challenges in this category */}
                  <div className="space-y-3 ml-4">
                    {challenges.map((challenge) => {
              const challengeContent = getChallengeContent(challenge);
              const isExpanded = expandedChallengeId === challenge.challenge_id;
              
              return (
                <div key={challenge.challenge_id} style={{ backgroundColor: isExpanded ? '#B8C5C5' : 'white' }} className="border border-gray-300 rounded-lg">
                  {/* Collapsed Challenge Header */}
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.challenge_id)}
                  >
                    <div className="font-medium text-black">{challengeContent.title}</div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-black" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-black" />
                    )}
                  </div>

                  {/* Expanded Challenge Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-300 bg-white">
                      <div className="space-y-4 pt-4">
                        {/* Description */}
                        <p className="text-sm text-gray-700">{challengeContent.description}</p>
                        
                        {/* Duration and Category Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{challenge.duration_days} {challenge.duration_days === 1 ? t('goals.dayLabel').toLowerCase() : t('goals.daysLabel').toLowerCase()}</span>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {t(`goals.categories.${challenge.category}`)}
                          </Badge>
                          <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                            {t(`challenges.difficulty.${challenge.difficulty}`) || challenge.difficulty}
                          </Badge>
                        </div>
                        
                        {/* Islamic Guidance */}
                        <div>
                          <p className="text-sm italic text-gray-600">{challenge.islamic_guidance}</p>
                        </div>

                        {/* View Details Link */}
                        <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-sm text-blue-600 hover:text-blue-800">
                                {t('challenges.viewDetailsLink')} &gt;
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{challengeContent.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>{challengeContent.description}</p>
                                
                                <div>
                                  <h4 className="font-medium mb-2">{t('challenges.islamicGuidance')}:</h4>
                                  <p className="text-sm text-muted-foreground italic">{challenge.islamic_guidance}</p>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">{t('challenges.duration')}:</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {challenge.duration_days} {challenge.duration_days === 1 ? t('goals.dayLabel').toLowerCase() : t('goals.daysLabel').toLowerCase()}
                                  </p>
                                </div>

                                {challenge.category && (
                                  <div>
                                    <h4 className="font-medium mb-2">{t('challenges.focusArea')}:</h4>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      {t(`goals.categories.${challenge.category}`)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Start Challenge Button */}
                        <Button 
                          onClick={() => handleActivateChallenge(challenge.challenge_id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          style={{ backgroundColor: '#dc2626' }}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {t('goals.startChallenge')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
                  </div>
                </div>
              ));
          })()}
        </div>

        </div>

      {/* Failure Confirmation Dialog */}
      <Dialog open={failureConfirmOpen} onOpenChange={setFailureConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('goals.confirmFailure')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('goals.failureConfirmationMessage')}
            </p>
            <Textarea
              placeholder={t('goals.optionalFailureNote')}
              value={failureNote}
              onChange={(e) => setFailureNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                onClick={confirmFailure}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('goals.confirmRestart')}
              </Button>
              <Button 
                onClick={cancelFailure}
                variant="outline"
                className="flex-1"
              >
                {t('goals.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Journal Entry Modal */}
      {selectedChallengeForJournal && (
        <AddJournalModal
          open={addJournalModalOpen}
          onOpenChange={setAddJournalModalOpen}
          defaultOrigin="Challenge"
          defaultOriginId={selectedChallengeForJournal.challenge_id}
          defaultArea="Misc"
          onSuccess={handleJournalSuccess}
          title="Add Journal Entry for Challenge"
        />
      )}
    </div>
  );
}