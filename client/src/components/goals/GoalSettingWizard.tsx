import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronLeft, ChevronRight, CloudLightning, Edit, Target } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// Temporarily removed problematic imports
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GoalSettingWizardProps {
  preSelectedCategory?: SinCategory;
  onComplete?: () => void;
}

type StepType = 'category' | 'templates' | 'details' | 'timeframe' | 'reminders' | 'summary';

type GoalType = 'habit_formation' | 'avoidance' | 'spiritual_practice';
type GoalFrequency = 'daily' | 'weekly' | 'monthly';
type GoalDifficulty = 'easy' | 'medium' | 'hard';

interface GoalFormData {
  title: string;
  description: string;
  category: SinCategory;
  type: GoalType;
  frequency: GoalFrequency;
  difficulty: GoalDifficulty;
  startDate: Date;
  durationDays: number;
  reminders: boolean;
  reminderTime?: string;
}

export function GoalSettingWizard({ preSelectedCategory, onComplete }: GoalSettingWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepType>(preSelectedCategory ? 'templates' : 'category');
  const [goalData, setGoalData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: preSelectedCategory || 'tongue',
    type: 'habit_formation',
    frequency: 'daily',
    difficulty: 'medium',
    startDate: new Date(),
    durationDays: 21,
    reminders: false
  });
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get goal suggestions based on the selected category
  const goalSuggestions = getGoalSuggestions(goalData.category);
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 'category') setCurrentStep('templates');
    else if (currentStep === 'templates') setCurrentStep('details');
    else if (currentStep === 'details') setCurrentStep('timeframe');
    else if (currentStep === 'timeframe') setCurrentStep('reminders');
    else if (currentStep === 'reminders') setCurrentStep('summary');
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep === 'templates') setCurrentStep(preSelectedCategory ? 'templates' : 'category');
    else if (currentStep === 'details') setCurrentStep('templates');
    else if (currentStep === 'timeframe') setCurrentStep('details');
    else if (currentStep === 'reminders') setCurrentStep('timeframe');
    else if (currentStep === 'summary') setCurrentStep('reminders');
  };
  
  // Handle create goal
  const handleCreateGoal = () => {
    try {
      const startDateStr = goalData.startDate.toISOString();
      
      // Create the goal
      createGoal({
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        type: goalData.type,
        frequency: goalData.frequency,
        difficulty: goalData.difficulty,
        startDate: startDateStr,
        durationDays: goalData.durationDays,
        reminders: goalData.reminders,
        reminderTime: goalData.reminderTime
      });
      
      // Show success toast
      toast({
        title: "Goal created successfully",
        description: "Your spiritual goal has been set up and is ready to track.",
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Navigate to goals page
        setLocation('/goals');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      
      // Show error toast
      toast({
        title: "Error creating goal",
        description: "There was a problem creating your goal. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Check if the form is valid for the current step
  const isStepValid = () => {
    if (currentStep === 'category') {
      return !!goalData.category;
    }
    
    if (currentStep === 'templates') {
      return !!goalData.title;
    }
    
    if (currentStep === 'details') {
      return !!goalData.title && !!goalData.description && goalData.description.length >= 10;
    }
    
    if (currentStep === 'timeframe') {
      return !!goalData.startDate && goalData.durationDays > 0;
    }
    
    return true;
  };
  
  // Handle selecting a goal template
  const handleSelectTemplate = (template: any) => {
    setGoalData({
      ...goalData,
      title: template.title,
      description: template.description,
      type: template.type,
      frequency: template.frequency,
      difficulty: template.difficulty,
      durationDays: template.durationDays
    });
  };
  
  // Render step indicator
  const renderStepIndicator = () => {
    const steps: StepType[] = preSelectedCategory 
      ? ['templates', 'details', 'timeframe', 'reminders', 'summary']
      : ['category', 'templates', 'details', 'timeframe', 'reminders', 'summary'];
    
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div 
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                index < currentIndex 
                  ? "bg-primary text-primary-foreground" 
                  : index === currentIndex 
                    ? "bg-primary/90 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentIndex ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "flex-1 h-1 mx-2",
                  index < currentIndex 
                    ? "bg-primary" 
                    : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Render category selection step
  const renderCategoryStep = () => {
    return (
      <>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select Focus Area</h2>
          <p className="text-muted-foreground">
            Choose the spiritual area you want to focus on improving
          </p>
          
          <RadioGroup 
            value={goalData.category} 
            onValueChange={(value) => setGoalData({...goalData, category: value as SinCategory})}
            className="grid gap-4 md:grid-cols-2"
          >
            {Object.entries(categoryInfo).map(([key, info]) => (
              <div key={key} className="flex">
                <RadioGroupItem 
                  value={key} 
                  id={`category-${key}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`category-${key}`}
                  className="flex flex-col items-center justify-between p-4 border rounded-md bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer w-full"
                >
                  <div className="text-center">
                    <h3 className="font-medium">{info.title}</h3>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </>
    );
  };
  
  // Render template selection step
  const renderTemplatesStep = () => {
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Choose a Goal Template</h2>
              <p className="text-muted-foreground">
                Select a pre-defined goal or create your own
              </p>
            </div>
            
            <Badge variant="outline" className="capitalize">
              {categoryInfo[goalData.category]?.title || goalData.category}
            </Badge>
          </div>
          
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="custom">Custom Goal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggestions" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {goalSuggestions.map((template, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex flex-col border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent",
                      goalData.title === template.title ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex-grow">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {getGoalTypeLabel(template.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getGoalDifficultyLabel(template.difficulty)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getGoalFrequencyLabel(template.frequency)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-title">Goal Title</Label>
                  <Input 
                    id="custom-title" 
                    placeholder="Enter a clear, specific goal title"
                    value={goalData.title}
                    onChange={(e) => setGoalData({...goalData, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-description">Goal Description</Label>
                  <Textarea 
                    id="custom-description" 
                    placeholder="Describe your goal in detail, including specific actions and desired outcomes"
                    value={goalData.description}
                    onChange={(e) => setGoalData({...goalData, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-type">Goal Type</Label>
                    <Select 
                      value={goalData.type}
                      onValueChange={(value) => setGoalData({...goalData, type: value as GoalType})}
                    >
                      <SelectTrigger id="goal-type">
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GoalType.HABIT_FORMATION}>Habit Formation</SelectItem>
                        <SelectItem value={GoalType.HABIT_BREAKING}>Habit Breaking</SelectItem>
                        <SelectItem value={GoalType.LEARNING}>Learning</SelectItem>
                        <SelectItem value={GoalType.REFLECTION}>Reflection</SelectItem>
                        <SelectItem value={GoalType.ACTION}>Action</SelectItem>
                        <SelectItem value={GoalType.WORSHIP}>Worship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-frequency">Frequency</Label>
                    <Select 
                      value={goalData.frequency}
                      onValueChange={(value) => setGoalData({...goalData, frequency: value as GoalFrequency})}
                    >
                      <SelectTrigger id="goal-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GoalFrequency.DAILY}>Daily</SelectItem>
                        <SelectItem value={GoalFrequency.WEEKLY}>Weekly</SelectItem>
                        <SelectItem value={GoalFrequency.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={GoalFrequency.ONCE}>One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal-difficulty">Difficulty Level</Label>
                  <RadioGroup 
                    value={goalData.difficulty} 
                    onValueChange={(value) => setGoalData({...goalData, difficulty: value as GoalDifficulty})}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={GoalDifficulty.EASY} id="difficulty-easy" />
                      <Label htmlFor="difficulty-easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={GoalDifficulty.MEDIUM} id="difficulty-medium" />
                      <Label htmlFor="difficulty-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={GoalDifficulty.HARD} id="difficulty-hard" />
                      <Label htmlFor="difficulty-hard">Hard</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  };
  
  // Render goal details step
  const renderDetailsStep = () => {
    return (
      <>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Goal Details</h2>
          <p className="text-muted-foreground">
            Make any necessary adjustments to your goal
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input 
              id="goal-title" 
              placeholder="Enter a clear, specific goal title"
              value={goalData.title}
              onChange={(e) => setGoalData({...goalData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal-description">Goal Description</Label>
            <Textarea 
              id="goal-description" 
              placeholder="Describe your goal in detail, including specific actions and desired outcomes"
              value={goalData.description}
              onChange={(e) => setGoalData({...goalData, description: e.target.value})}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {goalData.description.length} characters 
              (min. 10)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select 
                value={goalData.type}
                onValueChange={(value) => setGoalData({...goalData, type: value as GoalType})}
              >
                <SelectTrigger id="goal-type">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GoalType.HABIT_FORMATION}>Habit Formation</SelectItem>
                  <SelectItem value={GoalType.HABIT_BREAKING}>Habit Breaking</SelectItem>
                  <SelectItem value={GoalType.LEARNING}>Learning</SelectItem>
                  <SelectItem value={GoalType.REFLECTION}>Reflection</SelectItem>
                  <SelectItem value={GoalType.ACTION}>Action</SelectItem>
                  <SelectItem value={GoalType.WORSHIP}>Worship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-frequency">Frequency</Label>
              <Select 
                value={goalData.frequency}
                onValueChange={(value) => setGoalData({...goalData, frequency: value as GoalFrequency})}
              >
                <SelectTrigger id="goal-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GoalFrequency.DAILY}>Daily</SelectItem>
                  <SelectItem value={GoalFrequency.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={GoalFrequency.MONTHLY}>Monthly</SelectItem>
                  <SelectItem value={GoalFrequency.ONCE}>One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal-difficulty">Difficulty Level</Label>
            <RadioGroup 
              value={goalData.difficulty} 
              onValueChange={(value) => setGoalData({...goalData, difficulty: value as GoalDifficulty})}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={GoalDifficulty.EASY} id="difficulty-easy" />
                <Label htmlFor="difficulty-easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={GoalDifficulty.MEDIUM} id="difficulty-medium" />
                <Label htmlFor="difficulty-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={GoalDifficulty.HARD} id="difficulty-hard" />
                <Label htmlFor="difficulty-hard">Hard</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </>
    );
  };
  
  // Render timeframe step
  const renderTimeframeStep = () => {
    return (
      <>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Set Goal Timeframe</h2>
          <p className="text-muted-foreground">
            Choose when to start and how long your goal will last
          </p>
          
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !goalData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {goalData.startDate ? (
                    format(goalData.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={goalData.startDate}
                  onSelect={(date) => setGoalData({ ...goalData, startDate: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {goalData.startDate && format(goalData.startDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal-duration">Duration</Label>
            <Select 
              value={goalData.durationDays.toString()}
              onValueChange={(value) => setGoalData({...goalData, durationDays: parseInt(value)})}
            >
              <SelectTrigger id="goal-duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {goalData.startDate && goalData.durationDays && (
              <p className="text-xs text-muted-foreground">
                End date: {format(addDays(goalData.startDate, goalData.durationDays), "EEEE, MMMM d, yyyy")}
              </p>
            )}
          </div>
          
          <div className="pt-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Duration Tips</p>
                    <p className="text-sm text-muted-foreground">Based on research and tradition</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <Target className="h-3 w-3" />
                    </span>
                    <span>21 days is often needed to begin forming a new habit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <Target className="h-3 w-3" />
                    </span>
                    <span>40 days is a traditional spiritual period in many traditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <Target className="h-3 w-3" />
                    </span>
                    <span>90 days may be needed for more difficult goals or lasting change</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  };
  
  // Render reminders step
  const renderRemindersStep = () => {
    return (
      <>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Goal Reminders</h2>
          <p className="text-muted-foreground">
            Set up reminders to help you stay on track with your goal
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminders">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications to remind you about your goal
              </p>
            </div>
            <Switch
              id="reminders"
              checked={goalData.reminders}
              onCheckedChange={(checked) => setGoalData({...goalData, reminders: checked})}
            />
          </div>
          
          {goalData.reminders && (
            <div className="pt-4 space-y-2">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={goalData.reminderTime || "08:00"}
                onChange={(e) => setGoalData({...goalData, reminderTime: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Choose a time when you'll be available to work on your goal
              </p>
            </div>
          )}
          
          <div className="pt-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reminder Tips</p>
                    <p className="text-sm text-muted-foreground">Make the most of your reminders</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <CloudLightning className="h-3 w-3" />
                    </span>
                    <span>Set reminders for times when you typically face temptation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <CloudLightning className="h-3 w-3" />
                    </span>
                    <span>Morning reminders help set intentions for the day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/10 p-1 text-primary">
                      <CloudLightning className="h-3 w-3" />
                    </span>
                    <span>Evening reminders support reflection on daily progress</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  };
  
  // Render summary step
  const renderSummaryStep = () => {
    return (
      <>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Your Goal</h2>
          <p className="text-muted-foreground">
            Confirm your goal details before saving
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{goalData.title}</span>
                <Badge variant="outline" className="capitalize ml-2">
                  {goalData.category}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                  {goalData.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getGoalTypeLabel(goalData.type)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Frequency</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getGoalFrequencyLabel(goalData.frequency)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Difficulty</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getGoalDifficultyLabel(goalData.difficulty)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Duration</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goalData.durationDays} days
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Start Date</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(goalData.startDate, "MMMM d, yyyy")}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">End Date</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(addDays(goalData.startDate, goalData.durationDays), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Reminders</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {goalData.reminders ? (
                    <>Enabled at {goalData.reminderTime || "8:00 AM"}</>
                  ) : (
                    "Not enabled"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-2">
            <p className="text-sm">
              After saving, you'll be able to track your progress and add milestones 
              to help you achieve this goal.
            </p>
          </div>
        </div>
      </>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'category':
        return renderCategoryStep();
      case 'templates':
        return renderTemplatesStep();
      case 'details':
        return renderDetailsStep();
      case 'timeframe':
        return renderTimeframeStep();
      case 'reminders':
        return renderRemindersStep();
      case 'summary':
        return renderSummaryStep();
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Set a Spiritual Goal</CardTitle>
      </CardHeader>
      
      <CardContent>
        {renderStepIndicator()}
        {renderStepContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {currentStep !== 'category' || !preSelectedCategory ? (
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={currentStep === 'category' && !preSelectedCategory}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        {currentStep !== 'summary' ? (
          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreateGoal}>
            Create Goal
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}