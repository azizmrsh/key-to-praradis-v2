import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Target,
  Clock,
  Star,
  Trophy,
  Crown,
  Zap
} from 'lucide-react';
import { ChallengeTemplate, getChallengesByCategory, getMicroChallenges, getHabitChallenges, getSeasonalChallenges } from '@/data/challengeRepository';
import { SinCategory } from '@/data/selfAssessmentData';
import { challengeService } from '@/lib/challengeService';

interface ChallengeSelectionProps {
  userCategories: SinCategory[];
  onJoinChallenge: (challengeId: string) => void;
  activeChallengeIds: string[];
}

export function ChallengeSelection({ userCategories, onJoinChallenge, activeChallengeIds }: ChallengeSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<SinCategory | 'all'>(userCategories[0] || 'all');
  
  const categoryTitles: Record<SinCategory | 'all', string> = {
    all: 'All Categories',
    tongue: 'Speech & Words',
    eyes: 'Gaze & Vision', 
    ears: 'Listening & Sound',
    pride: 'Humility & Pride',
    stomach: 'Eating & Consumption',
    zina: 'Purity & Chastity',
    heart: 'Heart & Soul'
  };

  const getDifficultyIcon = (duration: number) => {
    if (duration >= 40) return <Crown className="w-4 h-4 text-purple-600" />;
    if (duration >= 7) return <Trophy className="w-4 h-4 text-blue-600" />;
    return <Zap className="w-4 h-4 text-green-600" />;
  };

  const getDifficultyText = (duration: number) => {
    if (duration >= 40) return 'Mastery';
    if (duration >= 7) return 'Intermediate';
    return 'Beginner';
  };

  const getDifficultyColor = (duration: number) => {
    if (duration >= 40) return 'bg-purple-100 text-purple-800';
    if (duration >= 7) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const ChallengeSelectionCard = ({ challenge }: { challenge: ChallengeTemplate }) => {
    const isActive = activeChallengeIds.includes(challenge.id);
    const isSeasonalActive = challengeService.isSeasonalChallengeActive(challenge);
    
    return (
      <Card className={`transition-all hover:shadow-lg ${isActive ? 'bg-blue-50 border-blue-200' : ''}`}>
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
              {getDifficultyIcon(challenge.duration)}
              <Badge variant="secondary" className={getDifficultyColor(challenge.duration)}>
                {getDifficultyText(challenge.duration)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Challenge Details */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {challenge.duration} day{challenge.duration !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {challenge.completionLogic === 'streak' ? 'Streak' : challenge.completionLogic === 'count' ? 'Count' : 'Time-locked'}
            </span>
            <span className="capitalize">{challenge.type}</span>
          </div>

          {/* Seasonal indicator */}
          {challenge.type === 'seasonal' && (
            <div className={`p-2 rounded-md text-sm ${isSeasonalActive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {isSeasonalActive ? '🌟 Currently Active' : '⏳ Seasonal - Not Currently Active'}
            </div>
          )}

          {/* Motivational Quote Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm italic text-gray-700">"{challenge.motivationalQuote}"</p>
          </div>

          {/* Join Button */}
          <Button 
            onClick={() => onJoinChallenge(challenge.id)}
            disabled={isActive || (challenge.type === 'seasonal' && !isSeasonalActive)}
            className="w-full"
            variant={isActive ? "secondary" : "default"}
          >
            {isActive ? 'Already Joined' : 'Join Challenge'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const getChallengesForTab = (type: 'micro' | 'habit' | 'seasonal' | 'category') => {
    let challenges: ChallengeTemplate[] = [];
    
    switch (type) {
      case 'micro':
        challenges = getMicroChallenges();
        break;
      case 'habit':
        challenges = getHabitChallenges();
        break;
      case 'seasonal':
        challenges = getSeasonalChallenges();
        break;
      case 'category':
        if (selectedCategory === 'all') {
          challenges = [...getMicroChallenges(), ...getHabitChallenges()].filter(c => 
            userCategories.includes(c.sinCategory)
          );
        } else {
          challenges = getChallengesByCategory(selectedCategory);
        }
        break;
    }
    
    return challenges;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Join New Challenges</h2>
        <p className="text-muted-foreground">Choose from our curated collection of spiritual growth challenges</p>
      </div>

      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="category">My Areas</TabsTrigger>
          <TabsTrigger value="micro">1-Day</TabsTrigger>
          <TabsTrigger value="habit">Multi-Day</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All My Areas
            </Button>
            {userCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryTitles[category]}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {getChallengesForTab('category').map(challenge => (
              <ChallengeSelectionCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="micro" className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              1-Day Micro-Challenges
            </h3>
            <p className="text-sm text-muted-foreground">Perfect for building momentum and trying new practices</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {getChallengesForTab('micro').map(challenge => (
              <ChallengeSelectionCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="habit" className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              Multi-Day Habit Challenges
            </h3>
            <p className="text-sm text-muted-foreground">Build lasting spiritual habits with 7-40 day challenges</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {getChallengesForTab('habit').map(challenge => (
              <ChallengeSelectionCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Seasonal Challenges
            </h3>
            <p className="text-sm text-muted-foreground">Special challenges tied to Islamic calendar events</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {getChallengesForTab('seasonal').map(challenge => (
              <ChallengeSelectionCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}