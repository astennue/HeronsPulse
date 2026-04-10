'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';

const STORAGE_KEY = 'heronpulse_session_count';
export const SESSIONS_BEFORE_ROLE_INFO = 5;

// Helper to read from localStorage safely
function getStoredSessionCount(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

// Subscribe to storage changes (for sync across tabs)
function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// Get snapshot for useSyncExternalStore
function getStorageSnapshot(): number {
  return getStoredSessionCount();
}

// Server snapshot for SSR
function getServerSnapshot(): number {
  return 0;
}

/**
 * Hook to track user session count
 * Uses session.loginCount for logged-in users, localStorage for guests
 */
export function useSessionCount() {
  const { data: session } = useSession();
  
  // Use useSyncExternalStore for localStorage sync
  const localCount = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot
  );

  // Get session count from either auth session or localStorage
  const sessionCount = session?.user?.loginCount ?? localCount;

  // Check if user should see role-specific info
  const shouldShowRoleInfo = sessionCount >= SESSIONS_BEFORE_ROLE_INFO;

  // Increment local session count (for guests)
  const incrementSessionCount = useCallback(() => {
    const newCount = localCount + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, [localCount]);

  return {
    sessionCount,
    shouldShowRoleInfo,
    incrementSessionCount,
  };
}
