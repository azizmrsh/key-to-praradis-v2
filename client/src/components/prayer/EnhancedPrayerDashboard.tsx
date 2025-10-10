import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Smartphone
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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

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
  }, []);

  // Update prayer times when location or settings change
  useEffect(() => {
    if (location) {
      updatePrayerTimes();
    }
  }, [location, settings]);

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

  const updatePrayerTimes = () => {
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
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      const newLocation = await EnhancedPrayerService.getCurrentLocation();
      const saved = EnhancedPrayerService.saveLocationData(newLocation);
      
      if (saved) {
        setLocation(newLocation);
        setLastLocationUpdate(newLocation.lastUpdated);
        
        // Save to additional storage for compatibility
        localStorage.setItem('prayer_location_data', JSON.stringify(newLocation));
        
        toast({
          title: 'Location Updated',
          description: newLocation.city ? 
            `Location set to ${newLocation.city}, ${newLocation.country}` :
            `Location updated (${newLocation.latitude.toFixed(4)}, ${newLocation.longitude.toFixed(4)})`,
        });
        
        // Schedule notifications for today if permission is granted
        if (hasNotificationPermission) {
          EnhancedNotificationService.schedulePrayerNotifications(
            new Date(), 
            newLocation, 
            settings, 
            notificationPrefs
          );
        }
      } else {
        throw new Error('Failed to save location data');
      }
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: 'Location Error',
        description: error instanceof Error ? error.message : 'Could not get current location',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

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
                To show accurate prayer times, we need your location. Your location data is stored locally and never shared.
              </p>
              <Button 
                onClick={handleGetCurrentLocation}
                disabled={isLoadingLocation}
                className="mb-2"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isLoadingLocation ? 'Getting Location...' : 'Get Current Location'}
              </Button>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/prayer-settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manual Setup
                </Button>
              </div>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  title="Update Location"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
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

      {/* Current/Next Prayer */}
      {(currentPrayer || nextPrayer) && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              {currentPrayer ? 'Current Prayer Time' : 'Next Prayer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPrayer ? (
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-blue-600 capitalize">
                  {currentPrayer.name}
                </div>
                <div className="text-lg text-blue-700">
                  {currentPrayer.formattedTime}
                </div>
                <div className="text-sm text-blue-600">
                  Prayer time is now! {currentPrayer.timeAfter}
                </div>
                {!currentPrayer.hasBeenPrayed && (
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => handlePrayerAction(currentPrayer.name, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Prayed On Time
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handlePrayerAction(currentPrayer.name, false)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Prayed Late
                    </Button>
                  </div>
                )}
              </div>
            ) : nextPrayer ? (
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-blue-600 capitalize">
                  {nextPrayer.name}
                </div>
                <div className="text-lg text-blue-700">
                  {nextPrayer.formattedTime}
                </div>
                <div className="text-sm text-blue-600">
                  in {nextPrayer.timeUntil}
                </div>
              </div>
            ) : null}
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
                    <Badge variant="destructive">{t('prayers.missed')}</Badge>
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