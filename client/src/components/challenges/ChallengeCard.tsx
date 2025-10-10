import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  Target,
  Flame,
  Clock,
  BookOpen,
  PenTool,
  Trash2
} from 'lucide-react';
import { ChallengeTemplate } from '@/data/challengeRepository';
import { challengeService, DateOption } from '@/lib/challengeService';

interface ChallengeCardProps {
  challenge: ChallengeTemplate;
  progress?: {
    currentStreak: number;
    totalSuccessDays: number;
    progressPercentage: number;
    isCompleted: boolean;
    hasFailed: boolean;
    loggedDates?: string[];
    infractionDates?: string[];
  };
  onLogSuccess: (challengeId: string, date: Date) => void;
  onLogInfraction: (challengeId: string, date: Date, note?: string) => void;
  onOpenJournal: (challengeId: string) => void;
  onViewContent: (challengeId: string) => void;
  onAbandonChallenge: (challengeId: string) => void;
  onDeleteLoggedEntry?: (challengeId: string, date: Date, type: 'success' | 'infraction') => void;
}

export function ChallengeCard({ 
  challenge, 
  progress, 
  onLogSuccess, 
  onLogInfraction,
  onOpenJournal,
  onViewContent,
  onAbandonChallenge,
  onDeleteLoggedEntry
}: ChallengeCardProps) {
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'success' | 'infraction' | null>(null);
  const [infractionNote, setInfractionNote] = useState('');
  
  console.log('ChallengeCard - Challenge ID:', challenge.id);
  console.log('ChallengeCard - Challenge Title:', challenge.title);
  console.log('ChallengeCard - Progress:', progress);
  
  const availableDates = challengeService.getAvailableDates(challenge.duration);
  const motivationalMessage = progress ? challengeService.getMotivationalMessage(challenge, progress) : '';
  const nextMilestone = progress ? challengeService.getNextMilestone(challenge, progress) : '';
  
  // Get available dates and check which ones are already logged
  const getDateOptions = () => {
    const loggedDates = progress?.loggedDates || [];
    const infractionDates = progress?.infractionDates || [];
    
    return availableDates.map(dateOption => {
      const dateString = dateOption.date.toDateString();
      const hasSuccess = loggedDates.includes(dateString);
      const hasInfraction = infractionDates.includes(dateString);
      
      return {
        ...dateOption,
        isLogged: hasSuccess,
        hasInfraction: hasInfraction,
        // For success: only disable if already logged success
        // For infractions: only disable if already logged infraction
        isDisabledForSuccess: hasSuccess,
        isDisabledForInfraction: hasInfraction
      };
    });
  };

  const handleDateSelect = (date: Date) => {
    if (selectedAction === 'success') {
      onLogSuccess(challenge.id, date);
    } else if (selectedAction === 'infraction') {
      onLogInfraction(challenge.id, date, infractionNote);
    }
    setShowDateSelector(false);
    setSelectedAction(null);
    setInfractionNote('');
  };

  const openDateSelector = (action: 'success' | 'infraction') => {
    setSelectedAction(action);
    setShowDateSelector(true);
  };

  const handleActionClick = (action: 'success' | 'infraction') => {
    setSelectedAction(action);
    setShowDateSelector(true);
  };

  const handleDateSelection = (date: Date) => {
    if (selectedAction === 'success') {
      onLogSuccess(challenge.id, date);
    } else if (selectedAction === 'infraction') {
      onLogInfraction(challenge.id, date, infractionNote);
    }
    setShowDateSelector(false);
    setSelectedAction(null);
    setInfractionNote('');
  };

  const getStatusColor = () => {
    if (!progress) return 'bg-gray-100';
    if (progress.isCompleted) return 'bg-green-100 border-green-300';
    if (progress.hasFailed) return 'bg-red-100 border-red-300';
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusIcon = () => {
    if (!progress) return <Target className="w-5 h-5 text-gray-500" />;
    if (progress.isCompleted) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (progress.hasFailed) return <XCircle className="w-5 h-5 text-red-600" />;
    return <Flame className="w-5 h-5 text-orange-500" />;
  };

  const getDifficultyBadge = () => {
    if (challenge.duration >= 40) return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Mastery</Badge>;
    if (challenge.duration >= 7) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Intermediate</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Beginner</Badge>;
  };

  return (
    <Card className={`w-full shadow-lg transition-all hover:shadow-xl ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{challenge.icon}</div>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusIcon()}
            {getDifficultyBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        {progress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                Current Streak: {progress.currentStreak} day{progress.currentStreak !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground">{nextMilestone}</span>
            </div>
            
            <Progress value={progress.progressPercentage} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress: {progress.totalSuccessDays}/{challenge.duration} days</span>
              <span>{Math.round(progress.progressPercentage)}% complete</span>
            </div>

            {motivationalMessage && (
              <div className="bg-primary/10 p-3 rounded-md text-center">
                <p className="text-sm font-medium">{motivationalMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Challenge Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {challenge.duration} day{challenge.duration !== 1 ? 's' : ''}
          </span>
          <span className="capitalize">{challenge.type} Challenge</span>
        </div>

        {/* Action Buttons */}
        {!progress?.isCompleted && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => openDateSelector('success')}
              variant="outline"
              className="flex items-center gap-2 text-green-600 hover:bg-green-50"
              disabled={progress?.hasFailed}
            >
              <CheckCircle className="w-4 h-4" />
              Log Success
            </Button>
            
            <Button 
              onClick={() => openDateSelector('infraction')}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              Log Issue
            </Button>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={() => onOpenJournal(challenge.id)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            Journal
          </Button>
          
          <Button 
            onClick={() => onViewContent(challenge.id)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Learn More
          </Button>

          <Button 
            onClick={() => onAbandonChallenge(challenge.id)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Abandon
          </Button>
        </div>

        {/* Date Selection Dialog */}
        <Dialog open={showDateSelector} onOpenChange={setShowDateSelector}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Which day are you recording this for?
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {getDateOptions().map((dateOption, index) => {
                  const isDisabled = selectedAction === 'success' 
                    ? dateOption.isDisabledForSuccess 
                    : dateOption.isDisabledForInfraction;
                  
                  return (
                    <Button
                      key={index}
                      variant={isDisabled ? "secondary" : "outline"}
                      className={`w-full justify-between ${
                        isDisabled 
                          ? selectedAction === 'success' && dateOption.isLogged
                            ? "cursor-not-allowed opacity-60 bg-green-50 text-green-700"
                            : selectedAction === 'infraction' && dateOption.hasInfraction  
                            ? "cursor-not-allowed opacity-60 bg-red-50 text-red-700"
                            : "cursor-not-allowed opacity-60"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => !isDisabled && handleDateSelect(dateOption.date)}
                      disabled={isDisabled}
                    >
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {dateOption.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {dateOption.isLogged && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {onDeleteLoggedEntry && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this success log?')) {
                                    onDeleteLoggedEntry(challenge.id, dateOption.date, 'success');
                                  }
                                }}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 rounded cursor-pointer flex items-center justify-center"
                              >
                                ×
                              </div>
                            )}
                          </>
                        )}
                        {dateOption.hasInfraction && (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            {onDeleteLoggedEntry && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this issue log?')) {
                                    onDeleteLoggedEntry(challenge.id, dateOption.date, 'infraction');
                                  }
                                }}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer flex items-center justify-center"
                              >
                                ×
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {selectedAction === 'infraction' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optional note:</label>
                  <textarea
                    placeholder="What happened and what can you learn from this?"
                    value={infractionNote}
                    onChange={(e) => setInfractionNote(e.target.value)}
                    className="w-full p-2 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                ⚠️ Only today or the two previous days can be selected. Earlier dates are disabled.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Completion Badge */}
        {progress?.isCompleted && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">{challenge.badgeIcon}</div>
            <p className="text-green-800 font-semibold">Challenge Completed!</p>
            <p className="text-sm text-green-600">{challenge.motivationalQuote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}