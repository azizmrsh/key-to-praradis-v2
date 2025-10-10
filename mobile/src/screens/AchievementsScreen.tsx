import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useLanguage} from '../contexts/LanguageContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Badge,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AchievementsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Achievements'>;
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  // Remove useUser since we don't have that context in mobile
  const userProgress = null;
  const [achievements, setAchievements] = useState([]);
  const [statistics, setStatistics] = useState({
    daysActive: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    loadAchievements();
    loadStatistics();
  }, []);

  const loadAchievements = async () => {
    try {
      const achievementsData = await AsyncStorage.getItem('achievements');
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      } else {
        // Default achievements
        const defaultAchievements = [
          {
            id: 'first_assessment',
            title: t('achievements.firstAssessment', 'First Assessment'),
            description: t('achievements.firstAssessmentDesc', 'Complete your first self-assessment'),
            icon: '📋',
            tier: 'bronze',
            unlocked: true,
            progress: 1,
            maxProgress: 1,
          },
          {
            id: 'week_streak',
            title: t('achievements.weekStreak', 'Week Warrior'),
            description: t('achievements.weekStreakDesc', 'Maintain a 7-day streak'),
            icon: '🔥',
            tier: 'silver',
            unlocked: false,
            progress: userProgress?.streak || 0,
            maxProgress: 7,
          },
          {
            id: 'month_streak',
            title: t('achievements.monthStreak', 'Month Master'),
            description: t('achievements.monthStreakDesc', 'Maintain a 30-day streak'),
            icon: '⭐',
            tier: 'gold',
            unlocked: false,
            progress: userProgress?.streak || 0,
            maxProgress: 30,
          },
          {
            id: 'sincere_seeker',
            title: t('achievements.sincereSeeker', 'Sincere Seeker'),
            description: t('achievements.sincereSeekerDesc', 'Complete 100 lessons with reflection'),
            icon: '🤲',
            tier: 'sincere',
            unlocked: false,
            progress: userProgress?.completedLessons?.length || 0,
            maxProgress: 100,
          },
        ];
        setAchievements(defaultAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = {
        daysActive: userProgress?.activityDates?.length || 0,
        lessonsCompleted: userProgress?.completedLessons?.length || 0,
        currentStreak: userProgress?.streak || 0,
        totalPoints: (userProgress?.completedLessons?.length || 0) * 10,
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'sincere':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTierLabel = (tier: string) => {
    return t(`achievements.tier.${tier}`, tier);
  };

  const renderStatCard = (title: string, value: number, icon: string) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statCardContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Title style={styles.statValue}>{value}</Title>
        <Paragraph style={[styles.statTitle, isRTL && styles.rtlText]}>
          {title}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  const renderAchievementCard = (achievement: any) => (
    <Card
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked && styles.unlockedCard,
        !achievement.unlocked && styles.lockedCard,
      ]}
    >
      <Card.Content>
        <View style={styles.achievementHeader}>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementText}>
              <Title style={[styles.achievementTitle, isRTL && styles.rtlText]}>
                {achievement.title}
              </Title>
              <Paragraph style={[styles.achievementDescription, isRTL && styles.rtlText]}>
                {achievement.description}
              </Paragraph>
            </View>
          </View>
          <Chip
            mode="flat"
            style={[styles.tierChip, {backgroundColor: getTierColor(achievement.tier)}]}
            textStyle={styles.tierText}
          >
            {getTierLabel(achievement.tier)}
          </Chip>
        </View>

        {!achievement.unlocked && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={achievement.progress / achievement.maxProgress}
              color={getTierColor(achievement.tier)}
              style={styles.progressBar}
            />
            <Paragraph style={styles.progressText}>
              {achievement.progress} / {achievement.maxProgress}
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← {t('common.back', 'Back')}
        </Button>
        <Title style={isRTL && styles.rtlText}>
          {t('achievements.title', 'Achievements')}
        </Title>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          {renderStatCard(
            t('achievements.daysActive', 'Days Active'),
            statistics.daysActive,
            '📅'
          )}
          {renderStatCard(
            t('achievements.lessonsCompleted', 'Lessons'),
            statistics.lessonsCompleted,
            '📚'
          )}
          {renderStatCard(
            t('achievements.currentStreak', 'Current Streak'),
            statistics.currentStreak,
            '🔥'
          )}
          {renderStatCard(
            t('achievements.totalPoints', 'Total Points'),
            statistics.totalPoints,
            '⭐'
          )}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Title style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t('achievements.yourAchievements', 'Your Achievements')}
          </Title>
          {achievements.map(renderAchievementCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    marginBottom: 12,
  },
  unlockedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  lockedCard: {
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  achievementInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tierChip: {
    alignSelf: 'flex-start',
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default AchievementsScreen;