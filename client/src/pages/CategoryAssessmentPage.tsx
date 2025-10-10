import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { ArrowLeft, CheckCircle, Target, BookOpen } from 'lucide-react';

interface CategoryResult {
  category: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  recommendations: string[];
}

export function CategoryAssessmentPage() {
  const [, navigate] = useLocation();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  
  const categories = [
    { id: 'tongue', name: 'Tongue', icon: '👅', color: 'bg-red-50 border-red-200' },
    { id: 'eyes', name: 'Eyes', icon: '👀', color: 'bg-blue-50 border-blue-200' },
    { id: 'ears', name: 'Ears', icon: '👂', color: 'bg-green-50 border-green-200' },
    { id: 'heart', name: 'Heart', icon: '❤️', color: 'bg-pink-50 border-pink-200' },
    { id: 'pride', name: 'Pride', icon: '👑', color: 'bg-purple-50 border-purple-200' },
    { id: 'stomach', name: 'Stomach', icon: '🍽️', color: 'bg-orange-50 border-orange-200' },
    { id: 'zina', name: 'Zina', icon: '🚫', color: 'bg-gray-50 border-gray-200' }
  ];

  const handleCategorySelect = (categoryId: string) => {
    // Redirect to enhanced assessment with category parameter to use all ~20 questions
    navigate(`/enhanced-assessment?category=${categoryId}`);
  };

  const getCategoryQuestions = (categoryId: string) => {
    // Simplified demo questions for each category
    const demoQuestions = [
      { id: `${categoryId}_1`, text: `How often do you struggle with ${categoryId}-related behaviors?` },
      { id: `${categoryId}_2`, text: `Do you feel you have control over your ${categoryId}?` },
      { id: `${categoryId}_3`, text: `How aware are you of triggers related to ${categoryId}?` }
    ];
    return demoQuestions;
  };

  const handleResponse = (value: number) => {
    const categoryQuestions = getCategoryQuestions(selectedCategory!);
    const currentQuestion = categoryQuestions[currentQuestionIndex];
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = () => {
    if (!selectedCategory) return;
    
    const categoryQuestions = getCategoryQuestions(selectedCategory);
    const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);
    const maxScore = categoryQuestions.length * 4; // Assuming 4 is max score per question
    const percentage = (totalScore / maxScore) * 100;
    
    const result: CategoryResult = {
      category: selectedCategory,
      score: Math.round(percentage),
      totalQuestions: categoryQuestions.length,
      completedAt: new Date(),
      recommendations: generateRecommendations(selectedCategory, percentage)
    };
    
    setCategoryResult(result);
    setIsComplete(true);
    
    // Save to localStorage
    const existingResults = JSON.parse(localStorage.getItem('categoryAssessmentResults') || '[]');
    existingResults.push(result);
    localStorage.setItem('categoryAssessmentResults', JSON.stringify(existingResults));
  };

  const generateRecommendations = (category: string, score: number): string[] => {
    const recommendations: Record<string, string[]> = {
      tongue: [
        'Practice daily dhikr to purify speech',
        'Implement a "no gossip" rule in conversations',
        'Learn about Islamic etiquette of speech'
      ],
      eyes: [
        'Practice lowering gaze in public spaces',
        'Limit social media and entertainment consumption',
        'Focus on reading Quran and beneficial content'
      ],
      ears: [
        'Avoid listening to harmful content',
        'Increase listening to Quran recitation',
        'Practice selective listening in conversations'
      ],
      heart: [
        'Increase remembrance of Allah',
        'Practice gratitude daily',
        'Work on intention purification'
      ],
      pride: [
        'Practice humility in daily interactions',
        'Acknowledge Allah\'s role in all successes',
        'Seek forgiveness regularly'
      ],
      stomach: [
        'Practice mindful eating',
        'Increase voluntary fasting',
        'Choose halal and wholesome foods'
      ],
      zina: [
        'Strengthen spiritual practices',
        'Avoid triggering situations',
        'Focus on building righteous relationships'
      ]
    };
    
    return recommendations[category] || [];
  };

  const handleBackToDashboard = () => {
    navigate('/content-dashboard');
  };

  const handleRetakeAssessment = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setResponses({});
    setIsAssessing(false);
    setIsComplete(false);
    setCategoryResult(null);
  };

  if (isComplete && categoryResult) {
    return (
      <div className="min-h-screen bg-background">
        <AssessmentHeader 
          title="Assessment Complete" 
          onBack={handleBackToDashboard}
          language="en"
        />
        
        <Container className="py-6 pb-24">
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">
                  {categoryResult.category.charAt(0).toUpperCase() + categoryResult.category.slice(1)} Assessment Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700">
                      {categoryResult.score}%
                    </div>
                    <div className="text-sm text-green-600">
                      Based on {categoryResult.totalQuestions} questions
                    </div>
                  </div>
                  
                  <Progress value={categoryResult.score} className="h-3" />
                  
                  <div className="text-center text-sm text-gray-600">
                    Completed on {categoryResult.completedAt.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="text-sm text-gray-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={handleRetakeAssessment}
                variant="outline"
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Assess Another Category
              </Button>
              <Button 
                onClick={handleBackToDashboard}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Container>
        
        <BottomNavigation />
      </div>
    );
  }

  if (isAssessing && selectedCategory) {
    const categoryQuestions = getCategoryQuestions(selectedCategory);
    const currentQuestion = categoryQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / categoryQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <AssessmentHeader 
          title={`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Assessment`}
          onBack={() => {
            setIsAssessing(false);
            setSelectedCategory(null);
          }}
          language="en"
        />
        
        <Container className="py-6 pb-24">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of {categoryQuestions.length}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-lg font-medium">
                    {currentQuestion.text}
                  </div>
                  
                  <div className="space-y-3">
                    {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleResponse(index + 1)}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                          </div>
                          <div>{option}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AssessmentHeader 
        title="Category Assessment" 
        onBack={handleBackToDashboard}
        language="en"
      />
      
      <Container className="py-6 pb-24">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Category to Assess</CardTitle>
              <p className="text-sm text-muted-foreground">
                Take a focused assessment on a specific area of spiritual growth
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${category.color}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {category.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Assess your {category.name.toLowerCase()} related behaviors
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
      
      <BottomNavigation />
    </div>
  );
}