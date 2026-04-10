'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Palette, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const accentColors = [
  { name: 'Blue', value: 'blue', color: '#1A56DB' },
  { name: 'Green', value: 'green', color: '#059669' },
  { name: 'Purple', value: 'purple', color: '#7C3AED' },
  { name: 'Orange', value: 'orange', color: '#EA580C' },
  { name: 'Pink', value: 'pink', color: '#DB2777' },
];

const themes = [
  { name: 'Light', value: 'light', icon: Sun, description: 'Clean and bright' },
  { name: 'Vibrant', value: 'vibrant', icon: Palette, description: 'Colorful and energetic' },
  { name: 'Dark', value: 'dark', icon: Moon, description: 'Easy on the eyes' },
  { name: 'System', value: 'system', icon: Monitor, description: 'Match your device' },
];

const primaryColors: Record<string, { primary: string; foreground: string }> = {
  blue: { primary: '#1A56DB', foreground: '#FFFFFF' },
  green: { primary: '#059669', foreground: '#FFFFFF' },
  purple: { primary: '#7C3AED', foreground: '#FFFFFF' },
  orange: { primary: '#EA580C', foreground: '#FFFFFF' },
  pink: { primary: '#DB2777', foreground: '#FFFFFF' },
};

function applyAccentColor(color: string) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const selected = primaryColors[color] || primaryColors.blue;
  
  root.style.setProperty('--primary', selected.primary);
  root.style.setProperty('--primary-foreground', selected.foreground);
  root.style.setProperty('--accent-primary', selected.primary);
  
  localStorage.setItem('accent-color', color);
}

function getStoredAccentColor(): string {
  if (typeof window === 'undefined') return 'blue';
  return localStorage.getItem('accent-color') || 'blue';
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('blue');
  
  // Use useSyncExternalStore for hydration-safe localStorage access
  const mounted = useSyncExternalStore(
    subscribeToStorage,
    () => true,
    () => false
  );

  const storedAccent = useSyncExternalStore(
    subscribeToStorage,
    getStoredAccentColor,
    () => 'blue'
  );

  // Apply accent color when mounted or stored accent changes
  if (mounted && storedAccent !== accentColor) {
    setAccentColor(storedAccent);
    applyAccentColor(storedAccent);
  }

  const handleAccentChange = useCallback((color: string) => {
    setAccentColor(color);
    applyAccentColor(color);
  }, []);

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
  }, [setTheme]);

  // Get current theme data
  const currentThemeData = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentThemeData.icon;

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative group">
          <CurrentIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="sr-only">Toggle theme</span>
          {/* Accent color indicator */}
          <span 
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-background"
            style={{ backgroundColor: primaryColors[accentColor]?.primary || '#1A56DB' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme options */}
        <div className="px-2 py-1">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Accent colors */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Accent Color
        </DropdownMenuLabel>
        <div className="flex gap-2 px-3 py-2">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleAccentChange(color.value)}
              className={`w-7 h-7 rounded-full transition-all hover:scale-110 relative ${
                accentColor === color.value ? 'ring-2 ring-offset-2 ring-foreground/50 scale-110' : ''
              }`}
              style={{ backgroundColor: color.color }}
              title={color.name}
            >
              {accentColor === color.value && (
                <Check className="h-3 w-3 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
