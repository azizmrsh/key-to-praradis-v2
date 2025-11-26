import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, I18nManager} from 'react-native';
import {Card, Title, Paragraph, Button, ProgressBar, Chip} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useUser} from '../contexts/UserContext';
import {useLanguage} from '../contexts/LanguageContext';
import {categoryInfo} from '../data/selfAssessmentData';
import {SinCategory} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrayerTimesCard from '../components/PrayerTimesCard';

const DashboardScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  const {userProgress} = useUser();
  const [userActiveSinCategories, setUserActiveSinCategories] = useState<SinCategory[]>(['tongue', 'heart']);

  useEffect(() => {
    getUserActiveSinCategories();
  }, []);

  const getUserActiveSinCategories = async () => {
    try {
      const assessmentResults = await AsyncStorage.getItem('assessment_results');
      if (assessmentResults) {
        const results = JSON.parse(assessmentResults);
        if (results.primaryStruggle) {
          setUserActiveSinCategories([
            results.primaryStruggle,
            results.secondaryStruggle || results.primaryStruggle
          ]);
          return;
        }
      }
      
      // Fallback to default categories
      setUserActiveSinCategories(['tongue', 'heart']);
    } catch (error) {
      console.error('Error loading assessment results:', error);
      setUserActiveSinCategories(['tongue', 'heart']);
    }
  };

  const navigateToAssessment = () => {
    navigation.navigate('AssessmentChoice');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={[styles.welcomeTitle, isRTL && styles.rtlText]}>
              {t('dashboard.title', 'Spiritual Journey Dashboard')}
            </Title>
            <Paragraph style={isRTL && styles.rtlText}>
              {t('dashboard.subtitle', 'Your path to spiritual growth and self-improvement')}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Prayer Times */}
        <PrayerTimesCard />

        {/* Active Focus Areas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('dashboard.activeFocusAreas', 'Your Active Focus Areas')}
            </Title>
            <Paragraph style={[styles.subtitle, isRTL && styles.rtlText]}>
              {t('dashboard.workingOnAreas', 'Working on {{count}} areas of spiritual growth', {count: userActiveSinCategories.length})}
            </Paragraph>
            
            <View style={styles.categoriesContainer}>
              {userActiveSinCategories.map((category) => (
                <Card key={category} style={styles.categoryCard}>
                  <Card.Content>
                    <View style={styles.categoryHeader}>
                      <Chip mode="outlined" style={styles.categoryChip}>
                        {categoryInfo[category].title}
                      </Chip>
                    </View>
                    <Paragraph style={styles.categoryDescription}>
                      {categoryInfo[category].description}
                    </Paragraph>
                    
                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                      <Paragraph style={styles.progressLabel}>Progress</Paragraph>
                      <ProgressBar progress={0.3} color="#10B981" style={styles.progressBar} />
                      <Paragraph style={styles.progressText}>30% Complete</Paragraph>
                    </View>
                    
                    <Button 
                      mode="contained" 
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('Content')}
                    >
                      {t('dashboard.continueLearning', 'Continue Learning')}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('dashboard.quickActions', 'Quick Actions')}
            </Title>
            <View style={styles.actionsContainer}>
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={navigateToAssessment}
              >
                {t('dashboard.takeAssessment', 'Take Assessment')}
              </Button>
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Content')}
              >
                {t('dashboard.browseContent', 'Browse Content')}
              </Button>
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('SOS')}
              >
                {t('dashboard.emergencySupport', 'Emergency Support')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Today's Progress */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('dashboard.todaysProgress', "Today's Progress")}
            </Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>
                  {userProgress?.todayCompletedLessons?.length || 0}
                </Title>
                <Paragraph style={isRTL && styles.rtlText}>
                  {t('dashboard.lessonsCompleted', 'Lessons Completed')}
                </Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>{userProgress?.streak || 0}</Title>
                <Paragraph style={isRTL && styles.rtlText}>
                  {t('dashboard.dayStreak', 'Day Streak')}
                </Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>
                  {userProgress?.activeChallenges?.length || 0}
                </Title>
                <Paragraph style={isRTL && styles.rtlText}>
                  {t('dashboard.yourPathItems', 'Your Path Items')}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#10B981',
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#10B981',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#10B981',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '30%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default DashboardScreen;