import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Button, RadioButton, ProgressBar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {selfAssessmentQuestions, responseOptions, categoryInfo} from '../data/selfAssessmentData';
import {AssessmentQuestion, AssessmentResponse, SinCategory} from '../types';

const AssessmentScreen = ({navigation, route}: any) => {
  const skipToManual = route?.params?.skip || false;
  const [showManualSelection, setShowManualSelection] = useState(skipToManual);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState<SinCategory | ''>('');
  const [secondaryCategory, setSecondaryCategory] = useState<SinCategory | ''>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const categoryOptions = [
    {value: 'tongue', label: 'Tongue (Speech & Communication)'},
    {value: 'eyes', label: 'Eyes (What We Watch)'},
    {value: 'ears', label: 'Ears (What We Listen To)'},
    {value: 'heart', label: 'Heart (Intentions & Emotions)'},
    {value: 'pride', label: 'Pride & Arrogance'},
    {value: 'stomach', label: 'Stomach (What We Consume)'},
    {value: 'zina', label: 'Zina (Unlawful Relations)'},
  ];

  const currentQuestion = selfAssessmentQuestions[currentQuestionIndex];
  const totalQuestions = selfAssessmentQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (currentQuestion) {
      const existingResponse = responses[currentQuestion.id];
      setSelectedAnswer(existingResponse?.answer || '');
    }
  }, [currentQuestionIndex, responses]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || isNavigating || isCompleting) return;

    const newResponses = {
      ...responses,
      [currentQuestion.id]: {questionId: currentQuestion.id, answer}
    };
    setResponses(newResponses);
    setSelectedAnswer(answer);
    
    // Auto-advance after a brief delay if this isn't the last question
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        if (!isNavigating && !isCompleting) {
          handleNext();
        }
      }, 800);
    }
  };

  const handleNext = () => {
    if (isNavigating || isCompleting) return;
    
    // Ensure we have a response before proceeding
    if (!selectedAnswer) return;
    
    setIsNavigating(true);
    
    // Add longer delay to prevent rapid clicking
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsNavigating(false);
      } else {
        setIsCompleting(true);
        handleComplete();
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (isNavigating || currentQuestionIndex === 0 || isCompleting) return;
    
    setIsNavigating(true);
    
    // Add longer delay to prevent rapid clicking
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsNavigating(false);
    }, 300);
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    
    try {
      // Calculate category scores
      const categoryScores: Record<SinCategory, number> = {
        tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
      };
      const categoryCounts: Record<SinCategory, number> = {
        tongue: 0, eyes: 0, ears: 0, pride: 0, stomach: 0, zina: 0, heart: 0
      };

      Object.values(responses).forEach(response => {
        const question = selfAssessmentQuestions.find(q => q.id === response.questionId);
        if (question) {
          const scoreOption = responseOptions.find(opt => opt.value === response.answer);
          if (scoreOption) {
            categoryScores[question.category] += scoreOption.score;
            categoryCounts[question.category] += 1;
          }
        }
      });

      // Find top 2 categories
      const avgScores = Object.entries(categoryScores).map(([category, total]) => ({
        category: category as SinCategory,
        avgScore: categoryCounts[category as SinCategory] > 0 ? total / categoryCounts[category as SinCategory] : 0
      }));

      avgScores.sort((a, b) => b.avgScore - a.avgScore);
      
      const results = {
        primaryStruggle: avgScores[0]?.category || 'tongue',
        secondaryStruggle: avgScores[1]?.category || 'heart',
        responses,
        completedAt: new Date().toISOString(),
        isFullAssessment: true
      };

      await AsyncStorage.setItem('assessment_results', JSON.stringify(results));
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleManualSelectionComplete = async () => {
    if (!primaryCategory || isCompleting) return;

    setIsCompleting(true);
    
    try {
      const results = {
        primaryStruggle: primaryCategory,
        secondaryStruggle: secondaryCategory || primaryCategory,
        isManualSelection: true,
        completedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem('assessment_results', JSON.stringify(results));
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error completing manual selection:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (showManualSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button mode="text" onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} />
          </Button>
          <Title>Choose Your Focus Areas</Title>
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Select Your Spiritual Focus Areas</Title>
              <Paragraph style={styles.cardDescription}>
                Choose which spiritual challenges you'd like to focus on improving.
              </Paragraph>

              <View style={styles.selectionContainer}>
                <Paragraph style={styles.selectionLabel}>Primary Focus Area (Required)</Paragraph>
                <RadioButton.Group
                  onValueChange={value => setPrimaryCategory(value as SinCategory)}
                  value={primaryCategory}
                >
                  {categoryOptions.map(option => (
                    <RadioButton.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      style={styles.radioItem}
                    />
                  ))}
                </RadioButton.Group>

                <Paragraph style={styles.selectionLabel}>Secondary Focus Area (Optional)</Paragraph>
                <RadioButton.Group
                  onValueChange={value => setSecondaryCategory(value as SinCategory)}
                  value={secondaryCategory}
                >
                  {categoryOptions
                    .filter(option => option.value !== primaryCategory)
                    .map(option => (
                      <RadioButton.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        style={styles.radioItem}
                      />
                    ))}
                </RadioButton.Group>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setShowManualSelection(false)}
                  style={styles.button}
                >
                  Take Assessment Instead
                </Button>
                <Button
                  mode="contained"
                  onPress={handleManualSelectionComplete}
                  disabled={!primaryCategory}
                  style={styles.button}
                >
                  Continue with Selection
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} />
        </Button>
        <Title>Self Assessment</Title>
      </View>

      <View style={styles.progressContainer}>
        <Paragraph>Question {currentQuestionIndex + 1} of {totalQuestions}</Paragraph>
        <ProgressBar progress={progress / 100} color="#10B981" style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content}>
        {currentQuestion && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.questionTitle}>{currentQuestion.text}</Title>
              
              <RadioButton.Group
                onValueChange={handleAnswer}
                value={selectedAnswer}
              >
                {responseOptions.map(option => (
                  <RadioButton.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0 || isNavigating || isCompleting}
          style={styles.navButton}
        >
          Previous
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!selectedAnswer || isNavigating || isCompleting}
          style={styles.navButton}
          loading={isCompleting && currentQuestionIndex === totalQuestions - 1}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next'}
        </Button>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#10B981',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    marginTop: 8,
    height: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    color: '#6B7280',
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  radioItem: {
    paddingVertical: 8,
  },
  selectionContainer: {
    marginBottom: 24,
  },
  selectionLabel: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
  },
  navButton: {
    minWidth: 100,
  },
});

export default AssessmentScreen;