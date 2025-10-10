import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getCompletionPercentage } from '@/lib/utils';

interface DailyProgressProps {
  completed: number;
  total: number;
  streak: number;
}

export function DailyProgress({ completed, total, streak }: DailyProgressProps) {
  const completionPercentage = getCompletionPercentage(completed, total);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Today's Journey</h2>
        <span className="text-sm text-neutral-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
          <span className="text-primary font-bold">{completed}/{total}</span>
        </div>
        <div className="flex-1 ml-4">
          <p className="text-sm text-neutral-500 mb-1">Daily Progress</p>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-neutral-500">
            <span>Started</span>
            <span>{completed} sections completed</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-neutral-200 pt-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-amber-500 mr-2">local_fire_department</span>
            <div>
              <p className="text-sm font-medium">Current Streak</p>
              <p className="text-xs text-neutral-500">Keep going!</p>
            </div>
          </div>
          <span className="font-bold text-xl">{streak}</span>
        </div>
      </div>
    </div>
  );
}
