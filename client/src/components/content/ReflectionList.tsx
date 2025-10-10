import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { 
  getReflections, 
  getContentItem, 
  ContentItem, 
  Reflection 
} from '@/lib/contentService';
import { 
  ClipboardList, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  Video, 
  Headphones, 
  Sparkles 
} from 'lucide-react';

export function ReflectionList() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [contentCache, setContentCache] = useState<Record<number, ContentItem>>({});
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  // Load all reflections on mount
  useEffect(() => {
    const allReflections = getReflections();
    setReflections(allReflections);
    
    // Pre-load content details for all reflections
    const contentIds = Array.from(new Set(allReflections.map(r => r.contentId)));
    const contentMap: Record<number, ContentItem> = {};
    
    contentIds.forEach(id => {
      const content = getContentItem(id);
      if (content) {
        contentMap[id] = content;
      }
    });
    
    setContentCache(contentMap);
  }, []);
  
  // Filter reflections based on selected period
  const filteredReflections = React.useMemo(() => {
    if (filterPeriod === 'all') {
      return reflections;
    }
    
    return reflections.filter(reflection => {
      const date = parseISO(reflection.date);
      
      if (filterPeriod === 'today') {
        return isToday(date);
      }
      
      if (filterPeriod === 'week') {
        return isThisWeek(date);
      }
      
      if (filterPeriod === 'month') {
        return isThisMonth(date);
      }
      
      return true;
    });
  }, [reflections, filterPeriod]);
  
  // Group reflections by date
  const groupedReflections = React.useMemo(() => {
    const groups: Record<string, Reflection[]> = {};
    
    filteredReflections.forEach(reflection => {
      const date = parseISO(reflection.date);
      let groupKey = '';
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(reflection);
    });
    
    return groups;
  }, [filteredReflections]);
  
  // Sort dates for rendering
  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedReflections).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      
      // For other dates, parse and compare
      const dateA = a === 'Today' 
        ? new Date() 
        : a === 'Yesterday' 
          ? new Date(new Date().setDate(new Date().getDate() - 1)) 
          : new Date(a);
      
      const dateB = b === 'Today' 
        ? new Date() 
        : b === 'Yesterday' 
          ? new Date(new Date().setDate(new Date().getDate() - 1)) 
          : new Date(b);
      
      return dateB.getTime() - dateA.getTime();
    });
  }, [groupedReflections]);
  
  // Function to get content title
  const getContentTitle = (contentId: number) => {
    return contentCache[contentId]?.title || 'Unknown Content';
  };
  
  // Function to get content type icon
  const getContentTypeIcon = (contentId: number) => {
    const content = contentCache[contentId];
    if (!content) return <BookOpen className="h-4 w-4" />;
    
    switch (content.type) {
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <Headphones className="h-4 w-4 text-purple-500" />;
      case 'practice':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'article':
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      return '';
    }
  };
  
  if (reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Reflections</CardTitle>
          <CardDescription>
            Record your thoughts and insights as you engage with content
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reflections yet</h3>
          <p className="text-muted-foreground mb-4">
            Your reflections will appear here after you engage with content
          </p>
          <Button asChild>
            <Link href="/content">Browse Content</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Your Reflections</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredReflections.length} {filteredReflections.length === 1 ? 'reflection' : 'reflections'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)} className="mb-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {sortedDates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No reflections found for the selected period
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{date}</span>
                </h3>
                
                <div className="space-y-3">
                  {groupedReflections[date].map((reflection, index) => {
                    const contentId = reflection.contentId;
                    const content = contentCache[contentId];
                    
                    return (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-primary/5 border border-primary/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Link href={`/content/${contentId}`}>
                            <h4 className="font-medium text-base hover:underline flex items-center gap-1">
                              {getContentTypeIcon(contentId)}
                              <span>{getContentTitle(contentId)}</span>
                            </h4>
                          </Link>
                          
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reflection.date)}
                          </span>
                        </div>
                        
                        {content && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {content.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex}
                                variant="outline" 
                                className="text-xs px-1.5 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <div 
                              className="h-2 w-16 rounded-full bg-gradient-to-r from-green-100 to-green-500 dark:from-green-900 dark:to-green-500"
                              style={{ 
                                clipPath: `inset(0 ${100 - (reflection.impactRating / 5 * 100)}% 0 0)` 
                              }}
                            />
                            <span className="text-xs">Impact: {reflection.impactRating}/5</span>
                          </div>
                          
                          {Object.values(reflection.answers).slice(0, 1).map((answer, i) => (
                            <p key={i} className="text-muted-foreground line-clamp-2">
                              {answer}
                            </p>
                          ))}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 h-7 text-xs text-primary" 
                          asChild
                        >
                          <Link href={`/content/${contentId}`}>
                            <span>View Content</span>
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/content">
            Explore More Content
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}