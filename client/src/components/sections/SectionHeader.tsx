import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getCompletionPercentage } from '@/lib/utils';
import { Section } from '@shared/schema';

interface SectionHeaderProps {
  section: Section;
  completedLessons: number;
  totalLessons: number;
}

export function SectionHeader({ section, completedLessons, totalLessons }: SectionHeaderProps) {
  const [, navigate] = useLocation();
  const completionPercentage = getCompletionPercentage(completedLessons, totalLessons);

  return (
    <div className="pattern-bg px-4 py-6 text-white">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10 mr-2 p-0"
          onClick={() => navigate('/content-dashboard')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-semibold">{section.title}</h2>
      </div>
      <p className="opacity-90">{section.description}</p>
      <div className="flex mt-4 items-center">
        <div className="h-1 bg-white/40 rounded-full flex-1">
          <div 
            className="h-1 bg-white rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span className="text-sm ml-2">{completedLessons}/{totalLessons} completed</span>
      </div>
    </div>
  );
}
