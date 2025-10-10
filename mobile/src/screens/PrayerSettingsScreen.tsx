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
  Switch,
  List,
  RadioButton,
  TextInput,
  Portal,
  Dialog,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [notifications, setNotifications] = useState([
    {prayer: 'fajr', enabled: true, timing: 'before15'},
    {prayer: 'dhuhr', enabled: true, timing: 'at'},
    {prayer: 'asr', enabled: true, timing: 'at'},
    {prayer: 'maghrib', enabled: true, timing: 'at'},
    {prayer: 'isha', enabled: true, timing: 'at'},
  ]);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(location);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('prayerLocation');
      const savedSettings = await AsyncStorage.getItem('prayerSettings');
      const savedNotifications = await AsyncStorage.getItem('prayerNotifications');

      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
      if (savedSettings) {
        setPrayerSettings(JSON.parse(savedSettings));
      }
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('prayerLocation', JSON.stringify(location));
      await AsyncStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
      await AsyncStorage.setItem('prayerNotifications', JSON.stringify(notifications));
      
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

  const handleLocationSave = () => {
    setLocation(editingLocation);
    setShowLocationDialog(false);
  };

  const toggleNotification = (prayerName: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.prayer === prayerName
          ? {...notification, enabled: !notification.enabled}
          : notification
      )
    );
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

  const prayerNames = [
    {key: 'fajr', name: t('prayers.fajr', 'Fajr')},
    {key: 'dhuhr', name: t('prayers.dhuhr', 'Dhuhr')},
    {key: 'asr', name: t('prayers.asr', 'Asr')},
    {key: 'maghrib', name: t('prayers.maghrib', 'Maghrib')},
    {key: 'isha', name: t('prayers.isha', 'Isha')},
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
              title={t('prayers.settings.currentLocation', 'Current Location')}
              description={`${location.city}, ${location.country}`}
              right={() => (
                <Button mode="outlined" onPress={() => setShowLocationDialog(true)}>
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

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('prayers.settings.notifications', 'Prayer Notifications')}
            </Title>
            {prayerNames.map(prayer => (
              <List.Item
                key={prayer.key}
                title={prayer.name}
                description={t('prayers.settings.notificationDescription', 'Get notified at prayer time')}
                right={() => (
                  <Switch
                    value={notifications.find(n => n.prayer === prayer.key)?.enabled || false}
                    onValueChange={() => toggleNotification(prayer.key)}
                  />
                )}
              />
            ))}
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

      {/* Location Dialog */}
      <Portal>
        <Dialog visible={showLocationDialog} onDismiss={() => setShowLocationDialog(false)}>
          <Dialog.Title>{t('prayers.settings.editLocation', 'Edit Location')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('prayers.settings.city', 'City')}
              value={editingLocation.city}
              onChangeText={(text) => setEditingLocation(prev => ({...prev, city: text}))}
              style={styles.input}
            />
            <TextInput
              label={t('prayers.settings.country', 'Country')}
              value={editingLocation.country}
              onChangeText={(text) => setEditingLocation(prev => ({...prev, country: text}))}
              style={styles.input}
            />
            <TextInput
              label={t('prayers.settings.latitude', 'Latitude')}
              value={String(editingLocation.latitude)}
              onChangeText={(text) => setEditingLocation(prev => ({...prev, latitude: parseFloat(text) || 0}))}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label={t('prayers.settings.longitude', 'Longitude')}
              value={String(editingLocation.longitude)}
              onChangeText={(text) => setEditingLocation(prev => ({...prev, longitude: parseFloat(text) || 0}))}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLocationDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleLocationSave}>
              {t('common.save', 'Save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  divider: {
    marginVertical: 8,
  },
  radioGroup: {
    gap: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  input: {
    marginBottom: 12,
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