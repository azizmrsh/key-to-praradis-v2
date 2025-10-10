import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, CheckCircle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'improvement' | 'consistency';
  value?: number;
  unlockedAt: Date;
}

interface MilestoneCelebrationProps {
  milestones: Milestone[];
  onDismiss: (milestoneId: string) => void;
}

export function MilestoneCelebration({ milestones, onDismiss }: MilestoneCelebrationProps) {
  if (milestones.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'streak': return <Zap className="h-8 w-8 text-yellow-500" />;
      case 'improvement': return <Star className="h-8 w-8 text-blue-500" />;
      case 'consistency': return <Trophy className="h-8 w-8 text-green-500" />;
      default: return <Trophy className="h-8 w-8 text-gray-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'streak': return 'bg-yellow-100 text-yellow-800';
      case 'improvement': return 'bg-blue-100 text-blue-800';
      case 'consistency': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            🎉 Milestone{milestones.length > 1 ? 's' : ''} Unlocked!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.slice(0, 3).map((milestone) => (
            <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getIcon(milestone.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{milestone.title}</h4>
                  <Badge className={`text-xs ${getBadgeColor(milestone.type)}`}>
                    {milestone.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                {milestone.value && (
                  <div className="text-xs text-gray-500 mt-1">
                    Value: {milestone.value}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {milestones.length > 3 && (
            <div className="text-center text-sm text-gray-600">
              +{milestones.length - 3} more milestone{milestones.length - 3 > 1 ? 's' : ''}
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={() => milestones.forEach(m => onDismiss(m.id))}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue Your Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}