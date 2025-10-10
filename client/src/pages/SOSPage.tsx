import React, { useState } from 'react';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { DhikrPlayer } from '@/components/sos/DhikrPlayer';
import { BreathingExercise } from '@/components/sos/BreathingExercise';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelfAssessmentProvider } from '@/contexts/SelfAssessmentContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Wind, Quote, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'wouter';

// Import SOS content configuration
import { dhikrData, quotes, emergencyActions, breathingExerciseConfig } from '@/data/sosContent';

function SOSContent() {
  const [, navigate] = useLocation();
  const [activeQuote, setActiveQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  const [activeDhikr, setActiveDhikr] = useState(dhikrData[0]);
  
  // Get a random quote
  const getRandomQuote = () => {
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setActiveQuote(newQuote);
  };
  
  // Change active dhikr
  const handleDhikrChange = (dhikrId: number) => {
    const dhikr = dhikrData.find(d => d.id === dhikrId);
    if (dhikr) setActiveDhikr(dhikr);
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AssessmentHeader title="Support (SOS)" onBack={() => navigate('/')} />
      
      <Container className="flex-1 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Emergency Spiritual Support</h1>
          <p className="text-muted-foreground">
            Use these tools when you're feeling spiritually vulnerable or in need of immediate support.
          </p>
        </div>
        
        <Tabs defaultValue="dhikr" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="dhikr" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Dhikr</span>
            </TabsTrigger>
            <TabsTrigger value="breathing" className="flex items-center gap-1">
              <Wind className="h-4 w-4" />
              <span className="hidden sm:inline">Breathing</span>
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guidance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dhikr" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Dhikr (Remembrance)</CardTitle>
                <CardDescription>
                  Select a dhikr to recite. Repeating these phrases can bring calm and focus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DhikrPlayer 
                  title={activeDhikr.title}
                  text={activeDhikr.text}
                  transliteration={activeDhikr.transliteration}
                  translation={activeDhikr.translation}
                />
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dhikrData.map(dhikr => (
                    <Button
                      key={dhikr.id}
                      variant={dhikr.id === activeDhikr.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDhikrChange(dhikr.id)}
                      className="justify-start"
                    >
                      {dhikr.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="breathing">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Breathing Exercise</CardTitle>
                <CardDescription>
                  A guided breathing exercise to help calm your mind and reduce anxiety.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BreathingExercise duration={breathingExerciseConfig.defaultDuration} />
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4 mt-2">
                <p>Take a few minutes to breathe mindfully. This can help clear your thoughts and regain focus.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="guidance">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inspiration & Guidance</CardTitle>
                <CardDescription>
                  Reminders and wisdom to strengthen your resolve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-2">
                    <Quote className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-base mb-2">{activeQuote.text}</p>
                      <p className="text-sm text-muted-foreground">{activeQuote.source}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={getRandomQuote}
                  >
                    Another Quote
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium mb-3">Emergency Actions</h3>
                <div className="space-y-3">
                  {emergencyActions.map(action => (
                    <Button 
                      key={action.id}
                      variant="outline" 
                      className="w-full justify-between"
                      asChild
                    >
                      <Link href={action.route}>
                        <span>{action.title}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
      
      <BottomNavigation />
    </div>
  );
}

function SOSPage() {
  return (
    <SelfAssessmentProvider>
      <SOSContent />
    </SelfAssessmentProvider>
  );
}

export default SOSPage;