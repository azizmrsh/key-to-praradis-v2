import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PrayerTimesService, PrayerTimesData } from '../services/PrayerTimesService';
import { LocationService, LocationData } from '../services/LocationService';

interface PrayerTimesCardProps {
  style?: any;
}

const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({ style }) => {
  const { t } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);

  useEffect(() => {
    loadPrayerTimes();
    
    // تحديث أوقات الصلاة كل دقيقة
    const interval = setInterval(() => {
      if (prayerTimes) {
        updateCurrentAndNextPrayer(prayerTimes);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      // الحصول على الموقع المحفوظ
      const location = await LocationService.getCurrentLocation();
      if (!location) {
        setError('لم يتم تحديد الموقع. يرجى تحديد موقعك في الإعدادات.');
        return;
      }

      // حساب أوقات الصلاة
      const times = await PrayerTimesService.calculatePrayerTimes(location);
      setPrayerTimes(times);
      updateCurrentAndNextPrayer(times);
    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError('حدث خطأ في تحميل أوقات الصلاة');
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentAndNextPrayer = (times: PrayerTimesData) => {
    const current = PrayerTimesService.getCurrentPrayerTime(times);
    const next = PrayerTimesService.getNextPrayer(times);
    
    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  const formatTime = (time: Date): string => {
    return PrayerTimesService.formatPrayerTime(time, false);
  };

  const getPrayerDisplayName = (prayerName: string): string => {
    const prayerNames: { [key: string]: string } = {
      fajr: t('prayers.fajr', 'الفجر'),
      sunrise: t('prayers.sunrise', 'الشروق'),
      dhuhr: t('prayers.dhuhr', 'الظهر'),
      asr: t('prayers.asr', 'العصر'),
      maghrib: t('prayers.maghrib', 'المغرب'),
      isha: t('prayers.isha', 'العشاء')
    };
    return prayerNames[prayerName] || prayerName;
  };

  if (loading) {
    return (
      <Card style={[styles.card, style]}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Paragraph style={styles.loadingText}>
            {t('prayers.loading', 'جاري تحميل أوقات الصلاة...')}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.card, style]}>
        <Card.Content>
          <Title style={styles.errorTitle}>
            {t('prayers.error', 'خطأ في أوقات الصلاة')}
          </Title>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (!prayerTimes) {
    return null;
  }

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>
            {t('prayers.todaysPrayerTimes', 'أوقات الصلاة اليوم')}
          </Title>
          {currentPrayer && (
            <Chip mode="flat" style={styles.currentPrayerChip}>
              {t('prayers.current', 'الآن')}: {getPrayerDisplayName(currentPrayer)}
            </Chip>
          )}
        </View>

        <View style={styles.locationContainer}>
          <Paragraph style={styles.locationText}>
            {prayerTimes.location.city}, {prayerTimes.location.country}
          </Paragraph>
        </View>

        <View style={styles.timesContainer}>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('fajr')}
              </Paragraph>
              <Paragraph style={[
                styles.prayerTime,
                currentPrayer === 'fajr' && styles.currentTime
              ]}>
                {formatTime(prayerTimes.fajr)}
              </Paragraph>
            </View>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('sunrise')}
              </Paragraph>
              <Paragraph style={styles.prayerTime}>
                {formatTime(prayerTimes.sunrise)}
              </Paragraph>
            </View>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('dhuhr')}
              </Paragraph>
              <Paragraph style={[
                styles.prayerTime,
                currentPrayer === 'dhuhr' && styles.currentTime
              ]}>
                {formatTime(prayerTimes.dhuhr)}
              </Paragraph>
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('asr')}
              </Paragraph>
              <Paragraph style={[
                styles.prayerTime,
                currentPrayer === 'asr' && styles.currentTime
              ]}>
                {formatTime(prayerTimes.asr)}
              </Paragraph>
            </View>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('maghrib')}
              </Paragraph>
              <Paragraph style={[
                styles.prayerTime,
                currentPrayer === 'maghrib' && styles.currentTime
              ]}>
                {formatTime(prayerTimes.maghrib)}
              </Paragraph>
            </View>
            <View style={styles.timeItem}>
              <Paragraph style={styles.prayerName}>
                {getPrayerDisplayName('isha')}
              </Paragraph>
              <Paragraph style={[
                styles.prayerTime,
                currentPrayer === 'isha' && styles.currentTime
              ]}>
                {formatTime(prayerTimes.isha)}
              </Paragraph>
            </View>
          </View>
        </View>

        {nextPrayer && (
          <View style={styles.nextPrayerContainer}>
            <Paragraph style={styles.nextPrayerText}>
              {t('prayers.nextPrayer', 'الصلاة التالية')}: {getPrayerDisplayName(nextPrayer.name)}
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 18,
    marginBottom: 8,
  },
  errorText: {
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  currentPrayerChip: {
    backgroundColor: '#10B981',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  timesContainer: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  prayerName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  prayerTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  currentTime: {
    color: '#10B981',
    fontSize: 16,
  },
  nextPrayerContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextPrayerText: {
    textAlign: 'center',
    color: '#10B981',
    fontWeight: '500',
  },
});

export default PrayerTimesCard;