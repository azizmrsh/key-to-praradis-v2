import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
// Temporary simple content type and function until contentService is fully implemented
interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedReadTime?: number;
}

function getRecommendedContent(focusArea: string, limit: number): ContentItem[] {
  // Return empty array for now - this will be populated when contentService is fully implemented
  return [];
}
import { useUser } from '@/contexts/UserContext';

export function RecommendedContentWidget() {
  const { userProgress } = useUser();
  const [recommendedContent, setRecommendedContent] = useState<ContentItem[]>([]);
  
  // Get the user's primary focus area from assessment results
  const focusArea = (() => {
    const assessmentResults = localStorage.getItem('assessment_results');
    if (assessmentResults) {
      try {
        const results = JSON.parse(assessmentResults);
        return results.primaryStruggle;
      } catch (error) {
        console.error('Error parsing assessment results:', error);
      }
    }
    return 'tongue'; // Default focus area
  })();
  
  // On mount, load recommended content
  useEffect(() => {
    const content = getRecommendedContent(focusArea, 3);
    setRecommendedContent(content);
  }, [focusArea]);
  
  // If no content, don't render the widget
  if (recommendedContent.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Recommended Content</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {recommendedContent.map((content) => (
            <Link key={content.id} href={`/content/${content.id}`}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="flex-shrink-0 mt-1">
                  {content.type === 'article' && <BookOpen className="h-5 w-5 text-blue-500" />}
                  {content.type === 'video' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                  {content.type === 'audio' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-purple-500">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2z"/><path d="M6 12v-2"/><path d="M10 12v-2"/><path d="M14 12v-2"/>
                    </svg>
                  )}
                  {content.type === 'practice' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500">
                      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{content.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{content.category}</span>
                    {content.estimatedReadTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.estimatedReadTime} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="ghost" asChild className="text-primary">
            <Link href="/content">
              <span>View All Content</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}