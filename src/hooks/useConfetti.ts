"use client";

import * as React from "react";
import confetti from "canvas-confetti";

/**
 * useConfetti Hook for HeronPulse Academic OS
 *
 * A comprehensive hook for triggering confetti celebrations with:
 * - Milestone celebrations (10, 50, 100 tasks)
 * - Different colors based on achievement level
 * - Optional sound effect (toggleable)
 * - Customizable particle count and duration
 * - Different celebration types (small, medium, large)
 * - Accessibility support (respects reduced motion)
 */

// ============================================
// Types
// ============================================

export type CelebrationType = "small" | "medium" | "large";
export type MilestoneLevel = 10 | 50 | 100 | "custom";

export interface ConfettiOptions {
  /** Type of celebration (affects intensity) */
  type?: CelebrationType;
  /** Duration of the celebration in ms */
  duration?: number;
  /** Number of particles (overrides type default) */
  particleCount?: number;
  /** Custom colors */
  colors?: string[];
  /** Enable sound effect */
  soundEnabled?: boolean;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Origin point (0-1 for x and y) */
  origin?: { x: number; y: number };
  /** Custom shapes */
  shapes?: ("square" | "circle")[];
}

// ============================================
// Constants
// ============================================

export const MILESTONE_COLORS = {
  10: {
    primary: ["#10B981", "#34D399", "#6EE7B7"], // Green - Good start
    secondary: ["#3B82F6", "#60A5FA", "#93C5FD"],
    name: "Bronze",
  },
  50: {
    primary: ["#8B5CF6", "#A78BFA", "#C4B5FD"], // Purple - Mid milestone
    secondary: ["#EC4899", "#F472B6", "#F9A8D4"],
    name: "Silver",
  },
  100: {
    primary: ["#F59E0B", "#FBBF24", "#FCD34D"], // Gold - Major milestone
    secondary: ["#EF4444", "#F87171", "#FCA5A5"],
    name: "Gold",
  },
  custom: {
    primary: ["#3B82F6", "#60A5FA", "#93C5FD"], // Blue - Custom
    secondary: ["#06B6D4", "#22D3EE", "#67E8F9"],
    name: "Custom",
  },
} as const;

export const CELEBRATION_CONFIGS: Record<CelebrationType, { particleCount: number; spread: number; startVelocity: number; scalar: number }> = {
  small: {
    particleCount: 30,
    spread: 50,
    startVelocity: 25,
    scalar: 0.8,
  },
  medium: {
    particleCount: 75,
    spread: 80,
    startVelocity: 35,
    scalar: 1,
  },
  large: {
    particleCount: 150,
    spread: 120,
    startVelocity: 45,
    scalar: 1.2,
  },
};

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Orange
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#FBBF24", // Yellow
];

// ============================================
// Sound Effect
// ============================================

function playCelebrationSound(): void {
  if (typeof window === "undefined" || !window.AudioContext) return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = audioContext.currentTime + i * 0.1;
      const endTime = startTime + 0.15;

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  } catch {
    // Audio not supported or blocked
  }
}

// ============================================
// Accessibility Hook
// ============================================

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

// ============================================
// Main Hook
// ============================================

export function useConfetti() {
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const animationRef = React.useRef<number | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /**
   * Fire a basic confetti celebration
   */
  const fire = React.useCallback(
    (options: ConfettiOptions = {}) => {
      // Skip if reduced motion is preferred
      if (reducedMotion) {
        options.onComplete?.();
        return;
      }

      // Prevent multiple simultaneous celebrations
      if (isPlaying) return;

      setIsPlaying(true);

      const {
        type = "medium",
        duration = 3000,
        particleCount,
        colors = DEFAULT_COLORS,
        soundEnabled = false,
        onComplete,
        origin = { x: 0.5, y: 0.5 },
        shapes = ["square", "circle"],
      } = options;

      const config = CELEBRATION_CONFIGS[type];
      const actualParticleCount = particleCount ?? config.particleCount;

      // Play sound if enabled
      if (soundEnabled) {
        playCelebrationSound();
      }

      // Fire confetti burst
      confetti({
        particleCount: actualParticleCount,
        spread: config.spread,
        startVelocity: config.startVelocity,
        decay: 0.9,
        gravity: 1,
        drift: 0,
        ticks: 200,
        origin,
        colors,
        shapes,
        scalar: config.scalar,
        disableForReducedMotion: true,
      });

      // For large celebrations, add extra bursts
      if (type === "large") {
        setTimeout(() => {
          confetti({
            particleCount: Math.floor(actualParticleCount * 0.5),
            angle: 60,
            spread: 55,
            origin: { x: 0.2, y: 0.6 },
            colors,
            shapes,
            disableForReducedMotion: true,
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: Math.floor(actualParticleCount * 0.5),
            angle: 120,
            spread: 55,
            origin: { x: 0.8, y: 0.6 },
            colors,
            shapes,
            disableForReducedMotion: true,
          });
        }, 400);
      }

      // Complete after duration
      timeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        onComplete?.();
      }, duration);
    },
    [reducedMotion, isPlaying]
  );

  /**
   * Fire a milestone celebration with preset colors
   */
  const fireMilestone = React.useCallback(
    (milestone: MilestoneLevel, options: Omit<ConfettiOptions, "colors" | "type"> = {}) => {
      const milestoneConfig = MILESTONE_COLORS[milestone];
      const colors = [...milestoneConfig.primary, ...milestoneConfig.secondary];
      const type: CelebrationType = milestone === 100 ? "large" : milestone === 50 ? "medium" : "small";

      fire({
        ...options,
        type,
        colors,
        soundEnabled: options.soundEnabled ?? true,
      });
    },
    [fire]
  );

  /**
   * Fire side cannons effect
   */
  const fireSideCannons = React.useCallback(
    (options: Omit<ConfettiOptions, "origin"> = {}) => {
      if (reducedMotion) {
        options.onComplete?.();
        return;
      }

      const { colors = DEFAULT_COLORS, soundEnabled = false, onComplete } = options;

      if (soundEnabled) {
        playCelebrationSound();
      }

      const end = Date.now() + 1000;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          onComplete?.();
        }
      };

      frame();
    },
    [reducedMotion]
  );

  /**
   * Fire fireworks effect
   */
  const fireFireworks = React.useCallback(
    (options: ConfettiOptions = {}) => {
      if (reducedMotion) {
        options.onComplete?.();
        return;
      }

      const { colors = DEFAULT_COLORS, soundEnabled = false, onComplete, duration = 4000 } = options;

      if (soundEnabled) {
        playCelebrationSound();
      }

      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60 + Math.random() * 60,
          spread: 50 + Math.random() * 30,
          origin: {
            x: Math.random() * 0.6 + 0.2,
            y: Math.random() * 0.4 + 0.3,
          },
          colors: [colors[Math.floor(Math.random() * colors.length)]],
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          onComplete?.();
        }
      };

      frame();
    },
    [reducedMotion]
  );

  /**
   * Fire snow effect
   */
  const fireSnow = React.useCallback(
    (options: Omit<ConfettiOptions, "origin"> = {}) => {
      if (reducedMotion) {
        options.onComplete?.();
        return;
      }

      const { colors = ["#ffffff", "#f0f0f0"], duration = 5000, onComplete } = options;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 1,
          startVelocity: 0,
          decay: 0.95,
          gravity: 0.1,
          drift: Math.random() * 0.2 - 0.1,
          ticks: 200,
          origin: {
            x: Math.random(),
            y: -0.1,
          },
          colors,
          shapes: ["circle"],
          scalar: 0.5 + Math.random() * 0.5,
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          onComplete?.();
        }
      };

      frame();
    },
    [reducedMotion]
  );

  /**
   * Fire stars effect
   */
  const fireStars = React.useCallback(
    (options: Omit<ConfettiOptions, "origin"> = {}) => {
      if (reducedMotion) {
        options.onComplete?.();
        return;
      }

      const { duration = 3000, onComplete, origin = { x: 0.5, y: 0.5 } } = options;
      const end = Date.now() + duration;
      const starColors = ["#FFD700", "#FFA500", "#FFEC8B", "#F0E68C"];

      const frame = () => {
        confetti({
          particleCount: 3,
          startVelocity: 15,
          spread: 360,
          origin,
          colors: [starColors[Math.floor(Math.random() * starColors.length)]],
          shapes: ["circle"],
          scalar: 0.8,
          gravity: 0.3,
          decay: 0.94,
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          animationRef.current = requestAnimationFrame(frame);
        } else {
          onComplete?.();
        }
      };

      frame();
    },
    [reducedMotion]
  );

  /**
   * Check if a milestone should be celebrated
   */
  const checkMilestone = React.useCallback(
    (
      currentCount: number,
      previousCount: number,
      milestones: number[] = [10, 50, 100]
    ): number | null => {
      for (const milestone of milestones) {
        if (currentCount >= milestone && previousCount < milestone) {
          return milestone;
        }
      }
      return null;
    },
    []
  );

  return {
    /** Fire a basic confetti celebration */
    fire,
    /** Fire a milestone celebration with preset colors */
    fireMilestone,
    /** Fire side cannons effect */
    fireSideCannons,
    /** Fire fireworks effect */
    fireFireworks,
    /** Fire snow effect */
    fireSnow,
    /** Fire stars effect */
    fireStars,
    /** Check if a milestone should be celebrated */
    checkMilestone,
    /** Whether a celebration is currently playing */
    isPlaying,
    /** Whether reduced motion is preferred */
    reducedMotion,
    /** Default colors array */
    DEFAULT_COLORS,
    /** Celebration configurations by type */
    CELEBRATION_CONFIGS,
    /** Milestone color configurations */
    MILESTONE_COLORS,
  };
}

export default useConfetti;
