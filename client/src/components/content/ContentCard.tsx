import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BookOpen, Clock, Heart } from 'lucide-react';
import { ContentLesson } from '@/data/contentRepository';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  content: ContentLesson;
  compact?: boolean;
}

export function ContentCard({ content, compact = false }: ContentCardProps) {
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  // Simplified for lesson content
  
  const cardClasses = cn(
    "overflow-hidden",
    "border-primary/10",
    "hover:border-primary/30",
    "transition-all",
    "duration-200",
    "h-full",
    compact ? "max-w-xs" : ""
  );
  
  return (
    <Link href={`/lesson/${content.id}`}>
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Lesson</span>
              <span className="mx-1">•</span>
              <Clock className="h-3 w-3" />
              <span>{content.duration} min</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={cn(
                  "h-4 w-4", 
                  isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} 
              />
            </Button>
          </div>
          <CardTitle className={cn(
            "line-clamp-2",
            compact ? "text-base" : "text-xl"
          )}>
            {content.title}
          </CardTitle>
          <CardDescription className={cn(
            "line-clamp-2",
            compact ? "text-xs" : "text-sm"
          )}>
            {content.coreMessage}
          </CardDescription>
        </CardHeader>
        
        {!compact && (
          <CardContent>
            <div className="flex flex-wrap gap-1 mt-1">
              {content.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
        
        <CardFooter className="text-xs text-muted-foreground">
          Lesson {content.order}
        </CardFooter>
      </Card>
    </Link>
  );
}