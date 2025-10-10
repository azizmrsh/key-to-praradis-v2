import React, {useState} from 'react';
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
  RadioButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ManualSelectionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ManualSelection'>;
};

const ManualSelectionScreen: React.FC<ManualSelectionScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');

  const categoryOptions = [
    {value: 'tongue', label: t('manualSelection.categories.tongue')},
    {value: 'eyes', label: t('manualSelection.categories.eyes')},
    {value: 'ears', label: t('manualSelection.categories.ears')},
    {value: 'heart', label: t('manualSelection.categories.heart')},
    {value: 'pride', label: t('manualSelection.categories.pride')},
    {value: 'stomach', label: t('manualSelection.categories.stomach')},
    {value: 'zina', label: t('manualSelection.categories.zina')},
  ];

  const handleContinue = async () => {
    if (!primaryCategory) return;

    const results = {
      primaryStruggle: primaryCategory,
      secondaryStruggle: secondaryCategory || primaryCategory,
      isManualSelection: true,
      completedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('assessment_results', JSON.stringify(results));
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving manual selection:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← {t('common.back', 'Back')}
        </Button>
        <Title style={isRTL && styles.rtlText}>
          {t('manualSelection.title')}
        </Title>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.cardTitle, isRTL && styles.rtlText]}>
              {t('manualSelection.cardTitle')}
            </Title>
            <Paragraph style={[styles.cardDescription, isRTL && styles.rtlText]}>
              {t('manualSelection.cardDescription')}
            </Paragraph>

            {/* Primary Focus Area */}
            <View style={styles.selectionContainer}>
              <Paragraph style={[styles.selectionLabel, isRTL && styles.rtlText]}>
                {t('manualSelection.primaryFocusLabel')}
              </Paragraph>
              <RadioButton.Group
                onValueChange={setPrimaryCategory}
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
            </View>

            {/* Secondary Focus Area */}
            <View style={styles.selectionContainer}>
              <Paragraph style={[styles.selectionLabel, isRTL && styles.rtlText]}>
                {t('manualSelection.secondaryFocusLabel')}
              </Paragraph>
              <RadioButton.Group
                onValueChange={setSecondaryCategory}
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

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Assessment')}
                style={styles.button}
              >
                {t('manualSelection.takeAssessmentInstead')}
              </Button>
              <Button
                mode="contained"
                onPress={handleContinue}
                disabled={!primaryCategory}
                style={styles.button}
              >
                {t('manualSelection.continueWithSelection')}
              </Button>
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
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#6B7280',
    marginBottom: 24,
  },
  selectionContainer: {
    marginBottom: 24,
  },
  selectionLabel: {
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 16,
  },
  radioItem: {
    paddingVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default ManualSelectionScreen;