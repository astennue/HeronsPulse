'use client';

import { useEffect, useMemo } from 'react';
import { 
  Command, 
  Search, 
  Plus, 
  Keyboard, 
  LayoutDashboard, 
  ClipboardList,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Command;
  keys: { modifier?: 'cmd' | 'ctrl'; key: string }[];
  category: 'navigation' | 'actions' | 'general';
}

interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether the user is on Mac (for showing ⌘ vs Ctrl) */
  isMac?: boolean;
}

// Icon mapping for shortcuts
const shortcutIcons: Record<string, typeof Command> = {
  'command-palette': Search,
  'new-task': Plus,
  'shortcuts-modal': Keyboard,
  'go-dashboard': LayoutDashboard,
  'go-boards': ClipboardList,
};

// All available shortcuts
const allShortcuts: ShortcutItem[] = [
  {
    id: 'command-palette',
    label: 'Open Command Palette',
    description: 'Quick search and access to all commands',
    icon: Search,
    keys: [{ modifier: 'cmd', key: 'K' }],
    category: 'general',
  },
  {
    id: 'new-task',
    label: 'Create New Task',
    description: 'Open the task creation dialog',
    icon: Plus,
    keys: [{ modifier: 'cmd', key: 'N' }],
    category: 'actions',
  },
  {
    id: 'shortcuts-modal',
    label: 'Show Keyboard Shortcuts',
    description: 'Display this help dialog',
    icon: Keyboard,
    keys: [{ modifier: 'cmd', key: '/' }],
    category: 'general',
  },
  {
    id: 'go-dashboard',
    label: 'Go to Dashboard',
    description: 'Navigate to the dashboard view',
    icon: LayoutDashboard,
    keys: [{ modifier: 'cmd', key: 'D' }],
    category: 'navigation',
  },
  {
    id: 'go-boards',
    label: 'Go to Boards',
    description: 'Navigate to the boards view',
    icon: ClipboardList,
    keys: [{ modifier: 'cmd', key: 'B' }],
    category: 'navigation',
  },
];

// Category labels and order
const categories = [
  { id: 'general', label: 'General', description: 'Essential shortcuts' },
  { id: 'navigation', label: 'Navigation', description: 'Move between pages' },
  { id: 'actions', label: 'Actions', description: 'Quick actions' },
] as const;

/**
 * Keyboard Shortcuts Modal Component
 * 
 * Displays all available keyboard shortcuts in a clean, organized modal.
 * Shows platform-specific key indicators (⌘ for Mac, Ctrl for Windows/Linux).
 */
export function KeyboardShortcutsModal({ 
  open, 
  onOpenChange,
  isMac: isMacProp 
}: KeyboardShortcutsModalProps) {
  // Detect platform if not provided
  const isMac = useMemo(() => {
    if (isMacProp !== undefined) return isMacProp;
    if (typeof navigator !== 'undefined') {
      return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    }
    return false;
  }, [isMacProp]);

  // Platform-specific modifier key display
  const modifierDisplay = isMac ? '⌘' : 'Ctrl';

  // Format a single key for display
  const formatKey = (key: string, modifier?: 'cmd' | 'ctrl'): string => {
    if (!modifier) return key.toUpperCase();
    return modifier === 'cmd' 
      ? `${isMac ? '⌘' : 'Ctrl'}+${key.toUpperCase()}`
      : `Ctrl+${key.toUpperCase()}`;
  };

  // Render a keyboard key
  const renderKey = (key: string, modifier?: 'cmd' | 'ctrl') => {
    const displayText = modifier 
      ? (isMac ? '⌘' : 'Ctrl')
      : key.toUpperCase();
    
    return (
      <div className="flex items-center gap-0.5">
        {modifier && (
          <>
            <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold bg-muted border border-border rounded-md shadow-sm">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <span className="text-muted-foreground text-xs">+</span>
          </>
        )}
        <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold bg-muted border border-border rounded-md shadow-sm">
          {key.toUpperCase()}
        </kbd>
      </div>
    );
  };

  // Group shortcuts by category
  const shortcutsByCategory = useMemo(() => {
    const grouped: Record<string, ShortcutItem[]> = {};
    for (const category of categories) {
      grouped[category.id] = allShortcuts.filter(s => s.category === category.id);
    }
    return grouped;
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Quick keyboard shortcuts to boost your productivity
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 pt-4 space-y-6">
            {categories.map(category => {
              const shortcuts = shortcutsByCategory[category.id];
              if (shortcuts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {category.label}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {category.description}
                    </span>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-2">
                    {shortcuts.map((shortcut) => {
                      const Icon = shortcut.icon;
                      return (
                        <div
                          key={shortcut.id}
                          className={cn(
                            "flex items-center justify-between gap-4 p-3 rounded-lg",
                            "bg-muted/30 hover:bg-muted/50 transition-colors"
                          )}
                        >
                          {/* Left: Icon and Label */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background border shrink-0">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {shortcut.label}
                              </p>
                              {shortcut.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {shortcut.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Keyboard Keys */}
                          <div className="flex items-center gap-1 shrink-0">
                            {shortcut.keys.map((k, idx) => (
                              <div key={idx} className="flex items-center">
                                {renderKey(k.key, k.modifier)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium bg-muted border border-border rounded">
                Esc
              </kbd>
              <span>to close</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground/60">
                Press {modifierDisplay}+/ anytime to open
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact keyboard shortcut display component
 * Use this to show individual shortcuts inline
 */
export function KeyboardShortcutBadge({ 
  keys,
  isMac: isMacProp,
  className 
}: { 
  keys: { modifier?: 'cmd' | 'ctrl'; key: string }[];
  isMac?: boolean;
  className?: string;
}) {
  const isMac = useMemo(() => {
    if (isMacProp !== undefined) return isMacProp;
    if (typeof navigator !== 'undefined') {
      return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    }
    return false;
  }, [isMacProp]);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {keys.map((k, idx) => (
        <div key={idx} className="flex items-center gap-0.5">
          {k.modifier && (
            <>
              <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[10px] font-medium bg-muted border border-border rounded shadow-sm">
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <span className="text-muted-foreground/50 text-[10px]">+</span>
            </>
          )}
          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[10px] font-medium bg-muted border border-border rounded shadow-sm">
            {k.key.toUpperCase()}
          </kbd>
        </div>
      ))}
    </div>
  );
}

export default KeyboardShortcutsModal;
