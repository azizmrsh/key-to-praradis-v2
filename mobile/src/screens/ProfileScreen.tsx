import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Button, List} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useUser} from '../contexts/UserContext';

const ProfileScreen = ({navigation}: any) => {
  const {userProgress, preferences} = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>User Profile</Title>
            <Paragraph>Manage your spiritual journey progress and preferences</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Progress Overview</Title>
            <List.Item
              title="Current Streak"
              description={`${userProgress?.streak || 0} days`}
              left={props => <List.Icon {...props} icon="fire" />}
            />
            <List.Item
              title="Completed Lessons"
              description={`${userProgress?.completedLessons?.length || 0} lessons`}
              left={props => <List.Icon {...props} icon="book-check" />}
            />
            <List.Item
              title="Active Challenges"
              description={`${userProgress?.activeChallenges?.length || 0} challenges`}
              left={props => <List.Icon {...props} icon="target" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Settings</Title>
            <List.Item
              title="Language"
              description={preferences.language.toUpperCase()}
              left={props => <List.Icon {...props} icon="translate" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings')}
            />
            <List.Item
              title="Theme"
              description={preferences.theme}
              left={props => <List.Icon {...props} icon="palette" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings')}
            />
            <List.Item
              title="Notifications"
              description={preferences.notifications ? 'Enabled' : 'Disabled'}
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Settings')}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Assessment</Title>
            <Paragraph style={styles.description}>
              Retake your spiritual assessment or update your focus areas
            </Paragraph>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('AssessmentChoice')}
            >
              Retake Assessment
            </Button>
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    color: '#6B7280',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ProfileScreen;