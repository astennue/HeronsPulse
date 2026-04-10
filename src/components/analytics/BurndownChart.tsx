'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInDays, addDays } from 'date-fns';

// Types
interface DayData {
  date: Date;
  plannedRemaining: number;
  actualRemaining: number;
  completed: number;
  added: number;
}

interface BurndownChartProps {
  projectStartDate?: Date;
  projectEndDate?: Date;
  totalTasks?: number;
  completedTasks?: number;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: Date | null;
    createdAt: Date;
    completedAt?: Date | null;
  }>;
}

// Generate burndown data from tasks
function generateBurndownData(
  tasks: BurndownChartProps['tasks'],
  startDate: Date,
  endDate: Date,
  totalPoints: number
): DayData[] {
  if (!tasks || tasks.length === 0) {
    // Generate sample data if no tasks
    const days: DayData[] = [];
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const dailyReduction = totalPoints / totalDays;

    for (let i = 0; i <= totalDays; i++) {
      const date = addDays(startDate, i);
      const plannedRemaining = Math.max(0, totalPoints - dailyReduction * i);
      const actualRemaining = Math.max(0, plannedRemaining + (Math.random() - 0.3) * 10);

      days.push({
        date,
        plannedRemaining: Math.round(plannedRemaining * 10) / 10,
        actualRemaining: Math.round(actualRemaining * 10) / 10,
        completed: Math.round((totalPoints - actualRemaining) * 10) / 10,
        added: i > 0 ? Math.round(Math.random() * 3) : 0,
      });
    }
    return days;
  }

  const days: DayData[] = [];
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const dailyReduction = totalPoints / totalDays;

  // Track completion by date
  const completionsByDate = new Map<string, number>();
  const additionsByDate = new Map<string, number>();

  tasks.forEach((task) => {
    const createdDate = format(new Date(task.createdAt), 'yyyy-MM-dd');
    additionsByDate.set(createdDate, (additionsByDate.get(createdDate) || 0) + 1);

    if (task.completedAt) {
      const completedDate = format(new Date(task.completedAt), 'yyyy-MM-dd');
      completionsByDate.set(completedDate, (completionsByDate.get(completedDate) || 0) + 1);
    }
  });

  let runningTotal = totalPoints;
  let completedSoFar = 0;

  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const plannedRemaining = Math.max(0, totalPoints - dailyReduction * i);

    const completedToday = completionsByDate.get(dateStr) || 0;
    const addedToday = additionsByDate.get(dateStr) || 0;

    completedSoFar += completedToday;
    runningTotal = runningTotal - completedToday + addedToday;

    days.push({
      date,
      plannedRemaining: Math.round(plannedRemaining * 10) / 10,
      actualRemaining: Math.round(runningTotal * 10) / 10,
      completed: completedSoFar,
      added: addedToday,
    });
  }

  return days;
}

// Calculate velocity
function calculateVelocity(
  tasks: BurndownChartProps['tasks'],
  weeksBack: number = 4
): { week: string; completed: number; planned: number }[] {
  const weeks: { week: string; completed: number; planned: number }[] = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = addDays(now, -((i + 1) * 7));
    const weekEnd = addDays(now, -(i * 7));
    const weekLabel = format(weekStart, 'MMM d');

    let completed = 0;
    let planned = 0;

    tasks?.forEach((task) => {
      const createdAt = new Date(task.createdAt);
      if (createdAt >= weekStart && createdAt < weekEnd) {
        planned++;
      }
      if (task.completedAt) {
        const completedAt = new Date(task.completedAt);
        if (completedAt >= weekStart && completedAt < weekEnd) {
          completed++;
        }
      }
    });

    weeks.push({ week: weekLabel, completed, planned });
  }

  return weeks;
}

export function BurndownChart({
  projectStartDate,
  projectEndDate,
  totalTasks = 20,
  completedTasks = 8,
  tasks,
}: BurndownChartProps) {
  const [viewType, setViewType] = useState<'burndown' | 'velocity'>('burndown');

  // Calculate dates
  const startDate = projectStartDate || addDays(new Date(), -14);
  const endDate = projectEndDate || addDays(new Date(), 7);
  const totalPoints = totalTasks || 20;

  // Generate burndown data
  const burndownData = useMemo(() => {
    const data = generateBurndownData(tasks, startDate, endDate, totalPoints);
    return data.map((d) => ({
      ...d,
      dateLabel: format(d.date, 'MMM d'),
    }));
  }, [tasks, startDate, endDate, totalPoints]);

  // Calculate velocity
  const velocityData = useMemo(() => {
    return calculateVelocity(tasks, 6);
  }, [tasks]);

  // Calculate average velocity
  const avgVelocity =
    velocityData.length > 0
      ? velocityData.reduce((acc, w) => acc + w.completed, 0) / velocityData.length
      : 0;

  // Calculate burndown status
  const lastData = burndownData[burndownData.length - 1];
  const burndownStatus =
    lastData && lastData.actualRemaining <= lastData.plannedRemaining
      ? 'ahead'
      : lastData && lastData.actualRemaining > lastData.plannedRemaining + 5
        ? 'behind'
        : 'on-track';

  // Calculate projected completion
  const projectedDays = lastData
    ? Math.ceil(lastData.actualRemaining / (avgVelocity / 7))
    : 0;
  const projectedCompletion = addDays(new Date(), projectedDays);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {viewType === 'burndown' ? (
                <>
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Sprint Burndown
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Velocity Tracking
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {viewType === 'burndown'
                ? 'Track remaining work over time'
                : 'Weekly completion rate analysis'}
            </CardDescription>
          </div>
          <Tabs
            value={viewType}
            onValueChange={(v) => setViewType(v as 'burndown' | 'velocity')}
          >
            <TabsList className="h-9">
              <TabsTrigger value="burndown" className="text-xs px-3 min-h-[36px]">
                Burndown
              </TabsTrigger>
              <TabsTrigger value="velocity" className="text-xs px-3 min-h-[36px]">
                Velocity
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === 'burndown' ? (
          <>
            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    burndownStatus === 'ahead'
                      ? 'default'
                      : burndownStatus === 'behind'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {burndownStatus === 'ahead' && 'Ahead of Schedule'}
                  {burndownStatus === 'behind' && 'Behind Schedule'}
                  {burndownStatus === 'on-track' && 'On Track'}
                </Badge>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Compares actual progress to the ideal burndown line
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-xs text-muted-foreground">
                Projected completion: {format(projectedCompletion, 'MMM d')}
              </div>
            </div>

            {/* Burndown Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={burndownData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[0, totalPoints]}
                  tick={{ fontSize: 10 }}
                  width={35}
                  label={{
                    value: 'Points',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: 'currentColor' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(1),
                    name === 'actualRemaining'
                      ? 'Actual Remaining'
                      : name === 'plannedRemaining'
                        ? 'Ideal Line'
                        : name,
                  ]}
                />
                {/* Ideal burndown line */}
                <Line
                  type="linear"
                  dataKey="plannedRemaining"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Ideal"
                />
                {/* Actual burndown area */}
                <Area
                  type="monotone"
                  dataKey="actualRemaining"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Actual"
                />
                {/* Added scope */}
                <Bar dataKey="added" fill="#EF4444" opacity={0.5} name="Added" barSize={10} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-500" style={{ borderTop: '2px dashed #6B7280' }} />
                <span>Ideal Burndown</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500" />
                <span>Actual Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-red-500/50 rounded-sm" />
                <span>Scope Added</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Velocity Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{avgVelocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg. Velocity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {velocityData[velocityData.length - 1]?.completed || 0}
                </p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {velocityData.length > 1
                    ? (
                        (velocityData[velocityData.length - 1]?.completed || 0) /
                        (velocityData[velocityData.length - 2]?.completed || 1)
                      ).toFixed(1) + 'x'
                    : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Trend</p>
              </div>
            </div>

            {/* Velocity Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="planned" fill="#3B82F6" opacity={0.5} name="Planned" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Velocity Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/50 rounded-sm" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <span>Completed</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
