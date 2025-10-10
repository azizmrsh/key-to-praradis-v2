import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useLanguage} from '../contexts/LanguageContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';
import {Card, Title, Paragraph, Button} from 'react-native-paper';

const {width} = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: t('onboarding.getStarted'),
      content: t('onboarding.chooseYourPath'),
      description: t('onboarding.pathDescription'),
    },
    {
      title: t('onboarding.takeAssessment'),
      content: t('onboarding.assessmentDescription'),
      description: t('onboarding.assessmentDescription'),
    },
    {
      title: t('onboarding.chooseManually'),
      content: t('onboarding.manualDescription'),
      description: t('onboarding.manualDescription'),
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('Assessment');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Assessment');
  };

  const handleTakeAssessment = () => {
    navigation.navigate('Assessment');
  };

  const handleManualSelection = () => {
    navigation.navigate('ManualSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={[styles.title, isRTL && styles.rtlText]}>
                {onboardingSteps[currentStep].title}
              </Title>
              <Paragraph style={[styles.description, isRTL && styles.rtlText]}>
                {onboardingSteps[currentStep].description}
              </Paragraph>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleTakeAssessment}
              style={styles.primaryButton}
            >
              {t('onboarding.takeAssessment')}
            </Button>

            <Text style={[styles.orText, isRTL && styles.rtlText]}>
              {t('onboarding.or')}
            </Text>

            <Button
              mode="outlined"
              onPress={handleManualSelection}
              style={styles.secondaryButton}
            >
              {t('onboarding.chooseManually')}
            </Button>
          </View>

          {/* Bottom Note */}
          <View style={styles.bottomNote}>
            <Paragraph style={[styles.noteText, isRTL && styles.rtlText]}>
              {t('onboarding.bottomNote')}
            </Paragraph>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('common.skip', 'Skip')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentStep === onboardingSteps.length - 1
              ? t('common.getStarted', 'Get Started')
              : t('common.next', 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  progressDotActive: {
    backgroundColor: '#10B981',
    width: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 4,
    minWidth: width * 0.8,
  },
  secondaryButton: {
    borderColor: '#10B981',
    paddingVertical: 4,
    minWidth: width * 0.8,
  },
  orText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomNote: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default OnboardingScreen;