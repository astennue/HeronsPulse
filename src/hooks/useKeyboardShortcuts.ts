'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  id: string;
  label: string;
  description?: string;
  keys: { modifier?: 'cmd' | 'ctrl'; key: string }[];
  category: 'navigation' | 'actions' | 'general';
  action?: () => void;
}

export interface UseKeyboardShortcutsReturn {
  /** Whether the shortcuts modal is open */
  isShortcutsModalOpen: boolean;
  /** Set whether the shortcuts modal is open */
  setIsShortcutsModalOpen: (open: boolean) => void;
  /** Whether the command palette is open */
  isCommandPaletteOpen: boolean;
  /** Set whether the command palette is open */
  setIsCommandPaletteOpen: (open: boolean) => void;
  /** Platform-specific modifier key display (⌘ for Mac, Ctrl for others) */
  modifierKey: string;
  /** Whether the user is on a Mac */
  isMac: boolean;
  /** All available shortcuts */
  shortcuts: KeyboardShortcut[];
  /** Open the shortcuts modal */
  openShortcutsModal: () => void;
  /** Close the shortcuts modal */
  closeShortcutsModal: () => void;
  /** Toggle the shortcuts modal */
  toggleShortcutsModal: () => void;
}

// Detect platform - computed once at module load
const detectMac = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  }
  return false;
};

/**
 * Hook to handle global keyboard shortcuts for HeronPulse Academic OS
 * 
 * Supported shortcuts:
 * - Cmd/Ctrl + K - Open search/command palette
 * - Cmd/Ctrl + N - Create new task
 * - Cmd/Ctrl + / - Toggle help/shortcuts modal
 * - Escape - Close modals
 * - Cmd/Ctrl + B - Go to boards
 * - Cmd/Ctrl + D - Go to dashboard
 */
export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  const router = useRouter();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Platform detection - use ref to avoid re-computation
  const isMac = useMemo(() => detectMac(), []);
  const modifierKey = useMemo(() => isMac ? '⌘' : 'Ctrl', [isMac]);

  // Define all available shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      id: 'command-palette',
      label: 'Open Command Palette',
      description: 'Quick search and access to all commands',
      keys: [{ modifier: 'cmd', key: 'K' }],
      category: 'general',
      action: () => setIsCommandPaletteOpen(prev => !prev),
    },
    {
      id: 'new-task',
      label: 'Create New Task',
      description: 'Open the task creation dialog',
      keys: [{ modifier: 'cmd', key: 'N' }],
      category: 'actions',
      action: () => {
        window.dispatchEvent(new CustomEvent('heronpulse:new-task'));
      },
    },
    {
      id: 'shortcuts-modal',
      label: 'Show Keyboard Shortcuts',
      description: 'Display all available keyboard shortcuts',
      keys: [{ modifier: 'cmd', key: '/' }],
      category: 'general',
      action: () => setIsShortcutsModalOpen(prev => !prev),
    },
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      description: 'Navigate to the dashboard',
      keys: [{ modifier: 'cmd', key: 'D' }],
      category: 'navigation',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'go-boards',
      label: 'Go to Boards',
      description: 'Navigate to the boards page',
      keys: [{ modifier: 'cmd', key: 'B' }],
      category: 'navigation',
      action: () => router.push('/boards'),
    },
  ], [router]);

  // Helper function to check if we're in an input field
  const isInInputField = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isEditableDiv = tagName === 'div' && isEditable;
    return isInput || isEditableDiv;
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isMetaKey = isMac ? e.metaKey : e.ctrlKey;

      // Always handle Escape to close modals
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        return;
      }

      // Skip shortcuts if in input field (except for specific combos)
      if (isInInputField(target)) {
        // Allow Cmd/Ctrl + K even in input fields (common pattern)
        if (isMetaKey && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setIsCommandPaletteOpen(prev => !prev);
          return;
        }
        return;
      }

      // Handle Cmd/Ctrl + key shortcuts
      if (isMetaKey) {
        const key = e.key.toLowerCase();
        
        switch (key) {
          case 'k':
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
            break;
          case 'n':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('heronpulse:new-task'));
            break;
          case '/':
            e.preventDefault();
            setIsShortcutsModalOpen(prev => !prev);
            break;
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'b':
            e.preventDefault();
            router.push('/boards');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac, isShortcutsModalOpen, isCommandPaletteOpen, isInInputField, router]);

  // Helper functions
  const openShortcutsModal = useCallback(() => setIsShortcutsModalOpen(true), []);
  const closeShortcutsModal = useCallback(() => setIsShortcutsModalOpen(false), []);
  const toggleShortcutsModal = useCallback(() => setIsShortcutsModalOpen(prev => !prev), []);

  return {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    modifierKey,
    isMac,
    shortcuts,
    openShortcutsModal,
    closeShortcutsModal,
    toggleShortcutsModal,
  };
}

/**
 * Format shortcut keys for display
 * Returns platform-specific display (e.g., ⌘K on Mac, Ctrl+K on Windows)
 */
export function formatShortcut(
  shortcut: KeyboardShortcut, 
  isMac: boolean
): string {
  return shortcut.keys.map(k => {
    const modifier = k.modifier === 'cmd' 
      ? (isMac ? '⌘' : 'Ctrl')
      : k.modifier === 'ctrl' 
        ? 'Ctrl' 
        : '';
    return modifier ? `${modifier}${k.key}` : k.key;
  }).join(' ');
}

/**
 * Get the display string for a modifier key
 */
export function getModifierDisplay(isMac: boolean): string {
  return isMac ? '⌘' : 'Ctrl';
}

/**
 * Get the display string for a single shortcut key combo
 */
export function getKeyDisplay(key: string, modifier: 'cmd' | 'ctrl' | undefined, isMac: boolean): string {
  if (!modifier) return key;
  return modifier === 'cmd' 
    ? `${isMac ? '⌘' : 'Ctrl'}${key}`
    : `Ctrl${key}`;
}
