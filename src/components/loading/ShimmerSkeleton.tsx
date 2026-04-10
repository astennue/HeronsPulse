'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Base Shimmer Effect
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden bg-muted rounded-md', className)}>
      <motion.div
        className="absolute inset-0"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}

// Skeleton Text Line
interface SkeletonTextProps {
  width?: string;
  className?: string;
}

export function SkeletonText({ width = '100%', className }: SkeletonTextProps) {
  return (
    <Shimmer 
      className={cn('h-4', className)} 
      style={{ width }}
    />
  );
}

// Skeleton Circle (for avatars)
interface SkeletonCircleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonCircle({ size = 'md', className }: SkeletonCircleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Shimmer className={cn('rounded-full', sizeClasses[size], className)} />
  );
}

// Skeleton Card
interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ className, showAvatar = true, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn('p-4 rounded-lg border bg-card', className)}>
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <SkeletonCircle size="md" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="40%" />
            <SkeletonText width="60%" className="h-3" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonText 
            key={i} 
            width={i === lines - 1 ? '60%' : '100%'} 
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton Stats Card
interface SkeletonStatsCardProps {
  className?: string;
}

export function SkeletonStatsCard({ className }: SkeletonStatsCardProps) {
  return (
    <div className={cn('p-4 sm:p-6 rounded-lg border bg-card glass-card', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText width="80px" className="h-4" />
          <SkeletonText width="60px" className="h-8" />
        </div>
        <SkeletonCircle size="lg" />
      </div>
      <div className="mt-4">
        <SkeletonText width="100%" className="h-1" />
      </div>
    </div>
  );
}

// Skeleton Task Card
interface SkeletonTaskCardProps {
  className?: string;
}

export function SkeletonTaskCard({ className }: SkeletonTaskCardProps) {
  return (
    <div className={cn('p-3 rounded-lg border bg-card', className)}>
      <div className="flex items-start justify-between mb-2">
        <SkeletonText width="70%" className="h-5" />
        <SkeletonCircle size="sm" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <SkeletonText width="60px" className="h-5" />
        <SkeletonText width="80px" className="h-4" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <SkeletonCircle size="sm" />
          <SkeletonCircle size="sm" />
        </div>
        <div className="flex gap-2">
          <SkeletonText width="20px" className="h-4" />
          <SkeletonText width="20px" className="h-4" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Kanban Column
interface SkeletonKanbanColumnProps {
  className?: string;
  taskCount?: number;
}

export function SkeletonKanbanColumn({ className, taskCount = 3 }: SkeletonKanbanColumnProps) {
  return (
    <div className={cn('p-3 rounded-lg bg-muted/30 min-w-[280px] w-[280px]', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SkeletonCircle size="sm" />
          <SkeletonText width="80px" className="h-5" />
        </div>
        <SkeletonText width="24px" className="h-5" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: taskCount }).map((_, i) => (
          <SkeletonTaskCard key={i} />
        ))}
      </div>
    </div>
  );
}

// Skeleton ALI Gauge
interface SkeletonALIGaugeProps {
  className?: string;
}

export function SkeletonALIGauge({ className }: SkeletonALIGaugeProps) {
  return (
    <div className={cn('flex flex-col items-center p-6', className)}>
      {/* Gauge skeleton */}
      <div className="relative w-32 h-20 mb-4">
        <Shimmer className="absolute bottom-0 left-0 right-0 h-2 rounded-full" 
          style={{ 
            clipPath: 'polygon(0% 100%, 10% 50%, 90% 50%, 100% 100%)' 
          }} 
        />
        <Shimmer className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-12 rounded-full origin-bottom"
          style={{ transform: 'translateX(-50%) rotate(-30deg)' }}
        />
      </div>
      <SkeletonText width="60px" className="h-8" />
      <SkeletonText width="80px" className="h-6 mt-2" />
    </div>
  );
}

// Skeleton Chart
interface SkeletonChartProps {
  className?: string;
  type?: 'line' | 'bar' | 'pie' | 'donut';
}

export function SkeletonChart({ className, type = 'line' }: SkeletonChartProps) {
  if (type === 'pie' || type === 'donut') {
    return (
      <div className={cn('flex items-center justify-center p-6', className)}>
        <Shimmer 
          className="w-32 h-32 rounded-full"
          style={{
            clipPath: type === 'donut' ? 'polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)' : undefined
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('p-4', className)}>
      <div className="flex items-end justify-between h-32 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Shimmer 
            key={i} 
            className={type === 'bar' ? 'w-8' : 'w-2 rounded-full'}
            style={{ 
              height: `${30 + Math.random() * 70}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton Calendar
interface SkeletonCalendarProps {
  className?: string;
}

export function SkeletonCalendar({ className }: SkeletonCalendarProps) {
  return (
    <div className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonText width="120px" className="h-6" />
        <div className="flex gap-2">
          <SkeletonCircle size="sm" />
          <SkeletonCircle size="sm" />
        </div>
      </div>
      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonText key={i} className="h-4 text-center" />
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Shimmer key={i} className="h-16 rounded" />
        ))}
      </div>
    </div>
  );
}

// Skeleton Table
interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ className, rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className={cn('rounded-lg border', className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <SkeletonText className="h-4" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <SkeletonText width={`${60 + Math.random() * 40}%`} className="h-4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton List
interface SkeletonListProps {
  className?: string;
  itemCount?: number;
  showAvatar?: boolean;
}

export function SkeletonList({ className, itemCount = 5, showAvatar = true }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          {showAvatar && <SkeletonCircle size="md" />}
          <div className="flex-1 space-y-2">
            <SkeletonText width="70%" />
            <SkeletonText width="40%" className="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Skeleton
interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText width="200px" className="h-8" />
          <SkeletonText width="300px" className="h-4" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonCircle size="md" />
          <SkeletonText width="100px" className="h-10" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <SkeletonCard className="h-full" />
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard lines={5} />
        </div>
        <div className="space-y-6">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}

// Boards Page Skeleton
interface SkeletonBoardsProps {
  className?: string;
}

export function SkeletonBoards({ className }: SkeletonBoardsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText width="150px" className="h-8" />
          <SkeletonText width="250px" className="h-4" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonCircle size="md" />
          <SkeletonText width="100px" className="h-10" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <SkeletonText width="200px" className="h-10" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonText key={i} width="80px" className="h-10" />
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonKanbanColumn key={i} taskCount={Math.floor(Math.random() * 3) + 2} />
        ))}
      </div>
    </div>
  );
}

export {
  Shimmer,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonStatsCard,
  SkeletonTaskCard,
  SkeletonKanbanColumn,
  SkeletonALIGauge,
  SkeletonChart,
  SkeletonCalendar,
  SkeletonTable,
  SkeletonList,
  SkeletonDashboard,
  SkeletonBoards
};
