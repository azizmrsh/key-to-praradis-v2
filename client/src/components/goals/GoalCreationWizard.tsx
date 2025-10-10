import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Book, BookOpen, Star, Crown, Target, Calendar } from 'lucide-react';
import { SinCategory, categoryInfo } from '@/data/selfAssessmentData';
import { GoalTemplate, goalTemplates, getTemplatesByCategory, getTierInfo } from '@/data/goalTemplates';
import { GoalService, GoalCreationData } from '@/lib/goalService';

interface GoalCreationWizardProps {
  activeSinCategories: SinCategory[];
  onGoalCreated: () => void;
}

export function GoalCreationWizard({ activeSinCategories, onGoalCreated }: GoalCreationWizardProps) {
  const [selectedCategory, setSelectedCategory] = useState<SinCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customTarget, setCustomTarget] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [step, setStep] = useState<'category' | 'template' | 'customize' | 'confirm'>('category');

  const availableTemplates = selectedCategory ? getTemplatesByCategory(selectedCategory) : [];

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'behavioral_streak': return <Flame className="h-5 w-5" />;
      case 'content_reflection': return <Book className="h-5 w-5" />;
      case 'reflection': return <BookOpen className="h-5 w-5" />;
      case 'spiritual_milestone': return <Star className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setCustomTarget(template.defaultTarget);
    setCustomDuration(template.defaultDuration || null);
    setStep('customize');
  };

  const handleCreateGoal = () => {
    if (!selectedTemplate || !selectedCategory) return;

    const goalData: GoalCreationData = {
      templateId: selectedTemplate.id,
      category: selectedCategory,
      customTarget: customTarget !== selectedTemplate.defaultTarget ? customTarget : undefined,
      customDuration: customDuration !== selectedTemplate.defaultDuration ? (customDuration || undefined) : undefined
    };

    try {
      GoalService.createGoal(goalData);
      onGoalCreated();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const renderCategoryStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Choose Focus Area</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select one of your active spiritual growth areas for this goal
        </p>
      </div>

      <div className="grid gap-3">
        {activeSinCategories.map(category => (
          <Card 
            key={category}
            className={`cursor-pointer transition-colors ${selectedCategory === category ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{categoryInfo[category].title}</CardTitle>
                {selectedCategory === category && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {categoryInfo[category].description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => setStep('template')} 
          disabled={!selectedCategory}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Choose Goal Type</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a goal template that matches your spiritual growth objectives
        </p>
      </div>

      <Tabs defaultValue="behavioral_streak" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavioral_streak">Streak</TabsTrigger>
          <TabsTrigger value="content_reflection">Content</TabsTrigger>
          <TabsTrigger value="reflection">Journal</TabsTrigger>
          <TabsTrigger value="spiritual_milestone">Milestone</TabsTrigger>
        </TabsList>

        <TabsContent value="behavioral_streak" className="space-y-3">
          {availableTemplates.filter(t => t.type === 'behavioral_streak').map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {getGoalIcon(template.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline" className={`text-${getTierInfo(template.tier).color}-600`}>
                        {getTierInfo(template.tier).name}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content_reflection" className="space-y-3">
          {availableTemplates.filter(t => t.type === 'content_reflection').map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {getGoalIcon(template.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline" className={`text-${getTierInfo(template.tier).color}-600`}>
                        {getTierInfo(template.tier).name}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reflection" className="space-y-3">
          {availableTemplates.filter(t => t.type === 'reflection').map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {getGoalIcon(template.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline" className={`text-${getTierInfo(template.tier).color}-600`}>
                        {getTierInfo(template.tier).name}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="spiritual_milestone" className="space-y-3">
          {availableTemplates.filter(t => t.type === 'spiritual_milestone').map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {getGoalIcon(template.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline" className={`text-${getTierInfo(template.tier).color}-600`}>
                        {getTierInfo(template.tier).name} {template.tier === 4 && <Crown className="h-3 w-3 ml-1" />}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep('category')}>
          Back
        </Button>
      </div>
    </div>
  );

  const renderCustomizeStep = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Customize Your Goal</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust the target and duration to match your preferences
          </p>
        </div>

        {/* Goal Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {getGoalIcon(selectedTemplate.type)}
              <div>
                <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
                <CardDescription className="text-sm">{selectedTemplate.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customization Options */}
        {selectedTemplate.adjustableFields.target && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Target: {customTarget} {selectedTemplate.type === 'behavioral_streak' ? 'days' : 
                      selectedTemplate.type === 'content_reflection' ? 'reflections' : 'entries'}
            </Label>
            <Slider
              value={[customTarget]}
              onValueChange={(value) => setCustomTarget(value[0])}
              min={selectedTemplate.adjustableFields.target.min}
              max={selectedTemplate.adjustableFields.target.max}
              step={selectedTemplate.adjustableFields.target.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{selectedTemplate.adjustableFields.target.min}</span>
              <span>{selectedTemplate.adjustableFields.target.max}</span>
            </div>
          </div>
        )}

        {selectedTemplate.adjustableFields.duration && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duration</Label>
            <Select 
              value={customDuration?.toString() || ''} 
              onValueChange={(value) => setCustomDuration(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {selectedTemplate.adjustableFields.duration.options.map(days => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep('template')}>
            Back
          </Button>
          <Button onClick={() => setStep('confirm')}>
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => {
    if (!selectedTemplate) return null;

    const goalTitle = GoalService.generateGoalTitle(selectedTemplate, selectedCategory, customTarget, customDuration);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Confirm Your Goal</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Review your goal details before creating
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getGoalIcon(selectedTemplate.type)}
              <div className="flex-1">
                <CardTitle className="text-base">{goalTitle}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </div>
              <Badge variant="outline" className={`text-${getTierInfo(selectedTemplate.tier).color}-600`}>
                {getTierInfo(selectedTemplate.tier).name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <div>{categoryInfo[selectedCategory].title}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Target</Label>
                <div>{customTarget} {selectedTemplate.type === 'behavioral_streak' ? 'days' : 
                      selectedTemplate.type === 'content_reflection' ? 'reflections' : 'entries'}</div>
              </div>
              {customDuration && (
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <div>{customDuration} days</div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Tier</Label>
                <div>{getTierInfo(selectedTemplate.tier).name}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Motivational Message:</strong>
          </p>
          <p className="text-sm italic">"{selectedTemplate.motivationalText}"</p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep('customize')}>
            Back
          </Button>
          <Button onClick={handleCreateGoal}>
            Create Goal
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'category' && renderCategoryStep()}
      {step === 'template' && renderTemplateStep()}
      {step === 'customize' && renderCustomizeStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
}