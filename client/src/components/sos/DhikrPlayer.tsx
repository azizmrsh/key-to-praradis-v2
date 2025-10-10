import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { BilingualText } from '@/components/ui/arabic-text';

interface DhikrPlayerProps {
  title: string;
  audioSrc?: string;
  text: string;
  transliteration?: string;
  translation: string;
}

export function DhikrPlayer({ title, audioSrc, text, transliteration, translation }: DhikrPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loop, setLoop] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioSrc) return;
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(audioSrc);
      audio.loop = loop;
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        setProgress(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audioRef.current = audio;
    }
    
    return () => {
      // Clean up
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioSrc, loop]);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div className="bg-primary/10 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      <div className="my-4">
        <BilingualText
          arabic={text}
          translation={translation}
          transliteration={transliteration}
          arabicSize="xl"
          arabicWeight="medium"
        />
      </div>

      {audioSrc && (
        <div>
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full" 
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-full max-w-[120px]">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}