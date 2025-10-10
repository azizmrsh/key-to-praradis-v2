import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Dimensions} from 'react-native';
import {Card, Title, Paragraph, Button, RadioButton, Text, ProgressBar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ArabicText, BilingualText} from '../components/ui/ArabicText';
import {responsive} from '../theme/theme';
import {questions} from '../data/selfAssessmentData';

interface EnhancedAssessmentScreenProps {
  navigation: any;
}

const EnhancedAssessmentScreen: React.FC<EnhancedAssessmentScreenProps> = ({navigation}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  const [isComplete, setIsComplete] = useState(false);

  const totalQuestions = questions.length;
  const progress = currentQuestionIndex / totalQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleResponse = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeAssessment = () => {
    setIsComplete(true);
    // Process results and navigate to results screen
    navigation.navigate('AssessmentResults', {responses});
  };

  const skipQuestion = () => {
    goToNext();
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <Card style={styles.completionCard}>
            <Card.Content>
              <View style={styles.completionHeader}>
                <Icon name="check-circle" size={64} color="#10B981" />
                <Title style={styles.completionTitle}>Assessment Complete!</Title>
                <Paragraph style={styles.completionText}>
                  Your spiritual assessment has been completed. We're analyzing your responses to provide personalized guidance.
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Text variant="titleSmall" style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
              <ProgressBar 
                progress={progress} 
                style={styles.progressBar}
                color="#10B981"
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <Title style={styles.questionTitle}>
              {currentQuestion.text}
            </Title>
            
            {currentQuestion.description && (
              <Paragraph style={styles.questionDescription}>
                {currentQuestion.description}
              </Paragraph>
            )}

            {/* Arabic guidance if available */}
            {currentQuestion.arabicGuidance && (
              <View style={styles.arabicGuidanceContainer}>
                <BilingualText
                  arabic={currentQuestion.arabicGuidance.arabic}
                  translation={currentQuestion.arabicGuidance.translation}
                  transliteration={currentQuestion.arabicGuidance.transliteration}
                  containerStyle={styles.bilingualContainer}
                  arabicSize="lg"
                  arabicWeight="medium"
                />
              </View>
            )}

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <RadioButton
                    value={option.value.toString()}
                    status={responses[currentQuestion.id] === option.value ? 'checked' : 'unchecked'}
                    onPress={() => handleResponse(option.value)}
                    color="#10B981"
                  />
                  <Text 
                    style={styles.optionText}
                    onPress={() => handleResponse(option.value)}
                  >
                    {option.text}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Islamic guidance card */}
        <Card style={styles.guidanceCard}>
          <Card.Content>
            <View style={styles.guidanceHeader}>
              <Icon name="book-open" size={24} color="#10B981" />
              <Title style={styles.guidanceTitle}>Islamic Guidance</Title>
            </View>
            
            <BilingualText
              arabic="وَاللَّهُ يَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ"
              translation="And Allah knows what you conceal and what you reveal."
              transliteration="Wa Allah ya'lamu ma tusirroona wa ma tu'linoon"
              containerStyle={styles.verseContainer}
              arabicSize="lg"
              arabicWeight="medium"
            />
            
            <Text variant="bodySmall" style={styles.verseReference}>
              - Quran 16:19
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Card style={styles.navigationCard}>
          <Card.Content>
            <View style={styles.navigationRow}>
              <Button
                mode="text"
                onPress={goToPrevious}
                disabled={currentQuestionIndex === 0}
                style={styles.navButton}
              >
                <Icon name="arrow-left" size={16} />
                Previous
              </Button>

              <Button
                mode="text"
                onPress={skipQuestion}
                style={styles.skipButton}
              >
                Skip
              </Button>

              <Button
                mode="contained"
                onPress={goToNext}
                disabled={!responses[currentQuestion.id]}
                style={styles.navButton}
                buttonColor="#10B981"
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next'}
                <Icon name="arrow-right" size={16} />
              </Button>
            </View>
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
  header: {
    paddingHorizontal: responsive.spacing.md,
    paddingTop: responsive.spacing.sm,
  },
  headerCard: {
    elevation: 2,
  },
  headerContent: {
    paddingVertical: responsive.spacing.sm,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: responsive.spacing.sm,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: responsive.spacing.md,
  },
  questionCard: {
    marginBottom: responsive.spacing.md,
    elevation: 2,
  },
  questionTitle: {
    fontSize: responsive.fontSize.lg,
    marginBottom: responsive.spacing.md,
    lineHeight: 24,
  },
  questionDescription: {
    fontSize: responsive.fontSize.sm,
    color: '#6B7280',
    marginBottom: responsive.spacing.lg,
    lineHeight: 20,
  },
  arabicGuidanceContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: responsive.spacing.md,
    marginBottom: responsive.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  bilingualContainer: {
    paddingVertical: responsive.spacing.sm,
  },
  optionsContainer: {
    marginTop: responsive.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.spacing.sm,
    paddingHorizontal: responsive.spacing.xs,
  },
  optionText: {
    flex: 1,
    marginLeft: responsive.spacing.sm,
    fontSize: responsive.fontSize.base,
    lineHeight: 20,
  },
  guidanceCard: {
    marginBottom: responsive.spacing.md,
    backgroundColor: '#FFFBEB',
    elevation: 1,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  guidanceTitle: {
    marginLeft: responsive.spacing.sm,
    fontSize: responsive.fontSize.base,
    color: '#10B981',
  },
  verseContainer: {
    paddingVertical: responsive.spacing.sm,
  },
  verseReference: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: responsive.spacing.sm,
  },
  navigationContainer: {
    paddingHorizontal: responsive.spacing.md,
    paddingBottom: responsive.spacing.md,
  },
  navigationCard: {
    elevation: 4,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.spacing.sm,
  },
  navButton: {
    minWidth: 80,
  },
  skipButton: {
    color: '#6B7280',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: responsive.spacing.lg,
  },
  completionCard: {
    elevation: 4,
  },
  completionHeader: {
    alignItems: 'center',
    paddingVertical: responsive.spacing.xl,
  },
  completionTitle: {
    fontSize: responsive.fontSize['2xl'],
    textAlign: 'center',
    marginVertical: responsive.spacing.md,
    color: '#10B981',
  },
  completionText: {
    textAlign: 'center',
    fontSize: responsive.fontSize.base,
    lineHeight: 22,
    color: '#6B7280',
  },
});

export default EnhancedAssessmentScreen;