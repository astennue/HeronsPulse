'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Target,
  Flame,
  BookOpen,
  Calendar,
  ArrowRight,
  Plus,
  BarChart3,
  PieChart,
  Sparkles,
  Zap,
  Timer,
  ChevronRight,
  Lightbulb,
  Loader2,
  Users,
  GraduationCap,
  Link2,
  Copy,
  Check,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getGreeting, getSmartDateLabel } from '@/lib/utils/dateHelpers';
import { getWorkloadRecommendation, getRiskCategory } from '@/lib/utils/workloadIndex';
import { TaskModal, TaskFormData } from '@/components/modals/TaskModal';
import { EmptyState } from '@/components/ui/empty-state';
import { AnimatedCounter, FadeIn, HoverLift } from '@/components/ui/animations';
import { ConfettiBurst } from '@/components/celebrations/ConfettiBurst';
import Link from 'next/link';
import { useUserStats, useTasks, useAnalytics, useProjects, createTask } from '@/hooks/api/useApi';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { usePomodoro } from '@/contexts/PomodoroContext';

// Enhanced ALI Gauge Component with animations
function ALIGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const riskLevel = getRiskCategory(score);
  const rotation = (animatedScore / 100) * 180 - 90;
  
  const getColor = () => {
    if (animatedScore <= 40) return '#10B981';
    if (animatedScore <= 70) return '#F59E0B';
    return '#EF4444';
  };

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.floor(score * easeOutQuart));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="100" viewBox="0 0 200 120" className="w-32 sm:w-40 md:w-44">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: animatedScore / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeDasharray="251.2"
          strokeDashoffset="0"
        />
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 1.5, 
            ease: 'easeOut', 
            delay: 0.5,
            type: 'spring',
            stiffness: 100,
            damping: 10
          }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line x1="100" y1="100" x2="100" y2="40" stroke={getColor()} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill={getColor()} />
        </motion.g>
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{animatedScore}</span>
          <span className="text-muted-foreground text-sm md:text-base">/100</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: 'spring' }}
        >
          <Badge 
            variant={riskLevel === 'Low' ? 'default' : riskLevel === 'Moderate' ? 'secondary' : 'destructive'}
            className="mt-2 text-xs"
          >
            {riskLevel} Risk
          </Badge>
        </motion.div>
      </div>
    </div>
  );
}

// Mini Line Chart Component
function MiniChart({ data, color = '#3B82F6' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        points={areaPoints}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Donut Chart Component
function DonutChart({ data }: { data: { course: string; count: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const arcData = useMemo(() => {
    if (total === 0) return [];
    const startAngle = -90;
    return data.reduce<{ item: typeof data[0]; x1: number; y1: number; x2: number; y2: number; largeArc: number; endAngle: number }[]>((acc, item, index) => {
      const prevEndAngle = index === 0 ? startAngle : acc[index - 1].endAngle;
      const angle = (item.count / total) * 360;
      const endAngle = prevEndAngle + angle;
      
      const startRad = (prevEndAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = 50 + 35 * Math.cos(startRad);
      const y1 = 50 + 35 * Math.sin(startRad);
      const x2 = 50 + 35 * Math.cos(endRad);
      const y2 = 50 + 35 * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      return [...acc, { item, x1, y1, x2, y2, largeArc, endAngle }];
    }, []);
  }, [data, total]);
  
  if (total === 0) {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No tasks</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {arcData.map(({ item, x1, y1, x2, y2, largeArc }, index) => (
          <motion.path
            key={index}
            d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={item.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
        <circle cx="50" cy="50" r="20" fill="var(--background)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold">{total}</span>
      </div>
    </div>
  );
}

// Welcome Banner Component
function WelcomeBanner({ greeting, streak }: { greeting: string; streak: number }) {
  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Let's make today productive!";
    if (hour < 17) return "Keep up the great work!";
    if (hour < 21) return "Finish strong today!";
    return "Great progress today!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-pink-500/10" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
            {greeting}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {getMotivationalMessage()}
          </p>
        </div>
        
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-6 w-6 text-orange-500 streak-fire" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-orange-500">{streak} Day Streak!</p>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Quick Actions Floating Button
function QuickActionsFAB({ onNewTask, onStartTimer }: { onNewTask: () => void; onStartTimer: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Plus, label: 'New Task', onClick: onNewTask, color: 'bg-blue-500' },
    { icon: Timer, label: 'Start Timer', onClick: onStartTimer, color: 'bg-orange-500' },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col-reverse items-end gap-2">
      <AnimatePresence>
        {isOpen && actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow min-h-[44px]`}
          >
            <action.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center min-h-[56px] min-w-[56px] transition-colors ${
          isOpen ? 'bg-muted rotate-45' : 'bg-primary text-primary-foreground'
        }`}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

// Smart Suggestions Panel
function SmartSuggestions({ tasks }: { tasks: any[] }) {
  const suggestions = useMemo(() => {
    const now = new Date();
    const urgentTasks = tasks.filter(t => 
      t.status !== 'done' && 
      t.priority === 'urgent'
    ).slice(0, 2);
    
    const upcomingDeadlines = tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const diff = Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 3;
    }).slice(0, 2);
    
    return [...urgentTasks, ...upcomingDeadlines].slice(0, 3).map(t => ({
      id: t.id,
      title: t.title,
      reason: t.priority === 'urgent' ? 'Urgent priority' : 'Due soon',
      priority: t.priority,
    }));
  }, [tasks]);

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        <h3 className="font-semibold text-sm">Smart Suggestions</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion.id}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              suggestion.priority === 'urgent' 
                ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20' 
                : 'border-primary/30 bg-primary/10 hover:bg-primary/20'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>{suggestion.title}</span>
            <span className="text-xs text-muted-foreground">• {suggestion.reason}</span>
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export function DashboardContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [greeting] = useState(getGreeting());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { togglePomodoro } = usePomodoro();

  // Enrolled classes state
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch real data from APIs
  const { stats, isLoading: statsLoading } = useUserStats();
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { analytics, isLoading: analyticsLoading } = useAnalytics();

  const userRole = (session?.user as any)?.role as string || 'student';
  const isSuperAdmin = userRole === 'super_admin';

  // Fetch enrolled classes
  const fetchEnrolledClasses = useCallback(async () => {
    try {
      setIsLoadingClasses(true);
      const response = await fetch('/api/users/classes');
      const result = await response.json();
      if (result.success && result.data) {
        setEnrolledClasses(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchEnrolledClasses();
    }
  }, [session, fetchEnrolledClasses]);

  // Handle join class via invitation code
  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast({ title: 'Error', description: 'Please enter an invitation code', variant: 'destructive' });
      return;
    }

    try {
      setIsJoining(true);
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });

      const result = await response.json();

      if (result.success) {
        toast({ 
          title: 'Success!', 
          description: `You have joined ${result.data.class.name}` 
        });
        setIsJoinClassOpen(false);
        setJoinCode('');
        fetchEnrolledClasses();
      } else {
        toast({ 
          title: 'Error', 
          description: result.error || 'Failed to join class', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to join class', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  // Calculate derived data
  const dashboardStats = useMemo(() => {
    if (!analytics) {
      return {
        aliScore: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        overdueTasks: 0,
        upcomingDeadlines: 0,
        currentStreak: 0,
        productivityScore: 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        taskDistribution: [],
      };
    }

    const courseColors: Record<string, string> = {
      'CS401': '#3B82F6',
      'IT301': '#10B981',
      'CS302': '#8B5CF6',
      'IT201': '#F59E0B',
      'CS405': '#EC4899',
    };

    const taskDistribution = Object.entries(analytics.tasksByCourse || {}).map(([course, count]) => ({
      course,
      count: count as number,
      color: courseColors[course] || '#6B7280',
    }));

    return {
      aliScore: analytics.aliScore || 0,
      tasksCompleted: analytics.summary?.completedTasks || 0,
      tasksInProgress: analytics.statusDistribution?.in_progress || 0,
      overdueTasks: analytics.summary?.overdueTasks || 0,
      upcomingDeadlines: analytics.summary?.upcomingDeadlines || 0,
      currentStreak: analytics.gamification?.currentStreak || 0,
      productivityScore: Math.round(analytics.gamification?.productivityScore || 0),
      weeklyProgress: analytics.productivityTrend?.map((d: any) => d.completed) || [0, 0, 0, 0, 0, 0, 0],
      taskDistribution,
    };
  }, [analytics]);

  // Recent tasks for display
  const recentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      })
      .slice(0, 5)
      .map(t => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      }));
  }, [tasks]);

  const handleOpenTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = (open: boolean) => {
    setIsTaskModalOpen(open);
  };

  const handleCreateTask = async (data: TaskFormData) => {
    if (projects.length === 0) {
      toast({
        title: 'No Project Available',
        description: 'Please create a project first before adding tasks. Projects help organize your work!',
        variant: 'destructive',
      });
      return;
    }

    const result = await createTask({
      title: data.title,
      description: data.description,
      projectId: projects[0].id, // Use first project
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: data.dueDate?.toISOString(),
      courseCode: data.courseCode,
    });

    if (result.success) {
      setIsTaskModalOpen(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
      mutateTasks();
    }
  };

  const handleStartTimer = () => {
    togglePomodoro();
  };

  // Loading state
  if (statsLoading && tasksLoading && analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden pb-20 md:pb-0">
      <ConfettiBurst trigger={showConfetti} />
      
      <WelcomeBanner greeting={greeting} streak={dashboardStats.currentStreak} />

      {!isSuperAdmin && <SmartSuggestions tasks={tasks} />}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* ALI Score Card */}
        <div className="xs:col-span-2 lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardDescription className="text-xs sm:text-sm">Academic Load Index</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center px-4 sm:px-6 pb-4 sm:pb-6">
              <ALIGauge score={dashboardStats.aliScore} />
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4 px-2">
                {getWorkloadRecommendation(dashboardStats.aliScore)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="xs:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
            <HoverLift>
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-500">
                        <AnimatedCounter value={dashboardStats.tasksCompleted} />
                      </p>
                    </div>
                    <motion.div 
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>Keep going!</span>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>

            <HoverLift>
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">In Progress</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-500">
                        <AnimatedCounter value={dashboardStats.tasksInProgress} />
                      </p>
                    </div>
                    <motion.div 
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </motion.div>
                  </div>
                  <Progress value={60} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </HoverLift>

            <HoverLift>
              <Card className={`glass-card ${dashboardStats.overdueTasks > 0 ? 'border-red-500/20' : ''}`}>
                <CardContent className="p-3 sm:p-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Overdue</p>
                      <p className={`text-xl sm:text-2xl font-bold ${dashboardStats.overdueTasks > 0 ? 'text-red-500' : ''}`}>
                        <AnimatedCounter value={dashboardStats.overdueTasks} />
                      </p>
                    </div>
                    <motion.div 
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 ${dashboardStats.overdueTasks > 0 ? 'bg-red-500/10' : 'bg-muted'}`}
                      animate={dashboardStats.overdueTasks > 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 ${dashboardStats.overdueTasks > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </motion.div>
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${dashboardStats.overdueTasks > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    <TrendingDown className="h-3 w-3" />
                    <span>{dashboardStats.overdueTasks > 0 ? 'Needs attention' : 'All good!'}</span>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>

            <HoverLift>
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        <AnimatedCounter value={dashboardStats.upcomingDeadlines} />
                      </p>
                    </div>
                    <motion.div 
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                      whileHover={{ rotate: 15 }}
                    >
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Due within 7 days</p>
                </CardContent>
              </Card>
            </HoverLift>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="glass-card">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Your productivity this week</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-32 sm:h-40">
              <MiniChart data={dashboardStats.weeklyProgress} color="var(--primary)" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <span key={i} className={i === 6 ? 'font-bold text-primary' : ''}>{day}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Task Distribution
            </CardTitle>
            <CardDescription>Tasks by course</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <DonutChart data={dashboardStats.taskDistribution} />
              <div className="flex-1 space-y-2">
                {dashboardStats.taskDistribution.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">{item.course}</span>
                    <span className="text-xs sm:text-sm font-medium ml-auto">{item.count}</span>
                  </motion.div>
                ))}
                {dashboardStats.taskDistribution.length === 0 && (
                  <p className="text-xs text-muted-foreground">No tasks yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses Section - For Students */}
      {!isSuperAdmin && userRole === 'student' && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 sm:py-6 gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                My Courses
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your enrolled classes this semester</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsJoinClassOpen(true)}
              className="shrink-0 min-h-[36px]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Join Class</span>
              <span className="sm:hidden">Join</span>
            </Button>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {isLoadingClasses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : enrolledClasses.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledClasses.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{cls.name}</h3>
                              <p className="text-xs text-muted-foreground">{cls.subjectCode}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{cls.section}</Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {cls.schedule && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{cls.schedule}</span>
                              </div>
                            )}
                            {cls.room && (
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                <span>{cls.room}</span>
                              </div>
                            )}
                            {cls.owner && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                <span>{cls.owner.displayName || 'Instructor'}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{cls.studentCount || 0} students</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">You haven't joined any classes yet</p>
                <Button onClick={() => setIsJoinClassOpen(true)} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join a Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 sm:py-6 gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Recent Tasks</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your active tasks and deadlines</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0 min-h-[36px] group">
                <Link href="/boards">
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {recentTasks.length > 0 ? (
                <ScrollArea className="h-[250px] sm:h-[300px] pr-2 sm:pr-4">
                  <div className="space-y-2 sm:space-y-3">
                    {recentTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                          task.priority === 'urgent' ? 'border-l-4 border-l-red-500 bg-red-500/5' :
                          task.priority === 'high' ? 'border-l-4 border-l-orange-500 bg-orange-500/5' :
                          task.priority === 'medium' ? 'border-l-4 border-l-blue-500 bg-blue-500/5' :
                          'border-l-4 border-l-gray-500 bg-gray-500/5'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                            {task.courseCode && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{task.courseCode}</Badge>
                            )}
                            {task.dueDate && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                {getSmartDateLabel(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            task.status === 'done' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }
                          className="text-[10px] sm:text-xs shrink-0 capitalize"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <EmptyState
                  illustration="tasks"
                  title="No tasks yet"
                  description="Create your first task to get started"
                  action={{ label: 'Create Task', onClick: handleOpenTaskModal }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="glass-card">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                Productivity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl sm:text-4xl font-bold">
                  <AnimatedCounter value={dashboardStats.productivityScore} />
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={dashboardStats.productivityScore} className="h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {dashboardStats.productivityScore >= 70 
                  ? "You're performing above average! Keep it up! 🎉"
                  : dashboardStats.productivityScore >= 40
                  ? "Making progress! Stay focused! 💪"
                  : "Let's boost your productivity! 🚀"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projects</span>
                <span className="font-bold">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-bold">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Points</span>
                <span className="font-bold text-primary">{analytics?.gamification?.totalPoints || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!isSuperAdmin && (
        <QuickActionsFAB 
          onNewTask={handleOpenTaskModal}
          onStartTimer={handleStartTimer}
        />
      )}

      <TaskModal
        key={isTaskModalOpen ? 'open' : 'closed'}
        open={isTaskModalOpen}
        onOpenChange={handleCloseTaskModal}
        onSubmit={handleCreateTask}
        mode="create"
      />
    </div>
  );
}
