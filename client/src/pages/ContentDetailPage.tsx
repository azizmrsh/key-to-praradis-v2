import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
// Temporarily disabled for Content Delivery System demo
// import { 
//   getContentItem, 
//   markContentAsViewed, 
//   ContentItem, 
//   ContentSection, 
//   Reflection,
//   saveReflection, 
//   getReflections
// } from '@/lib/contentService';
import { 
  BookOpen, 
  Clock, 
  Heart, 
  Share2, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Slider } from '@/components/ui/slider';

export function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const contentId = parseInt(params.id, 10);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load content
  useEffect(() => {
    if (!isNaN(contentId)) {
      const contentItem = getContentItem(contentId);
      
      if (contentItem) {
        setContent(contentItem);
        // Mark as viewed
        markContentAsViewed(contentId);
        // Load reflections
        setReflections(getReflections(contentId));
      }
      
      setIsLoading(false);
    }
  }, [contentId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="flex flex-col min-h-screen">
        <UnifiedHeader title="Content Not Found" />
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, the content you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/content">Browse Content</a>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  const typeLabel = {
    article: "Article",
    video: "Video",
    audio: "Audio",
    practice: "Practice"
  }[content.type];
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader title={typeLabel} />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline" className="capitalize">
              {content.category}
            </Badge>
            {content.estimatedReadTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {content.estimatedReadTime} min read
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
          <p className="text-muted-foreground">{content.description}</p>
          
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorite</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 ml-auto" asChild>
              <a href="#reflection">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Reflect</span>
              </a>
            </Button>
          </div>
          
          <Separator className="my-6" />
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p>{content.content.introduction}</p>
          </div>
          
          <Accordion
            type="single"
            collapsible
            value={activeSection || undefined}
            onValueChange={setActiveSection}
            className="mb-8"
          >
            {content.content.sections.map((section: ContentSection, index: number) => (
              <AccordionItem key={index} value={`section-${index}`}>
                <AccordionTrigger className="text-lg font-medium py-4">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">
                    <div className="whitespace-pre-line">{section.body}</div>
                    
                    {section.quotes && section.quotes.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {section.quotes.map((quote, qIndex) => (
                          <blockquote key={qIndex} className="border-l-4 border-primary/30 pl-4 italic">
                            <p>"{quote.text}"</p>
                            <footer className="text-sm text-muted-foreground mt-1">
                              — {quote.source}
                            </footer>
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Conclusion</h2>
            <p>{content.content.conclusion}</p>
          </div>
          
          {content.sourceReference && (
            <div className="text-sm text-muted-foreground italic mb-8">
              Source: {content.sourceReference}
            </div>
          )}
          
          <Separator className="my-8" />
          
          <div id="reflection" className="scroll-mt-16">
            <ReflectionSection 
              contentId={content.id} 
              questions={content.content.questions} 
              reflections={reflections}
              onReflectionAdded={(reflection) => {
                setReflections([...reflections, reflection]);
              }}
            />
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

const reflectionSchema = z.object({
  answers: z.record(z.string().min(2, "Please write at least 2 characters")),
  impactRating: z.number().min(1).max(5),
  actionItems: z.array(z.string()).optional(),
});

type ReflectionFormValues = z.infer<typeof reflectionSchema>;

interface ReflectionSectionProps {
  contentId: number;
  questions: string[];
  reflections: Reflection[];
  onReflectionAdded: (reflection: Reflection) => void;
}

function ReflectionSection({ 
  contentId, 
  questions, 
  reflections, 
  onReflectionAdded 
}: ReflectionSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("reflect");
  const { toast } = useToast();
  
  const form = useForm<ReflectionFormValues>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      answers: questions.reduce((acc, _, i) => {
        acc[`question-${i}`] = "";
        return acc;
      }, {} as Record<string, string>),
      impactRating: 3,
      actionItems: [],
    },
  });
  
  const onSubmit = (values: ReflectionFormValues) => {
    try {
      const reflection: Reflection = {
        contentId,
        date: new Date().toISOString(),
        answers: values.answers,
        impactRating: values.impactRating,
        actionItems: values.actionItems || [],
      };
      
      saveReflection(reflection);
      onReflectionAdded(reflection);
      
      // Reset form
      form.reset({
        answers: questions.reduce((acc, _, i) => {
          acc[`question-${i}`] = "";
          return acc;
        }, {} as Record<string, string>),
        impactRating: 3,
        actionItems: [],
      });
      
      // Switch to past reflections tab
      setActiveTab("past");
      
      toast({
        title: "Reflection saved",
        description: "Your reflection has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reflection & Application</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="reflect">New Reflection</TabsTrigger>
          <TabsTrigger value="past">Past Reflections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reflect">
          <p className="text-muted-foreground mb-6">
            Taking time to reflect on what you've read helps deepen understanding and commit to practical application.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {questions.map((question, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`answers.question-${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">{question}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your response..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              
              <FormField
                control={form.control}
                name="impactRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      How impactful was this content for you? ({field.value}/5)
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      1 = Not very impactful, 5 = Extremely impactful
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Save Reflection</Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="past">
          {reflections.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No reflections yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't recorded any reflections on this content. 
                Switch to the New Reflection tab to add one.
              </p>
              <Button variant="outline" onClick={() => setActiveTab("reflect")}>
                Create Reflection
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reflections.map((reflection, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">Reflection</CardTitle>
                    <CardDescription>{formatDate(reflection.date)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(reflection.answers).map(([key, answer], answerIndex) => {
                      const questionIndex = parseInt(key.split('-')[1], 10);
                      return (
                        <div key={answerIndex}>
                          <p className="font-medium">{questions[questionIndex]}</p>
                          <p className="text-muted-foreground mt-1">{answer}</p>
                        </div>
                      );
                    })}
                    
                    <div className="mt-4">
                      <p className="font-medium">Impact Rating</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-8 rounded-full ${
                              i < reflection.impactRating
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm">
                          {reflection.impactRating}/5
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}