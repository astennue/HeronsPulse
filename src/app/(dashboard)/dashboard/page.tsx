'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getGreeting, getSmartDateLabel } from '@/lib/utils/dateHelpers';
import { getWorkloadRecommendation, getRiskCategory } from '@/lib/utils/workloadIndex';

// Mock data for demo
const mockStats = {
  aliScore: 62,
  tasksCompleted: 12,
  tasksInProgress: 5,
  overdueTasks: 2,
  upcomingDeadlines: 8,
  currentStreak: 5,
  productivityScore: 78,
};

const mockRecentTasks = [
  { id: '1', title: 'Complete Project Proposal', status: 'done', priority: 'high', dueDate: new Date(Date.now() - 86400000), course: 'CS401' },
  { id: '2', title: 'Literature Review', status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 3 * 86400000), course: 'CS401' },
  { id: '3', title: 'System Architecture Design', status: 'todo', priority: 'urgent', dueDate: new Date(Date.now() + 7 * 86400000), course: 'CS401' },
  { id: '4', title: 'Database Schema', status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 10 * 86400000), course: 'CS401' },
  { id: '5', title: 'UI Mockups', status: 'backlog', priority: 'low', dueDate: new Date(Date.now() + 14 * 86400000), course: 'CS401' },
];

const mockActivity = [
  { id: '1', action: 'completed task', entity: 'Project Proposal Draft', time: '2 hours ago' },
  { id: '2', action: 'commented on', entity: 'Literature Review', time: '4 hours ago' },
  { id: '3', action: 'joined project', entity: 'CS Capstone 2026', time: '1 day ago' },
];

// ALI Gauge Component
function ALIGauge({ score }: { score: number }) {
  const riskLevel = getRiskCategory(score);
  const rotation = (score / 100) * 180 - 90;
  
  const getColor = () => {
    if (score <= 40) return '#10B981';
    if (score <= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted"
        />
        {/* Colored arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray="251.2"
          strokeDashoffset="0"
        />
        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
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
          transition={{ delay: 1 }}
        >
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-muted-foreground">/100</span>
        </motion.div>
        <Badge 
          variant={riskLevel === 'Low' ? 'default' : riskLevel === 'Moderate' ? 'secondary' : 'destructive'}
          className="mt-2"
        >
          {riskLevel} Risk
        </Badge>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [greeting] = useState(getGreeting());

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{greeting}! 👋</h1>
          <p className="text-muted-foreground">Here's your academic workload overview</p>
        </div>
        <div className="flex items-center gap-3">
          {mockStats.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full"
            >
              <Flame className="h-4 w-4 text-orange-500 streak-fire" />
              <span className="text-sm font-medium text-orange-500">{mockStats.currentStreak} day streak</span>
            </motion.div>
          )}
          <Button>
            <Target className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* ALI Score Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardDescription>Academic Load Index</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ALIGauge score={mockStats.aliScore} />
              <p className="text-sm text-muted-foreground text-center mt-4">
                {getWorkloadRecommendation(mockStats.aliScore)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
            {/* Tasks Completed */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-500">{mockStats.tasksCompleted}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3 this week</span>
                </div>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-500">{mockStats.tasksInProgress}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <Progress value={60} className="mt-2 h-1" />
              </CardContent>
            </Card>

            {/* Overdue */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-500">{mockStats.overdueTasks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-red-500">
                  <TrendingDown className="h-3 w-3" />
                  <span>Needs attention</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold">{mockStats.upcomingDeadlines}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Due within 7 days</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your active tasks and deadlines</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/boards">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {mockRecentTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.priority === 'urgent' ? 'border-l-4 border-l-red-500 bg-red-500/5' :
                        task.priority === 'high' ? 'border-l-4 border-l-orange-500 bg-orange-500/5' :
                        task.priority === 'medium' ? 'border-l-4 border-l-blue-500 bg-blue-500/5' :
                        'border-l-4 border-l-gray-500 bg-gray-500/5'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{task.course}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {getSmartDateLabel(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          task.status === 'done' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity & Productivity */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Productivity Score */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Productivity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl font-bold">{mockStats.productivityScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={mockStats.productivityScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                You're performing above average! Keep it up!
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                <div className="space-y-4">
                  {mockActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="text-muted-foreground">{activity.action}</span>{' '}
                          <span className="font-medium">{activity.entity}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
