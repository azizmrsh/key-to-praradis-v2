import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lesson, Section } from '@shared/schema';

interface LessonContentProps {
  lesson: Lesson;
  section: Section;
  onComplete: (lessonId: number, reflections: Record<string, string>) => void;
}

export function LessonContent({ lesson, section, onComplete }: LessonContentProps) {
  const [, navigate] = useLocation();
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const handleReflectionChange = (question: string, value: string) => {
    setReflections(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleComplete = () => {
    onComplete(lesson.id, reflections);
    navigate(`/section/${section.id}`);
  };

  const content = lesson.content;
  
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="pattern-bg px-4 py-6 text-white">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 mr-2 p-0"
            onClick={() => navigate(`/section/${section.id}`)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-semibold">{lesson.title}</h2>
        </div>
        <p className="opacity-90">Lesson {lesson.order} of {5} • {section.title}</p>
      </div>
      
      <div className="p-4 bg-white flex-1">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Introduction</h3>
          <p className="text-neutral-700 mb-3">{content.introduction}</p>
          
          {content.quotes && content.quotes.length > 0 && (
            <div className="bg-neutral-100 p-4 rounded-lg mb-4 flex">
              <span className="material-icons text-primary mr-3 mt-1">format_quote</span>
              <div>
                <p className="italic text-neutral-700 mb-2">{content.quotes[0].text}</p>
                <p className="text-neutral-500 text-sm">{content.quotes[0].source}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Key Points</h3>
          <ul className="space-y-2 text-neutral-700">
            {content.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start">
                <span className="material-icons text-primary mr-2 text-sm mt-1">circle</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Practical Guidance</h3>
          <div className="space-y-3">
            {content.practicalGuidance.map((guide, idx) => (
              <div key={idx} className="bg-neutral-100 p-3 rounded-lg">
                <h4 className="font-medium text-primary mb-1">{guide.title}</h4>
                <p className="text-sm text-neutral-700">{guide.content}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Reflection Questions</h3>
          <div className="border border-neutral-200 rounded-lg divide-y">
            {content.reflectionQuestions.map((question, idx) => (
              <div key={idx} className="p-3">
                <p className="text-neutral-700 mb-2">{question}</p>
                <Textarea
                  value={reflections[question] || ''}
                  onChange={(e) => handleReflectionChange(question, e.target.value)}
                  placeholder="Write your reflection here..."
                  rows={2}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleComplete}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-lg font-medium"
          style={{ backgroundColor: '#dc2626' }}
        >
          Complete Lesson
        </Button>
      </div>
    </div>
  );
}
