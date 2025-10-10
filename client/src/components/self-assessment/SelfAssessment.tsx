import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelfAssessment as SelfAssessmentType } from '@shared/schema';

interface SelfAssessmentProps {
  initialData?: SelfAssessmentType;
  onComplete: (assessment: SelfAssessmentType) => void;
}

export function SelfAssessment({ initialData, onComplete }: SelfAssessmentProps) {
  const [, navigate] = useLocation();
  const [assessment, setAssessment] = useState<SelfAssessmentType>(initialData || {
    areas: [],
    reflectionFrequency: '',
    preferredTime: '',
    struggles: [],
    strengths: [],
    goals: []
  });

  const areas = [
    { id: 'tongue', label: 'Speech and conversations (tongue)' },
    { id: 'eyes', label: 'What I look at (eyes)' },
    { id: 'ears', label: 'What I listen to (ears)' },
    { id: 'pride', label: 'Pride and arrogance (nose)' },
    { id: 'stomach', label: 'Eating and consumption (stomach)' },
    { id: 'chastity', label: 'Chastity and modesty' },
    { id: 'heart', label: 'Heart-related issues (envy, malice, etc.)' }
  ];

  const speechQuestions = [
    { id: 'gossip', label: 'How often do you find yourself engaging in or listening to gossip?' },
    { id: 'backbiting', label: 'Do you speak about others in their absence?' },
    { id: 'lying', label: 'How often do you catch yourself being less than truthful?' },
    { id: 'mockery', label: 'Do you engage in mockery or ridicule of others?' },
    { id: 'arguments', label: 'How frequently do you get into heated arguments?' },
    { id: 'vulgarity', label: 'Do you use inappropriate or offensive language?' },
    { id: 'excessive', label: 'Do you engage in excessive or pointless talk?' },
    { id: 'boasting', label: 'How often do you boast about yourself?' },
    { id: 'slander', label: 'Have you spread unverified information about others?' },
    { id: 'harsh', label: 'Do you speak harshly or rudely to others?' }
  ];

  const answerOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'very_often', label: 'Very Often' }
  ];

  const reflectionOptions = [
    { id: 'daily', label: 'Daily' },
    { id: 'few-times', label: 'A few times per week' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'rarely', label: 'Rarely' },
    { id: 'new', label: 'This is new to me' }
  ];

  const timeOptions = [
    { value: 'fajr', label: 'Early morning (Fajr to Sunrise)' },
    { value: 'morning', label: 'Morning (After Sunrise)' },
    { value: 'afternoon', label: 'Afternoon (Dhuhr to Asr)' },
    { value: 'evening', label: 'Evening (Maghrib to Isha)' },
    { value: 'night', label: 'Late night (After Isha)' }
  ];

  const handleAreaToggle = (areaId: string) => {
    setAssessment(prev => {
      const areas = [...prev.areas];
      if (areas.includes(areaId)) {
        return { ...prev, areas: areas.filter(id => id !== areaId) };
      } else {
        return { ...prev, areas: [...areas, areaId] };
      }
    });
  };

  const handleReflectionChange = (value: string) => {
    setAssessment(prev => ({ ...prev, reflectionFrequency: value }));
  };

  const handleTimeChange = (value: string) => {
    setAssessment(prev => ({ ...prev, preferredTime: value }));
  };

  const handleSubmit = () => {
    const speechData = speechQuestions.reduce((acc, question) => ({
      ...acc,
      [question.id]: assessment[`speech_${question.id}`] || 'never'
    }), {});
    
    onComplete({
      ...assessment,
      speechAssessment: speechData
    });
    navigate('/content-dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
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
          <h2 className="text-xl font-semibold">Self-Assessment</h2>
        </div>
        <p className="opacity-90">Personalize your journey by reflecting honestly</p>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-medium mb-3">Your Spiritual Journey</h3>
          <p className="text-neutral-700 mb-4">
            Answer these questions to help us create a personalized plan for your growth. 
            Your answers remain private on your device.
          </p>
          
          <div className="space-y-5">
            <div>
              <h4 className="font-medium mb-2">Which areas are you most concerned about?</h4>
              <div className="space-y-2">
                {areas.map(area => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={area.id}
                      checked={assessment.areas.includes(area.id)}
                      onCheckedChange={() => handleAreaToggle(area.id)}
                    />
                    <Label htmlFor={area.id}>{area.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">How often do you engage in self-reflection?</h4>
              <RadioGroup 
                value={assessment.reflectionFrequency} 
                onValueChange={handleReflectionChange}
              >
                {reflectionOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {assessment.areas.includes('tongue') && (
              <div className="mb-6">
                <h4 className="font-medium mb-4">Speech Assessment</h4>
                <div className="space-y-4">
                  {speechQuestions.map((question) => (
                    <div key={question.id} className="bg-slate-50 p-4 rounded-lg">
                      <p className="mb-2">{question.label}</p>
                      <RadioGroup 
                        value={assessment[`speech_${question.id}`] || ''}
                        onValueChange={(value) => setAssessment(prev => ({
                          ...prev,
                          [`speech_${question.id}`]: value
                        }))}
                        className="flex gap-4"
                      >
                        {answerOptions.map(option => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} />
                            <Label htmlFor={`${question.id}_${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">What time of day do you prefer for learning?</h4>
              <Select value={assessment.preferredTime} onValueChange={handleTimeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
              style={{ backgroundColor: '#dc2626' }}
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
