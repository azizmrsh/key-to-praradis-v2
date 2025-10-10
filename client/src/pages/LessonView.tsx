import React from 'react';
import { useParams } from 'wouter';
import { LessonContent } from '@/components/lessons/LessonContent';
import { SOSButton } from '@/components/layout/SOSButton';
import { useUser } from '@/contexts/UserContext';
import { useContentStore } from '@/store/contentStore';

export default function LessonView() {
  const params = useParams<{ sectionId: string; lessonId: string }>();
  const sectionId = parseInt(params.sectionId, 10);
  const lessonId = parseInt(params.lessonId, 10);
  
  const { userProgress, updateUserProgress } = useUser();
  const { 
    getSectionById, 
    getLessonById,
    completeLesson
  } = useContentStore();
  
  const section = getSectionById(sectionId);
  const lesson = getLessonById(lessonId);
  
  const handleCompleteLesson = (lessonId: number, reflections: Record<string, string>) => {
    // Save reflections and mark lesson as complete
    completeLesson(lessonId, reflections);
  };
  
  if (!section || !lesson) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <LessonContent 
        lesson={lesson} 
        section={section} 
        onComplete={handleCompleteLesson} 
      />
      
      <SOSButton />
    </div>
  );
}
