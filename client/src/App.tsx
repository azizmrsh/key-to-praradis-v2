import React, { useEffect, useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { UserProvider } from '@/contexts/UserContext';
import { SelfAssessmentProvider } from '@/contexts/SelfAssessmentContext';
import SplashScreen from '@/components/SplashScreen';

// Pages
import Dashboard from '@/pages/DashboardNew';
import SectionDetail from '@/pages/SectionDetail';
import LessonView from '@/pages/LessonView';
import SelfAssessmentPage from '@/pages/SelfAssessmentPage';
import SOSPage from '@/pages/SOSPage';
import AchievementsPage from '@/pages/AchievementsPage';
import OnboardingPage from '@/pages/OnboardingPage';
import PracticesPage from '@/pages/PracticesPage';
import TriggersPage from '@/pages/TriggersPage';
import PrayerSettingsPage from '@/pages/PrayerSettingsPage';
import EnhancedPrayerSettingsPage from '@/pages/EnhancedPrayerSettingsPage';
import { EnhancedPrayerDashboard } from '@/components/prayer/EnhancedPrayerDashboard';
import PrayerTimesPage from '@/pages/PrayerTimesPage';
import { DailyCheckInPage } from '@/pages/DailyCheckInPage';
import { ContentLibraryPage } from '@/pages/ContentLibraryPage';
import { ContentDetailPage } from '@/pages/ContentDetailPage';
import { GoalSettingPage } from '@/pages/GoalSettingPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { GoalsChallengesPage } from '@/pages/GoalsChallengesPage';
import { AssessmentChoice } from '@/pages/AssessmentChoice';
import { ProfilePage } from '@/pages/ProfilePage';
import { AssessmentAnalyticsPage } from '@/pages/AssessmentAnalyticsPage';
import { AchievementsDetailPage } from '@/pages/AchievementsDetailPage';

import { ContentDashboard } from '@/pages/ContentDashboard';
import SettingsPage from '@/pages/SettingsPage';
import { EnhancedSelfAssessment } from '@/components/assessment/EnhancedSelfAssessment';
import AssessmentReviewPage from '@/pages/AssessmentReviewPage';
import { AboutPGTPage } from '@/pages/AboutPGTPage';
import { CategoryAssessmentPage } from '@/pages/CategoryAssessmentPage';
import FontTestPage from '@/pages/FontTestPage';
import NotFound from '@/pages/not-found';
import { LanguageSelectionPage } from '@/components/onboarding/LanguageSelectionPage';
import { MultilingualAssessmentDemo } from '@/components/assessment/MultilingualAssessmentDemo';
import { MenuPage } from '@/pages/MenuPage';
import { MyPathPage } from '@/pages/MyPathPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { MyPagePlaceholder } from '@/pages/MyPagePlaceholder';
import JournalPage from '@/pages/JournalPage';

function Router() {
  // تعريف مسار البداية الافتراضي للتطبيق - دائماً يبدأ بصفحة اختيار اللغة
  const initialRoute = '/language-selection';
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // إخفاء الشاشة التمهيدية بعد 3 ثواني
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showSplash) {
    return <SplashScreen />;
  }
  
  return (
    <div className="ios-safe-area-top min-h-screen">
      <Switch initialRoute={initialRoute}>
      <Route path="/" component={() => {
        const [, navigate] = useLocation();
        
        // دائماً توجيه المستخدم إلى صفحة اختيار اللغة عند الدخول للتطبيق لأول مرة
        React.useEffect(() => {
          navigate('/language-selection');
        }, []);
        
        return null; // عدم عرض أي شيء أثناء التوجيه
      }} />
      <Route path="/language-selection" component={LanguageSelectionPage} />
      <Route path="/section/:id" component={SectionDetail} />
      <Route path="/section/:sectionId/lesson/:lessonId" component={LessonView} />
      <Route path="/assessment" component={() => {
        const [, navigate] = useLocation();
        React.useEffect(() => {
          navigate('/enhanced-assessment');
        }, [navigate]);
        return null;
      }} />
      <Route path="/sos" component={SOSPage} />
      <Route path="/achievements" component={AchievementsPage} />
      <Route path="/practices" component={PracticesPage} />
      <Route path="/triggers" component={TriggersPage} />
      <Route path="/prayer-settings" component={EnhancedPrayerSettingsPage} />
      <Route path="/prayers" component={PrayerTimesPage} />
      <Route path="/prayer-dashboard" component={EnhancedPrayerDashboard} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/check-in" component={DailyCheckInPage} />
      <Route path="/content" component={ContentLibraryPage} />
      <Route path="/content/:id" component={ContentDetailPage} />
      <Route path="/content-dashboard" component={ContentDashboard} />
      <Route path="/goals-challenges" component={GoalsChallengesPage} />
      <Route path="/my-path" component={MyPathPage} />
      <Route path="/my-page" component={MyPagePlaceholder} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/journal" component={JournalPage} />
      <Route path="/goals/set" component={GoalSettingPage} />
      <Route path="/assessment-choice" component={AssessmentChoice} />
      <Route path="/enhanced-assessment" component={EnhancedSelfAssessment} />
      <Route path="/category-assessment" component={CategoryAssessmentPage} />
      <Route path="/assessment-review" component={AssessmentReviewPage} />
      <Route path="/assessment-analytics" component={AssessmentAnalyticsPage} />
      <Route path="/analytics" component={AssessmentAnalyticsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/achievements-detail" component={AchievementsDetailPage} />

      <Route path="/about-pgt" component={AboutPGTPage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/font-test" component={FontTestPage} />
      <Route path="/multilingual-demo" component={MultilingualAssessmentDemo} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Add a class to handle mobile viewport height issues
  useEffect(() => {
    // Fix for mobile viewport height
    const appHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', appHeight);
    appHeight();
    return () => window.removeEventListener('resize', appHeight);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SelfAssessmentProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SelfAssessmentProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
