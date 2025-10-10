import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export function MyPagePlaceholder() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/my-path">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{t('myPath.myPage.title')}</h1>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Construction className="h-8 w-8 text-purple-600" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-800">Coming Soon</h2>
                <p className="text-gray-600 leading-relaxed">
                  {t('myPath.myPage.description')}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This structured spiritual development feature is currently in development. 
                  It will provide guided pathways for specific spiritual improvements.
                </p>
              </div>
              
              <Link href="/my-path">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Path
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}