import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lesson } from '@shared/schema';
import { cn } from '@/lib/utils';

interface LessonListProps {
  lessons: Lesson[];
  completedLessons: number[];
  sectionId: number;
}

export function LessonList({ lessons, completedLessons, sectionId }: LessonListProps) {
  const [, navigate] = useLocation();

  const isLessonCompleted = (lessonId: number) => {
    return completedLessons.includes(lessonId);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Lessons</h3>
      
      {lessons.map((lesson) => (
        <div 
          key={lesson.id}
          className={cn(
            "bg-white rounded-lg shadow-sm mb-3 overflow-hidden",
            isLessonCompleted(lesson.id) && "border-l-4 border-green-500"
          )}
        >
          <div className="flex justify-between p-4 items-center">
            <div className="flex-1">
              <h4 className="font-medium mb-1">{lesson.title}</h4>
              <p className="text-sm text-neutral-500">{lesson.description}</p>
            </div>
            {isLessonCompleted(lesson.id) ? (
              <span className="material-icons text-success">check_circle</span>
            ) : (
              <Button 
                variant="ghost" 
                className="text-primary text-sm font-medium"
                onClick={() => navigate(`/section/${sectionId}/lesson/${lesson.id}`)}
              >
                Start
              </Button>
            )}
          </div>
          {isLessonCompleted(lesson.id) && (
            <div className="h-1 bg-success"></div>
          )}
        </div>
      ))}
    </div>
  );
}
