import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SinCategoryBox } from '@/components/content/SinCategoryBox';
import { LessonViewer } from '@/components/content/LessonViewer';
import { PrayerTimesWidget } from '@/components/prayer/PrayerTimesWidget';
import { BadgeCarousel } from '@/components/gamification/BadgeCarousel';
import { StreakVisualization } from '@/components/gamification/StreakVisualization';
import { BadgeAwardModal } from '@/components/gamification/BadgeAwardModal';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Container } from '@/components/ui/container';
import { 
  getContentByCategory, 
  getLessonsByCategory, 
  getNextLesson, 
  getCategoryProgress,
  ContentLesson
} from '@/data/contentRepository';
import { ContentService, UserContentProgress } from '@/lib/contentService';
import { GamificationService, Badge as BadgeType } from '@/lib/gamificationService';
import { SinCategory } from '@/data/selfAssessmentData';
import { useSelfAssessment } from '@/hooks/useSelfAssessment';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { goalsEngine } from '@/services/goalsEngine';
import { challengeSelector } from '@/services/challengeSelector';
import { useLocation } from 'wouter';
import { ClipboardList, Eye, Play, RotateCcw, BarChart3, User } from 'lucide-react';

export function ContentDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userProgress: userState } = useUser();
  const [, navigate] = useLocation();
  
  // Get user's actual assessment areas
  const getUserActiveSinCategories = () => {
    // First check for manual selection results in localStorage
    const assessmentResults = localStorage.getItem('assessment_results');
    if (assessmentResults) {
      try {
        const results = JSON.parse(assessmentResults);
        if (results.primaryStruggle) {
          return [
            results.primaryStruggle,
            results.secondaryStruggle || results.primaryStruggle
          ];
        }
      } catch (error) {
        console.error('Error parsing assessment results:', error);
      }
    }
    
    // Fallback to default areas
    return ['tongue', 'heart'];
  };
  
  const userActiveSinCategories = getUserActiveSinCategories();
  
  // Initialize with user's actual assessment results
  const [userProgress, setUserProgress] = useState<UserContentProgress>(() => {
    return ContentService.initializeFromAssessment(userActiveSinCategories[0], userActiveSinCategories[1]);
  });

  const [selectedLesson, setSelectedLesson] = useState<ContentLesson | null>(null);
  
  // Gamification state
  const [awardedBadge, setAwardedBadge] = useState<BadgeType | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  // Get active goals and challenges for dashboard display
  const [pathItemsCount, setPathItemsCount] = useState(0);
  const [activeGoals, setActiveGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  
  useEffect(() => {
    const goals = goalsEngine.getActiveGoals().filter(g => g.status === 'active');
    const challenges = challengeSelector.getActiveChallenges().filter(c => c.status === 'in_progress');
    setActiveGoals(goals);
    setPathItemsCount(goals.length + challenges.length);
  }, []);

  // Get dashboard content for active sin categories
  const dashboardContent = ContentService.getDashboardContent(userProgress);

  const handleRecordSuccess = (category: SinCategory) => {
    const updatedProgress = ContentService.recordSuccessfulDay(userProgress, category);
    setUserProgress(updatedProgress);
    
    // Update streak and check for badges
    GamificationService.updateStreak('behavioral', category, true);
    const newBadges = GamificationService.checkAndAwardBadges(
      updatedProgress,
      {}, // Prayer records - will be integrated with prayer service
      [] // Journal entries - will be integrated with reflection service
    );
    
    // Show badge modal if new badge earned
    if (newBadges.length > 0) {
      setAwardedBadge(newBadges[0]);
      setShowBadgeModal(true);
    }
    
    toast({
      title: t('contentDashboard.successRecorded'),
      description: t('contentDashboard.stayStrong', { category })
    });
  };

  const handleRecordInfraction = (category: SinCategory, note?: string) => {
    const updatedProgress = ContentService.recordInfraction(userProgress, category, note);
    setUserProgress(updatedProgress);
    
    // Update streak (breaks the streak)
    GamificationService.updateStreak('behavioral', category, false);
    
    toast({
      title: t('contentDashboard.progressNoted'),
      description: t('contentDashboard.everyStruggle')
    });
  };

  const handleAddJournalEntry = (category: SinCategory, content: string, mood?: 'struggling' | 'hopeful' | 'strong') => {
    const updatedProgress = ContentService.addJournalEntry(userProgress, category, content, mood);
    setUserProgress(updatedProgress);
    
    // Check for reflection badges
    const allJournalEntries = Object.values(updatedProgress.journalEntries).flat();
    const newBadges = GamificationService.checkAndAwardBadges(
      updatedProgress,
      {}, // Prayer records - will be integrated with prayer service
      allJournalEntries
    );
    
    // Show badge modal if new badge earned
    if (newBadges.length > 0) {
      setAwardedBadge(newBadges[0]);
      setShowBadgeModal(true);
    }
    
    toast({
      title: t('contentDashboard.journalEntrySaved'),
      description: t('contentDashboard.reflectionTool')
    });
  };

  const handleStartLesson = (lessonId: string) => {
    // Find the lesson across all categories
    for (const categoryData of dashboardContent) {
      const lesson = categoryData.content.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        const updatedProgress = ContentService.startLesson(userProgress, lessonId);
        setUserProgress(updatedProgress);
        break;
      }
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updatedProgress = ContentService.markLessonComplete(userProgress, lessonId);
    setUserProgress(updatedProgress);
    setSelectedLesson(null);
    toast({
      title: t('contentDashboard.lessonCompleted'),
      description: t('contentDashboard.lessonCompletedDesc')
    });
  };

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
  };

  const handleRecordProgress = (goal, progressType) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const handleSaveProgress = (progressType) => {
    if (selectedGoal) {
      // Record the progress in the goals engine
      if (progressType === 'success') {
        goalsEngine.recordSuccess(selectedGoal.id, journalEntry);
      } else {
        goalsEngine.recordInfraction(selectedGoal.id, journalEntry);
      }
      
      // Update the active goals state
      const updatedGoals = goalsEngine.getActiveGoals().filter(g => g.status === 'active');
      setActiveGoals(updatedGoals);
      
      // Reset dialog state
      setProgressDialogOpen(false);
      setSelectedGoal(null);
      setJournalEntry('');
      
      toast({
        title: progressType === 'success' ? t('contentDashboard.successRecorded') : t('contentDashboard.progressNoted'),
        description: t('contentDashboard.progressLogged', { type: progressType })
      });
    }
  };

  // Function to determine assessment status and button configuration
  const getAssessmentStatus = () => {
    const completedResults = localStorage.getItem('assessment_results');
    const inProgressState = localStorage.getItem('assessment_state');
    
    if (completedResults) {
      return {
        status: 'completed',
        buttonText: t('dashboard.reviewAssessment'),
        buttonIcon: Eye,
        description: t('dashboard.viewAssessmentResults'),
        action: () => navigate('/assessment-review')
      };
    }
    
    if (inProgressState) {
      const parsed = JSON.parse(inProgressState);
      const answeredCount = Object.keys(parsed.responses || {}).length;
      return {
        status: 'in_progress',
        buttonText: t('dashboard.continueAssessment'),
        buttonIcon: Play,
        description: `${t('dashboard.resumeFromQuestion')} ${parsed.currentQuestionIndex + 1} (${answeredCount} ${t('dashboard.answered')})`,
        action: () => navigate('/enhanced-assessment')
      };
    }
    
    return {
      status: 'not_started',
      buttonText: t('dashboard.takeSelfAssessment'),
      buttonIcon: ClipboardList,
      description: t('dashboard.discoverGrowthAreas'),
      action: () => navigate('/enhanced-assessment')
    };
  };

  const assessmentConfig = getAssessmentStatus();

  if (selectedLesson) {
    return (
      <LessonViewer
        lesson={selectedLesson}
        onComplete={handleCompleteLesson}
        onBack={handleBackToDashboard}
        isCompleted={userProgress.completedLessons.includes(selectedLesson.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader 
        title={t('navigation.dashboard')}
      />
      
      <Container className="py-6 pb-24">
        <div className="space-y-6">
          {/* Prayer Times Widget */}
          <PrayerTimesWidget 
            userLocation={(() => {
              const saved = localStorage.getItem('prayer_location_data');
              return saved ? JSON.parse(saved) : null;
            })()}
            settings={(() => {
              const saved = localStorage.getItem('prayer_settings_data');
              return saved ? JSON.parse(saved) : {
                calculationMethod: 'muslim-world-league',
                madhab: 'shafi'
              };
            })()}
          />
          
          {/* Self-Assessment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <assessmentConfig.buttonIcon className="h-5 w-5" />
{t('goals.selfAssessment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {assessmentConfig.description}
                </p>
                
                <div className="space-y-2">
                  <Button 
                    onClick={assessmentConfig.action}
                    className="w-full"
                    variant={assessmentConfig.status === 'completed' ? 'outline' : 'default'}
                  >
                    <assessmentConfig.buttonIcon className="h-4 w-4 mr-2" />
                    {assessmentConfig.buttonText}
                  </Button>
                  
                  {assessmentConfig.status === 'completed' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          localStorage.removeItem('assessment_results');
                          navigate('/enhanced-assessment');
                        }}
                        className="w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t('goals.retake')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/category-assessment')}
                        className="w-full"
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        {t('goals.category')}
                      </Button>
                    </div>
                  )}
                </div>
                
                {assessmentConfig.status !== 'not_started' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
{assessmentConfig.status === 'completed' ? t('goals.completed') : t('goals.inProgress')}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          

          
          {/* Current Streaks */}
          {Object.keys(GamificationService.getUserRewards().streaks).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔥 {t('contentDashboard.yourCurrentStreaks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(GamificationService.getUserRewards().streaks)
                    .filter(streak => streak.isActive && streak.currentStreak > 0)
                    .slice(0, 3)
                    .map((streak, index) => (
                      <StreakVisualization 
                        key={`${streak.type}-${streak.category}-${index}`}
                        streakData={streak}
                        size="medium"
                        showDetails={true}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          )}




          {/* Profile Button */}
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={() => navigate('/profile')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <User className="h-5 w-5 mr-2" />
                {t('navigation.profile')}
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Analytics Button */}
          {assessmentConfig.status === 'completed' && (
            <Card>
              <CardContent className="p-4">
                <Button 
                  onClick={() => navigate('/analytics')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {t('menu.assessmentAnalytics')}
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </Container>

      <BottomNavigation />
      
      {/* Badge Award Modal */}
      <BadgeAwardModal
        badge={awardedBadge}
        isOpen={showBadgeModal}
        onClose={() => {
          setShowBadgeModal(false);
          setAwardedBadge(null);
        }}
        onViewProgress={() => {
          setShowBadgeModal(false);
          setAwardedBadge(null);
          // Navigate to profile page to view progress
        }}
      />

      {/* Progress Recording Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contentDashboard.recordProgress')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="journal-entry">{t('contentDashboard.journalEntryOptional')}</Label>
              <Textarea
                id="journal-entry"
                placeholder={t('contentDashboard.describeExperience')}
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveProgress('success')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                style={{ backgroundColor: '#dc2626' }}
              >
                {t('contentDashboard.recordSuccess')}
              </Button>
              <Button
                onClick={() => handleSaveProgress('infraction')}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                {t('contentDashboard.recordInfraction')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}