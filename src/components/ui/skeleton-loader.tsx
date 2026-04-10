"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SkeletonLoader Component
 * 
 * Animated skeleton placeholders with shimmer effect for loading states.
 * Multiple variants for different UI elements:
 * - text: For text lines
 * - avatar: For user avatars
 * - card: For card placeholders
 * - button: For buttons
 * - image: For images
 * - stats: For statistics widgets
 */

interface SkeletonBaseProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

// Base skeleton with shimmer effect
function SkeletonBase({ className, animate = true, style }: SkeletonBaseProps) {
  return (
    <div
      style={style}
      className={cn(
        "bg-muted rounded-md",
        animate && "skeleton-shimmer",
        className
      )}
    />
  );
}

/**
 * TextSkeleton - Loading placeholder for text content
 */
export function TextSkeleton({
  lines = 3,
  className,
  animate = true,
}: {
  lines?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          animate={animate}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * AvatarSkeleton - Loading placeholder for avatars
 */
export function AvatarSkeleton({
  size = "md",
  className,
  animate = true,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <SkeletonBase
      animate={animate}
      className={cn(sizeClasses[size], "rounded-full", className)}
    />
  );
}

/**
 * ButtonSkeleton - Loading placeholder for buttons
 */
export function ButtonSkeleton({
  size = "md",
  variant = "default",
  className,
  animate = true,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "icon" | "pill";
  className?: string;
  animate?: boolean;
}) {
  const sizeClasses = {
    sm: variant === "icon" ? "h-8 w-8" : "h-8 w-20",
    md: variant === "icon" ? "h-10 w-10" : "h-10 w-24",
    lg: variant === "icon" ? "h-12 w-12" : "h-12 w-32",
  };

  const radiusClasses = {
    default: "rounded-md",
    icon: "rounded-md",
    pill: "rounded-full",
  };

  return (
    <SkeletonBase
      animate={animate}
      className={cn(sizeClasses[size], radiusClasses[variant], className)}
    />
  );
}

/**
 * ImageSkeleton - Loading placeholder for images
 */
export function ImageSkeleton({
  aspectRatio = "16/9",
  className,
  animate = true,
}: {
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "2/3";
  className?: string;
  animate?: boolean;
}) {
  return (
    <SkeletonBase
      animate={animate}
      className={cn("w-full rounded-lg", className)}
      style={{ aspectRatio }}
    />
  );
}

/**
 * CardSkeleton - Loading placeholder for cards
 */
export function CardSkeleton({
  variant = "default",
  className,
  animate = true,
}: {
  variant?: "default" | "compact" | "feature" | "stats";
  className?: string;
  animate?: boolean;
}) {
  if (variant === "compact") {
    return (
      <div className={cn("p-4 rounded-lg border bg-card", className)}>
        <div className="flex items-center gap-3">
          <AvatarSkeleton size="sm" animate={animate} />
          <div className="flex-1 space-y-2">
            <SkeletonBase animate={animate} className="h-4 w-3/4" />
            <SkeletonBase animate={animate} className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "feature") {
    return (
      <div className={cn("p-6 rounded-xl border bg-card card-lift", className)}>
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBase animate={animate} className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <SkeletonBase animate={animate} className="h-5 w-32 mb-2" />
            <SkeletonBase animate={animate} className="h-3 w-20" />
          </div>
        </div>
        <TextSkeleton lines={2} animate={animate} />
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className={cn("p-4 rounded-lg border bg-card", className)}>
        <div className="flex items-center justify-between mb-2">
          <SkeletonBase animate={animate} className="h-4 w-20" />
          <SkeletonBase animate={animate} className="h-8 w-8 rounded-full" />
        </div>
        <SkeletonBase animate={animate} className="h-8 w-24 mb-1" />
        <SkeletonBase animate={animate} className="h-3 w-32" />
      </div>
    );
  }

  // Default card
  return (
    <div className={cn("p-6 rounded-xl border bg-card", className)}>
      <div className="space-y-4">
        <ImageSkeleton animate={animate} className="h-40" />
        <div className="space-y-2">
          <SkeletonBase animate={animate} className="h-5 w-3/4" />
          <TextSkeleton lines={2} animate={animate} />
        </div>
        <div className="flex gap-2">
          <ButtonSkeleton size="sm" animate={animate} />
          <ButtonSkeleton size="sm" animate={animate} />
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeleton - Loading placeholder for tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  animate = true,
}: {
  rows?: number;
  columns?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border", className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonBase
              key={i}
              animate={animate}
              className="h-4 flex-1"
            />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b last:border-0 p-4"
        >
          <div className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase
                key={colIndex}
                animate={animate}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "h-10 w-10 rounded-full flex-none"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ListSkeleton - Loading placeholder for lists
 */
export function ListSkeleton({
  items = 4,
  showAvatar = true,
  className,
  animate = true,
}: {
  items?: number;
  showAvatar?: boolean;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-card border"
        >
          {showAvatar && <AvatarSkeleton size="md" animate={animate} />}
          <div className="flex-1 space-y-2">
            <SkeletonBase animate={animate} className="h-4 w-2/3" />
            <SkeletonBase animate={animate} className="h-3 w-1/2" />
          </div>
          <SkeletonBase animate={animate} className="h-8 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton - Loading placeholder for dashboard layouts
 */
export function DashboardSkeleton({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} variant="stats" animate={animate} />
        ))}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - larger */}
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton animate={animate} />
          <ListSkeleton items={3} animate={animate} />
        </div>
        
        {/* Right column - smaller */}
        <div className="space-y-6">
          <CardSkeleton variant="compact" animate={animate} />
          <CardSkeleton variant="compact" animate={animate} />
          <CardSkeleton variant="compact" animate={animate} />
        </div>
      </div>
    </div>
  );
}

/**
 * KanbanColumnSkeleton - Loading placeholder for Kanban columns
 */
export function KanbanColumnSkeleton({
  cards = 3,
  className,
  animate = true,
}: {
  cards?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("w-72 flex-shrink-0", className)}>
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-2">
        <SkeletonBase animate={animate} className="h-4 w-4 rounded" />
        <SkeletonBase animate={animate} className="h-5 w-24" />
        <SkeletonBase animate={animate} className="h-5 w-5 rounded-full" />
      </div>
      
      {/* Cards */}
      <div className="space-y-2">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-card border space-y-2"
          >
            <SkeletonBase animate={animate} className="h-4 w-full" />
            <div className="flex gap-2">
              <SkeletonBase animate={animate} className="h-5 w-12 rounded-full" />
              <SkeletonBase animate={animate} className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <AvatarSkeleton size="sm" animate={animate} />
              <SkeletonBase animate={animate} className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FormSkeleton - Loading placeholder for forms
 */
export function FormSkeleton({
  fields = 4,
  className,
  animate = true,
}: {
  fields?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase animate={animate} className="h-4 w-24" />
          <SkeletonBase animate={animate} className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <ButtonSkeleton animate={animate} />
        <ButtonSkeleton animate={animate} />
      </div>
    </div>
  );
}

/**
 * SkeletonGroup - Group multiple skeletons with staggered animation
 */
export function SkeletonGroup({
  children,
  className,
  stagger = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={cn("space-y-4", className)}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={cn(stagger && `stagger-${(index % 8) + 1}`)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export { SkeletonBase };
export default SkeletonBase;
