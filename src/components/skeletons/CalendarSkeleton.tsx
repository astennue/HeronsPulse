'use client';

import { cn } from '@/lib/utils';

/**
 * CalendarSkeleton - Loading skeleton for the calendar view
 * Matches the layout of CalendarContent with:
 * - Header with title and view mode toggle
 * - Month view with calendar grid
 * - Selected date details sidebar
 * - Upcoming events section
 */

interface CalendarSkeletonProps {
  className?: string;
  /** View mode to display */
  viewMode?: 'month' | 'week' | 'day';
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

// Calendar Day Cell Skeleton
function CalendarDaySkeleton({ 
  hasEvents = false,
  isToday = false,
  isSelected = false 
}: { 
  hasEvents?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
}) {
  return (
    <div
      className={cn(
        'aspect-square sm:aspect-[4/3] min-h-[44px] sm:min-h-[60px] lg:min-h-[80px]',
        'p-0.5 sm:p-1 rounded-lg border flex flex-col',
        isToday && 'border-primary bg-primary/5',
        isSelected && !isToday && 'border-primary bg-primary/10',
        !isToday && !isSelected && 'border-transparent'
      )}
    >
      {/* Date number */}
      <div className={cn(
        'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center',
        isToday && 'bg-primary'
      )}>
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
      </div>
      
      {/* Events (desktop only) */}
      <div className="space-y-0.5 flex-1 hidden sm:block mt-0.5">
        {hasEvents && (
          <>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </>
        )}
      </div>
      
      {/* Mobile event dots */}
      {hasEvents && (
        <div className="flex gap-0.5 mt-auto sm:hidden">
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
        </div>
      )}
    </div>
  );
}

// Event Card Skeleton
function EventCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="p-3 sm:p-4 rounded-lg border-l-4 relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
          </div>
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

// Upcoming Day Card Skeleton
function UpcomingDaySkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="min-w-[120px] sm:min-w-[150px] p-3 rounded-lg border"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="text-center mb-2">
        <Skeleton className="h-3 w-8 mx-auto" />
        <Skeleton className="h-5 w-6 mx-auto mt-1" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

// Month View Skeleton
function MonthViewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6', className)}>
      {/* Calendar Grid */}
      <div className="lg:col-span-2 glass-card rounded-xl border bg-card/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
          <Skeleton className="h-6 sm:h-7 w-32 sm:w-40" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
        
        {/* Day headers */}
        <div className="px-3 sm:px-6">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center py-2 min-h-[36px]">
                <Skeleton className="h-3 sm:h-4 w-4 sm:w-6 mx-auto" />
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 pb-4 sm:pb-6">
            {/* Empty cells for days before month start */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="aspect-square sm:aspect-[4/3] min-h-[44px] sm:min-h-[60px] lg:min-h-[80px] rounded-lg bg-muted/20" 
              />
            ))}
            {/* Month days with deterministic event indicators */}
            {Array.from({ length: 28 }).map((_, i) => (
              <CalendarDaySkeleton 
                key={i} 
                hasEvents={[3, 7, 12, 15, 18, 22, 25].includes(i)}
                isToday={i === 14}
                isSelected={i === 14}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Selected Date Details */}
      <div className="glass-card rounded-xl border bg-card/50 hidden lg:block">
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-20" />
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="h-[400px] space-y-3">
            {[0, 1, 2].map((i) => (
              <EventCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Week View Skeleton
function WeekViewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="glass-card rounded-xl border bg-card/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
          <Skeleton className="h-6 sm:h-7 w-40 sm:w-52" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
        
        {/* Week grid */}
        <div className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className="p-2 sm:p-3 rounded-lg border min-h-[120px] sm:min-h-[160px]"
              >
                <div className="text-center mb-2">
                  <Skeleton className="h-3 w-6 mx-auto" />
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 mx-auto rounded-full mt-1" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Day View Skeleton
function DayViewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="glass-card rounded-xl border bg-card/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-64" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-3 sm:h-4 w-28 mb-4" />
          <div className="max-h-[400px] sm:max-h-[500px] space-y-3 sm:space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick date picker (mobile only) */}
      <div className="glass-card rounded-xl border bg-card/50 lg:hidden">
        <div className="px-4 py-4">
          <Skeleton className="h-5 w-20 mb-3" />
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-14 flex-1 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarSkeleton({ 
  className,
  viewMode = 'month'
}: CalendarSkeletonProps) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
            <Skeleton className="h-4 sm:h-5 w-40 sm:w-52" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="hidden xs:flex items-center border rounded-lg p-1">
              <Skeleton className="h-9 w-16 rounded" />
              <Skeleton className="h-9 w-16 rounded" />
              <Skeleton className="h-9 w-16 rounded" />
            </div>
            <Skeleton className="h-10 w-16 rounded" />
            <Skeleton className="h-10 w-20 sm:w-28 rounded" />
          </div>
        </div>

        {/* Mobile View Mode Toggle */}
        <div className="flex xs:hidden items-center border rounded-lg p-1">
          <Skeleton className="h-11 flex-1 rounded" />
          <Skeleton className="h-11 flex-1 rounded" />
          <Skeleton className="h-11 flex-1 rounded" />
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'month' && <MonthViewSkeleton />}
      {viewMode === 'week' && <WeekViewSkeleton />}
      {viewMode === 'day' && <DayViewSkeleton />}

      {/* Upcoming Events Section */}
      <div className="glass-card rounded-xl border bg-card/50">
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-2">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-36 sm:w-44" />
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Mobile: Grid */}
          <div className="grid grid-cols-2 sm:hidden gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border min-h-[80px]">
                <div className="text-center mb-2">
                  <Skeleton className="h-3 w-6 mx-auto" />
                  <Skeleton className="h-5 w-8 mx-auto mt-1" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ))}
          </div>
          
          {/* Desktop: Horizontal scroll */}
          <div className="hidden sm:flex gap-3 sm:gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <UpcomingDaySkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarSkeleton;
