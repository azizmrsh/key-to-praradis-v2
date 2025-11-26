import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  MapPin, 
  Bell, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  Flame,
  Settings,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import EnhancedPrayerService, { 
  type LocationData, 
  type PrayerTimeWithStatus, 
  type PrayerStatistics 
} from '@/lib/enhancedPrayerService';
import EnhancedNotificationService from '@/lib/enhancedNotificationService';
import { type PrayerSettings, type NotificationPreference } from '@/lib/prayerTimes';
import { useLocation } from 'wouter';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const defaultPrayerSettings: PrayerSettings = {
  method: 'muslim-world-league',
  madhab: 'shafi',
  highLatitudeRule: 'middle-of-the-night',
  adjustments: {}
};

const defaultNotificationPreferences: NotificationPreference[] = [
  { prayer: 'fajr', enabled: true, timing: 'at' },
  { prayer: 'dhuhr', enabled: true, timing: 'before15' },
  { prayer: 'asr', enabled: true, timing: 'before15' },
  { prayer: 'maghrib', enabled: true, timing: 'at' },
  { prayer: 'isha', enabled: true, timing: 'before15' }
];

export function EnhancedPrayerDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeWithStatus[]>([]);
  const [prayerStats, setPrayerStats] = useState<PrayerStatistics | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(defaultPrayerSettings);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>(defaultNotificationPreferences);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  const updatePrayerTimes = useCallback(() => {
    if (!location) return;

    try {
      const times = EnhancedPrayerService.getPrayerTimesWithStatus(location, settings);
      setPrayerTimes(times);
      
      // Update statistics
      const stats = EnhancedPrayerService.getPrayerStatistics();
      setPrayerStats(stats);
    } catch (error) {
      console.error('Error updating prayer times:', error);
      toast({
        title: 'Prayer Times Error',
        description: 'Unable to calculate prayer times. Please check your location settings.',
        variant: 'destructive'
      });
    }
  }, [location, settings, toast]);

  // Load initial data
  useEffect(() => {
    loadStoredData();
    checkNotificationPermission();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      if (location) {
        updatePrayerTimes();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [location, updatePrayerTimes]);

  // Update prayer times when location or settings change
  useEffect(() => {
    if (location) {
      updatePrayerTimes();
    }
  }, [location, settings, updatePrayerTimes]);

  const loadStoredData = () => {
    // Load location
    const savedLocation = EnhancedPrayerService.getLocationData();
    if (savedLocation) {
      setLocation(savedLocation);
      setLastLocationUpdate(savedLocation.lastUpdated);
    }

    // Load settings
    const savedSettings = localStorage.getItem('prayer_settings_data');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading prayer settings:', error);
      }
    }

    // Load notification preferences
    const savedNotifications = localStorage.getItem('prayer_notifications_data');
    if (savedNotifications) {
      try {
        setNotificationPrefs(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }

    // Load prayer statistics
    const stats = EnhancedPrayerService.getPrayerStatistics();
    setPrayerStats(stats);
  };

  const checkNotificationPermission = async () => {
    const status = EnhancedNotificationService.getPermissionStatus();
    setHasNotificationPermission(status.granted);
  };

  // GPS location feature has been removed for privacy compliance
  // Users must manually search for their city in settings

  const handleRequestNotificationPermission = async () => {
    const granted = await EnhancedNotificationService.requestNotificationPermission();
    setHasNotificationPermission(granted);
    
    if (granted) {
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive prayer time reminders',
      });
      
      // Schedule notifications for today
      if (location) {
        EnhancedNotificationService.schedulePrayerNotifications(
          new Date(), 
          location, 
          settings, 
          notificationPrefs
        );
      }
    } else {
      toast({
        title: 'Notifications Denied',
        description: 'Prayer notifications are disabled',
        variant: 'destructive'
      });
    }
  };

  const handlePrayerAction = (prayerName: string, onTime: boolean) => {
    EnhancedPrayerService.recordPrayer(
      prayerName as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
      onTime
    );
    
    // Update prayer times and stats
    updatePrayerTimes();
    
    toast({
      title: onTime ? 'Prayer Recorded' : 'Prayer Marked Late',
      description: `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} prayer logged. ${onTime ? 'May Allah accept your prayers.' : 'May Allah forgive and guide us to be more consistent.'}`,
      variant: onTime ? 'default' : 'destructive'
    });
  };

  const canMarkPrayerOnTime = (prayer: PrayerTimeWithStatus): boolean => {
    // Can mark prayers on time if:
    // 1. Prayer hasn't been recorded yet
    // 2. Prayer time has passed (not upcoming)
    // 3. It's still the same day
    return !prayer.hasBeenPrayed && !prayer.isUpcoming;
  };

  const getPrayerStatusMessage = (prayer: PrayerTimeWithStatus): string => {
    if (prayer.hasBeenPrayed) {
      return prayer.prayedOnTime ? 'Completed on time' : 'Completed late';
    }
    if (prayer.isCurrentTime) {
      return 'Prayer time is now';
    }
    if (prayer.isUpcoming) {
      return `Coming up ${prayer.timeUntil}`;
    }
    return 'Time passed - can still mark as completed';
  };

  const getNextPrayer = (): PrayerTimeWithStatus | null => {
    return prayerTimes.find(prayer => prayer.isUpcoming) || null;
  };

  const getCurrentPrayer = (): PrayerTimeWithStatus | null => {
    return prayerTimes.find(prayer => prayer.isCurrentTime) || null;
  };

  const getPrayerStatusColor = (prayer: PrayerTimeWithStatus): string => {
    if (prayer.hasBeenPrayed) {
      return prayer.prayedOnTime ? 'text-green-600' : 'text-yellow-600';
    }
    if (prayer.isCurrentTime) {
      return 'text-blue-600';
    }
    if (prayer.isUpcoming) {
      return 'text-gray-600';
    }
    return 'text-red-600'; // Missed prayer
  };

  const getPrayerIcon = (prayer: PrayerTimeWithStatus) => {
    if (prayer.hasBeenPrayed) {
      return <CheckCircle className={`h-4 w-4 ${prayer.prayedOnTime ? 'text-green-600' : 'text-yellow-600'}`} />;
    }
    if (prayer.isCurrentTime) {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    if (!prayer.isUpcoming) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  if (!location) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Location Required</h3>
              <p className="text-muted-foreground mb-4">
                To show accurate prayer times, please search for your city in the settings.
              </p>
              <Button 
                variant="default" 
                onClick={() => navigate('/prayer-settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Search for Your City
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextPrayer = getNextPrayer();
  const currentPrayer = getCurrentPrayer();

  const handleBackNavigation = () => {
    navigate('/content-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AssessmentHeader 
        title="Prayer Times"
        subtitle="Track your daily prayers and spiritual progress"
        onBack={handleBackNavigation}
      />
      
      {/* Main Content */}
      <div className="px-4 py-6 pb-20 space-y-6">
        {/* Location and settings info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prayer Dashboard
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/prayer-settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {location.city ? `${location.city}, ${location.country}` : 
                   `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {lastLocationUpdate && (
                  <span className="text-xs text-muted-foreground">
                    Updated {lastLocationUpdate.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Next Prayer Card - Beautiful Design */}
      {(currentPrayer || nextPrayer) && (
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {/* Clock Icon */}
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-3">
                  <Clock className="h-8 w-8 text-gray-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-gray-700">
                {currentPrayer ? 'Current Prayer' : 'Next Prayer'}
              </h3>

              {currentPrayer ? (
                <>
                  {/* Prayer Name */}
                  <div className="text-4xl font-bold text-red-600 capitalize">
                    {currentPrayer.name}
                  </div>

                  {/* Prayer Time */}
                  <div className="text-2xl font-medium text-gray-800">
                    {currentPrayer.formattedTime}
                  </div>

                  {/* Time Badge */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium text-gray-700">
                        Prayer time is now!
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!currentPrayer.hasBeenPrayed && (
                    <div className="flex gap-2 justify-center pt-2">
                      <Button 
                        onClick={() => handlePrayerAction(currentPrayer.name, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Prayed
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handlePrayerAction(currentPrayer.name, false)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Missed
                      </Button>
                    </div>
                  )}
                </>
              ) : nextPrayer ? (
                <>
                  {/* Prayer Name */}
                  <div className="text-4xl font-bold text-red-600 capitalize">
                    {nextPrayer.name}
                  </div>

                  {/* Prayer Time */}
                  <div className="text-2xl font-medium text-gray-800">
                    {nextPrayer.formattedTime}
                  </div>

                  {/* Time Remaining Badge */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium text-gray-700">
                        {nextPrayer.timeUntil} remaining
                      </span>
                    </div>
                  </div>

                  {/* City Name */}
                  <div className="text-base text-gray-500">
                    {location.city || 'Location not set'}
                  </div>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Prayer Times
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            You can mark past prayers as "prayed on time" until the day ends. Future prayers must wait until their time arrives.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prayerTimes.map((prayer, index) => (
              <div key={prayer.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getPrayerIcon(prayer)}
                  <div>
                    <div className={`font-medium capitalize ${getPrayerStatusColor(prayer)}`}>
                      {prayer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {prayer.formattedTime} • {getPrayerStatusMessage(prayer)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prayer.hasBeenPrayed ? (
                    <Badge variant={prayer.prayedOnTime ? "default" : "secondary"}>
                      {prayer.prayedOnTime ? 'On Time' : 'Late'}
                    </Badge>
                  ) : prayer.isCurrentTime ? (
                    <div className="flex gap-1">
                      <Button 
                        size="sm"
                        onClick={() => handlePrayerAction(prayer.name, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Prayed On Time
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrayerAction(prayer.name, false)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Late
                      </Button>
                    </div>
                  ) : canMarkPrayerOnTime(prayer) ? (
                    <div className="flex gap-1">
                      <Button 
                        size="sm"
                        onClick={() => handlePrayerAction(prayer.name, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Prayed On Time
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrayerAction(prayer.name, false)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Late
                      </Button>
                    </div>
                  ) : prayer.isUpcoming ? (
                    <Badge variant="outline">Upcoming</Badge>
                  ) : (
                    <Badge variant="destructive">Missed</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prayer Statistics */}
      {prayerStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prayer Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {prayerStats.currentAllPrayersStreak}
                </div>
                <div className="text-sm text-blue-700">Current Streak</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {prayerStats.consecutiveDaysWithoutMissing}
                </div>
                <div className="text-sm text-green-700">Days Perfect</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {prayerStats.currentFajrStreak}
                </div>
                <div className="text-sm text-orange-700">Fajr Streak</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {prayerStats.weeklyStats.percentage}%
                </div>
                <div className="text-sm text-purple-700">This Week</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Progress</span>
                  <span>{prayerStats.weeklyStats.onTimePrayers} / {prayerStats.weeklyStats.totalPrayers} prayers</span>
                </div>
                <Progress value={prayerStats.weeklyStats.percentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Progress</span>
                  <span>{prayerStats.monthlyStats.onTimePrayers} / {prayerStats.monthlyStats.totalPrayers} prayers</span>
                </div>
                <Progress value={prayerStats.monthlyStats.percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Prayer Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasNotificationPermission ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-muted-foreground mb-3">
                Enable notifications to receive prayer time reminders
              </p>
              <Button onClick={handleRequestNotificationPermission} className="bg-red-600 hover:bg-red-700 text-white" style={{ backgroundColor: '#dc2626' }}>
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Notifications enabled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll receive prayer time reminders based on your preferences. 
                Adjust notification settings in the prayer settings page.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/prayer-settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      
      {/* Footer Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default EnhancedPrayerDashboard;