import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { Heart, Users, BookOpen, Target } from 'lucide-react';
import logoImage from '@assets/QT_final_logo-02-01_1751283453807.png';

export function AboutPGTPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-5 pb-24">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logoImage} 
            alt="Keys to Paradise Logo" 
            className="w-[40%] mb-4"
          />
          <h1 className="text-2xl font-bold text-center">
            {t('aboutPGT.title')}
          </h1>
        </div>

        <div className="space-y-6">
          {/* About the Trust */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {t('aboutPGT.aboutTrust')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t('aboutPGT.trustDescription')}
              </p>
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{t('aboutPGT.ourMission')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('aboutPGT.missionSubtitle')}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t('aboutPGT.missionDescription')}
              </p>
            </CardContent>
          </Card>

          {/* What We Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
{t('aboutPGT.whatWeOffer')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t('aboutPGT.personalizedAssessment')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('aboutPGT.assessmentDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t('aboutPGT.guidedLearning')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('aboutPGT.learningDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Approach */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aboutPGT.ourApproach')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('aboutPGT.approachDescription')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">{t('aboutPGT.speechCommunication')}</h4>
                  <p className="text-sm text-green-700">{t('aboutPGT.speechDescription')}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">{t('aboutPGT.visualConduct')}</h4>
                  <p className="text-sm text-blue-700">{t('aboutPGT.visualDescription')}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">{t('aboutPGT.listeningHabits')}</h4>
                  <p className="text-sm text-purple-700">{t('aboutPGT.listeningDescription')}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">{t('aboutPGT.heartPurification')}</h4>
                  <p className="text-sm text-orange-700">{t('aboutPGT.heartDescription')}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">{t('aboutPGT.humilityPride')}</h4>
                  <p className="text-sm text-red-700">{t('aboutPGT.humilityDescription')}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">{t('aboutPGT.physicalConduct')}</h4>
                  <p className="text-sm text-yellow-700">{t('aboutPGT.physicalDescription')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </Container>

      <BottomNavigation />
    </div>
  );
}