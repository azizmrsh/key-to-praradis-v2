import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionType, ScoreScale, answerOptions } from '@/data/selfAssessmentData';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface QuestionnaireItemProps {
  question: QuestionType;
  currentScore: ScoreScale | undefined;
  totalQuestions: number;
  currentIndex: number;
  onScoreChange: (score: ScoreScale) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  isLastQuestion: boolean;
}

export function QuestionnaireItem({
  question,
  currentScore,
  totalQuestions,
  currentIndex,
  onScoreChange,
  onNext,
  onPrevious,
  onFinish,
  isLastQuestion
}: QuestionnaireItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-1">
              {question.section}
            </span>
          </div>
          <CardTitle className="text-xl">
            {question.text}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {answerOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentScore === option.value ? "default" : "outline"}
                className={`w-full justify-start h-auto py-3 px-4 text-left ${
                  currentScore === option.value ? "border-primary" : ""
                }`}
                onClick={() => onScoreChange(option.value as ScoreScale)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    currentScore === option.value 
                      ? "bg-primary text-primary-foreground" 
                      : "border border-muted-foreground"
                  }`}>
                    {currentScore === option.value && <Check className="h-4 w-4" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={onFinish}
              disabled={!currentScore}
              className="flex items-center gap-1"
            >
              Complete
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!currentScore}
              className="flex items-center gap-1"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-4">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${(currentIndex + 1) / totalQuestions * 100}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}