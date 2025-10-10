import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AssessmentChoiceScreen = ({navigation}: any) => {
  const handleTakeAssessment = () => {
    navigation.navigate('Assessment', {skip: false});
  };

  const handleSkipToManualSelection = () => {
    navigation.navigate('Assessment', {skip: true});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button 
            mode="text" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} />
          </Button>
          <Title style={styles.title}>Choose Your Path</Title>
        </View>

        <Paragraph style={styles.description}>
          To personalize your spiritual growth journey, you can either take our assessment or manually select the areas you'd like to focus on.
        </Paragraph>

        {/* Assessment Option */}
        <Card style={styles.optionCard} onPress={handleTakeAssessment}>
          <Card.Content>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Icon name="brain" size={32} color="#10B981" />
              </View>
              <View style={styles.textContainer}>
                <Title style={styles.optionTitle}>Take Self-Assessment</Title>
                <Paragraph style={styles.optionDescription}>
                  Answer questions to help identify your primary areas of focus (10-15 minutes)
                </Paragraph>
              </View>
              <Icon name="chevron-right" size={24} color="#6B7280" />
            </View>
          </Card.Content>
        </Card>

        {/* Manual Selection Option */}
        <Card style={styles.optionCard} onPress={handleSkipToManualSelection}>
          <Card.Content>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Icon name="target" size={32} color="#059669" />
              </View>
              <View style={styles.textContainer}>
                <Title style={styles.optionTitle}>Choose Manually</Title>
                <Paragraph style={styles.optionDescription}>
                  Skip the assessment and select the spiritual areas you want to work on
                </Paragraph>
              </View>
              <Icon name="chevron-right" size={24} color="#6B7280" />
            </View>
          </Card.Content>
        </Card>

        {/* Footer Note */}
        <Card style={styles.noteCard}>
          <Card.Content>
            <Paragraph style={styles.noteText}>
              You can always retake the assessment or change your focus areas later from your profile page.
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  noteCard: {
    marginTop: 32,
    backgroundColor: '#F9FAFB',
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AssessmentChoiceScreen;