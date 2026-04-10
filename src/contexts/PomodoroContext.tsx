'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Session type for history
export interface PomodoroSession {
  id: string;
  durationSeconds: number;
  type: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
  startedAt: string;
  endedAt: string;
  task?: {
    id: string;
    title: string;
  } | null;
}

// Session stats interface
export interface SessionStats {
  totalSessions: number;
  focusSessions: number;
  shortBreaks: number;
  longBreaks: number;
  totalFocusMinutes: number;
  completedSessions: number;
  averageSessionLength: number;
}

// History response from API
interface HistoryResponse {
  success: boolean;
  data: {
    sessions: PomodoroSession[];
    stats: SessionStats;
  };
}

// Type filter options
export type FilterType = 'all' | 'focus' | 'short_break' | 'long_break';

interface PomodoroContextType {
  // Pomodoro visibility
  showPomodoro: boolean;
  togglePomodoro: () => void;
  
  // Session history
  sessions: PomodoroSession[];
  stats: SessionStats | null;
  isLoadingHistory: boolean;
  filterType: FilterType;
  
  // Actions
  fetchHistory: (days?: number) => Promise<void>;
  setFilterType: (type: FilterType) => void;
  saveSession: (session: {
    type: 'focus' | 'short_break' | 'long_break';
    durationSeconds: number;
    completed: boolean;
    startedAt: Date;
    endedAt: Date;
    taskId?: string;
  }) => Promise<boolean>;
  
  // Streak calculation
  currentStreak: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [showPomodoro, setShowPomodoro] = useState(false);
  
  // Session history state
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentStreak, setCurrentStreak] = useState(0);

  const togglePomodoro = useCallback(() => {
    setShowPomodoro(prev => !prev);
  }, []);

  // Fetch history from API
  const fetchHistory = useCallback(async (days: number = 30) => {
    setIsLoadingHistory(true);
    try {
      const typeParam = filterType === 'all' ? 'all' : filterType;
      const response = await fetch(`/api/pomodoro?days=${days}&type=${typeParam}`);
      const data: HistoryResponse = await response.json();
      
      if (data.success) {
        setSessions(data.data.sessions);
        setStats(data.data.stats);
        
        // Calculate streak based on sessions
        if (data.data.sessions.length > 0) {
          calculateStreak(data.data.sessions);
        }
      }
    } catch (error) {
      console.error('Error fetching pomodoro history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [filterType]);

  // Calculate current streak
  const calculateStreak = useCallback((sessionList: PomodoroSession[]) => {
    if (sessionList.length === 0) {
      setCurrentStreak(0);
      return;
    }
    
    // Get unique dates with focus sessions
    const focusDates = new Set<string>();
    sessionList
      .filter(s => s.type === 'focus')
      .forEach(s => {
        const date = new Date(s.startedAt).toDateString();
        focusDates.add(date);
      });
    
    if (focusDates.size === 0) {
      setCurrentStreak(0);
      return;
    }
    
    // Calculate consecutive days
    const sortedDates = Array.from(focusDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if there's activity today or yesterday
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const prevDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    setCurrentStreak(streak);
  }, []);

  // Save session to API
  const saveSession = useCallback(async (session: {
    type: 'focus' | 'short_break' | 'long_break';
    durationSeconds: number;
    completed: boolean;
    startedAt: Date;
    endedAt: Date;
    taskId?: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: session.type,
          durationSeconds: session.durationSeconds,
          completed: session.completed,
          startedAt: session.startedAt.toISOString(),
          endedAt: session.endedAt.toISOString(),
          taskId: session.taskId,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save pomodoro session');
        return false;
      }
      
      // Refresh history after saving
      await fetchHistory(30);
      
      return true;
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
      return false;
    }
  }, [fetchHistory]);

  // Fetch history when filter type changes
  useEffect(() => {
    if (showPomodoro) {
      fetchHistory(30);
    }
  }, [filterType, showPomodoro, fetchHistory]);

  // Initial load of history for streak calculation
  useEffect(() => {
    fetchHistory(30);
  }, [fetchHistory]);

  return (
    <PomodoroContext.Provider value={{
      showPomodoro,
      togglePomodoro,
      sessions,
      stats,
      isLoadingHistory,
      filterType,
      fetchHistory,
      setFilterType,
      saveSession,
      currentStreak,
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
