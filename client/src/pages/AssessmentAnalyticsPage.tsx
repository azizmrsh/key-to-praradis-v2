import React from 'react';
import { AssessmentAnalyticsDashboard } from '@/components/assessment/AssessmentAnalyticsDashboard';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export function AssessmentAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        title="Assessment Analytics"
        subtitle="Track your spiritual progress and insights"
      />
      
      <div className="pb-20">
        <AssessmentAnalyticsDashboard />
      </div>
      
      <BottomNavigation />
    </div>
  );
}