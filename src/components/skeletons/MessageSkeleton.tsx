'use client';

import { cn } from '@/lib/utils';

/**
 * MessageSkeleton - Loading skeleton for chat messages
 * Matches the layout of message bubbles with:
 * - Avatar
 * - Sender name and timestamp
 * - Message content bubble
 */

interface MessageSkeletonProps {
  className?: string;
  /** Whether this is the current user's message (right-aligned) */
  isOwn?: boolean;
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
function AvatarSkeleton() {
  return <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" />;
}

export function MessageSkeleton({ 
  className, 
  isOwn = false,
  index = 0 
}: MessageSkeletonProps) {
  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3',
        isOwn && 'flex-row-reverse',
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <AvatarSkeleton />
      
      {/* Message content */}
      <div className={cn(
        'flex flex-col gap-1 max-w-[75%] sm:max-w-[70%]',
        isOwn && 'items-end'
      )}>
        {/* Sender and time */}
        <div className={cn(
          'flex items-center gap-2 flex-wrap',
          isOwn && 'flex-row-reverse'
        )}>
          {!isOwn && <Skeleton className="h-4 w-24" />}
          <Skeleton className="h-3 w-12" />
        </div>
        
        {/* Message bubble */}
        <Skeleton 
          className={cn(
            'h-10 sm:h-12 w-40 sm:w-56 rounded-2xl',
            isOwn ? 'rounded-br-md' : 'rounded-bl-md'
          )} 
        />
      </div>
    </div>
  );
}

/**
 * MessageListSkeleton - Skeleton for a list of messages
 */
export function MessageListSkeleton({ 
  className,
  count = 5 
}: { 
  className?: string;
  count?: number;
}) {
  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton 
          key={i} 
          isOwn={i % 3 === 0} 
          index={i} 
        />
      ))}
    </div>
  );
}

/**
 * ConversationItemSkeleton - Skeleton for a conversation list item
 */
export function ConversationItemSkeleton({ 
  className,
  index = 0 
}: { 
  className?: string;
  index?: number;
}) {
  return (
    <div 
      className={cn(
        'w-full flex items-center gap-2 sm:gap-3 px-3 py-3 rounded-lg',
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Channel icon or avatar */}
      <Skeleton className="h-5 w-5 rounded" />
      
      {/* Conversation name */}
      <Skeleton className="h-4 flex-1 max-w-32" />
      
      {/* Unread badge */}
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  );
}

/**
 * ConversationListSkeleton - Skeleton for the conversation sidebar
 */
export function ConversationListSkeleton({ 
  className 
}: { 
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Channels section */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <ConversationItemSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
      
      {/* Separator */}
      <Skeleton className="h-px w-full" />
      
      {/* Direct Messages section */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <ConversationItemSkeleton key={i} index={i + 3} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ChatHeaderSkeleton - Skeleton for the chat header
 */
export function ChatHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <div className="flex items-center gap-2 min-w-0">
        <Skeleton className="h-10 w-10 rounded md:hidden" />
        <Skeleton className="h-5 w-5 rounded hidden sm:block" />
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-5 w-24 sm:w-32" />
          <Skeleton className="h-3 w-16 hidden sm:block" />
        </div>
        <Skeleton className="h-5 w-10 rounded hidden sm:block" />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Skeleton className="h-9 w-16 sm:w-20 rounded hidden sm:block" />
        <Skeleton className="h-10 w-10 rounded sm:hidden" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
    </div>
  );
}

/**
 * MessageInputSkeleton - Skeleton for the message input area
 */
export function MessageInputSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-2 p-3 sm:p-4 border-t', className)}>
      <Skeleton className="h-11 w-11 rounded" />
      <Skeleton className="h-11 flex-1 rounded-md" />
      <Skeleton className="h-11 w-11 rounded" />
    </div>
  );
}

/**
 * FullMessagesSkeleton - Complete messages page skeleton
 */
export function FullMessagesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-[calc(100vh-120px)] gap-0 sm:gap-4', className)}>
      {/* Desktop Sidebar */}
      <div className="w-64 lg:w-72 flex-shrink-0 hidden md:block rounded-xl border bg-card/50">
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <ConversationListSkeleton />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 rounded-xl border bg-card/50">
        {/* Header */}
        <div className="border-b p-3 sm:p-4">
          <ChatHeaderSkeleton />
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden">
          <MessageListSkeleton count={4} />
        </div>
        
        {/* Input */}
        <MessageInputSkeleton />
      </div>
    </div>
  );
}

export default MessageSkeleton;
