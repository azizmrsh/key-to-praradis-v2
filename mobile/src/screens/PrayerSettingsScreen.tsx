import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
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
  List,
  RadioButton,
  Portal,
  Dialog,
  Divider,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocationService, LocationData} from '../services/LocationService';
import {LocationSearchModal} from '../components/LocationSearchModal';

type PrayerSettingsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PrayerSettings'>;
};

const PrayerSettingsScreen: React.FC<PrayerSettingsScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {isRTL} = useLanguage();
  const [location, setLocation] = useState({
    city: 'Mecca',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
  });
  const [prayerSettings, setPrayerSettings] = useState({
    method: 'muslim-world-league',
    madhab: 'shafi',
    highLatitudeRule: 'middle-of-the-night',
  });
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showLocationSearchModal, setShowLocationSearchModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    location: boolean;
  }>({
    location: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('prayerLocation');
      const savedSettings = await AsyncStorage.getItem('prayerSettings');

      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
      if (savedSettings) {
        setPrayerSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('prayerLocation', JSON.stringify(location));
      await AsyncStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
      
      Alert.alert(
        t('prayers.settings.saved', 'Settings Saved'),
        t('prayers.settings.savedDescription', 'Your prayer settings have been saved successfully.')
      );
    } catch (error) {
      console.error('Error saving prayer settings:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('prayers.settings.saveError', 'Failed to save settings. Please try again.')
      );
    }
  };



  const handleLocationPermission = async () => {
    // لم تعد هناك حاجة لطلب إذن الموقع - فتح نافذة البحث اليدوي
    setShowLocationSearchModal(true);
  };

  const handleLocationSelected = (selectedLocation: LocationData) => {
    const locationWithTimezone = {
      city: selectedLocation.city,
      country: selectedLocation.country,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      timezone: selectedLocation.timezone,
    };
    setLocation(locationWithTimezone);
    setPermissionStatus(prev => ({...prev, location: true}));
  };

  const calculationMethods = [
    {value: 'muslim-world-league', label: t('prayers.methods.mwl', 'Muslim World League')},
    {value: 'egyptian', label: t('prayers.methods.egyptian', 'Egyptian General Authority')},
    {value: 'karachi', label: t('prayers.methods.karachi', 'University of Karachi')},
    {value: 'umm-al-qura', label: t('prayers.methods.ummAlQura', 'Umm Al-Qura University')},
    {value: 'dubai', label: t('prayers.methods.dubai', 'Dubai')},
  ];

  const madhabOptions = [
    {value: 'shafi', label: t('prayers.madhab.shafi', 'Shafi')},
    {value: 'hanafi', label: t('prayers.madhab.hanafi', 'Hanafi')},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          ← {t('common.back', 'Back')}
        </Button>
        <Title style={isRTL && styles.rtlText}>
          {t('prayers.settings.title', 'Prayer Settings')}
        </Title>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Location Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('prayers.settings.location', 'Location')}
            </Title>
            <List.Item
              title={t('prayers.settings.selectedLocation', 'Selected Location')}
              description={`${location.city}, ${location.country}`}
              right={() => (
                <Button 
                  mode="outlined" 
                  onPress={handleLocationPermission}
                >
                  {t('settings.change', 'Change')}
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        {/* Calculation Method */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('prayers.settings.calculationMethod', 'Calculation Method')}
            </Title>
            <List.Item
              title={t('prayers.settings.method', 'Method')}
              description={calculationMethods.find(m => m.value === prayerSettings.method)?.label}
              right={() => (
                <Button mode="outlined" onPress={() => setShowMethodDialog(true)}>
                  {t('settings.change', 'Change')}
                </Button>
              )}
            />
            <Divider style={styles.divider} />
            <List.Item
              title={t('prayers.settings.madhab', 'Madhab')}
              description={madhabOptions.find(m => m.value === prayerSettings.madhab)?.label}
              right={() => (
                <RadioButton.Group
                  onValueChange={(value) => setPrayerSettings(prev => ({...prev, madhab: value}))}
                  value={prayerSettings.madhab}
                >
                  <View style={styles.radioGroup}>
                    {madhabOptions.map(option => (
                      <RadioButton.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        style={styles.radioItem}
                      />
                    ))}
                  </View>
                </RadioButton.Group>
              )}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={saveSettings}
          style={styles.saveButton}
        >
          {t('prayers.settings.saveSettings', 'Save Settings')}
        </Button>
      </ScrollView>



      {/* Method Dialog */}
      <Portal>
        <Dialog visible={showMethodDialog} onDismiss={() => setShowMethodDialog(false)}>
          <Dialog.Title>{t('prayers.settings.selectMethod', 'Select Calculation Method')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setPrayerSettings(prev => ({...prev, method: value}))}
              value={prayerSettings.method}
            >
              {calculationMethods.map(method => (
                <RadioButton.Item
                  key={method.value}
                  label={method.label}
                  value={method.value}
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMethodDialog(false)}>
              {t('common.done', 'Done')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <LocationSearchModal
        visible={showLocationSearchModal}
        onClose={() => setShowLocationSearchModal(false)}
        onLocationSelected={handleLocationSelected}
        currentLocation={location}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  enableButton: {
    marginVertical: 12,
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
  divider: {
    marginVertical: 8,
  },
  radioGroup: {
    gap: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#10B981',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default PrayerSettingsScreen;