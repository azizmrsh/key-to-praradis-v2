import { useContext } from 'react';
import { SelfAssessmentContext } from '@/contexts/SelfAssessmentContext';

// Separate hook from the context definition to avoid Fast Refresh issues
export const useSelfAssessment = () => {
  const context = useContext(SelfAssessmentContext);
  if (context === undefined) {
    throw new Error('useSelfAssessment must be used within a SelfAssessmentProvider');
  }
  return context;
};