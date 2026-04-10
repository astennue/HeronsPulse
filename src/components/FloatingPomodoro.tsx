'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// BGM Tracks - Built-in audio using Web Audio API
interface Track {
  id: string;
  name: string;
  genre: string;
  duration: number;
}

const tracks: Track[] = [
  // Lo-fi / Chill
  { id: 'lofi-1', name: 'Chill Study Beat', genre: 'lofi', duration: 180 },
  { id: 'lofi-2', name: 'Late Night Vibes', genre: 'lofi', duration: 210 },
  { id: 'lofi-3', name: 'Coffee Shop Jazz', genre: 'lofi', duration: 195 },
  { id: 'lofi-4', name: 'Chill Study Session', genre: 'lofi', duration: 200 },
  // Nature
  { id: 'nature-1', name: 'Rain & Thunder', genre: 'nature', duration: 300 },
  { id: 'nature-2', name: 'Forest Birds', genre: 'nature', duration: 280 },
  { id: 'nature-3', name: 'Ocean Waves', genre: 'nature', duration: 260 },
  { id: 'nature-4', name: 'Mountain Stream', genre: 'nature', duration: 240 },
  // Mellow
  { id: 'mellow-1', name: 'Piano Dreams', genre: 'mellow', duration: 220 },
  { id: 'mellow-2', name: 'Soft Guitar', genre: 'mellow', duration: 200 },
  { id: 'mellow-3', name: 'Ambient Space', genre: 'mellow', duration: 250 },
  { id: 'mellow-4', name: 'Mellow Evening', genre: 'mellow', duration: 230 },
];

const genres = [
  { id: 'lofi', name: 'Lo-fi', emoji: '🎵' },
  { id: 'nature', name: 'Nature', emoji: '🌿' },
  { id: 'mellow', name: 'Mellow', emoji: '🎹' },
];

const presets = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function FloatingPomodoro() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(presets.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [sessions, setSessions] = useState(0);
  
  // Music state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('lofi');
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [trackProgress, setTrackProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1000, ctx.currentTime);
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.5);
    }, 200);
  }, []);

  // Create ambient music using Web Audio API
  const createAmbientSound = useCallback((genre: string) => {
    if (typeof window === 'undefined') return;
    
    // Stop previous audio
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    
    const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    audioContextRef.current = ctx;
    
    const gainNode = ctx.createGain();
    gainNodeRef.current = gainNode;
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume / 100, ctx.currentTime);
    
    // Create ambient drone based on genre
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    
    // Different frequencies for different genres
    const baseFreq = genre === 'lofi' ? 110 : genre === 'nature' ? 146.83 : 130.81;
    
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
    osc3.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
    
    osc1.type = genre === 'nature' ? 'sine' : 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sine';
    
    // Slow LFO for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    lfoGain.gain.setValueAtTime(20, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();
    
    oscillatorRef.current = osc1;
    
    return () => {
      osc1.stop();
      osc2.stop();
      osc3.stop();
      lfo.stop();
    };
  }, [volume, isMuted]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'focus') {
              setSessions((s) => s + 1);
            }
            playNotificationSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, playNotificationSound]);

  // Music progress simulation
  useEffect(() => {
    if (isPlaying) {
      musicIntervalRef.current = setInterval(() => {
        setTrackProgress((prev) => {
          if (prev >= currentTrack.duration) {
            // Play next track
            const genreTracks = tracks.filter(t => t.genre === selectedGenre);
            const currentIndex = genreTracks.findIndex(t => t.id === currentTrack.id);
            const nextTrack = genreTracks[(currentIndex + 1) % genreTracks.length];
            if (nextTrack) setCurrentTrack(nextTrack);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
    }
    
    return () => {
      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
    };
  }, [isPlaying, currentTrack, selectedGenre]);

  // Handle music play/pause
  useEffect(() => {
    if (isPlaying) {
      createAmbientSound(selectedGenre);
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }
    
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, [isPlaying, selectedGenre, createAmbientSound]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume / 100, audioContextRef.current.currentTime);
    }
  }, [volume, isMuted]);

  const handleStart = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(presets[mode]);
  };

  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setMode(newMode);
    setTimeLeft(presets[newMode]);
    setIsRunning(false);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setTrackProgress(0);
    setSelectedGenre(track.genre);
  };

  const progress = ((presets[mode] - timeLeft) / presets[mode]) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <Timer className="h-6 w-6" />
      </motion.button>

      {/* Pomodoro Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 glass-card rounded-2xl shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-semibold">Pomodoro Timer</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="p-4 space-y-4">
                {/* Mode Tabs */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  {(['focus', 'short_break', 'long_break'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={cn(
                        'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors capitalize',
                        mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'
                      )}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Timer Display */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-muted"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-primary"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: circumference,
                          strokeDashoffset,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{formatTime(timeLeft)}</span>
                      <span className="text-xs text-muted-foreground capitalize">{mode.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-3">
                  <Button size="lg" onClick={handleStart} className="w-28">
                    {isRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Sessions Counter */}
                <div className="text-center text-sm text-muted-foreground">
                  Sessions: <span className="font-bold text-foreground">{sessions}</span>
                </div>

                {/* Music Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Background Music</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Genre Selection */}
                  <div className="flex gap-1 mb-3">
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => {
                          setSelectedGenre(genre.id);
                          const genreTrack = tracks.find(t => t.genre === genre.id);
                          if (genreTrack) {
                            setCurrentTrack(genreTrack);
                            setTrackProgress(0);
                          }
                        }}
                        className={cn(
                          'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                          selectedGenre === genre.id 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {genre.emoji} {genre.name}
                      </button>
                    ))}
                  </div>

                  {/* Current Track */}
                  <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="default" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div>
                          <p className="text-xs font-medium truncate max-w-[140px]">{currentTrack.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{currentTrack.genre}</p>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${(trackProgress / currentTrack.duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setVolume(0)} />
                    <Slider
                      value={[volume]}
                      onValueChange={(v) => setVolume(v[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setVolume(100)} />
                  </div>

                  {/* Track List */}
                  <div className="mt-3 max-h-28 overflow-y-auto space-y-1">
                    {tracks.filter(t => t.genre === selectedGenre).map((track) => (
                      <button
                        key={track.id}
                        onClick={() => selectTrack(track)}
                        className={cn(
                          'w-full text-left px-2 py-1.5 rounded text-xs transition-colors',
                          currentTrack.id === track.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-muted'
                        )}
                      >
                        {track.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
