import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, SkipForward, Pause, Eye, BookOpen, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  selfAssessmentQuestions, 
  selfAssessmentResponseOptions,
  getQuestionText,
  getResponseOptionText,
  type SinCategory, 
  type IslamicReference 
} from '@/data/selfAssessmentData';
import { LanguageSelector } from './LanguageSelector';
import { AssessmentLanguageProvider, useAssessmentLanguage } from '@/contexts/AssessmentLanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { AssessmentResults } from './AssessmentResults';
import { assessmentAnalytics } from '@/lib/assessmentAnalytics';

interface AssessmentQuestion {
  id: string;
  text: string;
  category: SinCategory;
  options: { value: string; label: string }[];
  islamicReferences?: IslamicReference[];
  originalQuestion?: any; // Reference to original question for translations
}

// Component to display Islamic references
const IslamicReferencesDisplay = ({ references }: { references?: IslamicReference[] }) => {
  const { t } = useTranslation();
  
  if (!references || references.length === 0) return null;

  return (
    <Card className="mt-6 bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-green-800">
          <BookOpen className="h-5 w-5" />
          {t('islamicGuidance.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {references.map((ref, index) => (
          <div key={index} className="space-y-2">
            <Badge variant="outline" className={ref.type === 'quran' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
              {ref.type === 'quran' ? t('islamicGuidance.quran') : t('islamicGuidance.hadith')}
            </Badge>
            
            {/* Arabic Text */}
            <div className="text-right bg-white p-3 rounded-lg border border-green-200">
              <p className="text-lg leading-relaxed font-arabic" dir="rtl">
                {ref.text}
              </p>
            </div>
            
            {/* Translation */}
            {ref.translation && (
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <Quote className="h-4 w-4 text-green-600 mb-2" />
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  "{ref.translation}"
                </p>
              </div>
            )}
            
            {/* Source */}
            <p className="text-xs text-green-700 font-medium">
              {t('islamicGuidance.source')}: {ref.source}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface AssessmentResponse {
  questionId: string;
  answer: string;
  skipped?: boolean;
}

interface AssessmentState {
  currentQuestionIndex: number;
  responses: Record<string, AssessmentResponse>;
  skippedQuestions: string[];
  status: 'in_progress' | 'completed' | 'paused';
  startedAt: Date;
  lastSavedAt?: Date;
}

// Function to generate 10 random questions from each category (70 total)
const generateAssessmentQuestions = (): AssessmentQuestion[] => {
  const categories: SinCategory[] = ['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'];
  const questionsPerCategory = 10;
  
  const standardOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'very_often', label: 'Very Often' }
  ];
  
  const selectedQuestions: AssessmentQuestion[] = [];
  
  categories.forEach(category => {
    // Get all questions for this category
    const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === category);
    
    // Shuffle and select up to 10 questions (or all if less than 10)
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionsPerCategory, categoryQuestions.length));
    
    // Convert to AssessmentQuestion format, preserving translation data
    selected.forEach(q => {
      selectedQuestions.push({
        id: q.id,
        text: q.text,
        category: q.category,
        options: standardOptions,
        islamicReferences: q.islamicReferences,
        // Preserve the original question object for translation access
        originalQuestion: q
      });
    });
  });
  
  // Shuffle the final list to mix categories
  const finalQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
  
  // Ensure unique IDs by appending index to each question ID
  finalQuestions.forEach((question, index) => {
    question.id = `${question.id}_${index}`;
  });
  
  // Debug log to verify question count
  const totalGenerated = finalQuestions.length;
  console.log(`✅ Generated ${totalGenerated} questions from ${categories.length} categories`);
  categories.forEach(cat => {
    const count = finalQuestions.filter(q => q.category === cat).length;
    const available = selfAssessmentQuestions.filter(q => q.category === cat).length;
    console.log(`  ${cat}: selected ${count} from ${available} available`);
  });
  
  // Verify no duplicate IDs remain
  const questionIds = finalQuestions.map(q => q.id);
  const uniqueIds = new Set(questionIds);
  if (questionIds.length !== uniqueIds.size) {
    console.error(`❌ DUPLICATE IDs FOUND! Total: ${questionIds.length}, Unique: ${uniqueIds.size}`);
  } else {
    console.log(`✅ All ${questionIds.length} question IDs are unique`);
  }
  
  return finalQuestions;
};

// Function to determine severity level based on percentage
const getSeverityLevel = (percentage: number): { level: string; color: string; message: string } => {
  if (percentage >= 80) {
    return {
      level: 'Very High',
      color: 'text-red-700 bg-red-100',
      message: 'This area requires immediate attention and focus in your spiritual journey.'
    };
  } else if (percentage >= 60) {
    return {
      level: 'High',
      color: 'text-orange-700 bg-orange-100',
      message: 'This area shows significant challenges that would benefit from dedicated work.'
    };
  } else if (percentage >= 40) {
    return {
      level: 'Moderate',
      color: 'text-yellow-700 bg-yellow-100',
      message: 'This area has some challenges that could be improved with attention.'
    };
  } else if (percentage >= 20) {
    return {
      level: 'Low',
      color: 'text-blue-700 bg-blue-100',
      message: 'This area shows minor challenges with room for improvement.'
    };
  } else {
    return {
      level: 'Very Low',
      color: 'text-green-700 bg-green-100',
      message: 'This area shows excellent spiritual discipline. Keep up the good work!'
    };
  }
};

// Function to generate single-category assessment with all available questions
const generateSingleCategoryAssessment = (category: SinCategory): AssessmentQuestion[] => {
  const standardOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'very_often', label: 'Very Often' }
  ];
  
  // Get all questions for this category
  const categoryQuestions = selfAssessmentQuestions.filter(q => q.category === category);
  
  // Convert to AssessmentQuestion format, preserving translation data
  const selectedQuestions: AssessmentQuestion[] = categoryQuestions.map(q => ({
    id: q.id,
    text: q.text,
    category: q.category,
    options: standardOptions,
    islamicReferences: q.islamicReferences,
    // Preserve the original question object for translation access
    originalQuestion: q
  }));
  
  // Shuffle the questions
  const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
  
  console.log(`Generated ${shuffledQuestions.length} questions for ${category} category`);
  
  return shuffledQuestions;
};

function EnhancedSelfAssessmentInner() {
  const { selectedLanguage, setSelectedLanguage } = useAssessmentLanguage();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Ensure i18n language is synchronized with selectedLanguage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }, [i18n]);
  
  // Check if we should skip to manual selection
  const searchParams = new URLSearchParams(window.location.search);
  const skipToManual = searchParams.get('skip') === 'true';
  const singleCategory = searchParams.get('category') as SinCategory | null;
  
  // Debug logging
  console.log('Window location:', window.location.href);
  console.log('Search params:', window.location.search);
  console.log('Skip parameter:', searchParams.get('skip'));
  console.log('Should skip to manual:', skipToManual);
  console.log('Single category:', singleCategory);
  
  // State management
  const [showManualSelection, setShowManualSelection] = useState(skipToManual);
  const [showResults, setShowResults] = useState(false);
  const [isSingleCategoryAssessment, setIsSingleCategoryAssessment] = useState(!!singleCategory);
  const [primaryCategory, setPrimaryCategory] = useState<SinCategory | ''>('');
  const [secondaryCategory, setSecondaryCategory] = useState<SinCategory | ''>('');
  
  const [assessmentState, setAssessmentState] = useState<AssessmentState>(() => {
    // For single category assessments, always start fresh
    if (singleCategory) {
      return {
        currentQuestionIndex: 0,
        responses: {},
        skippedQuestions: [],
        status: 'in_progress',
        startedAt: new Date()
      };
    }
    
    // Load saved state from localStorage for regular assessments
    const saved = localStorage.getItem('assessment_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // If the saved assessment is completed, start a fresh one (this is a retake)
      if (parsed.status === 'completed') {
        // Clear the old assessment data
        localStorage.removeItem('assessment_state');
        localStorage.removeItem('assessment_questions_order');
        localStorage.removeItem('assessment_questions');
        
        return {
          currentQuestionIndex: 0,
          responses: {},
          skippedQuestions: [],
          status: 'in_progress',
          startedAt: new Date()
        };
      }
      
      return {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        lastSavedAt: parsed.lastSavedAt ? new Date(parsed.lastSavedAt) : undefined
      };
    }
    
    return {
      currentQuestionIndex: 0,
      responses: {},
      skippedQuestions: [],
      status: 'in_progress',
      startedAt: new Date()
    };
  });

  const [assessmentQuestions] = useState<AssessmentQuestion[]>(() => {
    if (singleCategory) {
      // Generate single category assessment
      const newQuestions = generateSingleCategoryAssessment(singleCategory);
      localStorage.setItem('single_category_questions', JSON.stringify(newQuestions));
      return newQuestions;
    }
    
    const saved = localStorage.getItem('assessment_questions');
    if (saved) {
      const parsedQuestions = JSON.parse(saved);
      // Check if the cached questions have the originalQuestion property
      if (parsedQuestions.length > 0 && parsedQuestions[0].originalQuestion) {
        return parsedQuestions;
      }
    }
    // Generate new questions with originalQuestion property
    const newQuestions = generateAssessmentQuestions();
    localStorage.setItem('assessment_questions', JSON.stringify(newQuestions));
    return newQuestions;
  });

  const [questionsOrder, setQuestionsOrder] = useState<string[]>(() => {
    // For single category assessments, don't load from localStorage
    if (singleCategory) {
      return [];
    }
    
    const saved = localStorage.getItem('assessment_questions_order');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with empty array, will be set after assessmentQuestions is available
    return [];
  });

  // Initialize questionsOrder after assessmentQuestions is available
  useEffect(() => {
    if (questionsOrder.length === 0 && assessmentQuestions.length > 0) {
      setQuestionsOrder(assessmentQuestions.map(q => q.id));
    }
  }, [assessmentQuestions, questionsOrder.length]);

  // Save state to localStorage whenever it changes (skip for single category assessments)
  useEffect(() => {
    if (!singleCategory) {
      localStorage.setItem('assessment_state', JSON.stringify({
        ...assessmentState,
        lastSavedAt: new Date()
      }));
      localStorage.setItem('assessment_questions_order', JSON.stringify(questionsOrder));
      localStorage.setItem('assessment_questions', JSON.stringify(assessmentQuestions));
    }
  }, [assessmentState, questionsOrder, assessmentQuestions, singleCategory]);

  // Check if all questions are answered and trigger completion
  useEffect(() => {
    const answeredCount = Object.keys(assessmentState.responses).length;
    const totalQuestions = questionsOrder.length;
    
    if (answeredCount === totalQuestions && totalQuestions > 0 && assessmentState.status === 'in_progress') {
      // All questions answered, trigger completion after ensuring state is saved
      setTimeout(() => {
        handleComplete();
      }, 500);
    }
  }, [assessmentState.responses, questionsOrder.length, assessmentState.status]);

  const getCurrentQuestion = (): AssessmentQuestion | null => {
    if (assessmentState.currentQuestionIndex >= questionsOrder.length) {
      return null;
    }
    const questionId = questionsOrder[assessmentState.currentQuestionIndex];
    return assessmentQuestions.find(q => q.id === questionId) || null;
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    setAssessmentState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          answer
        }
      }
    }));
  };

  const handleAnswerAndNext = (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isLastQuestion = assessmentState.currentQuestionIndex >= questionsOrder.length - 1;

    // Save the answer
    setAssessmentState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          answer
        }
      }
    }));

    // Move to next question after a brief delay (useEffect will handle completion)
    if (!isLastQuestion) {
      setTimeout(() => {
        setAssessmentState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }, 300); // Small delay to show selection feedback
    }
    // If it's the last question, the useEffect will detect all answers are complete and trigger handleComplete
  };

  const handleNext = () => {
    if (assessmentState.currentQuestionIndex < questionsOrder.length - 1) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      // This is the last question - complete the assessment directly
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (assessmentState.currentQuestionIndex > 0) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleSkip = () => {
    // Exit assessment and save progress
    setAssessmentState(prev => ({
      ...prev,
      status: 'paused'
    }));
    
    toast({
      title: t('assessment.paused', 'Assessment Paused'),
      description: t('assessment.pausedDescription', 'You can continue later from where you left off.')
    });
    
    navigate('/profile');
  };

  const handlePause = () => {
    setAssessmentState(prev => ({
      ...prev,
      status: 'paused'
    }));
    
    toast({
      title: t('assessment.paused', 'Assessment Paused'),
      description: t('assessment.pausedDescription', 'You can continue later from where you left off.')
    });
    
    navigate('/profile');
  };

  const handleManualSelectionComplete = () => {
    if (!primaryCategory) {
      toast({
        title: t('manualSelection.selectionRequired', 'Selection Required'),
        description: t('manualSelection.selectionRequiredDescription', 'Please select at least a primary focus area.'),
        variant: "destructive"
      });
      return;
    }

    // Create a simple results object for manual selection
    const manualResults = {
      focusAreas: {
        primary: primaryCategory as SinCategory,
        secondary: (secondaryCategory as SinCategory) || (primaryCategory as SinCategory)
      },
      selectionMethod: 'manual',
      selectedAt: new Date().toISOString(),
      // Legacy fields for backwards compatibility
      primaryStruggle: primaryCategory as SinCategory,
      secondaryStruggle: secondaryCategory as SinCategory || primaryCategory as SinCategory,
      isManualSelection: true
    };

    // Save to localStorage - DON'T clear assessment_state to preserve partial progress
    localStorage.setItem('assessment_results', JSON.stringify(manualResults));
    localStorage.setItem('assessment_completed', 'true');
    
    toast({
      title: t('manualSelection.focusAreasSelected', 'Focus Areas Selected'),
      description: `You've chosen to focus on ${primaryCategory}${secondaryCategory ? ` and ${secondaryCategory}` : ''}.`,
    });
    
    navigate('/assessment-review');
  };

  const handleComplete = () => {
    setAssessmentState(prev => ({
      ...prev,
      status: 'completed'
    }));

    // Calculate category scores from responses
    const categoryScores: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };
    const categoryCounts: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };

    // Map string responses to numeric values
    const responseValueMap: Record<string, number> = {
      'never': 1,
      'rarely': 2,
      'sometimes': 3,
      'often': 4,
      'very_often': 5,
      'always': 5
    };

    // Analyze responses to calculate scores per category
    Object.values(assessmentState.responses).forEach(response => {
      const question = assessmentQuestions.find(q => q.id === response.questionId);
      if (question) {
        const score = responseValueMap[response.answer] || 0;
        if (score > 0) {
          categoryScores[question.category] += score;
          categoryCounts[question.category] += 1;
        }
      }
    });

    // Calculate average scores and find top 2 categories
    const avgScores = Object.entries(categoryScores).map(([category, total]) => ({
      category: category as SinCategory,
      avgScore: categoryCounts[category as SinCategory] > 0 ? total / categoryCounts[category as SinCategory] : 0
    }));

    // Sort by highest average score (areas needing most attention)
    avgScores.sort((a, b) => b.avgScore - a.avgScore);
    
    const primaryStruggle = avgScores[0]?.category || 'tongue';
    const secondaryStruggle = avgScores[1]?.category || 'heart';

    const results = {
      focusAreas: {
        primary: primaryStruggle,
        secondary: secondaryStruggle
      },
      selectionMethod: 'assessment',
      assessmentData: {
        responses: assessmentState.responses,
        skippedQuestions: assessmentState.skippedQuestions,
        completedAt: new Date().toISOString(),
        startedAt: assessmentState.startedAt,
        categoryScores,
        totalQuestions: categoryCounts,
        answeredQuestions: categoryCounts,
        categoryCounts
      },
      // Legacy fields for backwards compatibility
      responses: assessmentState.responses,
      skippedQuestions: assessmentState.skippedQuestions,
      completedAt: new Date(),
      startedAt: assessmentState.startedAt,
      primaryStruggle,
      secondaryStruggle,
      categoryScores,
      totalQuestions: categoryCounts,
      answeredQuestions: categoryCounts,
      categoryCounts,
      isFullAssessment: !isSingleCategoryAssessment,
      singleCategoryResults: isSingleCategoryAssessment ? {
        [singleCategory!]: {
          category: singleCategory!,
          score: categoryScores[singleCategory!],
          totalQuestions: categoryCounts[singleCategory!],
          percentage: categoryCounts[singleCategory!] > 0 ? (categoryScores[singleCategory!] / (categoryCounts[singleCategory!] * 5)) * 100 : 0
        }
      } : {},
      singleCategoryAssessment: isSingleCategoryAssessment ? {
        category: singleCategory!,
        score: categoryScores[singleCategory!],
        totalQuestions: Object.keys(assessmentState.responses).length,
        maxScore: Object.keys(assessmentState.responses).length * 5,
        percentage: Object.keys(assessmentState.responses).length > 0 ? (categoryScores[singleCategory!] / (Object.keys(assessmentState.responses).length * 5)) * 100 : 0,
        severity: getSeverityLevel(Object.keys(assessmentState.responses).length > 0 ? (categoryScores[singleCategory!] / (Object.keys(assessmentState.responses).length * 5)) * 100 : 0)
      } : undefined
    };

    if (isSingleCategoryAssessment) {
      // For single category assessments, preserve existing full assessment data
      const existingResults = JSON.parse(localStorage.getItem('assessment_results') || '{}');
      const updatedResults = {
        ...existingResults,  // Keep all existing full assessment data
        singleCategoryAssessment: results.singleCategoryAssessment
      };
      localStorage.setItem('assessment_results', JSON.stringify(updatedResults));
      localStorage.removeItem('single_category_questions');
      
      // Record single category assessment in analytics
      assessmentAnalytics.recordAssessment(
        results,
        'single_category',
        singleCategory || undefined,
        Object.keys(assessmentState.responses).length
      );
    } else {
      // For full assessments, store the complete results
      localStorage.setItem('assessment_results', JSON.stringify(results));
      localStorage.removeItem('assessment_state');
      localStorage.removeItem('assessment_questions_order');
      localStorage.removeItem('assessment_questions');
      
      // Record full assessment in analytics
      assessmentAnalytics.recordAssessment(
        results,
        'full',
        undefined,
        Object.keys(assessmentState.responses).length
      );
    }

    toast({
      title: t('assessment.complete', 'Assessment Complete!'),
      description: `Your assessment has been completed successfully.`
    });

    setShowResults(true);
  };

  const handleStartSingleCategoryAssessment = (category: SinCategory) => {
    // Navigate to single category assessment
    navigate(`/enhanced-assessment?category=${category}`);
  };

  const handleSelectFocusAreas = (primary: SinCategory, secondary?: SinCategory) => {
    // Save focus areas selection
    const focusAreas = {
      primary,
      secondary: secondary || primary,
      selectedAt: new Date()
    };
    
    localStorage.setItem('selected_focus_areas', JSON.stringify(focusAreas));
    navigate('/content-dashboard');
  };

  const categoryOptions: { value: SinCategory; label: string }[] = [
    { value: 'tongue', label: t('manualSelection.categories.tongue') },
    { value: 'eyes', label: t('manualSelection.categories.eyes') },
    { value: 'ears', label: t('manualSelection.categories.ears') },
    { value: 'heart', label: t('manualSelection.categories.heart') },
    { value: 'pride', label: t('manualSelection.categories.pride') },
    { value: 'stomach', label: t('manualSelection.categories.stomach') },
    { value: 'zina', label: t('manualSelection.categories.zina') }
  ];

  // Show results screen if assessment is completed
  if (showResults) {
    const resultsData = JSON.parse(localStorage.getItem('assessment_results') || '{}');
    return (
      <AssessmentResults
        resultsData={resultsData}
        onStartSingleCategoryAssessment={handleStartSingleCategoryAssessment}
        onSelectFocusAreas={handleSelectFocusAreas}
      />
    );
  }

  // Show manual selection interface if requested
  if (showManualSelection) {
    // Check if user has completed assessment to determine which content to show
    const hasAssessmentResults = localStorage.getItem('assessment_results');
    const assessmentResultsData = hasAssessmentResults ? JSON.parse(hasAssessmentResults) : null;
    const isFromAssessment = assessmentResultsData && assessmentResultsData.categories;
    
    return (
      <div className="min-h-screen flex flex-col">
        {/* White Header Section */}
        <div className="bg-white px-6 py-8" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h1 className="text-4xl font-bold text-black font-serif leading-tight">
            {t('manualSelection.selectYourFocusAreas')}
          </h1>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white">
          {/* Conditional Content Section - Gray Background */}
          <div className="px-6 py-8" style={{ backgroundColor: '#B8C5C5' }}>
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                {isFromAssessment ? (
                  <>
                    <h2 className="text-xl font-bold text-black uppercase">{t('manualSelection.recommendedFocusAreas')}</h2>
                    <p className="text-black text-lg leading-normal" dangerouslySetInnerHTML={{ __html: t('manualSelection.recommendationText') }} />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-black uppercase">{t('manualSelection.manualSelectionTitle')}</h2>
                    <p className="text-black text-lg leading-normal">
                      {t('manualSelection.manualSelectionDescription')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rest of content - White Background */}
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Primary Focus Area */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 uppercase">{t('manualSelection.primaryFocusArea')}</h3>
                <div className="bg-white border border-gray-300 p-4 rounded">
                  <Select
                    value={isFromAssessment && !primaryCategory ? 'tongue' : primaryCategory}
                    onValueChange={(value) => setPrimaryCategory(value as SinCategory)}
                  >
                    <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto bg-transparent text-gray-800 text-base" dir="ltr">
                      <SelectValue placeholder={t('manualSelection.selectFocusArea', 'Select Focus Area')} />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secondary Focus Area */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-3 uppercase">{t('manualSelection.secondaryFocusArea')}</h3>
                <div className="bg-white border border-gray-300 p-4 rounded">
                  <Select
                    value={isFromAssessment && !secondaryCategory ? 'stomach' : secondaryCategory}
                    onValueChange={(value) => setSecondaryCategory(value as SinCategory)}
                    disabled={!primaryCategory}
                  >
                    <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto bg-transparent text-gray-800 text-base" dir="ltr">
                      <SelectValue placeholder={t('manualSelection.selectFocusArea', 'Select Focus Area')} />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                      {categoryOptions
                        .filter(option => option.value !== primaryCategory)
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-4">
                <Button
                  onClick={handleManualSelectionComplete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-bold rounded"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = ((assessmentState.currentQuestionIndex + 1) / questionsOrder.length) * 100;
  const totalAnswered = Object.keys(assessmentState.responses).length;
  const currentAnswer = currentQuestion ? (assessmentState.responses[currentQuestion.id]?.answer || '') : '';

  if (!currentQuestion) {
    return (
      <div className="flex flex-col min-h-screen pb-16">
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
            <h2 className="text-xl font-semibold">{t('assessment.assessmentComplete', 'Assessment Complete')}</h2>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('assessment.assessmentFinished', 'Assessment Finished')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t('assessment.completedAllQuestions', 'You have completed all available questions.')}</p>
              <Button onClick={handleComplete} className="w-full">
                {t('assessment.finishAssessment', 'Finish Assessment')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Generate dynamic title based on assessment type
  const assessmentTitle = isSingleCategoryAssessment 
    ? `${currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)} ${t('assessment.assessment', 'Assessment')}`
    : t('assessment.selfAssessment', 'Self Assessment');
  
  const assessmentSubtitle = isSingleCategoryAssessment
    ? `Question ${assessmentState.currentQuestionIndex + 1} of ${questionsOrder.length}`
    : `Category: ${currentQuestion.category} • Answered: ${totalAnswered}/${questionsOrder.length}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* White Header Section */}
      <div className="bg-white px-6 py-6">
        <h1 className="text-4xl font-bold text-black mb-2 font-serif">{t('assessment.selfAssessment')}</h1>
        <p className="text-lg text-gray-700 mb-4">
          {t('assessment.category')}: {t(`sinCategories.${currentQuestion.category}.name`)} • {t('assessment.answered')}: {totalAnswered}/{questionsOrder.length}
        </p>
        
        {/* Progress Info */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>{t('assessment.questionLabel')} {assessmentState.currentQuestionIndex + 1} {t('assessment.of')} {questionsOrder.length}</span>
          <span>{Math.round(progress)}% {t('assessment.complete')}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div 
            className="bg-gray-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Teal Question Section */}
      <div className="px-6 py-6" style={{ backgroundColor: '#B8C5C5' }}>
        <h2 className="text-xl font-lato font-bold text-black leading-tight uppercase tracking-wide" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
          {currentQuestion.originalQuestion ? 
            getQuestionText(currentQuestion.originalQuestion, selectedLanguage) : 
            currentQuestion.text
          }
        </h2>
      </div>

      {/* Answer Options - Full Width Colored Bars */}
      <RadioGroup 
        key={currentQuestion.id} 
        value={currentAnswer || undefined} 
        className="flex-1"
      >
        {currentQuestion.options.map((option, index) => {
          // Exact colors from screenshot
          const colors = [
            'bg-yellow-500',     // Never - Yellow
            'bg-orange-400',     // Rarely - Orange  
            'bg-orange-600',     // Sometimes - Red-orange
            'bg-red-800',        // Often - Dark brown-red
            'bg-red-900'         // Very Often - Dark red
          ];
          
          const colorClass = colors[index] || colors[colors.length - 1];
          const isSelected = currentAnswer === option.value;
          
          // Find the corresponding response option with translations
          const responseOption = selfAssessmentResponseOptions[index];
          
          const optionText = responseOption ? 
            getResponseOptionText(responseOption, selectedLanguage) : 
            option.label;
          
          return (
            <div 
              key={option.value} 
              className={`relative flex items-center px-6 py-0.5 cursor-pointer transition-all ${colorClass} ${
                isSelected 
                  ? 'ring-4 ring-white ring-inset' 
                  : 'hover:brightness-110'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAnswerAndNext(option.value);
              }}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              <RadioGroupItem 
                value={option.value} 
                id={`${currentQuestion.id}-${option.value}`}
                className="me-2.5 bg-white border-white text-black data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <Label 
                htmlFor={`${currentQuestion.id}-${option.value}`} 
                className="flex-1 cursor-pointer text-white font-bold text-xl tracking-wide uppercase"
              >
                {optionText}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Bottom Navigation Section */}
      <div className="px-6 py-4" style={{ backgroundColor: '#B8C5C5' }}>
        {/* Navigation Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={assessmentState.currentQuestionIndex === 0}
            className="bg-transparent border-black text-black hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
{t('assessmentButtons.previous', 'PREVIOUS')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="bg-transparent border-black text-black hover:bg-black hover:text-white"
          >
            {selectedLanguage === 'ar' ? (
              <>
                {t('assessmentButtons.exitAssessment', 'EXIT ASSESSMENT')}
                <ArrowLeft className="h-4 w-4 ms-2" />
              </>
            ) : (
              <>
                <SkipForward className="h-4 w-4 me-2" />
                {t('assessmentButtons.exitAssessment', 'EXIT ASSESSMENT')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EnhancedSelfAssessment() {
  return (
    <AssessmentLanguageProvider>
      <EnhancedSelfAssessmentInner />
    </AssessmentLanguageProvider>
  );
}