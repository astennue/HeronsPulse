'use client';

import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  FolderKanban, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Target,
  Search,
  FileText,
  Users,
  Award,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'tasks' | 'projects' | 'messages' | 'calendar' | 'analytics' | 'goals' | 'search' | 'documents' | 'team' | 'achievements';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyStateConfigs: Record<string, {
  icon: LucideIcon;
  title: string;
  description: string;
  illustration: string;
}> = {
  tasks: {
    icon: ClipboardList,
    title: 'No tasks yet',
    description: 'Create your first task to start organizing your academic work.',
    illustration: '📋',
  },
  projects: {
    icon: FolderKanban,
    title: 'No projects found',
    description: 'Start a new project to collaborate and track progress.',
    illustration: '🗂️',
  },
  messages: {
    icon: MessageSquare,
    title: 'No messages',
    description: 'Start a conversation with your team or classmates.',
    illustration: '💬',
  },
  calendar: {
    icon: Calendar,
    title: 'No events scheduled',
    description: 'Add deadlines and events to your calendar.',
    illustration: '📅',
  },
  analytics: {
    icon: BarChart3,
    title: 'No data available',
    description: 'Complete some tasks to see your analytics.',
    illustration: '📊',
  },
  goals: {
    icon: Target,
    title: 'No goals set',
    description: 'Set your academic goals to stay motivated.',
    illustration: '🎯',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
    illustration: '🔍',
  },
  documents: {
    icon: FileText,
    title: 'No documents',
    description: 'Upload or create documents to get started.',
    illustration: '📄',
  },
  team: {
    icon: Users,
    title: 'No team members',
    description: 'Invite team members to collaborate on projects.',
    illustration: '👥',
  },
  achievements: {
    icon: Award,
    title: 'No achievements yet',
    description: 'Complete tasks and maintain streaks to earn badges!',
    illustration: '🏆',
  },
};

export function EmptyState({ type, title, description, action, className }: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="relative">
          {/* Background circle */}
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
          
          {/* Icon container */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
            <span className="text-4xl">{config.illustration}</span>
          </div>
        </div>
      </motion.div>

      {/* Text */}
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {description || config.description}
        </p>
      </div>

      {/* Action button */}
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button onClick={action.onClick} className="gap-2">
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/10 rounded-full" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/15 rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-primary/5 rounded-full" />
      </div>
    </motion.div>
  );
}

// Smaller inline empty state for tables and lists
export function InlineEmptyState({ 
  message = 'No items to display',
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('py-8 text-center text-muted-foreground', className)}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Skeleton loading state for content
export function LoadingSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
        >
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
