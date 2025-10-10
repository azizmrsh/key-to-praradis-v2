import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelfAssessmentResult, SinCategory, categoryInfo, SelfAssessmentGoal } from '@/data/selfAssessmentData';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { motion } from 'framer-motion';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Target, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimePicker, TimeValue } from '@/components/ui/time-picker';
import { useTranslation } from 'react-i18next';

const durationOptions = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
  { value: 40, label: '40 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' }
];

interface AssessmentResultsProps {
  onComplete: () => void;
}

export function AssessmentResults({ onComplete }: AssessmentResultsProps) {
  const { results, saveGoal } = useSelfAssessment();
  const { t } = useTranslation();
  
  const [focusCategory, setFocusCategory] = useState<SinCategory | null>(
    results ? results.primaryStruggle : null
  );
  
  const [durationDays, setDurationDays] = useState<number>(40); // Default to 40 days
  const [enableReminders, setEnableReminders] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<TimeValue>({ hours: 8, minutes: 0 }); // Default to 8:00 AM
  
  // For chart data
  const chartData = results ? 
    Object.keys(results.categoryScores).map(category => {
      const averageScore = results.answeredQuestions[category as SinCategory] > 0 
        ? results.categoryScores[category as SinCategory] / results.answeredQuestions[category as SinCategory]
        : 0;
      
      return {
        category: t(`sinCategories.${category}.name`),
        score: parseFloat(averageScore.toFixed(1)),
        fullName: t(`sinCategories.${category}.name`)
      };
    }) : [];
  
  // Sort by score in descending order
  chartData.sort((a, b) => b.score - a.score);
  
  // Handle goal saving
  const handleSaveGoal = () => {
    if (focusCategory && results) {
      const timeString = `${reminderTime.hours.toString().padStart(2, '0')}:${reminderTime.minutes.toString().padStart(2, '0')}`;
      
      const goal: SelfAssessmentGoal = {
        sinCategory: focusCategory,
        durationDays,
        startDate: new Date(),
        reminder: enableReminders,
        reminderTime: enableReminders ? timeString : undefined
      };
      
      saveGoal(goal);
      onComplete();
    }
  };
  
  if (!results) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {t('assessment.results.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('assessment.results.subtitle')}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Results Chart */}
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">{t('assessment.results.chartTitle')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value, name, props) => [`${value}/5`, props.payload.fullName]}
                    labelFormatter={(value) => `Category: ${value}`}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="var(--primary)" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('assessment.results.chartNote')}
            </p>
          </div>
          
          {/* Primary and Secondary Struggles */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="bg-primary/10 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{t('assessment.results.primaryFocus')}</h3>
              </div>
              <p className="font-bold text-lg mt-1">
                {t(`sinCategories.${results.primaryStruggle}.name`)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`sinCategories.${results.primaryStruggle}.description`)}
              </p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 opacity-70" />
                <h3 className="font-medium">{t('assessment.results.secondaryFocus')}</h3>
              </div>
              <p className="font-bold text-lg mt-1">
                {t(`sinCategories.${results.secondaryStruggle}.name`)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`sinCategories.${results.secondaryStruggle}.description`)}
              </p>
            </div>
          </div>
          
          {/* Goal Setting */}
          <div className="border rounded-md p-4 mt-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('assessment.results.setGoalTitle')}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('assessment.results.focusAreaLabel')}</label>
                <Select
                  value={focusCategory || undefined}
                  onValueChange={(value) => setFocusCategory(value as SinCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('assessment.results.focusAreaPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={results.primaryStruggle}>
                      {t(`sinCategories.${results.primaryStruggle}.name`)} ({t('assessment.results.recommended')})
                    </SelectItem>
                    {results.secondaryStruggle !== results.primaryStruggle && (
                      <SelectItem value={results.secondaryStruggle}>
                        {t(`sinCategories.${results.secondaryStruggle}.name`)}
                      </SelectItem>
                    )}
                    {Object.keys(categoryInfo)
                      .filter(key => key !== results.primaryStruggle && key !== results.secondaryStruggle)
                      .map(key => (
                        <SelectItem key={key} value={key}>
                          {t(`sinCategories.${key}.name`)}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('assessment.results.durationLabel')}
                </label>
                <Select
                  value={durationDays.toString()}
                  onValueChange={(value) => setDurationDays(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('assessment.results.durationPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('assessment.results.durationNote', { days: durationDays })}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-toggle" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('assessment.results.remindersLabel')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('assessment.results.remindersNote')}
                    </p>
                  </div>
                  <Switch 
                    id="reminder-toggle"
                    checked={enableReminders}
                    onCheckedChange={setEnableReminders}
                  />
                </div>
                
                {enableReminders && (
                  <div className="pt-2">
                    <Label htmlFor="reminder-time" className="text-sm font-medium mb-1 block">
                      {t('assessment.results.reminderTimeLabel')}
                    </Label>
                    <TimePicker
                      value={reminderTime}
                      onChange={setReminderTime}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="flex items-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3" />
              {t('assessment.results.completedOn', { date: format(results.completedAt, 'MMMM d, yyyy') })}
            </p>
            <p>
              {t('assessment.results.retakeNote')}
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            onClick={handleSaveGoal}
            disabled={!focusCategory}
            className="w-full flex items-center gap-1"
          >
            {t('assessment.results.beginJourney')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}