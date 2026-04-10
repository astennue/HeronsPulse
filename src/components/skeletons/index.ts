/**
 * Skeleton Loader Components
 * 
 * This module exports all skeleton loader components for HeronPulse Academic OS.
 * These components provide loading placeholders with shimmer animations
 * that match the layout of actual components.
 * 
 * Usage:
 * ```tsx
 * import { DashboardSkeleton, TaskCardSkeleton } from '@/components/skeletons';
 * 
 * // In your component
 * if (isLoading) {
 *   return <DashboardSkeleton />;
 * }
 * ```
 */

// Dashboard skeleton
export { DashboardSkeleton } from './DashboardSkeleton';

// Task card skeleton
export { TaskCardSkeleton, TaskCardSkeletonCompact } from './TaskCardSkeleton';

// Board column and Kanban skeletons
export { 
  BoardColumnSkeleton, 
  KanbanBoardSkeleton,
  BoardHeaderSkeleton,
  BoardToolbarSkeleton 
} from './BoardColumnSkeleton';

// Message skeletons
export { 
  MessageSkeleton,
  MessageListSkeleton,
  ConversationItemSkeleton,
  ConversationListSkeleton,
  ChatHeaderSkeleton,
  MessageInputSkeleton,
  FullMessagesSkeleton
} from './MessageSkeleton';

// Leaderboard skeleton
export { LeaderboardSkeleton } from './LeaderboardSkeleton';

// Calendar skeleton
export { CalendarSkeleton } from './CalendarSkeleton';

// Re-export types for convenience
export type { default as DashboardSkeletonType } from './DashboardSkeleton';
export type { default as TaskCardSkeletonType } from './TaskCardSkeleton';
export type { default as BoardColumnSkeletonType } from './BoardColumnSkeleton';
export type { default as MessageSkeletonType } from './MessageSkeleton';
export type { default as LeaderboardSkeletonType } from './LeaderboardSkeleton';
export type { default as CalendarSkeletonType } from './CalendarSkeleton';
