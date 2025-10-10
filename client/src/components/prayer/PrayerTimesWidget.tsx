import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle, Settings, Flame } from 'lucide-react';
import { PrayerTimeService, PrayerTimes } from '@/lib/prayerTimeService';
import { PrayerStreakService } from '@/lib/prayerStreakService';
import { useToast } from '@/hooks/use-toast';

interface PrayerTimesWidgetProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  settings?: {
    calculationMethod: string;
    madhab: 'shafi' | 'hanafi';
  };
}

export function PrayerTimesWidget({ userLocation, settings }: PrayerTimesWidgetProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerStats, setPrayerStats] = useState(() => PrayerStreakService.getPrayerStats());
  const [prayerRecords, setPrayerRecords] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('todaysPrayerRecords');
    return saved ? JSON.parse(saved) : {};
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer times when location or settings change
  useEffect(() => {
    if (userLocation) {
      fetchPrayerTimes();
    }
  }, [userLocation, settings]);

  // Save prayer records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todaysPrayerRecords', JSON.stringify(prayerRecords));
  }, [prayerRecords]);

  // Listen for storage changes to sync between dashboard and prayers tab
  useEffect(() => {
    const handleStorageChange = () => {
      // Update prayer stats when records change
      setPrayerStats(PrayerStreakService.getPrayerStats());
      // Force re-render by updating current time
      setCurrentTime(new Date());
    };

    // Listen for changes in prayer records storage
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('prayerRecorded', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('prayerRecorded', handleStorageChange);
    };
  }, []);

  const fetchPrayerTimes = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const times = await PrayerTimeService.getPrayerTimes(
        userLocation.latitude,
        userLocation.longitude,
        settings
      );
      setPrayerTimes(times);
    } catch (error) {
      toast({
        title: t('prayers.prayerTimesError'),
        description: t('prayers.couldNotFetch'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canRecordPrayer = (prayerName: string) => {
    if (!prayerTimes) return false;
    
    const currentTime = new Date();
    const prayerTime = prayerTimes[prayerName.toLowerCase() as keyof PrayerTimes];
    
    // Convert prayer time string to Date object
    const [timeStr, ampm] = prayerTime.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayer24Hours = ampm === 'PM' && hours !== 12 ? hours + 12 : (ampm === 'AM' && hours === 12 ? 0 : hours);
    
    const prayerDateTime = new Date();
    prayerDateTime.setHours(prayer24Hours, minutes, 0, 0);
    
    // Allow recording only if prayer time has passed or is within 30 minutes of starting
    const timeDiff = currentTime.getTime() - prayerDateTime.getTime();
    const withinWindow = timeDiff >= -30 * 60 * 1000; // 30 minutes before to allow early recording
    
    return withinWindow;
  };

  const recordPrayer = (prayerName: string) => {
    // Check if prayer can be recorded (not too early)
    if (!canRecordPrayer(prayerName)) {
      toast({
        title: t('prayers.cannotRecordPrayer'),
        description: t('prayers.cannotRecordYet', { prayer: translatePrayerName(prayerName) }),
        variant: "destructive"
      });
      return;
    }

    // Log prayer with the streak service (centralized storage)
    try {
      PrayerStreakService.logPrayer(
        prayerName.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
        true, // on time
        new Date()
      );
      
      // Update prayer stats and trigger re-render
      setPrayerStats(PrayerStreakService.getPrayerStats());
      
      // Force component re-render to show updated status
      const today = new Date().toDateString();
      const key = `${today}-${prayerName}`;
      setPrayerRecords(prev => ({
        ...prev,
        [key]: true
      }));

      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('prayerRecorded'));

      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('prayerRecorded'));
      
    } catch (error) {
      console.error('Error logging prayer:', error);
    }
    
    toast({
      title: t('prayers.prayerRecordedTitle'),
      description: t('prayers.prayerRecordedSuccess', { prayer: translatePrayerName(prayerName) })
    });
  };

  const recordMissedPrayer = (prayerName: string) => {
    // Log missed prayer with the streak service (centralized storage)
    try {
      PrayerStreakService.logPrayer(
        prayerName.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
        false, // not on time (missed)
        new Date()
      );
      
      // Update prayer stats and trigger re-render
      setPrayerStats(PrayerStreakService.getPrayerStats());
      
      // Force component re-render to show updated status
      const today = new Date().toDateString();
      const key = `${today}-${prayerName}-missed`;
      setPrayerRecords(prev => ({
        ...prev,
        [key]: true
      }));

      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('prayerRecorded'));

      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('prayerRecorded'));
      
    } catch (error) {
      console.error('Error logging missed prayer:', error);
    }
    
    toast({
      title: t('prayers.prayerMarkedMissed'),
      description: t('prayers.prayerMarkedMissedDesc', { prayer: translatePrayerName(prayerName) }),
      variant: "destructive"
    });
  };

  const isPrayerRecorded = (prayerName: string) => {
    // Check from centralized PrayerStreakService
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const records = PrayerStreakService.getPrayerRecords();
    const todayRecord = records[today];
    
    if (!todayRecord) return false;
    
    const prayerKey = prayerName.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    return todayRecord[prayerKey]?.logged || false;
  };

  const isPrayerMissed = (prayerName: string) => {
    // Check from centralized PrayerStreakService
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const records = PrayerStreakService.getPrayerRecords();
    const todayRecord = records[today];
    
    if (!todayRecord) return false;
    
    const prayerKey = prayerName.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    const prayerRecord = todayRecord[prayerKey];
    return prayerRecord?.logged && !prayerRecord?.onTime;
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    return PrayerTimeService.getNextPrayer(prayerTimes);
  };

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    return PrayerTimeService.isCurrentlyPrayerTime(prayerTimes);
  };

  if (!userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('prayers.nextPrayer')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-3">{t('prayers.locationRequired')}</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/prayer-settings')}>
              <Settings className="h-4 w-4 mr-2" />
              {t('prayers.setLocationSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('prayers.nextPrayer')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">{t('prayers.loadingPrayerTimes')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPrayer = getNextPrayer();
  const currentPrayer = getCurrentPrayer();

  // Helper function to translate prayer names
  const translatePrayerName = (prayerName: string | null) => {
    if (!prayerName) return '';
    const key = prayerName.toLowerCase();
    return t(`prayers.${key}`);
  };

  return (
    <div className="space-y-4">
      {/* Next Prayer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {currentPrayer ? `${translatePrayerName(currentPrayer)} ${t('prayers.prayerTime')}` : t('prayers.nextPrayer')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPrayer ? (
            <div className="text-center">
              <Badge variant="default" className="bg-green-500 text-white text-lg px-4 py-2">
                🕌 {translatePrayerName(currentPrayer)} {t('prayers.prayerTime')}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {userLocation.city}
              </p>
              {!isPrayerRecorded(currentPrayer) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => recordPrayer(currentPrayer)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('prayers.recordPrayerAction')}
                </Button>
              )}
              {isPrayerRecorded(currentPrayer) && (
                <Badge variant="default" className="bg-green-600 text-white mt-3">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t('prayers.recorded')}
                </Badge>
              )}
            </div>
          ) : nextPrayer ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {translatePrayerName(nextPrayer.name)}
              </div>
              <div className="text-lg mb-2">{nextPrayer.time}</div>
              <Badge variant="outline">
                {PrayerTimeService.formatRemainingTime(nextPrayer.remainingMinutes)} {t('prayers.remaining')}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {userLocation.city}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* All Prayer Times */}
      {prayerTimes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('prayers.todaysPrayerTimes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Fajr', time: prayerTimes.fajr, key: t('prayers.fajr') },
                { name: 'Dhuhr', time: prayerTimes.dhuhr, key: t('prayers.dhuhr') },
                { name: 'Asr', time: prayerTimes.asr, key: t('prayers.asr') },
                { name: 'Maghrib', time: prayerTimes.maghrib, key: t('prayers.maghrib') },
                { name: 'Isha', time: prayerTimes.isha, key: t('prayers.isha') }
              ].map((prayer) => (
                <div key={prayer.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium">{prayer.key}</span>
                      <div className="text-sm text-muted-foreground">{prayer.time}</div>
                    </div>
                  </div>
                  
                  {isPrayerMissed(prayer.name) ? (
                    <Badge variant="destructive" className="bg-red-500 text-white">
                      ❌ {t('prayers.missed')}
                    </Badge>
                  ) : isPrayerRecorded(prayer.name) ? (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('prayers.prayed')}
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canRecordPrayer(prayer.name)}
                        onClick={() => recordPrayer(prayer.name)}
                        className={`flex items-center gap-1 ${!canRecordPrayer(prayer.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {t('prayers.prayed')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canRecordPrayer(prayer.name)}
                        onClick={() => recordMissedPrayer(prayer.name)}
                        className={`flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 ${!canRecordPrayer(prayer.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ❌
                        {t('prayers.missed')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}