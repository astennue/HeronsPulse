'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  Search, 
  FileX, 
  Bell, 
  CheckCircle2, 
  FolderOpen,
  Calendar,
  Target,
  Trophy,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Empty State Props
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'default' | 'tasks' | 'search' | 'notifications' | 'calendar' | 'achievements';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Floating Animation Wrapper
function FloatingElement({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

// Particle Effects
function Particles({ count = 5, color = 'primary' }: { count?: number; color?: string }) {
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 2
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            'absolute rounded-full',
            color === 'primary' && 'bg-primary/20',
            color === 'success' && 'bg-green-500/20',
            color === 'warning' && 'bg-yellow-500/20'
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
}

// Default Illustration
function DefaultIllustration({ icon: Icon }: { icon?: LucideIcon }) {
  const IconComponent = Icon || Inbox;
  
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <Particles count={6} />
      
      {/* Background circles */}
      <motion.div
        className="absolute inset-0 rounded-full bg-muted/50"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-muted"
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Icon */}
      <FloatingElement>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-primary" />
          </div>
        </div>
      </FloatingElement>
    </div>
  );
}

// Tasks Illustration
function TasksIllustration() {
  return (
    <div className="relative w-40 h-32 mx-auto mb-6">
      <Particles count={8} color="success" />
      
      {/* Task cards */}
      <motion.div
        className="absolute top-0 left-0 w-24 h-12 bg-card rounded-lg border shadow-sm p-2"
        animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="h-2 bg-muted rounded w-3/4 mb-1" />
        <div className="h-2 bg-muted rounded w-1/2" />
      </motion.div>
      
      <motion.div
        className="absolute top-8 right-0 w-20 h-10 bg-card rounded-lg border shadow-sm p-2"
        animate={{ y: [0, 5, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <div className="h-2 bg-muted rounded w-full" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-0 left-8 w-28 h-14 bg-card rounded-lg border shadow-sm p-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500/20" />
          <div className="h-2 bg-muted rounded flex-1" />
        </div>
        <div className="h-2 bg-muted rounded w-2/3" />
      </motion.div>
    </div>
  );
}

// Search Illustration
function SearchIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <Particles count={5} />
      
      {/* Magnifying glass */}
      <FloatingElement>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-muted-foreground/30 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Search className="w-8 h-8 text-muted-foreground/50" />
          </motion.div>
          <motion.div
            className="absolute w-6 h-12 bg-muted-foreground/30 rounded-full origin-top"
            style={{ transform: 'rotate(45deg) translateY(30px)' }}
          />
        </div>
      </FloatingElement>
      
      {/* Question marks */}
      <motion.div
        className="absolute top-2 right-4 text-2xl text-muted-foreground/30 font-bold"
        animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ?
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-2 text-xl text-muted-foreground/20 font-bold"
        animate={{ opacity: [0.2, 0.5, 0.2], y: [0, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        ?
      </motion.div>
    </div>
  );
}

// Notifications Illustration
function NotificationsIllustration() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <Particles count={6} color="warning" />
      
      {/* Bell */}
      <FloatingElement>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell className="w-16 h-16 text-muted-foreground/30" />
          </motion.div>
        </div>
      </FloatingElement>
      
      {/* Zzz */}
      <motion.div
        className="absolute top-4 right-4 text-lg text-muted-foreground/40 font-bold"
        animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        z
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 text-sm text-muted-foreground/30 font-bold"
        animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}
      >
        z
      </motion.div>
      <motion.div
        className="absolute top-12 right-10 text-xs text-muted-foreground/20 font-bold"
        animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
      >
        z
      </motion.div>
    </div>
  );
}

// Calendar Illustration
function CalendarIllustration() {
  return (
    <div className="relative w-36 h-32 mx-auto mb-6">
      <Particles count={5} />
      
      {/* Calendar */}
      <FloatingElement>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-28 bg-card rounded-lg border shadow-sm overflow-hidden"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {/* Header */}
            <div className="h-8 bg-primary/10 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>
            {/* Grid */}
            <div className="p-2 grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    i === 5 ? 'bg-primary/30' : 'bg-muted'
                  )}
                  animate={i === 5 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </FloatingElement>
    </div>
  );
}

// Achievements Illustration
function AchievementsIllustration() {
  return (
    <div className="relative w-36 h-32 mx-auto mb-6">
      <Particles count={8} color="warning" />
      
      {/* Trophy */}
      <FloatingElement>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Trophy className="w-16 h-16 text-yellow-500/50" />
          </motion.div>
        </div>
      </FloatingElement>
      
      {/* Stars */}
      <motion.div
        className="absolute top-4 left-4 text-xl"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute top-8 right-6 text-sm"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-6 text-xs"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        ⭐
      </motion.div>
    </div>
  );
}

// Main Empty State Component
export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration = 'default',
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20'
  };

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const descSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderIllustration = () => {
    switch (illustration) {
      case 'tasks':
        return <TasksIllustration />;
      case 'search':
        return <SearchIllustration />;
      case 'notifications':
        return <NotificationsIllustration />;
      case 'calendar':
        return <CalendarIllustration />;
      case 'achievements':
        return <AchievementsIllustration />;
      default:
        return <DefaultIllustration icon={icon} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {renderIllustration()}
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn('font-semibold text-foreground mb-2', titleSizeClasses[size])}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn('text-muted-foreground max-w-sm mb-4', descSizeClasses[size])}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={action.onClick} className="min-h-[44px]">
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset Empty States
export function EmptyTasks({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      illustration="tasks"
      title="No tasks yet"
      description="Create your first task to start organizing your work"
      action={onCreateTask ? { label: 'Create Task', onClick: onCreateTask } : undefined}
    />
  );
}

export function EmptySearchResults({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      illustration="search"
      title="No results found"
      description={query ? `No results for "${query}". Try a different search term.` : 'Try a different search term'}
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      illustration="notifications"
      title="All caught up!"
      description="You have no new notifications at the moment"
    />
  );
}

export function EmptyCalendar() {
  return (
    <EmptyState
      illustration="calendar"
      title="No upcoming events"
      description="Your calendar is clear for the selected period"
    />
  );
}

export function EmptyAchievements() {
  return (
    <EmptyState
      illustration="achievements"
      title="No badges yet"
      description="Complete tasks and maintain streaks to earn your first badge!"
    />
  );
}

export function EmptyCompletedTasks() {
  return (
    <EmptyState
      icon={CheckCircle2}
      title="No completed tasks"
      description="Tasks you complete will appear here"
    />
  );
}

export function EmptyProjects({ onCreateProject }: { onCreateProject?: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create a project to organize your tasks and collaborate with others"
      action={onCreateProject ? { label: 'Create Project', onClick: onCreateProject } : undefined}
    />
  );
}

export function EmptyGoals({ onCreateGoal }: { onCreateGoal?: () => void }) {
  return (
    <EmptyState
      icon={Target}
      title="No goals set"
      description="Define your academic goals to track your progress"
      action={onCreateGoal ? { label: 'Set a Goal', onClick: onCreateGoal } : undefined}
    />
  );
}

export { EmptyState };
