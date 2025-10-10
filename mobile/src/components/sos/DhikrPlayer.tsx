import React, {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Card, IconButton, Text, ProgressBar, Slider} from 'react-native-paper';
import {BilingualText} from '../ui/ArabicText';

interface DhikrPlayerProps {
  title: string;
  audioSrc?: string;
  text: string;
  transliteration?: string;
  translation: string;
}

export const DhikrPlayer: React.FC<DhikrPlayerProps> = ({
  title,
  audioSrc,
  text,
  transliteration,
  translation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loop, setLoop] = useState(true);

  // Note: Audio implementation would need react-native-sound or similar
  // For now, this is the UI structure

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement audio play/pause logic
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement audio mute logic
  };

  const toggleLoop = () => {
    setLoop(!loop);
    // TODO: Implement audio loop logic
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>

        <View style={styles.textContainer}>
          <BilingualText
            arabic={text}
            translation={translation}
            transliteration={transliteration}
            arabicSize="xl"
            arabicWeight="medium"
            containerStyle={styles.bilingualContainer}
          />
        </View>

        {audioSrc && (
          <View style={styles.audioControls}>
            <View style={styles.progressContainer}>
              <Text variant="bodySmall" style={styles.timeText}>
                {formatTime(progress)}
              </Text>
              <ProgressBar
                progress={duration > 0 ? progress / duration : 0}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>

            <View style={styles.controlsRow}>
              <IconButton
                icon={isPlaying ? 'pause' : 'play'}
                mode="contained"
                onPress={togglePlay}
                style={styles.playButton}
              />

              <IconButton
                icon={isMuted ? 'volume-off' : 'volume-high'}
                onPress={toggleMute}
                style={styles.controlButton}
              />

              <IconButton
                icon={loop ? 'repeat' : 'repeat-off'}
                onPress={toggleLoop}
                style={styles.controlButton}
              />
            </View>

            <View style={styles.volumeContainer}>
              <Text variant="bodySmall" style={styles.volumeLabel}>
                Volume
              </Text>
              <Slider
                style={styles.volumeSlider}
                value={volume}
                onValueChange={setVolume}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
              />
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  textContainer: {
    marginVertical: 16,
  },
  bilingualContainer: {
    paddingHorizontal: 8,
  },
  audioControls: {
    marginTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
    height: 4,
  },
  timeText: {
    minWidth: 40,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButton: {
    marginHorizontal: 8,
  },
  controlButton: {
    marginHorizontal: 4,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  volumeLabel: {
    marginRight: 8,
    minWidth: 50,
  },
  volumeSlider: {
    flex: 1,
  },
});