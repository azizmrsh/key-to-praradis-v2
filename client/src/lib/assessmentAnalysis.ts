
import { SpeechAssessment } from '@shared/schema';

export function analyzeSpeechAssessment(assessment: SpeechAssessment) {
  const highRiskAreas = Object.entries(assessment)
    .filter(([_, value]) => value === 'often' || value === 'very_often')
    .map(([key]) => key);

  const moderateRiskAreas = Object.entries(assessment)
    .filter(([_, value]) => value === 'sometimes')
    .map(([key]) => key);

  return {
    highRiskAreas,
    moderateRiskAreas,
    needsImmediate: highRiskAreas.length > 0,
    recommendedFocus: highRiskAreas[0] || moderateRiskAreas[0],
    overallRisk: highRiskAreas.length > 2 ? 'high' : 
                 moderateRiskAreas.length > 3 ? 'moderate' : 'low'
  };
}
