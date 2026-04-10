'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Settings, Coffee, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingTimerProps {
  className?: string;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const timerModes: Record<TimerMode, { duration: number; label: string; icon: typeof Brain; color: string }> = {
  focus: { duration: 25 * 60, label: 'Focus', icon: Brain, color: 'text-primary' },
  shortBreak: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'text-green-500' },
  longBreak: { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'text-blue-500' },
};

export function FloatingTimer({ className }: FloatingTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timerModes.focus.duration);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Use refs to track timer completion without triggering cascading renders
  const prevTimeRemaining = useRef(timeRemaining);
  const timerCompletedRef = useRef(false);

  const currentMode = timerModes[mode];
  const Icon = currentMode.icon;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic - only handles counting down
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          timerCompletedRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle timer completion separately
  useEffect(() => {
    if (timerCompletedRef.current && timeRemaining === 0) {
      timerCompletedRef.current = false;
      
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setIsRunning(false);
        
        setSessionsCompleted((prev) => {
          const newCount = prev + 1;
          
          // Play sound if enabled
          if (soundEnabled) {
            console.log('Timer completed - playing sound');
          }

          // Auto switch to break after focus
          if (mode === 'focus') {
            const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
            setTimeRemaining(timerModes[nextMode].duration);
          }
          
          return newCount;
        });
      }, 0);
    }
  }, [timeRemaining, mode, soundEnabled]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    timerCompletedRef.current = false;
    setTimeRemaining(timerModes[mode].duration);
  }, [mode]);

  const changeMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeRemaining(timerModes[newMode].duration);
    setIsRunning(false);
    timerCompletedRef.current = false;
  }, []);

  // Progress percentage
  const progress = ((timerModes[mode].duration - timeRemaining) / timerModes[mode].duration) * 100;

  // Update prevTimeRemaining ref
  useEffect(() => {
    prevTimeRemaining.current = timeRemaining;
  }, [timeRemaining]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          className
        )}
      >
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed bottom-4 right-4 z-50 w-72 rounded-xl border bg-card shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', currentMode.color)} />
          <span className="text-sm font-medium">{currentMode.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
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
        <Button variant="outline" size="icon" onClick={() => setIsMinimized(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
          <span>Today: {sessionsCompleted} sessions</span>
          <span>~{sessionsCompleted * 25} min focused</span>
        </div>
      </div>
    </motion.div>
  );
}
