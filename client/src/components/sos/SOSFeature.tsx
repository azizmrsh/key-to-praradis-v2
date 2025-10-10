import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';

// Islamic emergency resources and prayers for spiritual crises
const emergencyPrayers = [
  {
    id: 'distress',
    title: "Dua for Distress",
    arabic: "لا إله إلا الله العظيم الحليم",
    transliteration: "La ilaha illallahul-Azimul-Halim",
    translation: "There is no god but Allah the Mighty, the Forbearing.",
    source: "Bukhari and Muslim"
  },
  {
    id: 'anxiety',
    title: "Dua for Anxiety",
    arabic: "اللهم إني عبدك، وابن عبدك",
    transliteration: "Allahumma inni abduka, wabnu abdika",
    translation: "O Allah, I am Your slave, son of Your slave.",
    source: "Ahmad"
  },
  {
    id: 'temptation',
    title: "Dua for Temptation",
    arabic: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ",
    transliteration: "Allahumma alimal-ghaybi wash-shahadati",
    translation: "O Allah, Knower of the unseen and the evident.",
    source: "Abu Dawud"
  }
];

const supportResources = [
  {
    title: "Immediate Steps When Feeling Overwhelmed",
    items: [
      "Take a deep breath",
      "Perform wudu (ablution)",
      "Find a quiet space",
      "Recite Ayat al-Kursi",
      "Remember Allah's mercy"
    ]
  },
  {
    title: "Actions to Strengthen Spiritual Resilience",
    items: [
      "Establish regular prayer",
      "Remember this is a test",
      "Connect with supportive people",
      "Distance from negative influences",
      "Remember the door to repentance"
    ]
  }
];

const reminders = [
  {
    title: "Mercy of Allah",
    content: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins. - Quran 39:53"
  },
  {
    title: "Ease After Difficulty",
    content: "For indeed, with hardship will be ease. - Quran 94:5-6"
  },
  {
    title: "No Burden Beyond Capacity",
    content: "Allah does not burden a soul beyond that it can bear. - Quran 2:286"
  },
  {
    title: "The Prophet's Hope",
    content: "Victory comes with patience, relief with affliction, and ease with hardship. - Tirmidhi"
  }
];

export function SOSFeature() {
  const { updateUserProgress } = useUser();
  const [selectedPrayer, setSelectedPrayer] = useState<(typeof emergencyPrayers)[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handlePrayerClick = (prayer: (typeof emergencyPrayers)[0]) => {
    setSelectedPrayer(prayer);
    setIsDialogOpen(true);
    
    // Record activity
    updateUserProgress({
      lastActivity: new Date()
    });
  };

  return (
    <div className="sos-feature">
      <Alert className="mb-4 bg-primary-50 text-primary">
        <AlertDescription>
          This feature provides spiritual support for moments of crisis. These resources are meant to offer immediate comfort and guidance.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="prayers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prayers">Duas</TabsTrigger>
          <TabsTrigger value="steps">Next Steps</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prayers" className="space-y-4">
          {emergencyPrayers.map(prayer => (
            <Card 
              key={prayer.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePrayerClick(prayer)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{prayer.title}</CardTitle>
                <CardDescription>Source: {prayer.source}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{prayer.translation}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Read Full Dua
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="steps">
          <Card>
            <CardContent className="pt-6">
              {supportResources.map((resource, index) => (
                <div key={index} className="mb-6">
                  <h3 className="font-medium text-lg mb-2">{resource.title}</h3>
                  <ul className="space-y-2">
                    {resource.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="material-icons text-primary mr-2 text-sm mt-1">check_circle</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reminders">
          <Accordion type="single" collapsible className="w-full">
            {reminders.map((reminder, index) => (
              <AccordionItem key={index} value={`reminder-${index}`}>
                <AccordionTrigger className="text-left">
                  {reminder.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">{reminder.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
      
      {/* Prayer Detail Dialog */}
      {selectedPrayer && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPrayer.title}</DialogTitle>
              <DialogDescription>Source: {selectedPrayer.source}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Arabic</h4>
                <p className="text-xl text-right leading-relaxed" dir="rtl">{selectedPrayer.arabic}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Transliteration</h4>
                <p className="text-sm">{selectedPrayer.transliteration}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Translation</h4>
                <p className="text-sm">{selectedPrayer.translation}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}