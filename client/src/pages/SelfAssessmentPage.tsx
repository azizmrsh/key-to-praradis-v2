import React, { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Container } from '@/components/ui/container';
import { SelfAssessmentProvider } from '@/contexts/SelfAssessmentContext';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { WelcomeIntroduction } from '@/components/self-assessment/WelcomeIntroduction';
import { QuestionnaireItem } from '@/components/self-assessment/QuestionnaireItem';
import { ManualSelection } from '@/components/self-assessment/ManualSelection';
import { AssessmentResults } from '@/components/self-assessment/AssessmentResults';
import { useLocation } from 'wouter';
import { useUser } from '@/contexts/UserContext';
import { ScoreScale, SinCategory } from '@/data/selfAssessmentData';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Assessment flow steps
enum AssessmentStep {
  Welcome,
  Questionnaire,
  ManualSelection,
  Results
}

// Component that handles the assessment flow
function SelfAssessmentFlow() {
  const [location, navigate] = useLocation();
  const { markUserAsReturning } = useUser();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const skipToManual = searchParams.get('skip') === 'true';
  
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(
    skipToManual ? AssessmentStep.ManualSelection : AssessmentStep.Welcome
  );
  
  const { 
    getCurrentQuestion,
    getVisibleQuestions,
    currentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    saveResponse,
    getResponseForQuestion,
    isAssessmentComplete,
    results,
    calculateResults,
    setStruggleArea,
    startFullAssessment
  } = useSelfAssessment();
  
  // Current question and total questions
  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = getCurrentQuestion();
  const totalQuestions = visibleQuestions.length;
  
  // Handlers for welcome screen
  const handleStartQuestionnaire = () => {
    startFullAssessment();
    setCurrentStep(AssessmentStep.Questionnaire);
  };
  
  const handleSkipToManualSelection = () => {
    setCurrentStep(AssessmentStep.ManualSelection);
  };
  
  // Handler for questionnaire responses
  const handleResponseSaved = (score: ScoreScale) => {
    if (currentQuestion) {
      saveResponse(currentQuestion.id, score);
    }
  };
  
  // Handler for completing the questionnaire
  const handleQuestionnaireFinish = () => {
    calculateResults();
    setCurrentStep(AssessmentStep.Results);
  };
  
  // Handler for manual selection
  const handleManualSelectionComplete = (primary: SinCategory, secondary?: SinCategory) => {
    setStruggleArea(primary, secondary);
    setCurrentStep(AssessmentStep.Results);
  };
  
  // Handler for completing the assessment
  const handleAssessmentComplete = () => {
    // Mark user as no longer first-time user
    markUserAsReturning();
    navigate('/content-dashboard');
  };
  
  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case AssessmentStep.Welcome:
        return (
          <WelcomeIntroduction
            onStartQuestionnaire={handleStartQuestionnaire}
            onSkipToManualSelection={handleSkipToManualSelection}
          />
        );
        
      case AssessmentStep.Questionnaire:
        return currentQuestion ? (
          <QuestionnaireItem
            question={currentQuestion}
            currentScore={getResponseForQuestion(currentQuestion.id)}
            totalQuestions={totalQuestions}
            currentIndex={currentQuestionIndex}
            onScoreChange={handleResponseSaved}
            onNext={goToNextQuestion}
            onPrevious={goToPreviousQuestion}
            onFinish={handleQuestionnaireFinish}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
          />
        ) : null;
        
      case AssessmentStep.ManualSelection:
        return (
          <ManualSelection
            onSelectionComplete={handleManualSelectionComplete}
            onBack={() => setCurrentStep(AssessmentStep.Welcome)}
          />
        );
        
      case AssessmentStep.Results:
        return results ? (
          <AssessmentResults
            onComplete={handleAssessmentComplete}
          />
        ) : null;
        
      default:
        return null;
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {renderCurrentStep()}
    </AnimatePresence>
  );
}

// Main page component with provider wrapper
export default function SelfAssessmentPage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title={t('assessment.selfAssessment')} backPath="/assessment-choice" />
      <Container className="flex-grow py-6">
        <div className="max-w-2xl mx-auto">
          <SelfAssessmentProvider>
            <SelfAssessmentFlow />
          </SelfAssessmentProvider>
        </div>
      </Container>
    </div>
  );
}