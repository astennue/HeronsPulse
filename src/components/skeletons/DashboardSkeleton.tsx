'use client';

import { cn } from '@/lib/utils';

/**
 * DashboardSkeleton - Loading skeleton for the main dashboard
 * Matches the layout of DashboardContent with:
 * - Header section
 * - Stats grid (ALI gauge + quick stats)
 * - Recent tasks card
 * - Productivity and activity cards
 */

interface DashboardSkeletonProps {
  className?: string;
}

// Base skeleton with shimmer effect
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-muted/50 rounded-md animate-pulse relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        'before:-translate-x-full before:animate-[shimmer_2s_infinite]',
        className
      )}
    />
  );
}

// ALI Gauge Skeleton
function ALIGaugeSkeleton() {
  return (
    <div className="flex flex-col items-center py-4">
      {/* Gauge arc skeleton */}
      <div className="relative w-32 sm:w-40 h-24 sm:h-28">
        <Skeleton className="absolute inset-0 rounded-full" />
        <div className="absolute inset-4 bg-card rounded-full" />
      </div>
      {/* Score placeholder */}
      <Skeleton className="h-8 w-16 mt-2" />
      {/* Risk badge */}
      <Skeleton className="h-5 w-16 mt-2 rounded-full" />
      {/* Recommendation text */}
      <Skeleton className="h-3 w-32 mt-3" />
    </div>
  );
}

// Stats Card Skeleton
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'p-3 sm:p-4 rounded-xl border bg-card/50 glass-card',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        </div>
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
      </div>
      <div className="mt-2 sm:mt-3">
        <Skeleton className="h-3 w-20 sm:w-24" />
      </div>
    </div>
  );
}

// Task Item Skeleton
function TaskItemSkeleton({ index }: { index: number }) {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border bg-card/50',
        'border-l-4'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-14 rounded" />
    </div>
  );
}

// Activity Item Skeleton
function ActivityItemSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="flex items-start gap-2 sm:gap-3"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-4 sm:space-y-6 max-w-full overflow-x-hidden', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-7 sm:h-8 md:h-9 w-40 sm:w-48" />
          <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak badge skeleton */}
          <Skeleton className="h-8 sm:h-9 w-20 sm:w-24 rounded-full" />
          {/* Button skeleton */}
          <Skeleton className="h-10 w-20 sm:w-24 rounded-md" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* ALI Score Card */}
        <div className="xs:col-span-2 lg:col-span-1">
          <div className="glass-card h-full rounded-xl border bg-card/50">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-1 sm:pb-2">
              <Skeleton className="h-4 w-32" />
            </div>
            <ALIGaugeSkeleton />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="xs:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl border bg-card/50">
            <div className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 sm:py-6 gap-2">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
              </div>
              <Skeleton className="h-8 w-16 sm:w-20 rounded" />
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-[250px] sm:h-[300px] space-y-2 sm:space-y-3 overflow-hidden">
                {[0, 1, 2, 3, 4].map((i) => (
                  <TaskItemSkeleton key={i} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Productivity */}
        <div className="space-y-4 sm:space-y-6">
          {/* Productivity Score */}
          <div className="glass-card rounded-xl border bg-card/50">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
              </div>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 sm:h-10 w-12 sm:w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-52" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-xl border bg-card/50">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-[150px] sm:h-[180px] space-y-3 sm:space-y-4">
                {[0, 1, 2].map((i) => (
                  <ActivityItemSkeleton key={i} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
