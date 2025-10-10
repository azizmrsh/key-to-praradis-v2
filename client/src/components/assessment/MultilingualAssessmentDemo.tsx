import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  CheckCircle, 
  Star, 
  BarChart3, 
  BookOpen, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  selfAssessmentQuestions, 
  selfAssessmentResponseOptions, 
  getQuestionText, 
  getResponseOptionText, 
  translationStats,
  type SelfAssessmentQuestion,
  type SelfAssessmentResponseOption
} from '@/data/selfAssessmentData';
import { LanguageSelector } from './LanguageSelector';

export function MultilingualAssessmentDemo() {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | 'fr'>('en');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = selfAssessmentQuestions[currentQuestionIndex];
  const totalQuestions = selfAssessmentQuestions.length;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  const getCategoryStats = () => {
    const stats = Object.entries(translationStats.categories).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / translationStats.totalQuestions) * 100)
    }));
    return stats;
  };

  const getLanguageDirection = (language: 'en' | 'ar' | 'fr') => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Multilingual Assessment System
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {translationStats.totalQuestions} Questions
              </Badge>
              <Badge variant="secondary">
                3 Languages
              </Badge>
              <Badge variant="secondary">
                7 Categories
              </Badge>
            </div>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="samples">Sample Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assessment Question Demo</CardTitle>
                <Badge variant="outline">
                  {currentQuestionIndex + 1} of {totalQuestions}
                </Badge>
              </div>
              <Progress value={(currentQuestionIndex / totalQuestions) * 100} className="w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Question */}
                <div 
                  className="space-y-4"
                  dir={getLanguageDirection(selectedLanguage)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{currentQuestion.category}</Badge>
                    <Badge variant="outline">{currentQuestion.section}</Badge>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">
                      {getQuestionText(currentQuestion, selectedLanguage)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {currentQuestion.id}
                    </p>
                  </div>
                </div>

                {/* Response Options */}
                <div className="space-y-3">
                  <h4 className="font-medium">Response Options:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selfAssessmentResponseOptions.map((option, index) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 text-left border rounded-lg transition-all ${
                          selectedAnswer === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAnswer(option.value)}
                        dir={getLanguageDirection(selectedLanguage)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {getResponseOptionText(option, selectedLanguage)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {option.value}
                            </Badge>
                            {selectedAnswer === option.value && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Translation Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Translation Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Questions</span>
                    <Badge variant="secondary">{translationStats.totalQuestions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Arabic Translation</span>
                    <Badge variant="secondary">{translationStats.questionsWithArabic}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>French Translation</span>
                    <Badge variant="secondary">{translationStats.questionsWithFrench}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fully Translated</span>
                    <Badge variant="secondary">{translationStats.fullyTranslated}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getCategoryStats().map((stat) => (
                    <div key={stat.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{stat.category}</span>
                        <span>{stat.count} questions</span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="samples" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Sample Questions in All Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selfAssessmentQuestions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{question.category}</Badge>
                        <Badge variant="outline">{question.id}</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-1">English:</h4>
                          <p className="text-sm">{getQuestionText(question, 'en')}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-1">Arabic:</h4>
                          <p className="text-sm" dir="rtl">{getQuestionText(question, 'ar')}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-1">French:</h4>
                          <p className="text-sm">{getQuestionText(question, 'fr')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MultilingualAssessmentDemo;