import React, { useEffect, useState } from 'react';
import { PrayerSettingsForm } from '@/components/settings/PrayerSettings';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { useUser } from '@/contexts/UserContext';
import { Container } from '@/components/ui/container';
import type { NotificationPreference, PrayerSettings, UserLocation } from '@/lib/prayerTimes';
import { scheduleAllPrayerNotifications } from '@/lib/notificationService';
import { useToast } from '@/hooks/use-toast';

const defaultPrayerSettings: PrayerSettings = {
  method: 'muslim-world-league',
  madhab: 'shafi',
  highLatitudeRule: 'middle-of-the-night',
  adjustments: {} // Empty object is required (not undefined)
};

const defaultLocation: UserLocation = {
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  city: 'Mecca',
  country: 'Saudi Arabia'
};

const defaultNotifications: NotificationPreference[] = [
  { prayer: 'fajr', enabled: true, timing: 'before15' },
  { prayer: 'sunrise', enabled: false, timing: 'at' },
  { prayer: 'dhuhr', enabled: true, timing: 'at' },
  { prayer: 'asr', enabled: true, timing: 'at' },
  { prayer: 'maghrib', enabled: true, timing: 'at' },
  { prayer: 'isha', enabled: true, timing: 'at' },
  { prayer: 'midnight', enabled: false, timing: 'at' },
  { prayer: 'tahajjud', enabled: false, timing: 'at' }
];

export default function PrayerSettingsPage() {
  const { toast } = useToast();
  const { userProgress, preferences, updatePreferences } = useUser();
  const [location, setLocation] = useState<UserLocation | undefined>(undefined);
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettings | undefined>(undefined);
  const [prayerNotifications, setPrayerNotifications] = useState<NotificationPreference[] | undefined>(undefined);

  // Load settings from user preferences
  useEffect(() => {
    if (preferences) {
      // For now, just use defaults until we expand the UserPreferences type
      setPrayerSettings(defaultPrayerSettings);
      setLocation(defaultLocation);
      setPrayerNotifications(defaultNotifications);
    }
  }, [preferences]);

  // Save settings to user preferences
  const handleSaveSettings = (
    newLocation: UserLocation,
    newSettings: PrayerSettings,
    newNotifications: NotificationPreference[]
  ) => {
    // Update local state
    setLocation(newLocation);
    setPrayerSettings(newSettings);
    setPrayerNotifications(newNotifications);

    // For now, just update notifications flag
    // Later we'll need to expand the UserPreferences type in the database
    updatePreferences({
      ...preferences,
      notifications: true // Enable notifications in general
    });

    // Store prayer settings in localStorage as a temporary solution
    localStorage.setItem('prayerSettings', JSON.stringify(newSettings));
    localStorage.setItem('prayerLocation', JSON.stringify(newLocation));
    localStorage.setItem('prayerNotifications', JSON.stringify(newNotifications));
    
    // Try to schedule notifications
    try {
      scheduleAllPrayerNotifications(newLocation, newSettings, newNotifications);
      toast({
        title: 'Settings Saved',
        description: 'Prayer time settings have been saved and notifications scheduled.',
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      toast({
        title: 'Settings Saved',
        description: 'Prayer time settings have been saved, but there was an error scheduling notifications.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AssessmentHeader 
        title="Prayer Times" 
        onBack={() => window.history.back()} 
        language="en"
      />
      <Container className="flex-grow py-6">
        {location && prayerSettings && prayerNotifications ? (
          <PrayerSettingsForm
            initialLocation={location}
            initialSettings={prayerSettings}
            initialNotifications={prayerNotifications}
            onSave={handleSaveSettings}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>Loading prayer settings...</p>
          </div>
        )}
      </Container>
    </div>
  );
}