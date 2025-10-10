import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SinCategory, 
  ScoreScale, 
  SelfAssessmentResponse, 
  SelfAssessmentResult, 
  SelfAssessmentGoal,
  selfAssessmentQuestions,
  QuestionType
} from '@/data/selfAssessmentData';
import { secureStorage } from '@/lib/storage';
import { useUser } from './UserContext';
import { assessmentAnalytics } from '@/lib/assessmentAnalytics';

// Constants for storage keys
const RESPONSES_KEY = 'self_assessment_responses';
const RESULTS_KEY = 'self_assessment_results';
const GOAL_KEY = 'self_assessment_goal';

interface SelfAssessmentContextType {
  // Current assessment state
  currentQuestionIndex: number;
  responses: SelfAssessmentResponse[];
  isAssessmentComplete: boolean;
  
  // Assessment navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Response management
  saveResponse: (questionId: string, score: ScoreScale) => void;
  getResponseForQuestion: (questionId: string) => ScoreScale | undefined;
  
  // Results and goals
  results: SelfAssessmentResult | null;
  goal: SelfAssessmentGoal | null;
  calculateResults: () => void;
  saveGoal: (goal: SelfAssessmentGoal) => void;
  resetAssessment: () => boolean;
  
  // Filter questions that should be shown (considering conditional questions)
  getVisibleQuestions: () => QuestionType[];
  
  // Check if a specific question should be shown based on previous responses
  shouldShowQuestion: (question: QuestionType) => boolean;
  
  // For manual selection
  setStruggleArea: (primary: SinCategory, secondary?: SinCategory) => void;
  getQuestionsForCategory: (category: SinCategory) => QuestionType[];
  
  // Get the current question
  getCurrentQuestion: () => QuestionType | null;
  
  // New assessment features
  startFullAssessment: () => void;
  startSingleSinAssessment: (category: SinCategory) => void;
  getRandomizedQuestions: (category?: SinCategory) => QuestionType[];
  assessmentType: 'full' | 'single' | null;
  targetCategory: SinCategory | null;
}

export const SelfAssessmentContext = createContext<SelfAssessmentContextType | undefined>(undefined);

export function SelfAssessmentProvider({ children }: { children: ReactNode }) {
  const { userProgress, updateUserProgress } = useUser();
  
  // State for assessment
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<SelfAssessmentResponse[]>([]);
  const [results, setResults] = useState<SelfAssessmentResult | null>(null);
  const [goal, setGoal] = useState<SelfAssessmentGoal | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState<boolean>(false);
  const [assessmentType, setAssessmentType] = useState<'full' | 'single' | null>(null);
  const [targetCategory, setTargetCategory] = useState<SinCategory | null>(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuestionType[]>([]);
  
  // Load saved data on mount
  useEffect(() => {
    const savedResponses = secureStorage.getItem<SelfAssessmentResponse[]>(RESPONSES_KEY, []);
    const savedResults = secureStorage.getItem<SelfAssessmentResult>(RESULTS_KEY);
    const savedGoal = secureStorage.getItem<SelfAssessmentGoal>(GOAL_KEY);
    
    if (savedResponses && savedResponses.length > 0) {
      setResponses(savedResponses);
    }
    
    if (savedResults) {
      setResults(savedResults);
      setIsAssessmentComplete(true);
    }
    
    if (savedGoal) {
      setGoal(savedGoal);
    }
    
    // If there's a saved assessment in user progress, update local state
    if (userProgress?.selfAssessment) {
      // This will be expanded once we have the backend storage implemented
    }
  }, [userProgress]);
  
  // Get the current question
  const getCurrentQuestion = (): QuestionType | null => {
    const visibleQuestions = getVisibleQuestions();
    return visibleQuestions.length > currentQuestionIndex ? visibleQuestions[currentQuestionIndex] : null;
  };
  
  // Navigation functions
  const goToNextQuestion = () => {
    const visibleQuestions = getVisibleQuestions();
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // We've reached the end of the questionnaire
      setIsAssessmentComplete(true);
      calculateResults();
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const goToQuestion = (index: number) => {
    const visibleQuestions = getVisibleQuestions();
    if (index >= 0 && index < visibleQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  // Response management
  const saveResponse = (questionId: string, score: ScoreScale) => {
    const now = new Date();
    const existingIndex = responses.findIndex(r => r.questionId === questionId);
    
    if (existingIndex !== -1) {
      // Update existing response
      const updatedResponses = [...responses];
      updatedResponses[existingIndex] = { questionId, score, timestamp: now };
      setResponses(updatedResponses);
    } else {
      // Add new response
      setResponses([...responses, { questionId, score, timestamp: now }]);
    }
    
    // Save to storage
    secureStorage.setItem(RESPONSES_KEY, [...responses, { questionId, score, timestamp: now }]);
  };
  
  const getResponseForQuestion = (questionId: string): ScoreScale | undefined => {
    const response = responses.find(r => r.questionId === questionId);
    return response?.score;
  };
  
  // Calculate results based on responses
  const calculateResults = () => {
    if (responses.length === 0) return;
    
    // Initialize category scores and question counts
    const categoryScores: Record<SinCategory, number> = {
      tongue: 0,
      eyes: 0,
      ears: 0,
      pride: 0,
      stomach: 0,
      zina: 0,
      heart: 0
    };
    
    const totalQuestions: Record<SinCategory, number> = {
      tongue: 0,
      eyes: 0,
      ears: 0,
      pride: 0,
      stomach: 0,
      zina: 0,
      heart: 0
    };
    
    const answeredQuestions: Record<SinCategory, number> = {
      tongue: 0,
      eyes: 0,
      ears: 0,
      pride: 0,
      stomach: 0,
      zina: 0,
      heart: 0
    };
    
    // Count visible questions per category
    const visibleQuestions = getVisibleQuestions();
    visibleQuestions.forEach(q => {
      totalQuestions[q.category]++;
    });
    
    // Calculate scores per category
    responses.forEach(response => {
      const question = selfAssessmentQuestions.find(q => q.id === response.questionId);
      if (question) {
        categoryScores[question.category] += response.score;
        answeredQuestions[question.category]++;
      }
    });
    
    // Determine primary and secondary struggles
    const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
    
    // Calculate average scores per category to normalize by number of questions
    const averageScores: Record<string, number> = {};
    categories.forEach(category => {
      if (answeredQuestions[category] > 0) {
        averageScores[category] = categoryScores[category] / answeredQuestions[category];
      } else {
        averageScores[category] = 0;
      }
    });
    
    // Sort categories by average score (descending)
    const sortedCategories = categories
      .filter(category => answeredQuestions[category] > 0)
      .sort((a, b) => averageScores[b] - averageScores[a]);
    
    const primaryStruggle = sortedCategories[0] || 'heart'; // Default to heart if no data
    const secondaryStruggle = sortedCategories[1] || sortedCategories[0] || 'tongue'; // Default to the same as primary or tongue if none
    
    const result: SelfAssessmentResult = {
      categoryScores,
      totalQuestions,
      answeredQuestions,
      primaryStruggle,
      secondaryStruggle,
      completedAt: new Date()
    };
    
    setResults(result);
    setIsAssessmentComplete(true);
    
    // Save results to storage
    secureStorage.setItem(RESULTS_KEY, result);
    
    // Record assessment analytics
    const totalQuestionCount = Object.values(answeredQuestions).reduce((sum, count) => sum + count, 0);
    assessmentAnalytics.recordAssessment(
      result,
      assessmentType || 'full',
      targetCategory,
      totalQuestionCount
    );
    
    // Update user progress
    if (updateUserProgress && userProgress) {
      updateUserProgress({
        ...userProgress,
        selfAssessment: {
          primaryStruggle,
          secondaryStruggle,
          completedAt: new Date(),
          // Add other fields as needed
        }
      });
    }
    
    return result;
  };
  
  // Save assessment goal
  const saveGoal = (newGoal: SelfAssessmentGoal) => {
    setGoal(newGoal);
    secureStorage.setItem(GOAL_KEY, newGoal);
    
    // Here we would also update the user's progress in the backend
    if (typeof updateUserProgress === 'function' && userProgress) {
      // This is a placeholder for now
    }
  };
  
  // Reset the assessment
  const resetAssessment = (): boolean => {
    try {
      setResponses([]);
      setResults(null);
      setGoal(null);
      setCurrentQuestionIndex(0);
      setIsAssessmentComplete(false);
      
      secureStorage.removeItem(RESPONSES_KEY);
      secureStorage.removeItem(RESULTS_KEY);
      secureStorage.removeItem(GOAL_KEY);
      
      return true;
    } catch (error) {
      console.error('Failed to reset assessment:', error);
      return false;
    }
  };
  
  // Get questions that should be visible based on current responses
  const getVisibleQuestions = (): QuestionType[] => {
    // If we have randomized questions (from startFullAssessment or startSingleSinAssessment), use those
    if (randomizedQuestions.length > 0) {
      return randomizedQuestions.filter(question => shouldShowQuestion(question));
    }
    
    // Fallback to all questions (for legacy compatibility)
    return selfAssessmentQuestions.filter(question => shouldShowQuestion(question));
  };
  
  // Check if a specific question should be shown
  const shouldShowQuestion = (question: QuestionType): boolean => {
    // If it's a conditional question, check if it should be shown
    if (question.conditionalOn && question.conditionalValue) {
      const parentResponse = getResponseForQuestion(question.conditionalOn);
      return parentResponse !== undefined && parentResponse >= question.conditionalValue;
    }
    
    // Non-conditional questions are always shown
    return true;
  };
  
  // Manually set struggle areas (for path B - direct selection)
  const setStruggleArea = (primary: SinCategory, secondary?: SinCategory) => {
    const now = new Date();
    
    const result: SelfAssessmentResult = {
      categoryScores: {
        tongue: 0,
        eyes: 0,
        ears: 0,
        pride: 0,
        stomach: 0,
        zina: 0,
        heart: 0
      },
      totalQuestions: {
        tongue: 0,
        eyes: 0,
        ears: 0,
        pride: 0,
        stomach: 0,
        zina: 0,
        heart: 0
      },
      answeredQuestions: {
        tongue: 0,
        eyes: 0,
        ears: 0,
        pride: 0,
        stomach: 0,
        zina: 0,
        heart: 0
      },
      primaryStruggle: primary,
      secondaryStruggle: secondary || primary,
      completedAt: now
    };
    
    setResults(result);
    setIsAssessmentComplete(true);
    
    // Save to storage
    secureStorage.setItem(RESULTS_KEY, result);
    
    // Update user progress
    if (typeof updateUserProgress === 'function' && userProgress) {
      updateUserProgress({
        ...userProgress,
        selfAssessment: {
          areas: [primary, secondary].filter(Boolean) as string[],
          reflectionFrequency: 'daily', // Default to daily
          preferredTime: '08:00', // Default to 8am
        }
      });
    }
  };
  
  // Get questions for a specific category
  const getQuestionsForCategory = (category: SinCategory): QuestionType[] => {
    return selfAssessmentQuestions.filter(q => q.category === category);
  };

  // Randomize questions - select 10 from each category's pool of 20
  const getRandomizedQuestions = (category?: SinCategory): QuestionType[] => {
    if (category) {
      // Single sin assessment - get 10 random questions from the specific category
      const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === category);
      return shuffleArray([...categoryQuestions]).slice(0, Math.min(10, categoryQuestions.length));
    } else {
      // Full assessment - get 10 random questions from each category
      const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
      const selectedQuestions: QuestionType[] = [];
      
      categories.forEach(cat => {
        const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === cat);
        const randomized = shuffleArray([...categoryQuestions]).slice(0, Math.min(10, categoryQuestions.length));
        selectedQuestions.push(...randomized);
      });
      
      return selectedQuestions;
    }
  };

  // Utility function to shuffle array
  const shuffleArray = (array: QuestionType[]): QuestionType[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start full assessment
  const startFullAssessment = () => {
    setAssessmentType('full');
    setTargetCategory(null);
    const questions = getRandomizedQuestions();
    setRandomizedQuestions(questions);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setIsAssessmentComplete(false);
    setResults(null);
  };

  // Start single sin assessment
  const startSingleSinAssessment = (category: SinCategory) => {
    setAssessmentType('single');
    setTargetCategory(category);
    const questions = getRandomizedQuestions(category);
    setRandomizedQuestions(questions);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setIsAssessmentComplete(false);
    setResults(null);
  };
  
  const contextValue: SelfAssessmentContextType = {
    currentQuestionIndex,
    responses,
    isAssessmentComplete,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    saveResponse,
    getResponseForQuestion,
    results,
    goal,
    calculateResults,
    saveGoal,
    resetAssessment,
    getVisibleQuestions,
    shouldShowQuestion,
    setStruggleArea,
    getQuestionsForCategory,
    getCurrentQuestion,
    startFullAssessment,
    startSingleSinAssessment,
    getRandomizedQuestions,
    assessmentType,
    targetCategory
  };
  
  return (
    <SelfAssessmentContext.Provider value={contextValue}>
      {children}
    </SelfAssessmentContext.Provider>
  );
}

// Hook is now imported from hooks/useSelfAssessment.ts