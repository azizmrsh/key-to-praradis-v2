import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SinCategory, AssessmentResponse, SelfAssessmentResult } from '../types';
import { selfAssessmentQuestions } from '../data/selfAssessmentData';

interface SelfAssessmentContextType {
  responses: AssessmentResponse[];
  isAssessmentComplete: boolean;
  results: SelfAssessmentResult | null;
  saveResponse: (questionId: string, answer: string) => void;
  calculateResults: () => void;
  resetAssessment: () => void;
}

const SelfAssessmentContext = createContext<SelfAssessmentContextType | undefined>(undefined);

export function SelfAssessmentProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [results, setResults] = useState<SelfAssessmentResult | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);

  const saveResponse = (questionId: string, answer: string) => {
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, { questionId, answer }];
    });
  };

  const calculateResults = () => {
    const categoryScores: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };
    const totalQuestions: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };
    const answeredQuestions: Record<SinCategory, number> = {
      tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
    };

    // Count total questions per category
    selfAssessmentQuestions.forEach(q => {
      totalQuestions[q.category]++;
    });

    // Calculate scores
    responses.forEach(response => {
      const question = selfAssessmentQuestions.find(q => q.id === response.questionId);
      if (question) {
        const score = parseInt(response.answer) || 0;
        categoryScores[question.category] += score;
        answeredQuestions[question.category]++;
      }
    });

    // Find primary and secondary struggles
    const avgScores = Object.entries(categoryScores).map(([category, total]) => ({
      category: category as SinCategory,
      avgScore: answeredQuestions[category as SinCategory] > 0 ? 
        total / answeredQuestions[category as SinCategory] : 0
    }));

    avgScores.sort((a, b) => b.avgScore - a.avgScore);

    const result: SelfAssessmentResult = {
      categoryScores,
      totalQuestions,
      answeredQuestions,
      primaryStruggle: avgScores[0]?.category || 'tongue',
      secondaryStruggle: avgScores[1]?.category || 'heart',
      completedAt: new Date()
    };

    setResults(result);
    setIsAssessmentComplete(true);
  };

  const resetAssessment = () => {
    setResponses([]);
    setResults(null);
    setIsAssessmentComplete(false);
  };

  const contextValue: SelfAssessmentContextType = {
    responses,
    isAssessmentComplete,
    results,
    saveResponse,
    calculateResults,
    resetAssessment,
  };

  return (
    <SelfAssessmentContext.Provider value={contextValue}>
      {children}
    </SelfAssessmentContext.Provider>
  );
}

export const useSelfAssessment = () => {
  const context = useContext(SelfAssessmentContext);
  if (context === undefined) {
    throw new Error('useSelfAssessment must be used within a SelfAssessmentProvider');
  }
  return context;
};