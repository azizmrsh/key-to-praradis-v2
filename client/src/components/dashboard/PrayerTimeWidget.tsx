import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coordinates } from 'adhan';
import { 
  calculatePrayerTimes, 
  getPrayerName, 
  formatPrayerTime, 
  getNextPrayerTime, 
  type PrayerSettings
} from '@/lib/prayerTimes';
import { type UserLocation } from '@/lib/prayerTimes';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  scheduleAllPrayerNotifications,
  getNextPrayer
} from '@/lib/notificationService';

const defaultPrayerSettings: PrayerSettings = {
  method: 'muslim-world-league',
  madhab: 'shafi',
  highLatitudeRule: 'middle-of-the-night',
  adjustments: {} // Empty object is required
};

const defaultLocation: UserLocation = {
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  city: 'Mecca',
  country: 'Saudi Arabia'
};

export function PrayerTimeWidget() {
  const [, navigate] = useLocation();
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; timeUntil: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  // Check notification permission when component mounts
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkNotificationPermission();
      setNotificationsEnabled(hasPermission);
    };
    
    checkPermission();
  }, []);
  
  useEffect(() => {
    const updatePrayerTimes = () => {
      // Try to get saved settings from localStorage using the same keys as enhanced prayer service
      const savedSettings = localStorage.getItem('prayer_settings_data');
      const savedLocation = localStorage.getItem('prayer_location_data');
      const savedNotifications = localStorage.getItem('prayer_notifications_data');
      
      // Use saved settings or defaults
      const prayerSettings: PrayerSettings = savedSettings ? 
        JSON.parse(savedSettings) : defaultPrayerSettings;
      
      const location: UserLocation = savedLocation ? 
        JSON.parse(savedLocation) : defaultLocation;
      
    // If we have notification permission and saved notifications, schedule them
    if (notificationsEnabled && savedNotifications) {
      try {
        const notificationPrefs = JSON.parse(savedNotifications);
        scheduleAllPrayerNotifications(location, prayerSettings, notificationPrefs);
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }
    
    // Calculate next prayer time
    try {
      const coordinates = new Coordinates(location.latitude, location.longitude);
      const prayerTimes = calculatePrayerTimes(
        new Date(), 
        coordinates, 
        prayerSettings, 
        location.timezone
      );
      
      const next = getNextPrayerTime(prayerTimes);
      
      // Format the time
      const formattedTime = formatPrayerTime(
        next.time, 
        'h:mm a', 
        location.timezone
      );
      
      // Calculate time until prayer
      const timeUntilMs = next.time.getTime() - new Date().getTime();
      const hours = Math.floor(timeUntilMs / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeUntilStr = '';
      if (hours > 0) {
        timeUntilStr = `${hours}h ${minutes}m`;
      } else {
        timeUntilStr = `${minutes}m`;
      }
      
      setNextPrayer({
        name: getPrayerName(next.name),
        time: formattedTime,
        timeUntil: timeUntilStr
      });
    } catch (error) {
      console.error('Error calculating prayer times:', error);
    }
    };

    // Initial load
    updatePrayerTimes();

    // Setup interval to update the time remaining
    const interval = setInterval(() => {
      updatePrayerTimes();
    }, 60000); // Update every minute

    // Listen for changes in prayer settings/location storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prayer_settings_data' || e.key === 'prayer_location_data') {
        updatePrayerTimes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('prayerSettingsUpdated', updatePrayerTimes);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('prayerSettingsUpdated', updatePrayerTimes);
    };
  }, []);
  
  const handleNavigateToSettings = () => {
    navigate('/prayer-settings');
  };
  
  // Request notification permission
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      
      // If we have saved settings, schedule notifications
      const savedSettings = localStorage.getItem('prayerSettings');
      const savedLocation = localStorage.getItem('prayerLocation');
      const savedNotifications = localStorage.getItem('prayerNotifications');
      
      if (savedSettings && savedLocation && savedNotifications) {
        try {
          const prayerSettings = JSON.parse(savedSettings);
          const location = JSON.parse(savedLocation);
          const notificationPrefs = JSON.parse(savedNotifications);
          
          scheduleAllPrayerNotifications(location, prayerSettings, notificationPrefs);
        } catch (error) {
          console.error('Error scheduling notifications after permission granted:', error);
        }
      }
    }
  };
  
  if (!nextPrayer) {
    return null;
  }
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center">
              <span className="material-icons mr-1 text-primary text-xl">schedule</span>
              Next Prayer
            </h3>
            <div className="mt-1">
              <span className="font-bold text-lg">{nextPrayer.name}</span>
              <span className="text-muted-foreground ml-2">{nextPrayer.time}</span>
              <span className="text-xs text-muted-foreground ml-2">
                (in {nextPrayer.timeUntil})
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!notificationsEnabled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRequestPermission}
                className="flex items-center gap-1"
              >
                <span className="material-icons text-sm">notifications</span>
                <span>Enable Alerts</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNavigateToSettings}
              className="flex items-center gap-1"
            >
              <span className="material-icons text-sm">settings</span>
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}