import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface BreathingExerciseProps {
  duration?: number; // Duration in seconds
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_DURATIONS = {
  inhale: 4,
  hold: 4, 
  exhale: 6,
  rest: 2
};

export function BreathingExercise({ duration = 60 }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  const resetExercise = () => {
    setIsActive(false);
    setTimeRemaining(duration);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setCycleCount(0);
  };
  
  const toggleExercise = () => {
    setIsActive(!isActive);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      // Main timer for the whole exercise
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      // Phase timer that updates more frequently for smooth animation
      let phaseDuration = PHASE_DURATIONS[currentPhase];
      let elapsedTime = 0;
      
      intervalId = setInterval(() => {
        elapsedTime += 0.1;
        const progress = Math.min((elapsedTime / phaseDuration) * 100, 100);
        setPhaseProgress(progress);
        
        // Move to next phase when current phase is complete
        if (elapsedTime >= phaseDuration) {
          elapsedTime = 0;
          
          // Transition to the next phase
          if (currentPhase === 'inhale') {
            setCurrentPhase('hold');
          } else if (currentPhase === 'hold') {
            setCurrentPhase('exhale');
          } else if (currentPhase === 'exhale') {
            setCurrentPhase('rest');
          } else {
            setCurrentPhase('inhale');
            setCycleCount(prev => prev + 1);
          }
        }
      }, 100);
    }
    
    // Exercise complete
    if (timeRemaining === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, timeRemaining, currentPhase]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Get instruction based on current phase
  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe in slowly...';
      case 'hold':
        return 'Hold your breath...';
      case 'exhale':
        return 'Exhale slowly...';
      case 'rest':
        return 'Rest...';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Breathing Exercise</h3>
      
      <div className="flex flex-col items-center justify-center mb-6">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4 transition-all duration-500 ${
          currentPhase === 'inhale' ? 'border-blue-500 scale-110' :
          currentPhase === 'hold' ? 'border-green-500' :
          currentPhase === 'exhale' ? 'border-indigo-500 scale-90' :
          'border-slate-300'
        }`}>
          <span className="text-2xl font-semibold">
            {isActive ? getPhaseInstruction() : 'Ready'}
          </span>
        </div>
        
        <Progress value={phaseProgress} className="h-2 w-full max-w-xs mb-2" />
        
        <div className="flex justify-between w-full max-w-xs text-sm text-muted-foreground mb-4">
          <span>Cycles: {cycleCount}</span>
          <span>Time: {formatTime(timeRemaining)}</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        <Button
          variant={isActive ? "secondary" : "default"}
          onClick={toggleExercise}
          className="w-24"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" /> Start
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetExercise} 
          disabled={isActive && timeRemaining > 0}
          className="w-24"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}