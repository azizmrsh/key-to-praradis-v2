import React, { useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { SOSButton } from '@/components/layout/SOSButton';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { LessonList } from '@/components/sections/LessonList';
import { useUser } from '@/contexts/UserContext';
import { useContentStore } from '@/store/contentStore';

export default function SectionDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const sectionId = parseInt(params.id, 10);
  
  const { userProgress } = useUser();
  const { 
    getSectionById, 
    getLessonsBySection,
    getSectionProgress
  } = useContentStore();
  
  const section = getSectionById(sectionId);
  const lessons = getLessonsBySection(sectionId);
  const { completed: completedLessonsCount, total: totalLessonsCount } = getSectionProgress(sectionId);
  
  useEffect(() => {
    if (!section) {
      navigate('/content-dashboard');
    }
  }, [section, navigate]);
  
  if (!section) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <SectionHeader 
        section={section} 
        completedLessons={completedLessonsCount} 
        totalLessons={totalLessonsCount} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <LessonList 
          lessons={lessons} 
          completedLessons={userProgress?.completedLessons || []} 
          sectionId={sectionId} 
        />
      </main>
      
      <SOSButton />
      <BottomNavigation />
    </div>
  );
}
