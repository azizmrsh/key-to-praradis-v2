import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Lock, ClipboardCheck } from 'lucide-react';

interface WelcomeIntroductionProps {
  onStartQuestionnaire: () => void;
  onSkipToManualSelection: () => void;
}

export function WelcomeIntroduction({ 
  onStartQuestionnaire, 
  onSkipToManualSelection 
}: WelcomeIntroductionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <Card className="border-primary/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Self-Assessment
          </CardTitle>
          <CardDescription className="text-center pt-2">
            A personal journey to identify areas for spiritual growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  Purpose
                </h3>
                <p className="text-sm text-muted-foreground">
                  This assessment will help identify specific spiritual challenges you may face,
                  allowing the app to provide personalized guidance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  Complete Privacy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your responses are stored only on your device and never transmitted elsewhere. 
                  This is a private conversation between you and your soul.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  Choose Your Path
                </h3>
                <p className="text-sm text-muted-foreground">
                  You can take a guided assessment with questions, or directly select the areas you wish to focus on.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            onClick={onStartQuestionnaire}
            className="w-full"
          >
            Start Assessment
          </Button>
          <Button 
            variant="outline" 
            onClick={onSkipToManualSelection}
            className="w-full"
          >
            Skip to Manual Selection
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}