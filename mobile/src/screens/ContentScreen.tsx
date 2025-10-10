import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

const ContentScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Spiritual Content</Title>
            <Paragraph>Access lessons, videos, and articles for your spiritual growth journey.</Paragraph>
            <Button mode="contained" style={styles.button}>
              Browse Lessons
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
  button: {
    marginTop: 16,
  },
});

export default ContentScreen;