import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';

// Define the Practice interface
export interface Practice {
  id: number;
  name: string;
  description: string;
  category: 'daily' | 'weekly' | 'occasional';
  source: string; // Quranic verse, hadith, etc.
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// Sample prophetic practices data
export const propheticPractices: Practice[] = [
  {
    id: 1,
    name: 'Morning Adhkar',
    description: 'Reciting the morning remembrances after Fajr prayer',
    category: 'daily',
    source: 'Sahih Muslim',
    difficulty: 'easy',
    tags: ['adhkar', 'morning']
  },
  {
    id: 2,
    name: 'Evening Adhkar',
    description: 'Reciting the evening remembrances after Asr prayer',
    category: 'daily',
    source: 'Sahih Muslim',
    difficulty: 'easy',
    tags: ['adhkar', 'evening']
  },
  {
    id: 3,
    name: 'Duha Prayer',
    description: 'Voluntary prayer performed in the mid-morning',
    category: 'daily',
    source: 'Sahih Bukhari',
    difficulty: 'medium',
    tags: ['prayer', 'voluntary']
  },
  {
    id: 4,
    name: 'Tahajjud Prayer',
    description: 'Night prayer performed after waking from sleep',
    category: 'daily',
    source: 'Sahih Bukhari, Sahih Muslim',
    difficulty: 'hard',
    tags: ['prayer', 'night']
  },
  {
    id: 5,
    name: 'Fasting Mondays and Thursdays',
    description: 'Voluntary fasting on Mondays and Thursdays',
    category: 'weekly',
    source: 'Sunan an-Nasa\'i',
    difficulty: 'medium',
    tags: ['fasting', 'voluntary']
  },
  {
    id: 6,
    name: 'Reading Surah Al-Kahf on Friday',
    description: 'Reading Surah Al-Kahf (Chapter 18) on Fridays',
    category: 'weekly',
    source: 'Sahih Muslim',
    difficulty: 'easy',
    tags: ['quran', 'friday']
  },
  {
    id: 7,
    name: 'Visiting the Sick',
    description: 'Visiting and comforting those who are ill',
    category: 'occasional',
    source: 'Sahih Bukhari',
    difficulty: 'medium',
    tags: ['social', 'charity']
  },
  {
    id: 8,
    name: 'Giving Charity',
    description: 'Giving voluntary charity beyond obligatory zakat',
    category: 'occasional',
    source: 'Multiple Hadith Collections',
    difficulty: 'medium',
    tags: ['charity', 'financial']
  }
];

interface PracticesChecklistProps {
  onComplete?: (practiceId: number) => void;
}

export function PracticesChecklist({ onComplete }: PracticesChecklistProps) {
  const { userProgress, updateUserProgress } = useUser();
  const [completedPractices, setCompletedPractices] = useState<number[]>(
    userProgress?.completedPractices || []
  );

  const handleTogglePractice = (practiceId: number) => {
    let updatedPractices: number[];
    
    if (completedPractices.includes(practiceId)) {
      updatedPractices = completedPractices.filter(id => id !== practiceId);
    } else {
      updatedPractices = [...completedPractices, practiceId];
      if (onComplete) {
        onComplete(practiceId);
      }
    }
    
    setCompletedPractices(updatedPractices);
    
    // Update user progress in the context/store
    updateUserProgress({
      completedPractices: updatedPractices,
      lastActivity: new Date()
    });
  };

  // Filter practices by category
  const dailyPractices = propheticPractices.filter(p => p.category === 'daily');
  const weeklyPractices = propheticPractices.filter(p => p.category === 'weekly');
  const occasionalPractices = propheticPractices.filter(p => p.category === 'occasional');

  const calculateProgress = (practices: Practice[]) => {
    if (practices.length === 0) return 0;
    const completed = practices.filter(p => completedPractices.includes(p.id)).length;
    return Math.round((completed / practices.length) * 100);
  };

  const renderPracticeList = (practices: Practice[]) => {
    return (
      <div className="space-y-3">
        {practices.map(practice => (
          <Card key={practice.id} className="relative overflow-hidden">
            {completedPractices.includes(practice.id) && (
              <div className="absolute top-0 right-0">
                <Badge className="bg-green-500 text-white">Completed</Badge>
              </div>
            )}
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id={`practice-${practice.id}`}
                  checked={completedPractices.includes(practice.id)}
                  onCheckedChange={() => handleTogglePractice(practice.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <label 
                      htmlFor={`practice-${practice.id}`}
                      className="font-medium cursor-pointer text-base"
                    >
                      {practice.name}
                    </label>
                    <Badge className="ml-2" variant="outline">{practice.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">Source: {practice.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="practices-checklist">
      <h2 className="text-xl font-semibold mb-4">Prophetic Practices</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm">
          <span className="font-medium">{completedPractices.length}</span> of <span className="font-medium">{propheticPractices.length}</span> practices completed
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCompletedPractices([])}
        >
          Reset All
        </Button>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="daily">
            Daily ({calculateProgress(dailyPractices)}%)
          </TabsTrigger>
          <TabsTrigger value="weekly">
            Weekly ({calculateProgress(weeklyPractices)}%)
          </TabsTrigger>
          <TabsTrigger value="occasional">
            Occasional
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          {renderPracticeList(dailyPractices)}
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          {renderPracticeList(weeklyPractices)}
        </TabsContent>
        
        <TabsContent value="occasional" className="space-y-4">
          {renderPracticeList(occasionalPractices)}
        </TabsContent>
      </Tabs>
    </div>
  );
}