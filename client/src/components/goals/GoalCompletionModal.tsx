import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Sparkles, Award, CheckCircle } from 'lucide-react';
import { Goal, getTierInfo } from '@/data/goalTemplates';
import { categoryInfo } from '@/data/selfAssessmentData';

interface GoalCompletionModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalCompletionModal({ goal, isOpen, onClose }: GoalCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const tierInfo = getTierInfo(goal.tier);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  const getCompletionMessage = () => {
    switch (goal.tier) {
      case 1:
        return "Excellent foundation! You've taken the first step on your spiritual journey.";
      case 2:
        return "Great progress! Your consistency is building strong spiritual habits.";
      case 3:
        return "Outstanding commitment! You're developing true spiritual discipline.";
      case 4:
        return "Mastery achieved! Your dedication to spiritual growth is truly inspiring.";
      default:
        return "Congratulations on completing your goal!";
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. (Quran 65:3)",
      "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth. (Quran 6:73)",
      "But whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. (Quran 65:3)",
      "And Allah will reward the grateful. (Quran 3:144)",
      "So remember Me; I will remember you. And be grateful to Me and do not deny Me. (Quran 2:152)"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getBadgeIcon = () => {
    switch (goal.tier) {
      case 4: return <Crown className="h-8 w-8" />;
      case 3: return <Award className="h-8 w-8" />;
      case 2: return <Star className="h-8 w-8" />;
      default: return <CheckCircle className="h-8 w-8" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative">
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="animate-pulse">
                <Sparkles className="absolute top-4 left-4 h-4 w-4 text-yellow-400" />
                <Sparkles className="absolute top-8 right-6 h-3 w-3 text-blue-400" />
                <Sparkles className="absolute bottom-12 left-8 h-5 w-5 text-green-400" />
                <Sparkles className="absolute bottom-8 right-4 h-4 w-4 text-purple-400" />
              </div>
            </div>
          )}

          <DialogHeader className="text-center space-y-4 pt-6">
            {/* Badge Icon */}
            <div className={`mx-auto w-16 h-16 rounded-full bg-${tierInfo.color}-100 flex items-center justify-center text-${tierInfo.color}-600`}>
              {getBadgeIcon()}
            </div>

            {/* Title */}
            <div>
              <DialogTitle className="text-xl font-bold mb-2">
                Goal Completed! 🎉
              </DialogTitle>
              <DialogDescription className="text-base">
                {getCompletionMessage()}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Goal Details */}
          <div className="space-y-4 py-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{goal.title}</h3>
                <Badge variant="outline" className={`text-${tierInfo.color}-600 border-${tierInfo.color}-200`}>
                  {tierInfo.name} {goal.tier === 4 && <Crown className="h-3 w-3 ml-1" />}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{categoryInfo[goal.category].title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Achieved:</span>
                  <span>{goal.currentProgress} / {goal.targetValue}</span>
                </div>
                {goal.durationDays && (
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{goal.durationDays} days</span>
                  </div>
                )}
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
              <p className="text-sm italic text-muted-foreground">
                "{getMotivationalQuote()}"
              </p>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">{goal.currentProgress}</div>
                <div className="text-xs text-muted-foreground">
                  {goal.type === 'behavioral_streak' ? 'Days Clean' :
                   goal.type === 'content_reflection' ? 'Reflections' :
                   goal.type === 'reflection' ? 'Journal Entries' : 'Progress'}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {goal.startDate && goal.completedAt ? 
                    Math.ceil((goal.completedAt.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
                    goal.durationDays || 0}
                </div>
                <div className="text-xs text-muted-foreground">Days Taken</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pb-4">
            <Button onClick={onClose} className="w-full">
              Continue Your Journey
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Share Achievement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}