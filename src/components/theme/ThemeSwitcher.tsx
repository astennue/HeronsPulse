'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'vibrant' | 'dark';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

const accentColors: Record<AccentColor, { name: string; value: string; logoFilter: string }> = {
  blue: { name: 'Blue', value: '#3B82F6', logoFilter: 'brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(1925%) hue-rotate(204deg) brightness(98%) contrast(97%)' },
  green: { name: 'Green', value: '#10B981', logoFilter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(130deg) brightness(90%) contrast(95%)' },
  purple: { name: 'Purple', value: '#8B5CF6', logoFilter: 'brightness(0) saturate(100%) invert(42%) sepia(96%) saturate(3053%) hue-rotate(254deg) brightness(99%) contrast(97%)' },
  orange: { name: 'Orange', value: '#F97316', logoFilter: 'brightness(0) saturate(100%) invert(48%) sepia(80%) saturate(1646%) hue-rotate(344deg) brightness(100%) contrast(97%)' },
  pink: { name: 'Pink', value: '#EC4899', logoFilter: 'brightness(0) saturate(100%) invert(38%) sepia(93%) saturate(1794%) hue-rotate(294deg) brightness(97%) contrast(97%)' },
};

const themes: Record<Theme, { name: string; icon: typeof Sun; description: string }> = {
  light: { name: 'Light', icon: Sun, description: 'Clean & Professional' },
  vibrant: { name: 'Vibrant', icon: Palette, description: 'Modern & Colorful' },
  dark: { name: 'Dark', icon: Moon, description: 'Premium Dark' },
};

const validThemes: Theme[] = ['light', 'vibrant', 'dark'];
const validAccents: AccentColor[] = ['blue', 'green', 'purple', 'orange', 'pink'];

// Helper to apply theme to DOM
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'vibrant');
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'vibrant') {
    root.classList.add('vibrant');
  }
}

// Helper to apply accent color to DOM
function applyAccent(accent: AccentColor) {
  const root = document.documentElement;
  const color = accentColors[accent].value;
  root.style.setProperty('--primary', color);
  root.style.setProperty('--ring', color);
}

// Helper to apply logo filter based on theme and accent
function applyLogoFilter(theme: Theme, accent: AccentColor) {
  const root = document.documentElement;
  
  // Logo always matches accent color in all themes
  root.style.setProperty('--logo-filter', accentColors[accent].logoFilter);
}

// Custom hook for theme state with localStorage persistence
function useThemeState() {
  // Memoize initial values - computed once on first render
  const initialValues = useMemo(() => {
    if (typeof window === 'undefined') {
      return { theme: 'light' as Theme, accent: 'blue' as AccentColor };
    }
    
    const savedTheme = localStorage.getItem('heronpulse-theme');
    const savedAccent = localStorage.getItem('heronpulse-accent');
    
    const theme = savedTheme && validThemes.includes(savedTheme as Theme) 
      ? (savedTheme as Theme) 
      : 'light';
    const accent = savedAccent && validAccents.includes(savedAccent as AccentColor) 
      ? (savedAccent as AccentColor) 
      : 'blue';
    
    // Apply on initial read
    applyTheme(theme);
    applyAccent(accent);
    applyLogoFilter(theme, accent);
    
    return { theme, accent };
  }, []);
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialValues.theme);
  const [currentAccent, setCurrentAccent] = useState<AccentColor>(initialValues.accent);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
    applyLogoFilter(newTheme, currentAccent);
    localStorage.setItem('heronpulse-theme', newTheme);
  }, [currentAccent]);

  const handleAccentChange = useCallback((newAccent: AccentColor) => {
    setCurrentAccent(newAccent);
    applyAccent(newAccent);
    applyLogoFilter(currentTheme, newAccent);
    localStorage.setItem('heronpulse-accent', newAccent);
  }, [currentTheme]);

  return {
    currentTheme,
    currentAccent,
    handleThemeChange,
    handleAccentChange,
  };
}

export function ThemeSwitcher() {
  const { currentTheme, currentAccent, handleThemeChange, handleAccentChange } = useThemeState();
  const [mounted, setMounted] = useState(false);

  // Use useLayoutEffect equivalent with useEffect for mount detection
  useEffect(function setMountedState() {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const CurrentIcon = themes[currentTheme].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] relative group">
          <CurrentIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(themes).map(([key, { name, icon: Icon, description }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleThemeChange(key as Theme)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            {currentTheme === key && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="h-4 w-4 mr-2" />
            Accent Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={currentAccent} onValueChange={(v) => handleAccentChange(v as AccentColor)}>
              {Object.entries(accentColors).map(([key, { name, value }]) => (
                <DropdownMenuRadioItem key={key} value={key} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 w-4 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: value }}
                    />
                    <span>{name}</span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
