'use client';

import { cn } from '@/lib/utils';

/**
 * BoardColumnSkeleton - Loading skeleton for Kanban board columns
 * Matches the layout of Kanban columns with:
 * - Column header with icon, title, and count
 * - Multiple task card skeletons
 */

interface BoardColumnSkeletonProps {
  className?: string;
  /** Number of task cards to show */
  cards?: number;
  /** Column color theme */
  color?: 'slate' | 'blue' | 'yellow' | 'purple' | 'green';
  /** Index for staggered animation */
  index?: number;
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
function AvatarSkeleton({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  };

  return <Skeleton className={cn(sizeClasses[size], 'rounded-full')} />;
}

// Task Card Skeleton (inline for BoardColumn)
function TaskSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="p-3 rounded-lg border bg-card/50 space-y-2 border-l-4 border-l-blue-500"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Title */}
      <Skeleton className="h-4 w-full" />
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-1">
        <AvatarSkeleton size="sm" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function BoardColumnSkeleton({ 
  className, 
  cards = 3,
  color = 'blue',
  index = 0 
}: BoardColumnSkeletonProps) {
  const colorClasses = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <div 
      className={cn('w-72 flex-shrink-0', className)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-2">
        <Skeleton className={cn('h-4 w-4 rounded', colorClasses[color])} />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      
      {/* Task cards */}
      <div className="space-y-2">
        {Array.from({ length: cards }).map((_, i) => (
          <TaskSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * KanbanBoardSkeleton - Full Kanban board skeleton with multiple columns
 */
export function KanbanBoardSkeleton({ className }: { className?: string }) {
  const columns = [
    { color: 'slate' as const, cards: 2 },
    { color: 'blue' as const, cards: 3 },
    { color: 'yellow' as const, cards: 2 },
    { color: 'purple' as const, cards: 1 },
    { color: 'green' as const, cards: 2 },
  ];

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((col, i) => (
        <BoardColumnSkeleton 
          key={i} 
          color={col.color} 
          cards={col.cards} 
          index={i} 
        />
      ))}
    </div>
  );
}

/**
 * BoardHeaderSkeleton - Skeleton for the board header section
 */
export function BoardHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4', className)}>
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-7 sm:h-8 md:h-9 w-24 sm:w-32" />
        <Skeleton className="h-4 sm:h-5 w-40 sm:w-52" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-24 sm:w-28 rounded-md" />
      </div>
    </div>
  );
}

/**
 * BoardToolbarSkeleton - Skeleton for the board toolbar (search, filters, tabs)
 */
export function BoardToolbarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:gap-4', className)}>
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Skeleton className="h-10 w-full sm:max-w-64 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
      </div>
    </div>
  );
}

export default BoardColumnSkeleton;
