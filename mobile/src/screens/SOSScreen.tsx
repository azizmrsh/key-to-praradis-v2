import React, {useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Button, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DhikrPlayer} from '../components/sos/DhikrPlayer';
import {BilingualText} from '../components/ui/ArabicText';

const SOSScreen = () => {
  const [activeSection, setActiveSection] = useState<'main' | 'dhikr' | 'prayers' | 'breathing' | 'reminders'>('main');

  const dhikrList = [
    {
      title: "Istighfar",
      text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
      transliteration: "Astaghfiru Allah al-Azeem",
      translation: "I seek forgiveness from Allah, the Most Great"
    },
    {
      title: "Tasbih",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      transliteration: "Subhan Allah wa bi-hamdihi",
      translation: "Glory be to Allah and praise be to Him"
    },
    {
      title: "La Hawla",
      text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "La hawla wa la quwwata illa billah",
      translation: "There is no power except with Allah"
    }
  ];

  const renderMainScreen = () => (
    <>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Icon name="alert-circle" size={48} color="#EF4444" />
            <Title style={styles.title}>SOS - Emergency Support</Title>
            <Paragraph style={styles.subtitle}>
              When you need immediate spiritual support
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.buttonGrid}>
            <Button 
              mode="contained" 
              style={[styles.button, styles.dhikrButton]}
              onPress={() => setActiveSection('dhikr')}
            >
              <Icon name="hands-pray" size={20} color="white" />
              Dhikr
            </Button>
            <Button 
              mode="contained" 
              style={[styles.button, styles.prayerButton]}
              onPress={() => setActiveSection('prayers')}
            >
              <Icon name="book-open" size={20} color="white" />
              Emergency Prayers
            </Button>
            <Button 
              mode="contained" 
              style={[styles.button, styles.breathingButton]}
              onPress={() => setActiveSection('breathing')}
            >
              <Icon name="lungs" size={20} color="white" />
              Breathing Exercise
            </Button>
            <Button 
              mode="contained" 
              style={[styles.button, styles.reminderButton]}
              onPress={() => setActiveSection('reminders')}
            >
              <Icon name="lightbulb" size={20} color="white" />
              Spiritual Reminders
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Immediate Guidance</Title>
          <BilingualText
            arabic="وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ"
            translation="And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."
            transliteration="Wa man yatawakkal 'ala Allah fa-huwa hasbuhu inna Allah balighu amrihi"
            containerStyle={styles.verseContainer}
            arabicSize="lg"
            arabicWeight="medium"
          />
          <Text variant="bodySmall" style={styles.verseReference}>
            - Quran 65:3
          </Text>
        </Card.Content>
      </Card>
    </>
  );

  const renderDhikrScreen = () => (
    <>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Button 
              mode="text" 
              onPress={() => setActiveSection('main')}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={20} />
              Back
            </Button>
            <Title style={styles.sectionTitle}>Dhikr for Peace</Title>
          </View>
        </Card.Content>
      </Card>

      {dhikrList.map((dhikr, index) => (
        <DhikrPlayer
          key={index}
          title={dhikr.title}
          text={dhikr.text}
          transliteration={dhikr.transliteration}
          translation={dhikr.translation}
        />
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {activeSection === 'main' && renderMainScreen()}
        {activeSection === 'dhikr' && renderDhikrScreen()}
        {/* Other sections can be implemented similarly */}
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
  headerCard: {
    backgroundColor: '#FEF2F2',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  dhikrButton: {
    backgroundColor: '#10B981',
  },
  prayerButton: {
    backgroundColor: '#3B82F6',
  },
  breathingButton: {
    backgroundColor: '#8B5CF6',
  },
  reminderButton: {
    backgroundColor: '#F59E0B',
  },
  verseContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  verseReference: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default SOSScreen;