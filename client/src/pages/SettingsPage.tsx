import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { journalManager } from '@/services/journalManager';
import { 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Clock, 
  MapPin, 
  Volume2, 
  Smartphone,
  Shield,
  HelpCircle,
  Download,
  RotateCcw,
  BookHeart,
  X,
  Plus
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { preferences, updatePreferences, resetUserData } = useUser();
  
  // Local state for settings - load from localStorage for persistence
  const [prayerNotifications, setPrayerNotifications] = useState(() => {
    const saved = localStorage.getItem('prayer-notifications');
    return saved !== null ? JSON.parse(saved) : (preferences?.notifications || true);
  });
  const [challengeReminders, setChallengeReminders] = useState(() => {
    const saved = localStorage.getItem('challenge-reminders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [goalReminders, setGoalReminders] = useState(() => {
    const saved = localStorage.getItem('goal-reminders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [streakReminders, setStreakReminders] = useState(() => {
    const saved = localStorage.getItem('streak-reminders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('vibration-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Custom emotions state
  const [customEmotions, setCustomEmotions] = useState<string[]>(() => {
    return journalManager.getCustomEmotions();
  });
  const [newEmotion, setNewEmotion] = useState('');

  const savePrayerNotifications = (enabled: boolean) => {
    setPrayerNotifications(enabled);
    localStorage.setItem('prayer-notifications', JSON.stringify(enabled));
  };

  const saveChallengeReminders = (value: boolean) => {
    setChallengeReminders(value);
    localStorage.setItem('challenge-reminders', JSON.stringify(value));
  };

  const saveGoalReminders = (value: boolean) => {
    setGoalReminders(value);
    localStorage.setItem('goal-reminders', JSON.stringify(value));
  };

  const saveStreakReminders = (value: boolean) => {
    setStreakReminders(value);
    localStorage.setItem('streak-reminders', JSON.stringify(value));
  };

  const saveSoundEnabled = (value: boolean) => {
    setSoundEnabled(value);
    localStorage.setItem('sound-enabled', JSON.stringify(value));
  };

  const saveVibrationEnabled = (value: boolean) => {
    setVibrationEnabled(value);
    localStorage.setItem('vibration-enabled', JSON.stringify(value));
  };

  const handleResetData = () => {
    // Clear all localStorage data including goals and challenges
    localStorage.clear();
    
    // Reset user data through UserContext
    resetUserData();
    
    // Show success message
    toast({
      title: t('settings.allDataDeleted'),
      description: t('settings.allDataDeletedDescription')
    });
  };

  const handleSaveSettings = () => {
    updatePreferences({
      notifications: prayerNotifications,
      theme: preferences?.theme || 'light'
    });
    
    toast({
      title: t('settings.settingsSaved'),
      description: t('settings.settingsSavedDescription')
    });
  };

  const handleAddCustomEmotion = () => {
    if (!newEmotion.trim()) {
      toast({
        title: 'Invalid emotion',
        description: 'Please enter an emotion name.',
        variant: 'destructive'
      });
      return;
    }

    const success = journalManager.addCustomEmotion(newEmotion);
    
    if (success) {
      setCustomEmotions(journalManager.getCustomEmotions());
      setNewEmotion('');
      toast({
        title: 'Emotion added',
        description: `"${newEmotion}" has been added to your custom emotions.`
      });
    } else {
      toast({
        title: 'Duplicate emotion',
        description: 'This emotion already exists.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveCustomEmotion = (emotion: string) => {
    const success = journalManager.removeCustomEmotion(emotion);
    
    if (success) {
      setCustomEmotions(journalManager.getCustomEmotions());
      toast({
        title: 'Emotion removed',
        description: `"${emotion}" has been removed.`
      });
    }
  };

  const handleExportData = () => {
    try {
      // Gather all app data from localStorage
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '0.1.1-alpha',
        data: {
          // Assessment data
          assessmentResults: localStorage.getItem('assessment_results'),
          assessmentAnalytics: localStorage.getItem('assessment_analytics'),
          
          // Goals and Challenges
          goalsLog: localStorage.getItem('goals_log'),
          challengesLog: localStorage.getItem('challenges_log'),
          
          // Journal entries
          journalEntries: journalManager.getAllEntries(),
          
          // Prayer data
          prayerSettings: localStorage.getItem('prayer-settings'),
          prayerStreak: localStorage.getItem('prayer-streak'),
          prayerHistory: localStorage.getItem('prayer-history'),
          
          // User preferences
          selectedLanguage: localStorage.getItem('selectedLanguage'),
          preferences: localStorage.getItem('userPreferences'),
          
          // Notifications settings
          prayerNotifications: localStorage.getItem('prayer-notifications'),
          challengeReminders: localStorage.getItem('challenge-reminders'),
          goalReminders: localStorage.getItem('goal-reminders'),
          streakReminders: localStorage.getItem('streak-reminders'),
          soundEnabled: localStorage.getItem('sound-enabled'),
          vibrationEnabled: localStorage.getItem('vibration-enabled')
        }
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `keys-to-paradise-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('settings.dataExported'),
        description: t('settings.dataExportedDescription')
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('settings.exportFailed'),
        description: t('settings.exportFailedDescription'),
        variant: 'destructive'
      });
    }
  };



  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader 
        title={t('settings.title')}
      />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              {t('settings.languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>



        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.notifications')}
            </CardTitle>
            <CardDescription>
              {t('settings.notificationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Prayer Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('settings.prayerTimeNotifications')}</Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.prayerTimeNotificationDescription')}
                </div>
              </div>
              <Switch 
                checked={prayerNotifications} 
                onCheckedChange={savePrayerNotifications}
              />
            </div>



            <Separator />

            {/* Challenge Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('settings.challengeReminders')}</Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.challengeRemindersDescription')}
                </div>
              </div>
              <Switch 
                checked={challengeReminders} 
                onCheckedChange={saveChallengeReminders}
              />
            </div>

            {/* Goal Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('settings.goalReminders')}</Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.goalRemindersDescription')}
                </div>
              </div>
              <Switch 
                checked={goalReminders} 
                onCheckedChange={saveGoalReminders}
              />
            </div>

            {/* Streak Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('settings.streakMaintenance')}</Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.streakMaintenanceDescription')}
                </div>
              </div>
              <Switch 
                checked={streakReminders} 
                onCheckedChange={saveStreakReminders}
              />
            </div>

            <Separator />

            {/* Sound & Vibration */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base">
                  <Volume2 className="h-4 w-4" />
                  {t('settings.sound')}
                </Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.soundDescription')}
                </div>
              </div>
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={saveSoundEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4" />
                  {t('settings.vibration')}
                </Label>
                <div className="text-sm text-muted-foreground">
                  {t('settings.vibrationDescription')}
                </div>
              </div>
              <Switch 
                checked={vibrationEnabled} 
                onCheckedChange={saveVibrationEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              {t('settings.theme')}
            </CardTitle>
            <CardDescription>
              {t('settings.themeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={preferences?.theme || 'light'} onValueChange={(value) => updatePreferences({ theme: value as 'light' | 'dark' })}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.selectTheme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('settings.light')}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('settings.dark')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Journal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookHeart className="h-5 w-5" />
              {t('settings.journalSettings')}
            </CardTitle>
            <CardDescription>
              {t('settings.journalSettingsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('journal.defaultEmotions')}</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {['happy', 'grateful', 'peaceful', 'hopeful', 'reflective', 'struggling', 'determined'].map(emotion => (
                  <Badge key={emotion} variant="secondary" className="text-sm">
                    {t(`journal.moods.${emotion}`)}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">{t('journal.customEmotions')}</Label>
              {customEmotions.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-3">{t('journal.noCustomEmotions')}</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customEmotions.map(emotion => (
                    <Badge key={emotion} variant="outline" className="text-sm pl-3 pr-1">
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveCustomEmotion(emotion)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder={t('journal.addCustomEmotionPlaceholder')}
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomEmotion()}
                  data-testid="input-custom-emotion"
                />
                <Button 
                  onClick={handleAddCustomEmotion}
                  size="icon"
                  data-testid="button-add-custom-emotion"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('settings.dataPrivacy')}
            </CardTitle>
            <CardDescription>
              {t('settings.dataPrivacyDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('settings.exportData')}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('settings.resetAllData')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.resetAllData')}</AlertDialogTitle>
                  <AlertDialogDescription className="whitespace-pre-line">
                    {t('settings.resetDataConfirmation')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('settings.confirmDeleteData')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.about')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t('settings.appVersion')}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSaveSettings} className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg" style={{ backgroundColor: '#dc2626' }}>
          {t('settings.saveSettings')}
        </Button>

      </main>
      
      <BottomNavigation />
    </div>
  );
}