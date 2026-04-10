'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  ClipboardList, 
  FolderKanban, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut,
  Plus,
  Command,
  HelpCircle,
  Moon,
  Sun,
  Keyboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ShortcutCommand {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  shortcut: string[];
  action: () => void;
  category: 'navigation' | 'actions' | 'system';
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define all commands
  const commands: ShortcutCommand[] = [
    // Navigation
    { 
      id: 'home', 
      label: 'Go to Dashboard', 
      icon: Home, 
      shortcut: ['G', 'D'], 
      action: () => router.push('/dashboard'),
      category: 'navigation' 
    },
    { 
      id: 'boards', 
      label: 'Go to Boards', 
      icon: ClipboardList, 
      shortcut: ['G', 'B'], 
      action: () => router.push('/boards'),
      category: 'navigation' 
    },
    { 
      id: 'projects', 
      label: 'Go to Projects', 
      icon: FolderKanban, 
      shortcut: ['G', 'P'], 
      action: () => router.push('/projects'),
      category: 'navigation' 
    },
    { 
      id: 'analytics', 
      label: 'Go to Analytics', 
      icon: BarChart3, 
      shortcut: ['G', 'A'], 
      action: () => router.push('/analytics'),
      category: 'navigation' 
    },
    { 
      id: 'messages', 
      label: 'Go to Messages', 
      icon: MessageSquare, 
      shortcut: ['G', 'M'], 
      action: () => router.push('/messages'),
      category: 'navigation' 
    },
    { 
      id: 'calendar', 
      label: 'Go to Calendar', 
      icon: Calendar, 
      shortcut: ['G', 'C'], 
      action: () => router.push('/calendar'),
      category: 'navigation' 
    },
    { 
      id: 'settings', 
      label: 'Go to Settings', 
      icon: Settings, 
      shortcut: ['G', 'S'], 
      action: () => router.push('/settings'),
      category: 'navigation' 
    },
    // Actions
    { 
      id: 'new-task', 
      label: 'Create New Task', 
      description: 'Open the task creation dialog',
      icon: Plus, 
      shortcut: ['N', 'T'], 
      action: () => {
        // Dispatch custom event that task modals listen to
        window.dispatchEvent(new CustomEvent('heronpulse:new-task'));
        toast({ title: 'Create Task', description: 'Opening task dialog...' });
      },
      category: 'actions' 
    },
    { 
      id: 'new-project', 
      label: 'Create New Project', 
      icon: Plus, 
      shortcut: ['N', 'P'], 
      action: () => {
        window.dispatchEvent(new CustomEvent('heronpulse:new-project'));
        toast({ title: 'Create Project', description: 'Opening project dialog...' });
      },
      category: 'actions' 
    },
    // System
    { 
      id: 'toggle-theme', 
      label: 'Toggle Theme', 
      description: 'Switch between light and dark mode',
      icon: theme === 'dark' ? Sun : Moon, 
      shortcut: ['⌘', 'T'], 
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      category: 'system' 
    },
    { 
      id: 'logout', 
      label: 'Sign Out', 
      icon: LogOut, 
      shortcut: ['⌘', 'Q'], 
      action: async () => {
        await signOut({ redirect: false });
        router.push('/login');
        toast({ title: 'Signed Out', description: 'You have been signed out.' });
      },
      category: 'system' 
    },
    { 
      id: 'help', 
      label: 'Open Help Center', 
      icon: HelpCircle, 
      shortcut: ['?'], 
      action: () => router.push('/help'),
      category: 'system' 
    },
  ];

  // Filter commands by search
  const filteredCommands = searchQuery.trim()
    ? commands.filter(cmd => 
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commands;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
        return;
      }

      // Navigate within palette
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) {
            cmd.action();
            setIsOpen(false);
            setSearchQuery('');
            setSelectedIndex(0);
          }
        }
        return;
      }

      // Global shortcuts when palette is closed
      // Check for G + key combinations (navigation)
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const handleGSequence = (event: KeyboardEvent) => {
          const key = event.key.toLowerCase();
          const matchingCommand = commands.find(
            cmd => cmd.shortcut.length === 2 && 
                  cmd.shortcut[0].toLowerCase() === 'g' && 
                  cmd.shortcut[1].toLowerCase() === key
          );
          if (matchingCommand) {
            event.preventDefault();
            matchingCommand.action();
          }
          window.removeEventListener('keydown', handleGSequence);
        };
        window.addEventListener('keydown', handleGSequence, { once: true });
        setTimeout(() => window.removeEventListener('keydown', handleGSequence), 1000);
      }

      // Check for ? key (help)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push('/help');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, router, toast, theme, setTheme]);

  // Reset selection when filtered results change - use useMemo pattern
  const effectiveSelectedIndex = Math.min(selectedIndex, filteredCommands.length - 1);

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedIndex: effectiveSelectedIndex,
    setSelectedIndex,
    filteredCommands,
    commands,
  };
}

// Command Palette Component
export function CommandPalette() {
  const {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    filteredCommands,
  } = useKeyboardShortcuts();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="border-0 focus-visible:ring-0 px-0"
                  autoFocus
                />
                <Badge variant="outline" className="text-xs">
                  ESC
                </Badge>
              </div>

              {/* Commands List */}
              <ScrollArea className="max-h-80">
                <div className="p-2">
                  {['navigation', 'actions', 'system'].map(category => {
                    const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                    if (categoryCommands.length === 0) return null;

                    return (
                      <div key={category} className="mb-2">
                        <p className="text-xs text-muted-foreground uppercase px-2 py-1.5">
                          {category}
                        </p>
                        {categoryCommands.map((cmd, index) => {
                          const Icon = cmd.icon;
                          const globalIndex = filteredCommands.indexOf(cmd);
                          
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                                setSearchQuery('');
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                globalIndex === selectedIndex
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{cmd.label}</p>
                                {cmd.description && (
                                  <p className="text-xs text-muted-foreground">{cmd.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {cmd.shortcut.map((key, i) => (
                                  <kbd
                                    key={i}
                                    className="min-w-[24px] h-6 px-1.5 text-[10px] font-medium bg-muted rounded flex items-center justify-center"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {filteredCommands.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No commands found
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Keyboard Shortcuts Help Dialog
export function KeyboardShortcutsHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'B'], description: 'Go to Boards' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'A'], description: 'Go to Analytics' },
      { keys: ['G', 'M'], description: 'Go to Messages' },
      { keys: ['G', 'C'], description: 'Go to Calendar' },
      { keys: ['G', 'S'], description: 'Go to Settings' },
    ]},
    { category: 'Actions', items: [
      { keys: ['N', 'T'], description: 'Create new task' },
      { keys: ['N', 'P'], description: 'Create new project' },
    ]},
    { category: 'System', items: [
      { keys: ['⌘', 'T'], description: 'Toggle theme' },
      { keys: ['?'], description: 'Open help' },
      { keys: ['⌘', 'Q'], description: 'Sign out' },
    ]},
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {shortcuts.map(group => (
                  <div key={group.category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                      {group.category}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm">{item.description}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((key, j) => (
                              <kbd
                                key={j}
                                className="min-w-[28px] h-7 px-2 text-xs font-medium bg-muted rounded"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
