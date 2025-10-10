import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrayerChallengeCard } from '@/components/challenges/PrayerChallengeCard';
import { challengeTemplates } from '@/data/challengeRepository';
import { PrayerStreakService } from '@/lib/prayerStreakService';
import { Flame, Clock } from 'lucide-react';

interface PrayerChallengeSectionProps {
  onJoinChallenge: (challengeId: string) => void;
  activeChallengeIds: string[];
}

export function PrayerChallengeSection({ onJoinChallenge, activeChallengeIds }: PrayerChallengeSectionProps) {
  const prayerChallenges = challengeTemplates.filter(challenge => 
    challenge.id.startsWith('prayer-') || challenge.id.startsWith('fajr-')
  );

  const prayerStats = PrayerStreakService.getPrayerStats();

  return (
    <div className="space-y-6">
      {/* Prayer Stats Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Prayer Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {prayerStats.currentAllPrayersStreak}
              </div>
              <div className="text-sm text-blue-700">All Prayers</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-2xl font-bold text-orange-600">
                {prayerStats.currentFajrStreak}
              </div>
              <div className="text-sm text-orange-700">Fajr Streak</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-2xl font-bold text-green-600">
                {prayerStats.currentOnTimeStreak}
              </div>
              <div className="text-sm text-green-700">On-Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Prayer Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold">
                {prayerStats.todaysPrayersLogged} / 5 prayers logged
              </div>
              <div className="text-sm text-muted-foreground">
                {prayerStats.todaysPrayersOnTime} on time
              </div>
            </div>
            <div className="text-3xl">
              {prayerStats.todaysPrayersLogged === 5 ? '🌟' : 
               prayerStats.todaysPrayersLogged >= 3 ? '📿' : '🕌'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Challenge Cards */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">Prayer Challenges</h3>
          <p className="text-muted-foreground">
            Build on your existing prayer streaks! Your current progress counts toward these challenges.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {prayerChallenges.map(challenge => (
            <PrayerChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoinChallenge={onJoinChallenge}
              isActive={activeChallengeIds.includes(challenge.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}