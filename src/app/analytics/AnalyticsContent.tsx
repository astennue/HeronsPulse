'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart,
  LineChart,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { getRiskCategory, getWorkloadRecommendation } from '@/lib/utils/workloadIndex';
import { GoalModal, GoalData } from '@/components/modals/GoalModal';

// Mock data
const productivityData = [
  { date: 'Mon', completed: 4, added: 3 },
  { date: 'Tue', completed: 6, added: 5 },
  { date: 'Wed', completed: 3, added: 4 },
  { date: 'Thu', completed: 8, added: 2 },
  { date: 'Fri', completed: 5, added: 6 },
  { date: 'Sat', completed: 2, added: 1 },
  { date: 'Sun', completed: 4, added: 3 },
];

const forecastData = [
  { date: 'Today', score: 62, lower: 55, upper: 70 },
  { date: 'Tomorrow', score: 58, lower: 50, upper: 66 },
  { date: 'Wed', score: 75, lower: 65, upper: 85 },
  { date: 'Thu', score: 72, lower: 62, upper: 82 },
  { date: 'Fri', score: 68, lower: 58, upper: 78 },
  { date: 'Sat', score: 45, lower: 38, upper: 52 },
  { date: 'Sun', score: 42, lower: 35, upper: 49 },
];

const taskDistribution = [
  { name: 'Done', value: 12, color: '#10B981' },
  { name: 'In Progress', value: 5, color: '#F59E0B' },
  { name: 'To Do', value: 8, color: '#3B82F6' },
  { name: 'Backlog', value: 4, color: '#6B7280' },
];

const courseWorkload = [
  { course: 'CS401', tasks: 8, risk: 'high' },
  { course: 'IT301', tasks: 5, risk: 'moderate' },
  { course: 'CS302', tasks: 3, risk: 'low' },
  { course: 'CS405', tasks: 2, risk: 'low' },
];

// Pre-defined heatmap data for SSR consistency - prevents hydration mismatch
const heatmapData = [
  { day: 0, count: 2 }, { day: 1, count: 3 }, { day: 2, count: 1 }, { day: 3, count: 4 }, { day: 4, count: 0 },
  { day: 5, count: 2 }, { day: 6, count: 3 }, { day: 7, count: 1 }, { day: 8, count: 2 }, { day: 9, count: 4 },
  { day: 10, count: 0 }, { day: 11, count: 3 }, { day: 12, count: 2 }, { day: 13, count: 1 }, { day: 14, count: 4 },
  { day: 15, count: 2 }, { day: 16, count: 0 }, { day: 17, count: 3 }, { day: 18, count: 1 }, { day: 19, count: 2 },
  { day: 20, count: 4 }, { day: 21, count: 3 }, { day: 22, count: 0 }, { day: 23, count: 2 }, { day: 24, count: 1 },
  { day: 25, count: 3 }, { day: 26, count: 4 }, { day: 27, count: 2 }, { day: 28, count: 0 }, { day: 29, count: 1 },
  { day: 30, count: 3 }, { day: 31, count: 2 }, { day: 32, count: 4 }, { day: 33, count: 1 }, { day: 34, count: 0 },
];

// ALI Gauge Component
function ALIGauge({ score }: { score: number }) {
  const riskLevel = getRiskCategory(score);
  
  const getColor = () => {
    if (score <= 40) return '#10B981';
    if (score <= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="100%" height="120" viewBox="0 0 200 120" className="max-w-[200px]">
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
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray="251.2"
        />
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: (score / 100) * 180 - 90 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line x1="100" y1="100" x2="100" y2="40" stroke={getColor()} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill={getColor()} />
        </motion.g>
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <span className="text-2xl sm:text-4xl font-bold">{score}</span>
          <span className="text-muted-foreground text-sm sm:text-base">/100</span>
        </motion.div>
        <Badge 
          variant={riskLevel === 'Low' ? 'default' : riskLevel === 'Moderate' ? 'secondary' : 'destructive'}
          className="mt-2 text-xs sm:text-sm"
        >
          {riskLevel} Risk
        </Badge>
      </div>
    </div>
  );
}

// Deadline Heatmap
function DeadlineHeatmap() {
  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count === 3) return 'bg-green-400 dark:bg-green-700';
    if (count === 4) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
      {heatmapData.map((cell, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          className={cn('w-full aspect-square min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] rounded-sm', getIntensity(cell.count))}
          title={`${cell.count} tasks`}
        />
      ))}
    </div>
  );
}

export function AnalyticsContent() {
  const [forecastHorizon, setForecastHorizon] = useState<7 | 14 | 30>(7);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const currentALI = 62;

  const handleSetGoal = (goal: GoalData) => {
    setGoals([...goals, goal]);
    console.log('Goal set:', goal);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your academic workload and productivity</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="min-h-[44px]">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 Days
          </Button>
          <Button size="sm" onClick={() => setIsGoalModalOpen(true)} className="min-h-[44px]">
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
        </div>
      </div>

      {/* Active Goals */}
      {goals.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 text-primary" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {goals.slice(0, 3).map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-sm font-medium truncate flex-1">{goal.title}</p>
                    <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{goal.category}</Badge>
                  </div>
                  <Progress value={0} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Target: {goal.target}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ALI Gauge */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Academic Load Index
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your current workload score</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2 sm:pt-4">
            <ALIGauge score={currentALI} />
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4 px-2">
              {getWorkloadRecommendation(currentALI)}
            </p>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Task Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={130}>
              <RechartsPieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
              {taskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
            <CardDescription className="text-xs sm:text-sm">This week&apos;s performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Completed</span>
              </div>
              <span className="font-bold text-sm sm:text-base">32</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">In Progress</span>
              </div>
              <span className="font-bold text-sm sm:text-base">12</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Overdue</span>
              </div>
              <span className="font-bold text-red-500 text-sm sm:text-base">2</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Productivity</span>
              </div>
              <Badge variant="secondary" className="text-xs">+15%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Productivity Trend */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Productivity Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Tasks completed vs added over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="added" 
                  stackId="2"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload Forecast */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Workload Forecast
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Predicted ALI for the next {forecastHorizon} days</CardDescription>
              </div>
              <Tabs value={forecastHorizon.toString()} onValueChange={(v) => setForecastHorizon(Number(v) as 7 | 14 | 30)}>
                <TabsList className="h-9">
                  <TabsTrigger value="7" className="text-xs px-2 sm:px-3 min-h-[36px]">7D</TabsTrigger>
                  <TabsTrigger value="14" className="text-xs px-2 sm:px-3 min-h-[36px]">14D</TabsTrigger>
                  <TabsTrigger value="30" className="text-xs px-2 sm:px-3 min-h-[36px]">30D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsLineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} className="text-xs" tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1A56DB" 
                  strokeWidth={2}
                  dot={{ fill: '#1A56DB', strokeWidth: 2 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Workload & Deadline Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Course Workload */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Course Workload</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Task distribution by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={courseWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis dataKey="course" type="category" className="text-xs" tick={{ fontSize: 10 }} width={45} />
                <Tooltip />
                <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                  {courseWorkload.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.risk === 'high' ? '#EF4444' :
                        entry.risk === 'moderate' ? '#F59E0B' : '#10B981'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deadline Heatmap */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Deadline Heatmap</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Task density over the next 5 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <DeadlineHeatmap />
            <div className="flex items-center justify-between mt-3 sm:mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-muted" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-green-300 dark:bg-green-800" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-green-500 dark:bg-green-600" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Modal */}
      <GoalModal
        open={isGoalModalOpen}
        onOpenChange={setIsGoalModalOpen}
        onSetGoal={handleSetGoal}
        currentALI={currentALI}
      />
    </div>
  );
}
