import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart3, Target, TrendingUp, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { SinCategory } from '@/data/selfAssessmentData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface CategoryScore {
  category: SinCategory;
  score: number;
  totalQuestions: number;
  percentage: number;
}

interface AssessmentResultsData {
  responses: Record<string, any>;
  skippedQuestions: string[];
  completedAt: Date;
  startedAt: Date;
  primaryStruggle: SinCategory;
  secondaryStruggle: SinCategory;
  categoryScores: Record<SinCategory, number>;
  categoryCounts?: Record<SinCategory, number>;
  isFullAssessment: boolean;
  singleCategoryResults?: Record<SinCategory, CategoryScore>;
  singleCategoryAssessment?: {
    category: SinCategory;
    score: number;
    totalQuestions: number;
    maxScore: number;
    percentage: number;
    severity: { level: string; color: string; message: string };
  };
}


interface AssessmentResultsProps {
  resultsData: AssessmentResultsData;
  onStartSingleCategoryAssessment: (category: SinCategory) => void;
  onSelectFocusAreas: (primary: SinCategory, secondary?: SinCategory) => void;
}

export function AssessmentResults({ resultsData, onStartSingleCategoryAssessment, onSelectFocusAreas }: AssessmentResultsProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const [selectedPrimary, setSelectedPrimary] = useState<SinCategory>(resultsData.primaryStruggle);
  const [selectedSecondary, setSelectedSecondary] = useState<SinCategory>(resultsData.secondaryStruggle);
  const [selectedCategoryForAssessment, setSelectedCategoryForAssessment] = useState<SinCategory>('tongue');

  // Function to recalculate scores from saved responses if needed
  const recalculateScoresFromResponses = (responses: Record<string, any>) => {
    const responseValueMap: Record<string, number> = {
      'never': 1,
      'rarely': 2,
      'sometimes': 3,
      'often': 4,
      'very_often': 5,
      'always': 5
    };

    const categoryScores: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };
    const categoryCounts: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };

    // Map category from question ID patterns
    const getCategoryFromQuestionId = (questionId: string): SinCategory | null => {
      if (questionId.startsWith('tongue_')) return 'tongue';
      if (questionId.startsWith('eyes_')) return 'eyes';
      if (questionId.startsWith('ears_')) return 'ears';
      if (questionId.startsWith('pride_')) return 'pride';
      if (questionId.startsWith('stomach_')) return 'stomach';
      if (questionId.startsWith('zina_')) return 'zina';
      if (questionId.startsWith('heart_')) return 'heart';
      return null;
    };

    Object.values(responses).forEach(response => {
      const category = getCategoryFromQuestionId(response.questionId);
      if (category) {
        const score = responseValueMap[response.answer] || 0;
        if (score > 0) {
          categoryScores[category] += score;
          categoryCounts[category] += 1;
        }
      }
    });

    return { categoryScores, categoryCounts };
  };

  // Check if we need to recalculate scores (if all scores are 0 but we have responses)
  const needsRecalculation = resultsData.responses && 
    Object.keys(resultsData.responses).length > 0 && 
    Object.values(resultsData.categoryScores || {}).every(score => score === 0);

  // Recalculate if needed
  const finalResultsData = needsRecalculation ? (() => {
    const { categoryScores, categoryCounts } = recalculateScoresFromResponses(resultsData.responses);
    return {
      ...resultsData,
      categoryScores,
      categoryCounts
    };
  })() : resultsData;

  // Calculate category scores and statistics
  const categoryScores: CategoryScore[] = finalResultsData.categoryScores ? Object.entries(finalResultsData.categoryScores).map(([category, score]) => {
    const totalQuestions = finalResultsData.categoryCounts ? finalResultsData.categoryCounts[category as SinCategory] || 0 : 10;
    // Calculate percentage: (total score / max possible score) * 100
    // Max possible score = totalQuestions * 5 (since responses range from 1-5)
    const maxPossibleScore = totalQuestions * 5;
    const percentage = totalQuestions > 0 && maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
    
    return {
      category: category as SinCategory,
      score,
      totalQuestions,
      percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
    };
  }).sort((a, b) => b.percentage - a.percentage) : [];

  // Calculate total questions from category counts (sum of all questions across categories)
  const totalQuestions = finalResultsData.categoryCounts 
    ? Object.values(finalResultsData.categoryCounts).reduce((sum, count) => sum + count, 0)
    : (finalResultsData.responses ? Object.keys(finalResultsData.responses).length : 0);
  
  const completionTime = finalResultsData.completedAt && finalResultsData.startedAt 
    ? Math.round((new Date(finalResultsData.completedAt).getTime() - new Date(finalResultsData.startedAt).getTime()) / 1000 / 60)
    : 0;

  const handleFocusAreasSelection = () => {
    onSelectFocusAreas(selectedPrimary, selectedSecondary);
    toast({
      title: t('assessment.results.focusAreasSelected'),
      description: t('assessment.results.chosenToFocus', { primary: t(`sinCategories.${selectedPrimary}.name`), secondary: t(`sinCategories.${selectedSecondary}.name`) })
    });
  };

  const handleSingleCategoryAssessment = () => {
    onStartSingleCategoryAssessment(selectedCategoryForAssessment);
    toast({
      title: t('assessment.results.focusAreasSelected'),
      description: t('assessment.results.chosenToFocus', { primary: t(`sinCategories.${selectedCategoryForAssessment}.name`), secondary: '' })
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader
        title={t('assessment.results.title')}
        subtitle={t('assessment.results.subtitle')}
      />
      
      <div className="flex-1" style={{ backgroundColor: '#B8C5C5' }}>
        {/* Recommended Focus Areas Section - Gray Background */}
        <div className="px-6 py-8" style={{ backgroundColor: '#B8C5C5' }}>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black uppercase">{t('assessment.results.recommendedFocusAreas')}</h2>
              <p className="text-black text-lg leading-normal">
                {t('assessment.results.basedOnAssessment')} <strong>{t(`sinCategories.${categoryScores[0]?.category}.name`)}</strong> {t('assessment.results.and')} <strong>{t(`sinCategories.${categoryScores[1]?.category}.name`)}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Focus Area Selection Form - White Background */}
        <div className="bg-white px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Primary Focus Area */}
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-3 uppercase">{t('assessment.results.primaryFocusArea')}</h3>
              <div className="bg-white border border-gray-300 p-4 rounded">
                <Select
                  value={selectedPrimary}
                  onValueChange={(value) => setSelectedPrimary(value as SinCategory)}
                >
                  <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto bg-transparent text-gray-800 text-base">
                    <SelectValue placeholder={t(`sinCategories.${categoryScores[0]?.category}.name`)} />
                  </SelectTrigger>
                  <SelectContent className="rtl:text-right">
                    {(['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'] as SinCategory[]).map((key) => (
                      <SelectItem key={key} value={key} className="rtl:text-right">
                        {t(`sinCategories.${key}.name`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Secondary Focus Area */}
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-3 uppercase">{t('assessment.results.secondaryFocusArea')}</h3>
              <div className="bg-white border border-gray-300 p-4 rounded">
                <Select
                  value={selectedSecondary}
                  onValueChange={(value) => setSelectedSecondary(value as SinCategory)}
                >
                  <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto bg-transparent text-gray-800 text-base">
                    <SelectValue placeholder={t(`sinCategories.${categoryScores[1]?.category}.name`)} />
                  </SelectTrigger>
                  <SelectContent className="rtl:text-right">
                    {(['tongue', 'eyes', 'ears', 'pride', 'stomach', 'zina', 'heart'] as SinCategory[])
                      .filter((key) => key !== selectedPrimary)
                      .map((key) => (
                        <SelectItem key={key} value={key} className="rtl:text-right">
                          {t(`sinCategories.${key}.name`)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button
                onClick={handleFocusAreasSelection}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-bold rounded"
                style={{ backgroundColor: '#dc2626' }}
              >
                {t('assessment.results.continueWithFocus')}
              </Button>
            </div>
          </div>
        </div>

        {/* Assessment Statistics Section - Gray Background */}
        <div style={{ backgroundColor: '#B8C5C5' }} className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-black uppercase mb-6">{t('assessment.results.assessmentStatistics')}</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{totalQuestions}</div>
                <div className="text-base text-black font-medium">{t('assessment.results.questionsCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{completionTime} {t('assessment.results.mins')}</div>
                <div className="text-base text-black font-medium">{t('assessment.results.timeTaken')}</div>
              </div>
            </div>
            
            {resultsData.completedAt && (
              <div>
                <div className="text-sm font-bold text-black mb-1">{t('assessment.results.completionDate')}</div>
                <div className="text-sm text-black">
                  {new Date(resultsData.completedAt).toLocaleDateString(i18n.language, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Results - White Background */}
        <div className="bg-white px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {categoryScores.map((categoryScore, index) => (
              <div key={categoryScore.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-red-600 font-bold text-lg">#{index + 1}</div>
                    <span className="font-bold text-black text-base">
                      {t(`sinCategories.${categoryScore.category}.name`).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-black">
                    {categoryScore.percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-6 bg-gray-300 rounded-sm">
                    <div 
                      className="h-6 bg-gray-600 rounded-sm"
                      style={{ width: `${categoryScore.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {categoryScore.totalQuestions} {t('assessment.results.questionsCompleted')} • {t('assessment.score')} {categoryScore.score} ({categoryScore.totalQuestions * 5})
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Single Category Assessment - Hidden for now */}
        {false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Single Category Deep Dive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Take a detailed assessment focusing on just one category to get deeper insights.
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Category for Deep Assessment</label>
              <Select value={selectedCategoryForAssessment} onValueChange={(value) => setSelectedCategoryForAssessment(value as SinCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleSingleCategoryAssessment} variant="outline" className="w-full">
              Start Single Category Assessment
            </Button>
          </CardContent>
        </Card>
        )}

        {/* Single Category Assessment Results - Hidden for now */}
        {false && resultsData.singleCategoryAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Single Category Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {categoryInfo[resultsData.singleCategoryAssessment.category].title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {categoryInfo[resultsData.singleCategoryAssessment.category].description}
                </p>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {resultsData.singleCategoryAssessment.score}/{resultsData.singleCategoryAssessment.maxScore}
                  </div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {resultsData.singleCategoryAssessment.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Questions Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Challenge Level</span>
                  <span>{resultsData.singleCategoryAssessment.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={resultsData.singleCategoryAssessment.percentage} className="h-3" />
              </div>

              {/* Severity Assessment */}
              <div className={`p-4 rounded-lg ${resultsData.singleCategoryAssessment.severity.color}`}>
                <div className="font-semibold mb-2">
                  Assessment Level: {resultsData.singleCategoryAssessment.severity.level}
                </div>
                <p className="text-sm">
                  {resultsData.singleCategoryAssessment.severity.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onSelectFocusAreas(resultsData.singleCategoryAssessment!.category)}
                    className="flex-1"
                  >
                    Focus on This Area
                  </Button>
                  <Button 
                    onClick={() => navigate('/content-dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    View Content
                  </Button>
                </div>
                <Button 
                  onClick={() => navigate('/assessment-review')}
                  variant="outline"
                  className="w-full"
                >
                  Review Assessment History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}