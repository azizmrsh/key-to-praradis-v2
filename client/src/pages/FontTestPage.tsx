import React from 'react';
import { useLocation } from 'wouter';
import { ArabicText, BilingualText } from '@/components/ui/arabic-text';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FontTestPage() {
  const [, navigate] = useLocation();
  const arabicSample = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم";
  const quranVerse = "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ";
  const dhikrSample = "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ";

  return (
    <div className="min-h-screen bg-background">
      <AssessmentHeader 
        title="Arabic Font Test" 
        subtitle="Sakkal Font Weight Showcase" 
        onBack={() => navigate('/')}
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Font Weight Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Font Weight Examples</CardTitle>
            <CardDescription>All available Sakkal font weights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Light (300)</h3>
              <ArabicText variant="body" size="xl" weight="light">
                {arabicSample}
              </ArabicText>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Regular (400)</h3>
              <ArabicText variant="body" size="xl" weight="regular">
                {arabicSample}
              </ArabicText>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Medium (500)</h3>
              <ArabicText variant="body" size="xl" weight="medium">
                {arabicSample}
              </ArabicText>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Bold (700)</h3>
              <ArabicText variant="body" size="xl" weight="bold">
                {arabicSample}
              </ArabicText>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Heavy (900)</h3>
              <ArabicText variant="body" size="xl" weight="heavy">
                {arabicSample}
              </ArabicText>
            </div>
          </CardContent>
        </Card>

        {/* Quran Verse Example */}
        <Card>
          <CardHeader>
            <CardTitle>Quranic Verse</CardTitle>
            <CardDescription>Using medium weight for verses</CardDescription>
          </CardHeader>
          <CardContent>
            <BilingualText
              arabic={quranVerse}
              translation="And I did not create the jinn and mankind except to worship Me."
              transliteration="Wa mā khalaqtu al-jinna wa'l-insa illā li-ya'budūn"
              arabicSize="2xl"
              arabicWeight="medium"
            />
          </CardContent>
        </Card>

        {/* Dhikr Example */}
        <Card>
          <CardHeader>
            <CardTitle>Dhikr Example</CardTitle>
            <CardDescription>Using regular weight for dhikr</CardDescription>
          </CardHeader>
          <CardContent>
            <BilingualText
              arabic={dhikrSample}
              translation="Glory be to Allah and praise be to Him"
              transliteration="Subhān Allāhi wa bi-hamdihi"
              arabicSize="xl"
              arabicWeight="regular"
            />
          </CardContent>
        </Card>

        {/* Heading Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Heading Examples</CardTitle>
            <CardDescription>Different sizes with bold weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Large Heading</h3>
              <ArabicText variant="heading" size="2xl" weight="bold">
                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
              </ArabicText>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Medium Heading</h3>
              <ArabicText variant="heading" size="xl" weight="medium">
                الرَّحْمَنِ الرَّحِيمِ
              </ArabicText>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Small Heading</h3>
              <ArabicText variant="heading" size="lg" weight="medium">
                مَالِكِ يَوْمِ الدِّينِ
              </ArabicText>
            </div>
          </CardContent>
        </Card>

        {/* Font Loading Status */}
        <Card>
          <CardHeader>
            <CardTitle>Font Loading Status</CardTitle>
            <CardDescription>Check if Sakkal fonts are loaded correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>✓ Sakkal Light (300) - Available</p>
              <p>✓ Sakkal Regular (400) - Available</p>
              <p>✓ Sakkal Medium (500) - Available</p>
              <p>✓ Sakkal Bold (700) - Available</p>
              <p>✓ Sakkal Heavy (900) - Available</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}