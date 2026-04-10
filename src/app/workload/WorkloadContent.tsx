'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

// Types
interface ALIPrediction {
  date: string;
  ali_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
}

interface WorkloadData {
  user_id: string;
  current_ali: number;
  current_risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  forecast_7day: ALIPrediction[];
  forecast_14day: ALIPrediction[];
  forecast_30day: ALIPrediction[];
  peak_date: string | null;
  peak_score: number | null;
  recommendations: string[];
  activityData?: {
    active_tasks: number;
    tasks_due_in_7_days: number;
    graded_tasks_weight: number;
    overlapping_deadlines: number;
    thesis_active: boolean;
    org_memberships: number;
    org_positions: number;
    work_hours_per_week: number;
  };
  factors?: {
    task_density: number;
    assessment_intensity: number;
    deadline_clustering: number;
    research_load: number;
    extracurricular_load: number;
    part_time_work: number;
  };
  mlServiceHealthy?: boolean;
}

// ALI Gauge Component
function ALIGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return '#10B981';
      case 'Moderate':
        return '#F59E0B';
      case 'High':
        return '#EF4444';
      case 'Critical':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const riskLevel =
    score <= 40 ? 'Low' : score <= 70 ? 'Moderate' : score <= 85 ? 'High' : 'Critical';
  const color = getRiskColor(riskLevel);

  const dimensions = size === 'lg' ? { width: 200, height: 120 } : { width: 120, height: 80 };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="max-w-full"
      >
        {/* Background arc */}
        <path
          d={`M 20 ${dimensions.height - 20} A ${dimensions.width - 40} ${dimensions.width - 40} 0 0 1 ${dimensions.width - 20} ${dimensions.height - 20}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted"
        />
        {/* Animated arc */}
        <motion.path
          d={`M 20 ${dimensions.height - 20} A ${dimensions.width - 40} ${dimensions.width - 40} 0 0 1 ${dimensions.width - 20} ${dimensions.height - 20}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeDasharray="251.2"
        />
        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: (score / 100) * 180 - 90 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{
            transformOrigin: `${dimensions.width / 2}px ${dimensions.height - 20}px`,
          }}
        >
          <line
            x1={dimensions.width / 2}
            y1={dimensions.height - 20}
            x2={dimensions.width / 2}
            y2={size === 'lg' ? 35 : 25}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height - 20}
            r={size === 'lg' ? 8 : 5}
            fill={color}
          />
        </motion.g>
      </svg>

      <div className="absolute bottom-0 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <span className={size === 'lg' ? 'text-4xl font-bold' : 'text-2xl font-bold'}>
            {score}
          </span>
          <span className="text-muted-foreground text-sm">/100</span>
        </motion.div>
        <Badge
          variant={
            riskLevel === 'Low'
              ? 'default'
              : riskLevel === 'Moderate'
                ? 'secondary'
                : 'destructive'
          }
          className="mt-1"
        >
          {riskLevel} Risk
        </Badge>
      </div>
    </div>
  );
}

// Factor Radar Chart
function FactorRadar({ factors }: { factors: Record<string, number> }) {
  const data = [
    { factor: 'Tasks', value: (factors.task_density || 0) * 100, fullMark: 100 },
    { factor: 'Assessments', value: (factors.assessment_intensity || 0) * 100, fullMark: 100 },
    { factor: 'Deadlines', value: (factors.deadline_clustering || 0) * 100, fullMark: 100 },
    { factor: 'Research', value: (factors.research_load || 0) * 100, fullMark: 100 },
    { factor: 'Extra', value: (factors.extracurricular_load || 0) * 100, fullMark: 100 },
    { factor: 'Work', value: (factors.part_time_work || 0) * 100, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data}>
        <PolarGrid stroke="currentColor" className="text-muted" />
        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar
          name="Load"
          dataKey="value"
          stroke="#F59E0B"
          fill="#F59E0B"
          fillOpacity={0.4}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Risk Alert Component
function RiskAlert({
  riskLevel,
  peakDate,
  peakScore,
}: {
  riskLevel: string;
  peakDate: string | null;
  peakScore: number | null;
}) {
  if (riskLevel === 'Low') return null;

  const getAlertVariant = () => {
    switch (riskLevel) {
      case 'Moderate':
        return 'default';
      case 'High':
        return 'destructive';
      case 'Critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {riskLevel === 'Critical' && 'Critical Workload Alert'}
        {riskLevel === 'High' && 'High Workload Warning'}
        {riskLevel === 'Moderate' && 'Moderate Workload Notice'}
      </AlertTitle>
      <AlertDescription>
        {riskLevel === 'Critical' && (
          <span>
            Your workload is at a critical level. Immediate action is recommended.{' '}
            {peakDate && (
              <span>
                Peak expected on {format(parseISO(peakDate), 'MMM d')} with ALI score of{' '}
                {peakScore?.toFixed(0)}.
              </span>
            )}
          </span>
        )}
        {riskLevel === 'High' && (
          <span>
            Your workload is high. Consider prioritizing tasks and managing your time carefully.
          </span>
        )}
        {riskLevel === 'Moderate' && (
          <span>
            Your workload is manageable but elevated. Stay organized to maintain balance.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Recommendation Card
function RecommendationCard({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
    >
      <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <p className="text-sm">{text}</p>
    </motion.div>
  );
}

// Loading Skeleton
function WorkloadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function WorkloadContent() {
  const [workload, setWorkload] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastHorizon, setForecastHorizon] = useState<7 | 14 | 30>(7);

  const fetchWorkload = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workload');
      if (!response.ok) {
        throw new Error('Failed to fetch workload data');
      }
      const data = await response.json();
      setWorkload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  if (loading) {
    return <WorkloadSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Workload</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={fetchWorkload}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!workload) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No workload data available</p>
      </div>
    );
  }

  const getForecastData = () => {
    switch (forecastHorizon) {
      case 7:
        return workload.forecast_7day;
      case 14:
        return workload.forecast_14day;
      case 30:
        return workload.forecast_30day;
      default:
        return workload.forecast_7day;
    }
  };

  const forecastData = getForecastData().map((p) => ({
    date: format(parseISO(p.date), 'MMM d'),
    score: p.ali_score,
    confidence: p.confidence * 100,
    risk: p.risk_level,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Workload Analysis
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            AI-powered Academic Load Index predictions
          </p>
        </div>
        <Button onClick={fetchWorkload} variant="outline" size="sm" className="min-h-[44px]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Risk Alert */}
      <RiskAlert
        riskLevel={workload.current_risk_level}
        peakDate={workload.peak_date}
        peakScore={workload.peak_score}
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ALI Gauge */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Academic Load Index
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your current workload score
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2 sm:pt-4">
            <ALIGauge score={workload.current_ali} />
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Powered by Gradient Boosting Regression
            </div>
          </CardContent>
        </Card>

        {/* Factor Radar */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Factor Analysis
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Six-dimensional ALI factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workload.factors && <FactorRadar factors={workload.factors} />}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Activity Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Current task statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active Tasks</span>
              </div>
              <span className="font-bold">{workload.activityData?.active_tasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Due in 7 Days</span>
              </div>
              <span className="font-bold">{workload.activityData?.tasks_due_in_7_days || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Graded Tasks</span>
              </div>
              <span className="font-bold">{workload.activityData?.graded_tasks_weight || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Deadline Clusters</span>
              </div>
              <span className="font-bold text-red-500">
                {workload.activityData?.overlapping_deadlines || 0}
              </span>
            </div>
            {workload.activityData?.thesis_active && (
              <Badge variant="secondary" className="w-full justify-center">
                Thesis/Capstone Active
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Workload Forecast
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Predicted ALI for the next {forecastHorizon} days
              </CardDescription>
            </div>
            <Tabs
              value={forecastHorizon.toString()}
              onValueChange={(v) => setForecastHorizon(Number(v) as 7 | 14 | 30)}
            >
              <TabsList className="h-9">
                <TabsTrigger value="7" className="text-xs px-3 min-h-[36px]">
                  7D
                </TabsTrigger>
                <TabsTrigger value="14" className="text-xs px-3 min-h-[36px]">
                  14D
                </TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-3 min-h-[36px]">
                  30D
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="aliGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toFixed(1), 'ALI Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#aliGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Risk zones */}
          <div className="flex justify-between mt-4 text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Low (0-40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Moderate (41-70)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High (71-85)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critical (86-100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factor Details & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Factor Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Factor Breakdown</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              How each factor contributes to your ALI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workload.factors && (
              <>
                {[
                  {
                    name: 'Task Density',
                    value: workload.factors.task_density,
                    weight: 0.2,
                    icon: <CheckCircle2 className="h-4 w-4" />,
                  },
                  {
                    name: 'Assessment Intensity',
                    value: workload.factors.assessment_intensity,
                    weight: 0.25,
                    icon: <Target className="h-4 w-4" />,
                  },
                  {
                    name: 'Deadline Clustering',
                    value: workload.factors.deadline_clustering,
                    weight: 0.2,
                    icon: <AlertTriangle className="h-4 w-4" />,
                  },
                  {
                    name: 'Research Load',
                    value: workload.factors.research_load,
                    weight: 0.15,
                    icon: <Activity className="h-4 w-4" />,
                  },
                  {
                    name: 'Extracurricular',
                    value: workload.factors.extracurricular_load,
                    weight: 0.1,
                    icon: <Clock className="h-4 w-4" />,
                  },
                  {
                    name: 'Part-time Work',
                    value: workload.factors.part_time_work,
                    weight: 0.1,
                    icon: <TrendingUp className="h-4 w-4" />,
                  },
                ].map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {factor.icon}
                        {factor.name}
                      </span>
                      <span className="text-muted-foreground">
                        {(factor.value * factor.weight * 100).toFixed(1)} pts
                      </span>
                    </div>
                    <Progress value={factor.value * 100} className="h-2" />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              AI Recommendations
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Personalized suggestions based on your workload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {workload.recommendations.length > 0 ? (
              workload.recommendations.map((rec, index) => (
                <RecommendationCard key={index} text={rec} index={index} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recommendations at this time. Your workload is well balanced!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ML Service Status */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            workload.mlServiceHealthy ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span>ML Service {workload.mlServiceHealthy ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
}
