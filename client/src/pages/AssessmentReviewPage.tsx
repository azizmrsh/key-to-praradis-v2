import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Clock, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { selfAssessmentQuestions, type SinCategory } from '@/data/selfAssessmentData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AssessmentResponse {
  questionId: string;
  answer: string;
  skipped?: boolean;
}

interface AssessmentResults {
  responses: Record<string, AssessmentResponse>;
  skippedQuestions: string[];
  completedAt?: Date;
  startedAt: Date;
}

export default function AssessmentReviewPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  
  const getAssessmentResults = (): { results: any; questionsUsed: any[]; selectionMethod?: string } | null => {
    // Check for completed results first
    const completedResults = localStorage.getItem('assessment_results');
    if (completedResults) {
      const parsed = JSON.parse(completedResults);
      const selectionMethod = parsed.selectionMethod || 'assessment';
      const questionsOrder = localStorage.getItem('assessment_questions_order');
      const questionsUsed = questionsOrder ? JSON.parse(questionsOrder) : [];
      
      return {
        results: {
          ...parsed,
          responses: parsed.responses || parsed.assessmentData?.responses || {},
          skippedQuestions: parsed.skippedQuestions || parsed.assessmentData?.skippedQuestions || [],
          startedAt: parsed.startedAt ? new Date(parsed.startedAt) : (parsed.selectedAt ? new Date(parsed.selectedAt) : new Date()),
          completedAt: parsed.completedAt ? new Date(parsed.completedAt) : (parsed.selectedAt ? new Date(parsed.selectedAt) : undefined),
          focusAreas: parsed.focusAreas || { primary: parsed.primaryStruggle, secondary: parsed.secondaryStruggle }
        },
        questionsUsed,
        selectionMethod
      };
    }
    
    // Check for in-progress assessment
    const inProgressState = localStorage.getItem('assessment_state');
    if (inProgressState) {
      const parsed = JSON.parse(inProgressState);
      const questionsOrder = localStorage.getItem('assessment_questions_order');
      const questionsUsed = questionsOrder ? JSON.parse(questionsOrder) : [];
      
      return {
        results: {
          responses: parsed.responses || {},
          skippedQuestions: parsed.skippedQuestions || [],
          startedAt: new Date(parsed.startedAt)
        },
        questionsUsed,
        selectionMethod: 'assessment'
      };
    }
    
    return null;
  };

  const assessmentData = getAssessmentResults();
  
  if (!assessmentData || !assessmentData.results) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <AssessmentHeader 
          title={t('assessment.review.title')}
          onBack={() => window.history.back()} 
          language="en"
        />
        
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('assessment.review.noAssessmentFound')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('assessment.review.noAssessmentMessage')}
              </p>
              <Button onClick={() => navigate('/enhanced-assessment')}>
                {t('assessment.startAssessment')}
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }

  const { results, questionsUsed, selectionMethod } = assessmentData;
  
  // Additional safety check for results
  if (!results || typeof results !== 'object') {
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <AssessmentHeader 
          title={t('assessment.review.title')}
          onBack={() => window.history.back()} 
          language="en"
        />
        
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('assessment.review.dataError')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('assessment.review.dataErrorMessage')}
              </p>
              <Button onClick={() => navigate('/enhanced-assessment')}>
                {t('assessment.review.startNewAssessment')}
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  // Manual Selection View
  if (selectionMethod === 'manual') {
    const focusAreas = results.focusAreas || {};
    const categoryInfo: Record<SinCategory, { title: string }> = {
      tongue: { title: t('manualSelection.categories.tongue') },
      eyes: { title: t('manualSelection.categories.eyes') },
      ears: { title: t('manualSelection.categories.ears') },
      heart: { title: t('manualSelection.categories.heart') },
      pride: { title: t('manualSelection.categories.pride') },
      stomach: { title: t('manualSelection.categories.stomach') },
      zina: { title: t('manualSelection.categories.zina') }
    };
    
    return (
      <div className="flex flex-col min-h-screen pb-16">
        <AssessmentHeader 
          title={t('assessment.review.manualSelectionTitle', 'Your Focus Areas')}
          onBack={() => navigate('/profile')} 
          language="en"
        />
        
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {t('assessment.review.manualSelectionTitle', 'Your Focus Areas')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('assessment.review.manualSelectionMessage', 'You manually selected these focus areas. You can change them anytime or take the full assessment for detailed insights.')}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{t('assessment.review.selectedFocusAreas')}:</h3>
                <div className="space-y-1">
                  <p className="text-lg font-medium text-blue-800">
                    • {categoryInfo[focusAreas.primary as SinCategory]?.title || focusAreas.primary}
                  </p>
                  {focusAreas.secondary && focusAreas.secondary !== focusAreas.primary && (
                    <p className="text-lg font-medium text-blue-800">
                      • {categoryInfo[focusAreas.secondary as SinCategory]?.title || focusAreas.secondary}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/enhanced-assessment?skip=true')}
                  className="w-full"
                >
                  {t('assessment.review.changeFocusAreas', 'Change Focus Areas')}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/enhanced-assessment')}
                  className="w-full"
                >
                  {t('assessment.review.takeFullAssessment', 'Take Full Assessment')} {' '}
                  <Badge variant="secondary" className="ml-2">Recommended</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="w-full"
                >
                  {t('assessment.review.backToDashboard', 'Back to Profile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  // Calculate total questions based on what was actually used
  const totalQuestions = questionsUsed.length > 0 ? questionsUsed.length : 70;
  const isCompleted = !!(results.completedAt);

  // State management
  const [editingQuestion, setEditingQuestion] = React.useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = React.useState<string | null>(null);
  const [localResults, setLocalResults] = React.useState({
    responses: results.responses || {},
    skippedQuestions: results.skippedQuestions || [],
    startedAt: results.startedAt,
    completedAt: results.completedAt
  });

  // Get the actual question objects from our database
  const getQuestionById = (id: string) => {
    return selfAssessmentQuestions.find(q => q.id === id);
  };



  const handleUpdateAnswer = async (questionId: string, newAnswer: string) => {
    setSavingQuestion(questionId);
    
    // Update localStorage with new answer
    const currentState = localStorage.getItem('assessment_state');
    const currentResults = localStorage.getItem('assessment_results');
    
    const newResponse = { questionId, answer: newAnswer };
    
    if (currentState) {
      const state = JSON.parse(currentState);
      state.responses[questionId] = newResponse;
      localStorage.setItem('assessment_state', JSON.stringify(state));
    }
    
    if (currentResults) {
      const resultsData = JSON.parse(currentResults);
      resultsData.responses[questionId] = newResponse;
      localStorage.setItem('assessment_results', JSON.stringify(resultsData));
    }
    
    // Update local state immediately
    const updatedResults = { ...localResults };
    updatedResults.responses[questionId] = newResponse;
    
    // Remove from skipped if it was there
    if (updatedResults.skippedQuestions && updatedResults.skippedQuestions.includes(questionId)) {
      updatedResults.skippedQuestions = updatedResults.skippedQuestions.filter(id => id !== questionId);
      
      // Update localStorage
      if (currentState) {
        const state = JSON.parse(currentState);
        state.skippedQuestions = updatedResults.skippedQuestions;
        localStorage.setItem('assessment_state', JSON.stringify(state));
      }
      if (currentResults) {
        const resultsData = JSON.parse(currentResults);
        resultsData.skippedQuestions = updatedResults.skippedQuestions;
        localStorage.setItem('assessment_results', JSON.stringify(resultsData));
      }
    }
    
    setLocalResults(updatedResults);
    
    // Brief delay to show saving state, then exit edit mode
    setTimeout(() => {
      setSavingQuestion(null);
      setEditingQuestion(null);
    }, 800);
  };

  // Calculate current state data
  const answeredIds = Object.keys(localResults.responses || {});
  const currentSkippedQuestions = (localResults.skippedQuestions || [])
    .filter(id => !answeredIds.includes(id))
    .map(id => getQuestionById(id))
    .filter(q => q !== undefined);

  const currentAnsweredQuestions = answeredIds
    .map(id => getQuestionById(id))
    .filter(q => q !== undefined);

  const answeredCount = answeredIds.length;
  const localSkippedCount = currentSkippedQuestions.length;

  const getAnswerLabel = (answerKey: string) => {
    const labels: Record<string, string> = {
      never: t('assessment.scale.never'),
      rarely: t('assessment.scale.rarely'),
      sometimes: t('assessment.scale.sometimes'),
      often: t('assessment.scale.often'),
      very_often: t('assessment.scale.always')
    };
    return labels[answerKey] || answerKey;
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AssessmentHeader 
        title={t('assessment.review.title')}
        onBack={() => window.history.back()} 
        language="en"
      />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              {t('assessment.review.assessmentStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{answeredCount}</div>
                <div className="text-sm text-muted-foreground">{t('assessment.review.completed')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{localSkippedCount}</div>
                <div className="text-sm text-muted-foreground">{t('assessment.review.skipped')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">{t('assessment.review.totalQuestions')}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('assessment.review.started')}: {results.startedAt.toLocaleDateString()}</span>
                {isCompleted && results.completedAt && (
                  <span>{t('assessment.review.completedDate')}: {results.completedAt.toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Badge variant={isCompleted ? "default" : "secondary"}>
                  {isCompleted ? t('assessment.review.completed') : t('assessment.review.inProgress')}
                </Badge>
                {!isCompleted && (
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/enhanced-assessment')}
                  >
                    {t('assessment.review.continueAssessment')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skipped Questions */}
        {currentSkippedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-yellow-700">{t('assessment.review.skippedQuestions')}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {currentSkippedQuestions.length} {t('assessment.review.skipped').toLowerCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentSkippedQuestions.map((question: any) => (
                <div key={question.id} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="font-medium text-sm mb-3">
                    {question.text}
                  </div>
                  
                  {editingQuestion === question.id ? (
                    <div className="space-y-3 relative z-10">
                      <div className="space-y-2">
                        {['never', 'rarely', 'sometimes', 'often', 'very_often'].map((option) => (
                          <div 
                            key={option} 
                            className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-white/50"
                            onClick={() => handleUpdateAnswer(question.id, option)}
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary opacity-0"></div>
                            </div>
                            <span className="text-sm font-medium cursor-pointer">
                              {getAnswerLabel(option)}
                            </span>
                            {savingQuestion === question.id && (
                              <div className="ml-auto text-xs text-green-600 flex items-center gap-1">
                                <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                {t('assessment.review.saving')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingQuestion(null)}
                        className="mt-3"
                      >
                        {t('assessment.review.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SkipForward className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-700 font-medium">{t('assessment.review.skipped')}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingQuestion(question.id)}
                      >
                        {t('assessment.review.answerNow')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Answered Questions */}
        {currentAnsweredQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-green-700">{t('assessment.review.yourAnswers')}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {currentAnsweredQuestions.length} {t('assessment.answered').toLowerCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentAnsweredQuestions.map((question: any) => {
                const response = localResults.responses[question.id];
                
                return (
                  <div key={question.id} className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="font-medium text-sm mb-3">
                      {question.text}
                    </div>
                    
                    {editingQuestion === question.id ? (
                      <div className="space-y-3 relative z-10">
                        <div className="space-y-2">
                          {['never', 'rarely', 'sometimes', 'often', 'very_often'].map((option) => (
                            <div 
                              key={option} 
                              className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-white/50"
                              onClick={() => handleUpdateAnswer(question.id, option)}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                response?.answer === option ? 'border-primary' : 'border-gray-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full bg-primary ${
                                  response?.answer === option ? 'opacity-100' : 'opacity-0'
                                }`}></div>
                              </div>
                              <span className="text-sm font-medium cursor-pointer">
                                {getAnswerLabel(option)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingQuestion(null)}
                          className="mt-3"
                        >
                          {t('assessment.review.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700">
                            {getAnswerLabel(response?.answer) || response?.answer}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingQuestion(question.id)}
                        >
                          {t('assessment.review.changeAnswer')}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              {!isCompleted && (
                <Button 
                  onClick={() => navigate('/enhanced-assessment')}
                  className="w-full"
                >
                  {t('assessment.review.continueAssessment')}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                {t('assessment.review.backToDashboard')}
              </Button>
              
              {isCompleted && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Clear completed assessment to allow retaking
                    localStorage.removeItem('assessment_results');
                    navigate('/enhanced-assessment');
                  }}
                  className="w-full"
                >
                  {t('assessment.review.retakeAssessment')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </main>
      
      <BottomNavigation />
    </div>
  );
}