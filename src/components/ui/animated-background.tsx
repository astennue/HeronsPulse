"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedBackground Component
 * 
 * A versatile background component that supports:
 * - Dot grid patterns
 * - Grid patterns  
 * - Floating shape animations
 * - Gradient overlays
 * 
 * Inspired by Monday.com/ClickUp hero sections
 */

interface FloatingShape {
  id: number;
  type: "circle" | "square" | "triangle" | "diamond";
  size: number;
  color: string;
  left: string;
  top: string;
  animation: "float-up" | "float-horizontal" | "float-vertical" | "float-diagonal" | "float-rotate" | "float-pulse" | "float-bounce";
  delay: string;
  duration: string;
}

interface AnimatedBackgroundProps {
  /** Pattern type to display */
  pattern?: "dots" | "dots-sm" | "dots-lg" | "grid" | "grid-lg" | "dots-and-grid" | "none";
  /** Pattern color (CSS color value) */
  patternColor?: string;
  /** Pattern opacity (0-1) */
  patternOpacity?: number;
  /** Enable floating shapes */
  floatingShapes?: boolean;
  /** Number of floating shapes */
  shapeCount?: number;
  /** Shape colors */
  shapeColors?: string[];
  /** Enable gradient overlay */
  gradientOverlay?: boolean;
  /** Custom gradient for overlay */
  gradient?: string;
  /** Enable hero gradient background */
  heroGradient?: boolean;
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Fixed position (for full-page backgrounds) */
  fixed?: boolean;
  /** Blur strength for glassmorphism effect */
  blur?: "none" | "sm" | "md" | "lg" | "xl";
}

const DEFAULT_SHAPE_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green  
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Orange
  "#06B6D4", // Cyan
];

const SHAPE_TYPES: FloatingShape["type"][] = ["circle", "square", "triangle", "diamond"];

const ANIMATION_TYPES: FloatingShape["animation"][] = [
  "float-up",
  "float-horizontal", 
  "float-vertical",
  "float-diagonal",
  "float-rotate",
  "float-pulse",
  "float-bounce",
];

function generateShapes(count: number, colors: string[]): FloatingShape[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
    size: Math.random() * 30 + 10, // 10-40px
    color: colors[Math.floor(Math.random() * colors.length)],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animation: ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)],
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 10 + 5}s`,
  }));
}

function ShapeSVG({ shape }: { shape: FloatingShape }) {
  const { type, size, color, animation, delay, duration } = shape;
  
  const animationClass = {
    "float-up": "animate-float-up",
    "float-horizontal": "animate-float-horizontal",
    "float-vertical": "animate-float-vertical",
    "float-diagonal": "animate-float-diagonal",
    "float-rotate": "animate-float-rotate",
    "float-pulse": "animate-float-pulse",
    "float-bounce": "animate-float-bounce",
  }[animation];

  const baseStyles: React.CSSProperties = {
    position: "absolute",
    left: shape.left,
    top: shape.top,
    width: size,
    height: size,
    opacity: 0.4,
    animationDelay: delay,
    animationDuration: duration,
  };

  const shapeContent = (() => {
    switch (type) {
      case "circle":
        return (
          <div
            className={cn("rounded-full", animationClass)}
            style={{
              ...baseStyles,
              backgroundColor: color,
            }}
          />
        );
      case "square":
        return (
          <div
            className={cn("rounded-sm", animationClass)}
            style={{
              ...baseStyles,
              backgroundColor: color,
            }}
          />
        );
      case "triangle":
        return (
          <div
            className={animationClass}
            style={{
              ...baseStyles,
              width: 0,
              height: 0,
              backgroundColor: "transparent",
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
            }}
          />
        );
      case "diamond":
        return (
          <div
            className={cn("rounded-sm", animationClass)}
            style={{
              ...baseStyles,
              backgroundColor: color,
              transform: "rotate(45deg)",
            }}
          />
        );
      default:
        return null;
    }
  })();

  return shapeContent;
}

export function AnimatedBackground({
  pattern = "dots",
  patternColor = "rgba(26, 86, 219, 0.1)",
  patternOpacity = 0.5,
  floatingShapes = false,
  shapeCount = 8,
  shapeColors = DEFAULT_SHAPE_COLORS,
  gradientOverlay = false,
  gradient,
  heroGradient = false,
  className,
  children,
  fixed = false,
  blur = "none",
}: AnimatedBackgroundProps) {
  const [shapes, setShapes] = React.useState<FloatingShape[]>([]);

  React.useEffect(() => {
    if (floatingShapes) {
      setShapes(generateShapes(shapeCount, shapeColors));
    }
  }, [floatingShapes, shapeCount, shapeColors]);

  const patternClass = {
    dots: "bg-dot-pattern",
    "dots-sm": "bg-dot-pattern-sm",
    "dots-lg": "bg-dot-pattern-lg",
    grid: "bg-grid-pattern",
    "grid-lg": "bg-grid-pattern-lg",
    "dots-and-grid": "bg-dots-and-grid",
    none: "",
  }[pattern];

  const blurClass = {
    none: "",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  }[blur];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fixed && "fixed inset-0 -z-10",
        className
      )}
    >
      {/* Base background with hero gradient */}
      {heroGradient && (
        <div className="absolute inset-0 hero-gradient" />
      )}

      {/* Pattern layer */}
      {pattern !== "none" && (
        <div
          className={cn("absolute inset-0", patternClass)}
          style={{ 
            color: patternColor,
            opacity: patternOpacity,
          }}
        />
      )}

      {/* Floating shapes */}
      {floatingShapes && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {shapes.map((shape) => (
            <ShapeSVG key={shape.id} shape={shape} />
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      {gradientOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: gradient || "linear-gradient(135deg, rgba(26, 86, 219, 0.05) 0%, rgba(59, 130, 246, 0.02) 50%, rgba(139, 92, 246, 0.05) 100%)",
          }}
        />
      )}

      {/* Blur overlay */}
      {blur !== "none" && (
        <div className={cn("absolute inset-0", blurClass)} />
      )}

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * HeroBackground - Pre-configured for hero sections
 */
export function HeroBackground({ 
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <AnimatedBackground
      pattern="dots"
      patternColor="rgba(26, 86, 219, 0.15)"
      patternOpacity={0.6}
      floatingShapes
      shapeCount={12}
      heroGradient
      className={className}
    >
      {children}
    </AnimatedBackground>
  );
}

/**
 * SectionBackground - Pre-configured for section backgrounds
 */
export function SectionBackground({
  className,
  children,
  variant = "light",
}: {
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark" | "gradient";
}) {
  return (
    <AnimatedBackground
      pattern="dots"
      patternColor={variant === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(26, 86, 219, 0.08)"}
      patternOpacity={0.5}
      gradientOverlay={variant === "gradient"}
      className={className}
    >
      {children}
    </AnimatedBackground>
  );
}

/**
 * CardBackground - Subtle background for cards
 */
export function CardBackground({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <AnimatedBackground
      pattern="dots-sm"
      patternColor="rgba(26, 86, 219, 0.08)"
      patternOpacity={0.4}
      className={cn("rounded-xl", className)}
    >
      {children}
    </AnimatedBackground>
  );
}

export default AnimatedBackground;
