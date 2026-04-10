'use client';

import { cn } from '@/lib/utils';

/**
 * TaskCardSkeleton - Loading skeleton for individual task cards
 * Matches the layout of TaskCard component with:
 * - Title with priority indicator
 * - Tags and due date
 * - Subtask progress
 * - Footer with comments/attachments and assignees
 */

interface TaskCardSkeletonProps {
  className?: string;
  /** Priority level affects the border color indicator */
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  /** Show owner info for Super Admin view */
  showOwner?: boolean;
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

export function TaskCardSkeleton({ 
  className, 
  priority = 'medium',
  showOwner = false,
  index = 0 
}: TaskCardSkeletonProps) {
  const priorityBorderClasses = {
    urgent: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-blue-500',
    low: 'border-l-gray-500',
    none: 'border-l-transparent',
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border bg-card/50 cursor-pointer transition-shadow',
        'border-l-4',
        priorityBorderClasses[priority],
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with title and menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-7 w-7 rounded shrink-0" />
      </div>

      {/* Owner info (Super Admin view) */}
      {showOwner && (
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-3 w-24" />
        </div>
      )}

      {/* Tags and due date */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Skeleton className="h-5 w-12 rounded" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Subtask progress */}
      <div className="mb-2 space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1 w-full rounded-full" />
      </div>

      {/* Footer with comments/attachments and assignees */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Comments */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-4" />
          </div>
          {/* Attachments */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-4" />
          </div>
        </div>
        
        {/* Assignees */}
        <div className="flex -space-x-2">
          <AvatarSkeleton size="sm" />
          <AvatarSkeleton size="sm" />
          <AvatarSkeleton size="sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * TaskCardSkeletonCompact - A more compact version for list views
 */
export function TaskCardSkeletonCompact({ 
  className,
  index = 0 
}: { 
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border bg-card/50',
        'border-l-4 border-l-blue-500',
        className
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
      <Skeleton className="h-5 w-14 rounded shrink-0" />
    </div>
  );
}

export default TaskCardSkeleton;
