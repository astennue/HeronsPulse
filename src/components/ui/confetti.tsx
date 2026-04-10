"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

/**
 * Confetti Celebration Component for HeronPulse Academic OS
 *
 * A canvas-based confetti system with:
 * - Milestone celebrations (10, 50, 100 tasks)
 * - Different colors based on achievement level
 * - Optional sound effect (toggleable)
 * - Customizable particle count and duration
 * - Different celebration types (small, medium, large)
 * - Accessibility support (respects reduced motion)
 */

// ============================================
// Types and Constants
// ============================================

export type CelebrationType = "small" | "medium" | "large";
export type MilestoneLevel = 10 | 50 | 100 | "custom";

export interface ConfettiConfig {
  particleCount: number;
  spread: number;
  startVelocity: number;
  decay: number;
  gravity: number;
  drift: number;
  ticks: number;
  origin: { x: number; y: number };
  colors: string[];
  shapes: ("square" | "circle")[];
  scalar: number;
}

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

interface MilestoneConfig {
  level: MilestoneLevel;
  colors: string[];
  particleCount: number;
  duration: number;
  sound: boolean;
}

// ============================================
// Color Schemes by Achievement Level
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
};

// ============================================
// Celebration Type Configurations
// ============================================

export const CELEBRATION_CONFIGS: Record<CelebrationType, Partial<ConfettiConfig>> = {
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

// Default colors
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
  // Create a simple celebration sound using Web Audio API
  if (typeof window === "undefined" || !window.AudioContext) return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Play a cheerful ascending tone
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
    console.log("Audio celebration not available");
  }
}

// ============================================
// Accessibility Check
// ============================================

function useReducedMotion(): boolean {
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
// Confetti Hook
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
      const actualParticleCount = particleCount ?? config.particleCount ?? 75;

      // Play sound if enabled
      if (soundEnabled) {
        playCelebrationSound();
      }

      // Fire confetti burst
      const shootConfetti = () => {
        confetti({
          particleCount: actualParticleCount,
          spread: config.spread ?? 80,
          startVelocity: config.startVelocity ?? 35,
          decay: config.decay ?? 0.9,
          gravity: config.gravity ?? 1,
          drift: config.drift ?? 0,
          ticks: config.ticks ?? 200,
          origin,
          colors,
          shapes,
          scalar: config.scalar ?? 1,
          disableForReducedMotion: true,
        });
      };

      // Initial burst
      shootConfetti();

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
      const colorsToUse = colors;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60 + Math.random() * 60,
          spread: 50 + Math.random() * 30,
          origin: {
            x: Math.random() * 0.6 + 0.2,
            y: Math.random() * 0.4 + 0.3,
          },
          colors: [colorsToUse[Math.floor(Math.random() * colorsToUse.length)]],
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

  return {
    fire,
    fireMilestone,
    fireSideCannons,
    fireFireworks,
    fireSnow,
    isPlaying,
    reducedMotion,
  };
}

// ============================================
// Confetti Component
// ============================================

export interface ConfettiProps {
  /** Trigger the celebration */
  trigger?: boolean;
  /** Celebration options */
  options?: ConfettiOptions;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Children to render (for wrapper pattern) */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function Confetti({
  trigger = false,
  options = {},
  onComplete,
  children,
  className,
}: ConfettiProps) {
  const { fire, isPlaying } = useConfetti();
  const hasFiredRef = React.useRef(false);

  React.useEffect(() => {
    if (trigger && !hasFiredRef.current && !isPlaying) {
      hasFiredRef.current = true;
      fire({
        ...options,
        onComplete: () => {
          hasFiredRef.current = false;
          onComplete?.();
        },
      });
    }
  }, [trigger, isPlaying, fire, options, onComplete]);

  if (children) {
    return <div className={className}>{children}</div>;
  }

  return null;
}

// ============================================
// Celebration Button Wrapper
// ============================================

export interface CelebrationButtonProps {
  /** The button or action element to wrap */
  children: React.ReactNode;
  /** Celebration options */
  celebrationOptions?: ConfettiOptions;
  /** Milestone to celebrate (overrides celebrationOptions) */
  milestone?: MilestoneLevel;
  /** Trigger celebration on click */
  celebrateOnClick?: boolean;
  /** Callback after celebration completes */
  onCelebrationComplete?: () => void;
  /** Additional class names */
  className?: string;
  /** Disable celebration */
  disabled?: boolean;
}

export function CelebrationButton({
  children,
  celebrationOptions = {},
  milestone,
  celebrateOnClick = true,
  onCelebrationComplete,
  className,
  disabled = false,
}: CelebrationButtonProps) {
  const { fire, fireMilestone, isPlaying, reducedMotion } = useConfetti();

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isPlaying || reducedMotion) return;

      if (celebrateOnClick) {
        if (milestone) {
          fireMilestone(milestone, {
            ...celebrationOptions,
            onComplete: onCelebrationComplete,
          });
        } else {
          fire({
            ...celebrationOptions,
            onComplete: onCelebrationComplete,
          });
        }
      }

      // Trigger the child's onClick if it exists
      const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
      if (child?.props?.onClick) {
        child.props.onClick(e);
      }
    },
    [disabled, isPlaying, reducedMotion, celebrateOnClick, milestone, celebrationOptions, onCelebrationComplete, fire, fireMilestone, children]
  );

  // Clone the child element and add the onClick handler
  const childElement = children as React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    disabled?: boolean;
  }>;

  return React.cloneElement(childElement, {
    onClick: handleClick,
    className: cn(childElement?.props?.className, className),
    disabled: disabled || childElement?.props?.disabled,
  });
}

// ============================================
// Milestone Celebration Component
// ============================================

export interface MilestoneCelebrationProps {
  /** Task count to check milestones against */
  taskCount: number;
  /** Previous task count (to detect new milestones) */
  previousTaskCount?: number;
  /** Custom milestones to celebrate */
  milestones?: number[];
  /** Enable sound effects */
  soundEnabled?: boolean;
  /** Callback when milestone is reached */
  onMilestoneReached?: (milestone: number) => void;
  /** Children to render */
  children?: React.ReactNode;
}

export function MilestoneCelebration({
  taskCount,
  previousTaskCount = 0,
  milestones = [10, 50, 100],
  soundEnabled = true,
  onMilestoneReached,
  children,
}: MilestoneCelebrationProps) {
  const { fireMilestone, reducedMotion } = useConfetti();
  const hasCelebratedRef = React.useRef<Set<number>>(new Set());

  React.useEffect(() => {
    // Find if we've crossed a milestone
    const crossedMilestone = milestones.find(
      (m) => taskCount >= m && previousTaskCount < m && !hasCelebratedRef.current.has(m)
    );

    if (crossedMilestone && !reducedMotion) {
      hasCelebratedRef.current.add(crossedMilestone);

      const level: MilestoneLevel = crossedMilestone === 10 || crossedMilestone === 50 || crossedMilestone === 100
        ? (crossedMilestone as MilestoneLevel)
        : "custom";

      fireMilestone(level, {
        soundEnabled,
        onComplete: () => onMilestoneReached?.(crossedMilestone),
      });
    }
  }, [taskCount, previousTaskCount, milestones, fireMilestone, reducedMotion, soundEnabled, onMilestoneReached]);

  return <>{children}</>;
}

// ============================================
// Full Screen Celebration Modal
// ============================================

export interface CelebrationModalProps {
  /** Show the celebration modal */
  show: boolean;
  /** Main message */
  message: string;
  /** Sub message */
  subMessage?: string;
  /** Milestone level for theming */
  milestone?: MilestoneLevel;
  /** Custom colors */
  colors?: string[];
  /** Enable sound */
  soundEnabled?: boolean;
  /** Auto close after delay (ms), 0 to disable */
  autoCloseDelay?: number;
  /** Callback when closed */
  onClose?: () => void;
}

export function CelebrationModal({
  show,
  message,
  subMessage,
  milestone = 10,
  colors,
  soundEnabled = true,
  autoCloseDelay = 4000,
  onClose,
}: CelebrationModalProps) {
  const { fireMilestone, reducedMotion } = useConfetti();
  const hasFiredRef = React.useRef(false);

  React.useEffect(() => {
    if (show && !hasFiredRef.current && !reducedMotion) {
      hasFiredRef.current = true;
      fireMilestone(milestone, {
        soundEnabled,
        colors,
        type: milestone === 100 ? "large" : milestone === 50 ? "medium" : "small",
        duration: autoCloseDelay > 0 ? autoCloseDelay - 500 : 3000,
      });
    }

    if (!show) {
      hasFiredRef.current = false;
    }
  }, [show, milestone, fireMilestone, reducedMotion, soundEnabled, colors, autoCloseDelay]);

  React.useEffect(() => {
    if (show && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoCloseDelay, onClose]);

  if (!show) return null;

  const milestoneConfig = MILESTONE_COLORS[milestone];
  const bgGradient = `linear-gradient(135deg, ${milestoneConfig.primary[0]}20, ${milestoneConfig.secondary[0]}20)`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Celebration"
    >
      <div
        className="bg-card rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4 animate-in fade-in zoom-in duration-300"
        style={{ background: bgGradient }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <span
            className="inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl"
            style={{ background: milestoneConfig.primary[0] }}
          >
            {milestone === 100 ? "🏆" : milestone === 50 ? "🥈" : milestone === 10 ? "🥉" : "🎉"}
          </span>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: milestoneConfig.primary[0] }}
        >
          {message}
        </h2>
        {subMessage && (
          <p className="text-muted-foreground text-lg">{subMessage}</p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {milestoneConfig.name} Achievement Unlocked!
        </p>
      </div>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default Confetti;
