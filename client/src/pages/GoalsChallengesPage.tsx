import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Target, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { GoalsEngine } from '@/components/goals/GoalsEngine';
import { ChallengeSelector } from '@/components/goals/ChallengeSelector';

export function GoalsChallengesPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('goals');
  const [userFocusAreas, setUserFocusAreas] = useState({
    primary: 'eyes',
    secondary: 'ears'
  });

  useEffect(() => {
    // Load user's focus areas from assessment results
    const results = localStorage.getItem('assessment_results');
    if (results) {
      try {
        const parsed = JSON.parse(results);
        setUserFocusAreas({
          primary: parsed.primaryStruggle || 'eyes',
          secondary: parsed.secondaryStruggle || 'ears'
        });
      } catch (error) {
        console.error('Error loading assessment results:', error);
      }
    }
  }, []);

  const getCategoryDisplayName = (category: string) => {
    const categoryNames = {
      'eyes': 'Vision & Gaze',
      'ears': 'Hearing & Listening', 
      'tongue': 'Speech & Communication',
      'heart': 'Heart & Intentions',
      'pride': 'Pride & Arrogance',
      'stomach': 'Consumption & Sustenance',
      'zina': 'Purity & Chastity'
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Header Section - White Background */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }}>
        <h1 className="text-4xl font-bold text-black mb-2 font-serif">Your Path</h1>
        <p className="text-2xl text-gray-600 font-serif">Track your spiritual growth journey</p>
      </div>

      {/* Focus Area Section - Light Blue-Gray Background */}
      <div className="px-6 py-4" style={{ backgroundColor: '#B8C5C5' }}>
        <div className="text-sm font-bold text-black mb-1">FOCUS AREA</div>
        <div className="text-red-600 font-medium">
          {getCategoryDisplayName(userFocusAreas.primary)} • {getCategoryDisplayName(userFocusAreas.secondary)}
        </div>
      </div>

      {/* Tab System */}
      <div className="flex px-4 pt-4 pb-0 gap-2">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium rounded-lg border-2 ${
            activeTab === 'goals' 
              ? 'bg-white text-black border-black' 
              : 'bg-gray-400 text-black border-gray-400'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium rounded-lg border-2 ${
            activeTab === 'challenges' 
              ? 'bg-white text-black border-black' 
              : 'bg-gray-400 text-black border-gray-400'
          }`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white">
        {activeTab === 'goals' ? (
          <div className="p-6">
            {/* Active Goals Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-red-600">ACTIVE GOALS</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Take a detailed assessment focusing on just one category to get deeper insights.
              </p>
              
              {/* Active Goal Cards */}
              <div className="space-y-3 mb-6">
                <Card className="border border-gray-300">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-black">
                      {getCategoryDisplayName(userFocusAreas.primary)} (Primary Focus)
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-black">
                      {getCategoryDisplayName(userFocusAreas.secondary)} (Secondary Focus)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Available Goals Section */}
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-4">Available Goals</h3>
              <GoalsEngine 
                focusSinPrimary={userFocusAreas.primary}
                focusSinSecondary={userFocusAreas.secondary}
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Active Challenges Section */}
            <div className="mb-6">
              <ChallengeSelector 
                userFocusAreas={userFocusAreas}
              />
            </div>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}