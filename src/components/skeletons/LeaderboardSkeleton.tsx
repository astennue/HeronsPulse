'use client';

import { cn } from '@/lib/utils';

/**
 * LeaderboardSkeleton - Loading skeleton for the leaderboard page
 * Matches the layout of LeaderboardContent with:
 * - Header with title and time filters
 * - Stats cards
 * - Top 3 podium
 * - Full rankings list
 * - Available badges section
 */

interface LeaderboardSkeletonProps {
  className?: string;
  /** Show current user rank card */
  showUserRank?: boolean;
  /** Show viewer notice for faculty/admin */
  showViewerNotice?: boolean;
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

// Circular Avatar Skeleton
function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'h-9 w-9 sm:h-10 sm:w-10',
    md: 'h-14 w-14 sm:h-16 sm:w-16',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-16 w-16 sm:h-20 sm:w-20',
  };

  return <Skeleton className={cn(sizeClasses[size], 'rounded-full')} />;
}

// Podium Card Skeleton
function PodiumCardSkeleton({ 
  position, 
  className 
}: { 
  position: 'first' | 'second' | 'third';
  className?: string;
}) {
  const isWinner = position === 'first';
  
  return (
    <div 
      className={cn(
        'glass-card text-center pt-4 sm:pt-6 rounded-xl border',
        isWinner && 'border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent',
        className
      )}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Avatar with medal */}
        <div className="relative inline-block">
          <AvatarSkeleton size={isWinner ? 'lg' : 'md'} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <Skeleton className={cn(
              'rounded',
              position === 'first' ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-5 w-5 sm:h-6 sm:w-6'
            )} />
          </div>
        </div>
        
        {/* Name and score */}
        <div className="space-y-1">
          <Skeleton className={cn(
            'mx-auto',
            isWinner ? 'h-5 w-24 sm:h-6 sm:w-28' : 'h-4 w-20 sm:h-5 sm:w-24'
          )} />
          <Skeleton className="h-3 sm:h-4 w-16 mx-auto" />
        </div>
        
        {/* Badges */}
        <div className="flex justify-center gap-2 flex-wrap px-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        {/* Sparkles icon for winner */}
        {isWinner && <Skeleton className="h-5 w-5 mx-auto rounded" />}
      </div>
    </div>
  );
}

// Leaderboard Entry Skeleton
function LeaderboardEntrySkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-muted/50"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Rank */}
      <div className="w-8 sm:w-10 text-center flex-shrink-0">
        <Skeleton className="h-6 w-6 mx-auto rounded" />
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <AvatarSkeleton size="sm" />
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-4 w-28 sm:w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Badges (desktop only) */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0 space-y-1">
        <Skeleton className="h-5 sm:h-6 w-8 sm:w-10 ml-auto" />
        <Skeleton className="h-3 w-10 ml-auto" />
      </div>
    </div>
  );
}

// Stats Card Skeleton
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card rounded-xl border bg-card/50', className)}>
      <div className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex-shrink-0" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-28" />
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge Card Skeleton
function BadgeCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border border-gray-500/20 bg-gray-500/5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
      <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
    </div>
  );
}

export function LeaderboardSkeleton({ 
  className,
  showUserRank = false,
  showViewerNotice = false
}: LeaderboardSkeletonProps) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 md:h-9 w-32 sm:w-40" />
          <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-11 w-full sm:w-72 rounded-lg" />
      </div>

      {/* Viewer Notice */}
      {showViewerNotice && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1 max-w-md" />
        </div>
      )}

      {/* Current User Rank */}
      {showUserRank && (
        <div className="glass-card rounded-xl border border-primary/30 bg-primary/5">
          <div className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* 2nd Place */}
        <div className="order-2 sm:order-1">
          <PodiumCardSkeleton position="second" />
        </div>

        {/* 1st Place */}
        <div className="order-1 sm:order-2">
          <PodiumCardSkeleton position="first" />
        </div>

        {/* 3rd Place */}
        <div className="order-3">
          <PodiumCardSkeleton position="third" />
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="glass-card rounded-xl border bg-card/50">
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-52" />
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2 max-h-[400px] overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <LeaderboardEntrySkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Available Badges Section */}
      <div className="glass-card rounded-xl border bg-card/50">
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-44" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <BadgeCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardSkeleton;
