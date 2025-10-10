import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChallengeTemplate } from '@/data/challengeRepository';
import { PrayerStreakService, PrayerChallengeProgress } from '@/lib/prayerStreakService';
import { CheckCircle, Clock, Flame, Trophy } from 'lucide-react';

interface PrayerChallengeCardProps {
  challenge: ChallengeTemplate;
  onJoinChallenge: (challengeId: string) => void;
  isActive?: boolean;
}

export function PrayerChallengeCard({ challenge, onJoinChallenge, isActive }: PrayerChallengeCardProps) {
  // Determine challenge type based on ID
  const getChallengeType = () => {
    if (challenge.id.includes('fajr')) return 'fajr_only';
    if (challenge.id.includes('ontime')) return 'on_time_all';
    return 'all_prayers';
  };

  const challengeType = getChallengeType();
  const progress = PrayerStreakService.calculateChallengeProgress(challenge.duration, challengeType);
  const prayerStats = PrayerStreakService.getPrayerStats();

  // Get current streak for this challenge type
  const getCurrentStreak = () => {
    switch (challengeType) {
      case 'fajr_only': return prayerStats.currentFajrStreak;
      case 'on_time_all': return prayerStats.currentOnTimeStreak;
      default: return prayerStats.currentAllPrayersStreak;
    }
  };

  const currentStreak = getCurrentStreak();
  const daysAlreadyCompleted = Math.min(currentStreak, challenge.duration);
  const daysRemaining = Math.max(0, challenge.duration - daysAlreadyCompleted);
  const progressPercentage = (daysAlreadyCompleted / challenge.duration) * 100;

  const getChallengeTypeLabel = () => {
    switch (challengeType) {
      case 'fajr_only': return 'Fajr Only';
      case 'on_time_all': return 'On-Time All Prayers';
      default: return 'All 5 Prayers';
    }
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your prayer streak today!";
    } else if (daysRemaining === 0) {
      return "🎉 You've already completed this challenge!";
    } else if (daysAlreadyCompleted > 0) {
      return `Your ${currentStreak}-day streak counts! Only ${daysRemaining} days left.`;
    } else {
      return `Current streak: ${currentStreak} days`;
    }
  };

  const getButtonText = () => {
    if (isActive) return 'Already Joined';
    if (daysRemaining === 0) return 'Challenge Complete!';
    if (daysAlreadyCompleted > 0) return `Join (${daysRemaining} days left)`;
    return 'Join Challenge';
  };

  const isCompleted = daysRemaining === 0;

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{challenge.icon}</div>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getChallengeTypeLabel()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {challenge.duration} days
                </Badge>
              </div>
            </div>
          </div>
          {isCompleted && (
            <Trophy className="h-6 w-6 text-yellow-600" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {challenge.description}
        </p>

        {/* Current Streak Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium text-sm">Your Current Progress</span>
          </div>
          <div className="text-sm text-gray-700">
            {getStreakMessage()}
          </div>
        </div>

        {/* Progress Visualization */}
        {currentStreak > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Challenge Progress</span>
              <span>{daysAlreadyCompleted} / {challenge.duration} days</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {daysAlreadyCompleted > 0 && daysRemaining > 0 && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {daysAlreadyCompleted} days from your existing streak applied!
              </div>
            )}
          </div>
        )}

        {/* Motivational Quote */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 italic leading-relaxed">
            "{challenge.motivationalQuote}"
          </p>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onJoinChallenge(challenge.id)}
          disabled={isActive || isCompleted}
          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {isCompleted && <Trophy className="h-4 w-4 mr-2" />}
          {getButtonText()}
        </Button>

        {/* Next Step Hint */}
        {!isActive && !isCompleted && daysRemaining > 0 && (
          <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            {daysRemaining === challenge.duration 
              ? "Start logging your prayers to begin this challenge"
              : `Continue your streak for ${daysRemaining} more days to complete`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}