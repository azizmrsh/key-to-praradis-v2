import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Challenge } from '@shared/schema';
import { useUser } from '@/contexts/UserContext';

interface DailyChallengeProps {
  challenge: Challenge;
  onAccept: (challengeId: number) => void;
}

export function DailyChallenge({ challenge, onAccept }: DailyChallengeProps) {
  const { userProgress } = useUser();
  const { t } = useTranslation();
  const isAccepted = userProgress?.activeChallenges?.includes(challenge.id);

  return (
    <div className="mt-6 mb-4">
      <h2 className="text-lg font-semibold mb-3">{t('dailyChallenge.todaysChallenge')}</h2>
      <div className="bg-gradient-to-r from-amber-600 to-amber-400 p-4 rounded-lg shadow-md text-white">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="font-medium mb-2">{challenge.title}</h3>
            <p className="text-sm opacity-90 mb-3">{challenge.description}</p>
            <div className="flex items-center">
              <span className="material-icons text-sm mr-1">timer</span>
              <span className="text-xs">{challenge.duration}</span>
            </div>
          </div>
          <span className="material-icons text-3xl">{challenge.icon}</span>
        </div>
        <Button
          onClick={() => onAccept(challenge.id)}
          disabled={isAccepted}
          className="mt-4 bg-white text-amber-500 hover:bg-white/90 font-medium rounded-full text-sm py-2 px-4"
        >
          {isAccepted ? t('dailyChallenge.challengeAccepted') : t('dailyChallenge.acceptChallenge')}
        </Button>
      </div>
    </div>
  );
}
