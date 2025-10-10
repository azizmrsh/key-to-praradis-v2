import React, {useState} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {Card, Title, List, Switch, Button, Portal, Dialog, RadioButton, Paragraph} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../contexts/UserContext';
import {useLanguage} from '../contexts/LanguageContext';

const SettingsScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const {currentLanguage, changeLanguage, availableLanguages, isRTL} = useLanguage();
  const {preferences, updatePreferences} = useUser();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setShowLanguageDialog(false);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updatePreferences({theme});
  };

  const handleNotificationToggle = () => {
    updatePreferences({notifications: !preferences.notifications});
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert(
        t('settings.dataCleared', 'Data Cleared'),
        t('settings.dataCleared.description', 'All user data has been cleared. The app will redirect to language selection.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('LanguageSelection'),
          },
        ]
      );
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('settings.languageRegion', 'Language & Region')}
            </Title>
            <List.Item
              title={t('settings.currentLanguage', 'Current Language')}
              description={availableLanguages.find(lang => lang.code === currentLanguage)?.nativeName}
              right={() => (
                <Button mode="outlined" onPress={() => setShowLanguageDialog(true)}>
                  {t('settings.change', 'Change')}
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('settings.appearance', 'Appearance')}
            </Title>
            <List.Item
              title={t('settings.lightTheme', 'Light Theme')}
              right={() => (
                <Switch
                  value={preferences.theme === 'light'}
                  onValueChange={() => handleThemeChange('light')}
                />
              )}
            />
            <List.Item
              title={t('settings.darkTheme', 'Dark Theme')}
              right={() => (
                <Switch
                  value={preferences.theme === 'dark'}
                  onValueChange={() => handleThemeChange('dark')}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('settings.notifications', 'Notifications')}
            </Title>
            <List.Item
              title={t('settings.enableNotifications', 'Enable Notifications')}
              description={t('settings.notificationsDescription', 'Receive reminders and spiritual guidance')}
              right={() => (
                <Switch
                  value={preferences.notifications}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={isRTL && styles.rtlText}>
              {t('settings.dataManagement', 'Data Management')}
            </Title>
            <List.Item
              title={t('settings.clearAllData', 'Clear All Data')}
              description={t('settings.clearDataDescription', 'Remove all user data and reset the app')}
              right={() => (
                <Button 
                  mode="outlined" 
                  buttonColor="#EF4444"
                  textColor="white"
                  onPress={() => setShowDataDialog(true)}
                >
                  {t('settings.clear', 'Clear')}
                </Button>
              )}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Language Selection Dialog */}
      <Portal>
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>{t('settings.selectLanguage', 'Select Language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={currentLanguage}
            >
              {availableLanguages.map((language) => (
                <RadioButton.Item
                  key={language.code}
                  label={language.nativeName}
                  value={language.code}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Clear Data Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDataDialog} onDismiss={() => setShowDataDialog(false)}>
          <Dialog.Title>{t('settings.confirmClearData', 'Confirm Clear Data')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {t('settings.clearDataWarning', 'This action will permanently delete all your progress, assessment results, and preferences. This cannot be undone.')}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDataDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onPress={handleClearData} textColor="#EF4444">
              {t('settings.clearData', 'Clear Data')}
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default SettingsScreen;