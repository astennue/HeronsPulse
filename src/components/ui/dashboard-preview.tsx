'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Flame,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== MOCK DASHBOARD PREVIEW ====================
interface DashboardPreviewProps {
  className?: string;
  showAnimation?: boolean;
}

export function DashboardPreview({ className, showAnimation = true }: DashboardPreviewProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Browser Frame */}
      <motion.div
        initial={showAnimation ? { opacity: 0, y: 30, scale: 0.95 } : {}}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative bg-card rounded-2xl shadow-2xl border overflow-hidden"
      >
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
              heronpulse.app/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-40 bg-muted/50 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-full">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-500 font-medium">5 day streak</span>
              </div>
              <div className="h-8 w-20 bg-primary rounded-lg" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* ALI Score */}
            <motion.div
              initial={showAnimation ? { opacity: 0, scale: 0.9 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="col-span-1 p-3 bg-card rounded-xl border"
            >
              <div className="text-xs text-muted-foreground mb-2">ALI Score</div>
              <div className="relative h-16 flex items-end justify-center">
                <svg width="80" height="50" viewBox="0 0 100 60">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                  />
                  <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.62 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="text-lg font-bold">62</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={showAnimation ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-3 bg-card rounded-xl border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold text-green-500">12</div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>+3 this week</span>
              </div>
            </motion.div>

            <motion.div
              initial={showAnimation ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-3 bg-card rounded-xl border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">In Progress</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-500">5</div>
              <div className="h-1 bg-muted rounded mt-2">
                <div className="h-full w-3/5 bg-blue-500 rounded" />
              </div>
            </motion.div>

            <motion.div
              initial={showAnimation ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-3 bg-card rounded-xl border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Overdue</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-xl font-bold text-red-500">2</div>
              <div className="text-xs text-muted-foreground mt-1">Needs attention</div>
            </motion.div>
          </div>

          {/* Recent Tasks */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={showAnimation ? { opacity: 0, x: -20 } : {}}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="p-3 bg-card rounded-xl border"
            >
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Recent Tasks
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Project Proposal', status: 'done', priority: 'high' },
                  { title: 'Literature Review', status: 'in_progress', priority: 'high' },
                  { title: 'System Design', status: 'todo', priority: 'urgent' }
                ].map((task, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-xs',
                      task.priority === 'urgent' && 'border-l-2 border-l-red-500 bg-red-500/5',
                      task.priority === 'high' && 'border-l-2 border-l-orange-500 bg-orange-500/5',
                      task.status === 'done' && 'opacity-60'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      task.status === 'done' && 'bg-green-500 border-green-500 text-white'
                    )}>
                      {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="truncate flex-1">{task.title}</span>
                    <span className="text-muted-foreground">CS401</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={showAnimation ? { opacity: 0, x: 20 } : {}}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="p-3 bg-card rounded-xl border"
            >
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Upcoming
              </div>
              <div className="space-y-2">
                {[
                  { day: 'Mon', date: '15', title: 'Team Meeting', time: '10:00 AM' },
                  { day: 'Wed', date: '17', title: 'Deadline: Proposal', time: '11:59 PM' },
                  { day: 'Fri', date: '19', title: 'Presentation', time: '2:00 PM' }
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">{event.day}</div>
                      <div className="font-bold text-sm">{event.date}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        className="absolute -top-4 -right-4 p-3 bg-green-500 text-white rounded-xl shadow-lg"
      >
        <CheckCircle2 className="w-5 h-5" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: 'spring' }}
        className="absolute -bottom-4 -left-4 px-3 py-2 bg-card border rounded-xl shadow-lg flex items-center gap-2"
      >
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium">5 Day Streak! 🔥</span>
      </motion.div>
    </div>
  );
}

// ==================== MINI DASHBOARD PREVIEW (for smaller spaces) ====================
export function MiniDashboardPreview({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('bg-card rounded-xl border shadow-lg p-4', className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-6 w-16 bg-primary rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg" />
        ))}
      </div>
      <div className="h-20 bg-muted/30 rounded-lg" />
    </motion.div>
  );
}

// ==================== ANIMATED PREVIEW GLOW ====================
export function PreviewGlow({ className }: { className?: string }) {
  return (
    <div className={cn('absolute -inset-4 -z-10', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50" />
    </div>
  );
}

export { DashboardPreview };
