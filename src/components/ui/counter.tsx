"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Counter Component
 * 
 * Animated number counter with count-up animation on mount.
 * Perfect for statistics, dashboards, and hero sections.
 * 
 * Features:
 * - Smooth count-up animation
 * - Customizable duration and easing
 * - Prefix and suffix support
 * - Decimal formatting
 * - Separator for thousands
 * - Trigger on scroll into view option
 */

interface CounterProps {
  /** Target number to count to */
  value: number;
  /** Starting number */
  startValue?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix to display before the number */
  prefix?: string;
  /** Suffix to display after the number */
  suffix?: string;
  /** Separator for thousands (e.g., ",") */
  separator?: string;
  /** Easing function */
  easing?: "linear" | "easeOut" | "easeInOut" | "easeOutQuart" | "easeOutExpo";
  /** Custom formatter function */
  formatter?: (value: number) => string;
  /** Trigger animation when element enters viewport */
  triggerOnView?: boolean;
  /** Animation type */
  animation?: "count" | "slide" | "pop";
  /** Additional class names */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
};

function formatNumber(
  value: number,
  decimals: number,
  separator: string
): string {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

export function Counter({
  value,
  startValue = 0,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  easing = "easeOutQuart",
  formatter,
  triggerOnView = true,
  animation = "count",
  className,
  onComplete,
}: CounterProps) {
  const [displayValue, setDisplayValue] = React.useState(startValue);
  const [isVisible, setIsVisible] = React.useState(!triggerOnView);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);
  const animationRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  // Intersection Observer for trigger on view
  React.useEffect(() => {
    if (!triggerOnView || hasAnimated) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerOnView, hasAnimated]);

  // Animation loop
  React.useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const ease = easingFunctions[easing];
    const range = value - startValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);
      const currentValue = startValue + range * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, value, startValue, duration, easing, onComplete, hasAnimated]);

  const formattedValue = formatter
    ? formatter(displayValue)
    : formatNumber(displayValue, decimals, separator);

  const animationClass = {
    count: "animate-count-up",
    slide: "animate-number-slide",
    pop: "animate-number-pop",
  }[animation];

  return (
    <span
      ref={elementRef}
      className={cn(
        "tabular-nums",
        isVisible && animationClass,
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

/**
 * CounterGroup - Group of counters with staggered animation
 */
export function CounterGroup({
  children,
  className,
  stagger = 100,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={cn("flex flex-wrap gap-6", className)}>
      {childArray.map((child, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * stagger}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * StatCounter - Pre-styled counter for statistics displays
 */
export function StatCounter({
  value,
  label,
  prefix,
  suffix,
  icon,
  trend,
  trendValue,
  className,
  duration = 2000,
  decimals = 0,
  feature = "dashboard",
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  duration?: number;
  decimals?: number;
  feature?: "dashboard" | "tasks" | "analytics" | "messages" | "leaderboard" | "calendar" | "settings" | "admin";
}) {
  const featureColors = {
    dashboard: "text-feature-dashboard",
    tasks: "text-feature-tasks",
    analytics: "text-feature-analytics",
    messages: "text-feature-messages",
    leaderboard: "text-feature-leaderboard",
    calendar: "text-feature-calendar",
    settings: "text-feature-settings",
    admin: "text-feature-admin",
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div className={cn("p-4 rounded-xl bg-card border card-lift", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && (
          <span className={cn("text-lg", featureColors[feature])}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <Counter
          value={value}
          prefix={prefix}
          suffix={suffix}
          duration={duration}
          decimals={decimals}
          className={cn(
            "text-3xl font-bold tracking-tight",
            featureColors[feature]
          )}
        />
        {trend && trendValue && (
          <span
            className={cn(
              "text-sm font-medium mb-1",
              trendColors[trend]
            )}
          >
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * BigCounter - Large hero-style counter
 */
export function BigCounter({
  value,
  label,
  prefix,
  suffix,
  className,
  duration = 2500,
  animation = "pop",
}: {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  animation?: "count" | "slide" | "pop";
}) {
  return (
    <div className={cn("text-center", className)}>
      <Counter
        value={value}
        prefix={prefix}
        suffix={suffix}
        duration={duration}
        animation={animation}
        className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-text"
      />
      {label && (
        <p className="mt-2 text-lg text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

/**
 * CounterCard - Card with counter and additional content
 */
export function CounterCard({
  value,
  label,
  description,
  prefix,
  suffix,
  icon,
  iconBg,
  className,
  feature = "dashboard",
  children,
}: {
  value: number;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  feature?: "dashboard" | "tasks" | "analytics" | "messages" | "leaderboard" | "calendar" | "settings" | "admin";
  children?: React.ReactNode;
}) {
  const featureBgColors = {
    dashboard: "bg-feature-dashboard/10",
    tasks: "bg-feature-tasks/10",
    analytics: "bg-feature-analytics/10",
    messages: "bg-feature-messages/10",
    leaderboard: "bg-feature-leaderboard/10",
    calendar: "bg-feature-calendar/10",
    settings: "bg-feature-settings/10",
    admin: "bg-feature-admin/10",
  };

  const featureTextColors = {
    dashboard: "text-feature-dashboard",
    tasks: "text-feature-tasks",
    analytics: "text-feature-analytics",
    messages: "text-feature-messages",
    leaderboard: "text-feature-leaderboard",
    calendar: "text-feature-calendar",
    settings: "text-feature-settings",
    admin: "text-feature-admin",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-card border card-lift feature-card",
        `feature-${feature}`,
        className
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl",
              iconBg || featureBgColors[feature]
            )}
          >
            <span className={cn("text-xl", featureTextColors[feature])}>
              {icon}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <Counter
            value={value}
            prefix={prefix}
            suffix={suffix}
            className={cn(
              "text-3xl font-bold",
              featureTextColors[feature]
            )}
          />
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * TimeCounter - Counter for time-based displays (hours, minutes, seconds)
 */
export function TimeCounter({
  seconds,
  className,
  showLabels = true,
}: {
  seconds: number;
  className?: string;
  showLabels?: boolean;
}) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {hours > 0 && (
        <>
          <Counter
            value={hours}
            duration={1500}
            className="text-2xl font-bold tabular-nums"
          />
          {showLabels && <span className="text-sm text-muted-foreground">h</span>}
          <span className="text-muted-foreground">:</span>
        </>
      )}
      <Counter
        value={minutes}
        duration={1500}
        className="text-2xl font-bold tabular-nums"
      />
      {showLabels && <span className="text-sm text-muted-foreground">m</span>}
      <span className="text-muted-foreground">:</span>
      <Counter
        value={secs}
        duration={1500}
        className="text-2xl font-bold tabular-nums"
      />
      {showLabels && <span className="text-sm text-muted-foreground">s</span>}
    </div>
  );
}

export default Counter;
