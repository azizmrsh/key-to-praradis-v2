import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculatePrayerTimes, formatPrayerTime } from '@/lib/prayerTimes';
import { UserLocation, PrayerSettings } from '@/lib/prayerTimes';
import { PrayerStreakService } from '@/lib/prayerStreakService';
import { Coordinates } from 'adhan';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Sun, Sunrise, Clock, Moon, Star, Settings } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import kaabaImagePath from "@assets/Artboard 1@2x_1755772694767.png";

const getCurrentPrayer = (prayerTimes: any, t: any): { name: string; time: string; status: string; timeRemaining: string } => {
  const now = new Date();
  const prayers = [
    { name: t('prayers.fajr'), key: 'fajr', time: prayerTimes.fajr },
    { name: t('prayers.dhuhr'), key: 'dhuhr', time: prayerTimes.dhuhr },
    { name: t('prayers.asr'), key: 'asr', time: prayerTimes.asr },
    { name: t('prayers.maghrib'), key: 'maghrib', time: prayerTimes.maghrib },
    { name: t('prayers.isha'), key: 'isha', time: prayerTimes.isha }
  ];

  // Find current prayer period and next prayer
  for (let i = 0; i < prayers.length; i++) {
    const currentPrayer = prayers[i];
    const nextPrayer = prayers[i + 1];
    
    // If we're past this prayer time but before the next one (or it's the last prayer)
    if (now >= currentPrayer.time && (!nextPrayer || now < nextPrayer.time)) {
      let timeRemaining = '';
      if (nextPrayer) {
        const timeDiff = nextPrayer.time.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = `${hours}${t('prayers.hrs')} ${minutes}${t('prayers.mins')} ${t('prayers.until')} ${nextPrayer.name}`;
      }
      
      return {
        name: currentPrayer.name,
        time: formatPrayerTime(currentPrayer.time, 'h:mm a', 'Asia/Riyadh'),
        status: t('prayers.currentPrayer'),
        timeRemaining
      };
    }
  }

  // If before Fajr, show time until Fajr
  if (now < prayers[0].time) {
    const timeDiff = prayers[0].time.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      name: prayers[0].name,
      time: formatPrayerTime(prayers[0].time, 'h:mm a', 'Asia/Riyadh'),
      status: t('prayers.nextPrayer'),
      timeRemaining: `${hours}${t('prayers.hrs')} ${minutes}${t('prayers.mins')} ${t('prayers.remaining')}`
    };
  }

  // After Isha, show next day's Fajr
  return {
    name: t('prayers.fajr'),
    time: t('prayers.tomorrow'),
    status: t('prayers.nextPrayer'),
    timeRemaining: t('prayers.tomorrowMorning')
  };
};

const defaultLocation: UserLocation = {
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  city: 'Mecca',
  country: 'Saudi Arabia'
};

const defaultSettings: PrayerSettings = {
  method: 'muslim-world-league',
  madhab: 'shafi',
  highLatitudeRule: 'middle-of-the-night',
  adjustments: {}
};

const prayerIcons = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: Clock,
  maghrib: Sun,
  isha: Moon
};

export default function PrayerTimesPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [location, setLocation] = useState<UserLocation>(defaultLocation);
  const [settings, setSettings] = useState<PrayerSettings>(defaultSettings);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState<{ name: string; time: string; status: string; timeRemaining: string } | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedLocation = localStorage.getItem('prayerLocation');
      const savedSettings = localStorage.getItem('prayerSettings');
      
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  }, []);

  useEffect(() => {
    if (location && settings) {
      try {
        const coordinates = new Coordinates(location.latitude, location.longitude);
        const times = calculatePrayerTimes(new Date(), coordinates, settings, location.timezone);
        setPrayerTimes(times);
        
        // Calculate current prayer
        const timeInfo = getCurrentPrayer(times, t);
        setCurrentPrayer(timeInfo);
      } catch (error) {
        console.error('Error calculating prayer times:', error);
      }
    }
  }, [location, settings, t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      if (prayerTimes) {
        const timeInfo = getCurrentPrayer(prayerTimes, t);
        setCurrentPrayer(timeInfo);
      }
    }, 60000); // Update every minute

    // Listen for prayer recording events to sync with dashboard
    const handlePrayerUpdate = () => {
      setCurrentTime(new Date()); // Force re-render
    };

    window.addEventListener('prayerRecorded', handlePrayerUpdate);
    window.addEventListener('storage', handlePrayerUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('prayerRecorded', handlePrayerUpdate);
      window.removeEventListener('storage', handlePrayerUpdate);
    };
  }, [prayerTimes, t]);

  const markPrayerStatus = (prayer: string, status: 'prayed' | 'missed') => {
    // Use centralized PrayerStreakService for consistent storage
    try {
      PrayerStreakService.logPrayer(
        prayer as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
        status === 'prayed', // onTime = true if prayed, false if missed
        new Date()
      );
      
      // Force component re-render
      setCurrentTime(new Date());
      
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('prayerRecorded'));
    } catch (error) {
      console.error('Error recording prayer status:', error);
    }
  };

  const getPrayerStatus = (prayer: string): 'prayed' | 'missed' | null => {
    // Check from centralized PrayerStreakService
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const records = PrayerStreakService.getPrayerRecords();
    const todayRecord = records[today];
    
    if (!todayRecord) return null;
    
    const prayerRecord = todayRecord[prayer as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'];
    
    if (!prayerRecord?.logged) return null;
    
    return prayerRecord.onTime ? 'prayed' : 'missed';
  };

  const isPrayerTimePassed = (prayerTime: Date): boolean => {
    const now = new Date();
    return now > prayerTime;
  };

  const canSelectPrayer = (prayerTime: Date): boolean => {
    // Can only select prayers that have already passed
    return isPrayerTimePassed(prayerTime);
  };

  if (!prayerTimes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>{t('prayers.loadingPrayerTimes')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white px-6 py-8" style={{ minHeight: '120px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-black font-serif">{t('prayers.prayerTimes')}</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/prayer-settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t('prayers.prayerSettings')}
          </Button>
        </div>
        
        {/* Current Prayer Display */}
        {currentPrayer && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <Sun className="h-8 w-8 text-orange-500" />
                <div>
                  <h2 className="text-2xl font-bold text-black font-serif">{currentPrayer.name}</h2>
                  <p className="text-lg text-red-600">{currentPrayer.time}</p>
                </div>
              </div>
              
              {/* Time Remaining Display */}
              {currentPrayer.timeRemaining && (
                <div className="text-right">
                  <div className="bg-gray-200 px-4 py-2 rounded">
                    <span className="text-red-600 font-medium text-sm">{currentPrayer.timeRemaining}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-200 px-4 py-2 rounded inline-block">
              <span className="text-red-600 font-medium">{currentPrayer.status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Prayer Times List */}
      <div className="px-6 py-4" style={{ backgroundColor: '#C8B899' }}>
        <div className="flex justify-between items-center mb-4 text-black font-medium">
          <span></span>
          <div className="flex gap-4">
            <span>{t('prayers.prayed')}</span>
            <span>{t('prayers.missed')}</span>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { key: 'fajr', name: t('prayers.fajr'), time: prayerTimes.fajr },
            { key: 'dhuhr', name: t('prayers.dhuhr'), time: prayerTimes.dhuhr },
            { key: 'asr', name: t('prayers.asr'), time: prayerTimes.asr },
            { key: 'maghrib', name: t('prayers.maghrib'), time: prayerTimes.maghrib },
            { key: 'isha', name: t('prayers.isha'), time: prayerTimes.isha }
          ].map((prayer) => {
            const IconComponent = prayerIcons[prayer.key as keyof typeof prayerIcons] || Clock;
            const status = getPrayerStatus(prayer.key);
            const hasPassed = isPrayerTimePassed(prayer.time);
            const canSelect = canSelectPrayer(prayer.time);
            
            return (
              <div key={prayer.key} className={`flex items-center justify-between py-1 ${!hasPassed ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 flex-1">
                  <IconComponent className={`h-6 w-6 ${!hasPassed ? 'text-gray-400' : 'text-black'}`} />
                  <div>
                    <h3 className={`font-bold ${!hasPassed ? 'text-gray-400' : 'text-black'}`}>{prayer.name}</h3>
                    <p className={`font-medium ${!hasPassed ? 'text-gray-400' : 'text-red-600'}`}>
                      {formatPrayerTime(prayer.time, 'h:mm a', location.timezone)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => canSelect && markPrayerStatus(prayer.key, 'prayed')}
                    disabled={!canSelect}
                    className={`w-8 h-8 rounded-full border-2 border-white ${
                      status === 'prayed' ? 'bg-green-500' : 'bg-transparent'
                    } ${!canSelect ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                  <button
                    onClick={() => canSelect && markPrayerStatus(prayer.key, 'missed')}
                    disabled={!canSelect}
                    className={`w-8 h-8 rounded-full border-2 border-white ${
                      status === 'missed' ? 'bg-red-500' : 'bg-transparent'
                    } ${!canSelect ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Kaaba Image */}
        <div className="mt-4 -mx-6">
          <img 
            src={kaabaImagePath} 
            alt="Kaaba in Mecca" 
            className="w-full h-48 object-cover object-bottom"
          />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
