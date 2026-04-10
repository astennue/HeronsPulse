'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Coffee, Brain, Music, Minimize2, History, Clock, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { usePomodoro, PomodoroSession, FilterType } from '@/contexts/PomodoroContext';

interface FloatingPomodoroProps {
  isVisible: boolean;
  onToggle: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const timerModes: Record<TimerMode, { duration: number; label: string; icon: typeof Brain; color: string }> = {
  focus: { duration: 25 * 60, label: 'Focus', icon: Brain, color: 'text-primary' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'text-green-500' },
  longBreak: { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'text-blue-500' },
};

// Background music types
type MusicType = 'lofi' | 'nature' | 'white-noise' | 'none';

const musicOptions: { value: MusicType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'lofi', label: 'Lo-Fi Beats' },
  { value: 'nature', label: 'Nature Sounds' },
  { value: 'white-noise', label: 'White Noise' },
];

// Filter options
const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'focus', label: 'Focus' },
  { value: 'short_break', label: 'Short Break' },
  { value: 'long_break', label: 'Long Break' },
];

export function FloatingPomodoro({ isVisible, onToggle }: FloatingPomodoroProps) {
  // Get context values
  const {
    sessions: historySessions,
    stats: historyStats,
    isLoadingHistory,
    filterType,
    setFilterType,
    saveSession,
    fetchHistory,
    currentStreak,
  } = usePomodoro();

  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timerModes.focus.duration);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [musicType, setMusicType] = useState<MusicType>('none');
  const [musicVolume, setMusicVolume] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  
  // Track session start time for saving
  const sessionStartRef = useRef<Date | null>(null);
  
  // Audio context for background music
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const currentMode = timerModes[mode];
  const Icon = currentMode.icon;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
  };

  // Get group label for date
  const getDateGroupLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  // Initialize Audio Context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Stop background music - must be declared before startMusic
  const stopMusic = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch {
      // Ignore errors from already stopped nodes
    }
  }, []);

  // Create white noise
  const createWhiteNoise = useCallback((context: AudioContext) => {
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = context.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    return whiteNoise;
  }, []);

  // Create nature-like sound (filtered noise)
  const createNatureSound = useCallback((context: AudioContext) => {
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate brown noise (more natural sounding)
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for volume loss
    }
    
    const natureSound = context.createBufferSource();
    natureSound.buffer = noiseBuffer;
    natureSound.loop = true;
    
    // Add a low-pass filter for more natural sound
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    natureSound.connect(filter);
    
    return { source: natureSound, filter };
  }, []);

  // Create lo-fi style sound (simple oscillator with modulation)
  const createLofiSound = useCallback((context: AudioContext) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    
    // Main oscillator - low frequency hum
    oscillator.type = 'sine';
    oscillator.frequency.value = 60;
    
    // LFO for subtle modulation
    lfo.type = 'sine';
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 5;
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    // Set very low volume for ambient effect
    gainNode.gain.value = 0.02;
    
    oscillator.connect(gainNode);
    
    return { oscillator, gainNode, lfo };
  }, []);

  // Start background music
  const startMusic = useCallback(() => {
    if (musicType === 'none') return;
    
    try {
      const context = initAudioContext();
      
      // Stop any existing sounds
      stopMusic();
      
      const masterGain = context.createGain();
      masterGain.gain.value = musicVolume / 100 * 0.3; // Scale volume
      masterGain.connect(context.destination);
      gainNodeRef.current = masterGain;
      
      if (musicType === 'white-noise') {
        const noise = createWhiteNoise(context);
        noise.connect(masterGain);
        noise.start();
        noiseNodeRef.current = noise;
      } else if (musicType === 'nature') {
        const { source, filter } = createNatureSound(context);
        filter.connect(masterGain);
        source.start();
        noiseNodeRef.current = source;
      } else if (musicType === 'lofi') {
        const { oscillator, gainNode, lfo } = createLofiSound(context);
        gainNode.connect(masterGain);
        oscillator.start();
        lfo.start();
        oscillatorRef.current = oscillator;
      }
    } catch (error) {
      console.error('Failed to start music:', error);
    }
  }, [musicType, musicVolume, initAudioContext, stopMusic, createWhiteNoise, createNatureSound, createLofiSound]);

  // Update music volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = musicVolume / 100 * 0.3;
    }
  }, [musicVolume]);

  // Handle music type changes
  useEffect(() => {
    if (isRunning && soundEnabled && musicType !== 'none') {
      startMusic();
    } else {
      stopMusic();
    }
    
    return () => {
      stopMusic();
    };
  }, [musicType, isRunning, soundEnabled, startMusic, stopMusic]);

  // Fetch history when modal opens
  useEffect(() => {
    if (showHistory) {
      fetchHistory(30);
    }
  }, [showHistory, fetchHistory]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      // Timer completed - use setTimeout to avoid synchronous setState
      setTimeout(() => {
        setIsRunning(false);
        setSessionsCompleted((prev) => prev + 1);
        stopMusic();
        
        // Save completed session using context
        if (sessionStartRef.current) {
          const sessionType = mode === 'focus' ? 'focus' : mode === 'shortBreak' ? 'short_break' : 'long_break';
          saveSession({
            type: sessionType,
            durationSeconds: timerModes[mode].duration,
            completed: true,
            startedAt: sessionStartRef.current,
            endedAt: new Date(),
          });
          sessionStartRef.current = null;
        }
      }, 0);
      
      // Play completion sound if enabled
      if (soundEnabled) {
        try {
          const context = initAudioContext();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          
          oscillator.connect(gain);
          gain.connect(context.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gain.gain.setValueAtTime(0.3, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
          
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.5);
        } catch (error) {
          console.error('Failed to play completion sound:', error);
        }
      }

      // Auto switch to break after focus
      if (mode === 'focus') {
        setTimeout(() => {
          setSessionsCompleted((prev) => {
            const nextMode = prev % 4 === 3 ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
            setTimeRemaining(timerModes[nextMode].duration);
            return prev + 1;
          });
        }, 0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, mode, soundEnabled, initAudioContext, stopMusic, saveSession]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => {
      const newRunning = !prev;
      // Track session start time when starting
      if (newRunning && !sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
      return newRunning;
    });
    // Initialize audio context on user interaction
    if (!audioContextRef.current) {
      initAudioContext();
    }
  }, [initAudioContext]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(timerModes[mode].duration);
    stopMusic();
    // Reset session start time
    sessionStartRef.current = null;
  }, [mode, stopMusic]);

  const changeMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeRemaining(timerModes[newMode].duration);
    setIsRunning(false);
    stopMusic();
    // Reset session start time
    sessionStartRef.current = null;
  }, [stopMusic]);

  // Progress percentage
  const progress = ((timerModes[mode].duration - timeRemaining) / timerModes[mode].duration) * 100;

  // Group sessions by date
  const groupedSessions = historySessions.reduce((groups, session) => {
    const date = format(parseISO(session.startedAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, PomodoroSession[]>);

  // Get session type badge color
  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'focus': return 'bg-primary/10 text-primary border-primary/20';
      case 'short_break': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'long_break': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopMusic]);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-card border-2 hover:border-primary transition-colors"
          onClick={() => setIsMinimized(false)}
        >
          <span className={cn('text-lg font-bold', currentMode.color)}>
            {formatTime(timeRemaining)}
          </span>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-72 max-w-[320px] rounded-xl border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', currentMode.color)} />
            <span className="text-sm font-medium">{currentMode.label}</span>
            {isRunning && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowHistory(true)}
              title="View History"
            >
              <History className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggle}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-6 text-center">
          <div className="relative inline-flex items-center justify-center">
            {/* Progress Ring */}
            <svg className="w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={currentMode.color}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.3 }}
                style={{
                  strokeDasharray: '352',
                  strokeDashoffset: '0',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
              <span className="text-xs text-muted-foreground">Session #{sessionsCompleted + 1}</span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center gap-2 mt-4">
            {(Object.keys(timerModes) as TimerMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeMode(m)}
                className="text-xs"
              >
                {timerModes[m].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-4 border-t">
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="lg" className="h-12 w-12 rounded-full" onClick={toggleTimer}>
            {isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(showSettings && 'bg-primary/10')}
          >
            <Music className="h-4 w-4" />
          </Button>
        </div>

        {/* Music Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t pt-4">
                {/* Music Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Background Music</label>
                  <div className="grid grid-cols-2 gap-2">
                    {musicOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={musicType === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMusicType(option.value)}
                        className="text-xs justify-start"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                {musicType !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Volume</label>
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-3 w-3 text-muted-foreground" />
                      <Slider
                        value={[musicVolume]}
                        onValueChange={([value]) => setMusicVolume(value)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Volume2 className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
            <span>Today: {sessionsCompleted} sessions</span>
            <div className="flex items-center gap-1">
              {currentStreak > 0 && (
                <>
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>{currentStreak} day streak</span>
                </>
              )}
              {!currentStreak && <span>~{sessionsCompleted * 25} min focused</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Pomodoro History
              {currentStreak > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-600 border-orange-500/20">
                  <Flame className="h-3 w-3 mr-1" />
                  {currentStreak} day streak
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* Stats Cards */}
          {historyStats && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary">{historyStats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">{historyStats.totalFocusMinutes}</div>
                <div className="text-xs text-muted-foreground">Focus Mins</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{historyStats.averageSessionLength}</div>
                <div className="text-xs text-muted-foreground">Avg Min</div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filterType === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(option.value)}
                className="text-xs h-7"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Session List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : historySessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions recorded yet</p>
                <p className="text-xs mt-1">Complete a focus session to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSessions).map(([date, sessions]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {getDateGroupLabel(sessions[0].startedAt)}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              session.type === 'focus' ? 'bg-primary' :
                              session.type === 'short_break' ? 'bg-green-500' : 'bg-blue-500'
                            )} />
                            <div>
                              <div className="text-sm font-medium">
                                {session.type === 'focus' ? 'Focus' :
                                 session.type === 'short_break' ? 'Short Break' : 'Long Break'}
                              </div>
                              {session.task && (
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {session.task.title}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn('text-[10px] h-5', getSessionTypeColor(session.type))}
                            >
                              {formatDuration(session.durationSeconds)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {format(parseISO(session.startedAt), 'h:mm a')}
                            </span>
                            {session.completed && (
                              <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Additional Stats */}
          {historyStats && historyStats.totalSessions > 0 && (
            <div className="mt-4 pt-3 border-t">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex items-center justify-center gap-1">
                  <Target className="h-3 w-3 text-primary" />
                  <span>{historyStats.focusSessions} focus</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Coffee className="h-3 w-3 text-green-500" />
                  <span>{historyStats.shortBreaks + historyStats.longBreaks} breaks</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span>{Math.round((historyStats.completedSessions / historyStats.totalSessions) * 100)}% done</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
