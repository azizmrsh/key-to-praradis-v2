import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
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
  Chip,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GoalsChallengesScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Challenges'>;
};

const GoalsChallengesScreen: React.FC<GoalsChallengesScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [userFocusAreas, setUserFocusAreas] = useState({
    primary: 'tongue',
    secondary: 'heart',
  });
  const [activeGoals, setActiveGoals] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const results = await AsyncStorage.getItem('assessment_results');
      if (results) {
        const parsed = JSON.parse(results);
        setUserFocusAreas({
          primary: parsed.primaryStruggle || 'tongue',
          secondary: parsed.secondaryStruggle || 'heart',
        });
      }

      const goals = await AsyncStorage.getItem('activeGoals');
      if (goals) {
        setActiveGoals(JSON.parse(goals));
      }

      const challenges = await AsyncStorage.getItem('activeChallenges');
      if (challenges) {
        setActiveChallenges(JSON.parse(challenges));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    return t(`manualSelection.categories.${category}`, {defaultValue: category});
  };

  const renderGoalsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Focus Areas */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={isRTL && styles.rtlText}>
            {t('goals.focusAreas', 'Focus Areas')}
          </Title>
          <View style={styles.chipContainer}>
            <Chip mode="flat" style={styles.primaryChip}>
              {getCategoryLabel(userFocusAreas.primary)}
            </Chip>
            {userFocusAreas.secondary && (
              <Chip mode="outlined" style={styles.secondaryChip}>
                {getCategoryLabel(userFocusAreas.secondary)}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Active Goals */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={isRTL && styles.rtlText}>
            {t('goals.activeGoals', 'Active Goals')}
          </Title>
          {activeGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Paragraph style={isRTL && styles.rtlText}>
                {t('goals.noActiveGoals', 'No active goals yet')}
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('GoalSetting')}
                style={styles.actionButton}
              >
                {t('goals.setFirstGoal', 'Set Your First Goal')}
              </Button>
            </View>
          ) : (
            activeGoals.map((goal, index) => (
              <Card key={index} style={styles.goalCard}>
                <Card.Content>
                  <Title style={styles.goalTitle}>{goal.title}</Title>
                  <Paragraph style={styles.goalDescription}>
                    {goal.description}
                  </Paragraph>
                  <View style={styles.progressContainer}>
                    <ProgressBar
                      progress={goal.progress || 0}
                      color="#10B981"
                      style={styles.progressBar}
                    />
                    <Paragraph style={styles.progressText}>
                      {Math.round((goal.progress || 0) * 100)}% Complete
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderChallengesTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Active Challenges */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={isRTL && styles.rtlText}>
            {t('challenges.activeChallenges', 'Active Challenges')}
          </Title>
          {activeChallenges.length === 0 ? (
            <View style={styles.emptyState}>
              <Paragraph style={isRTL && styles.rtlText}>
                {t('challenges.noActiveChallenges', 'No active challenges yet')}
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ChallengeSelection')}
                style={styles.actionButton}
              >
                {t('challenges.startFirstChallenge', 'Start Your First Challenge')}
              </Button>
            </View>
          ) : (
            activeChallenges.map((challenge, index) => (
              <Card key={index} style={styles.challengeCard}>
                <Card.Content>
                  <View style={styles.challengeHeader}>
                    <Title style={styles.challengeTitle}>{challenge.title}</Title>
                    <Badge size={24} style={styles.challengeBadge}>
                      {challenge.daysRemaining}
                    </Badge>
                  </View>
                  <Paragraph style={styles.challengeDescription}>
                    {challenge.description}
                  </Paragraph>
                  <View style={styles.challengeStats}>
                    <Paragraph style={styles.statText}>
                      {t('challenges.daysCompleted', 'Days Completed')}: {challenge.daysCompleted || 0}
                    </Paragraph>
                    <Paragraph style={styles.statText}>
                      {t('challenges.streak', 'Streak')}: {challenge.streak || 0}
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← {t('common.back', 'Back')}
        </Button>
        <Title style={isRTL && styles.rtlText}>
          {t('navigation.challenges', 'Challenges')}
        </Title>
      </View>

      <View style={styles.tabsContainer}>
        <Button 
          mode={activeTab === 0 ? 'contained' : 'outlined'}
          onPress={() => setActiveTab(0)}
          style={styles.tabButton}
        >
          {t('goals.title', 'Goals')}
        </Button>
        <Button 
          mode={activeTab === 1 ? 'contained' : 'outlined'}
          onPress={() => setActiveTab(1)}
          style={styles.tabButton}
        >
          {t('challenges.title', 'Challenges')}
        </Button>
      </View>

      {activeTab === 0 ? renderGoalsTab() : renderChallengesTab()}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  primaryChip: {
    backgroundColor: '#10B981',
  },
  secondaryChip: {
    borderColor: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: '#10B981',
  },
  goalCard: {
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  },
  challengeCard: {
    marginBottom: 12,
    backgroundColor: '#FEF3C7',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  challengeBadge: {
    backgroundColor: '#F59E0B',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default GoalsChallengesScreen;