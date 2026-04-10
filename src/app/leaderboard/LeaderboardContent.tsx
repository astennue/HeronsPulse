'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Target, 
  CheckCircle2,
  Crown,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getInitials, generateDefaultAvatar } from '@/lib/utils/avatar';

// Mock leaderboard data for different time periods
const leaderboardDataByPeriod = {
  week: [
    { rank: 1, name: 'Reiner Nuevas', tasksCompleted: 12, deadlinesMet: 11, streak: 5, score: 350, badges: ['first_task', 'streak_7', 'deadline_destroyer'] },
    { rank: 2, name: 'Maria Santos', tasksCompleted: 10, deadlinesMet: 9, streak: 4, score: 280, badges: ['first_task', 'streak_7'] },
    { rank: 3, name: 'John Doe', tasksCompleted: 8, deadlinesMet: 7, streak: 3, score: 220, badges: ['first_task', 'early_bird'] },
    { rank: 4, name: 'Alice Martinez', tasksCompleted: 7, deadlinesMet: 6, streak: 2, score: 190, badges: ['first_task'] },
    { rank: 5, name: 'Bob Wilson', tasksCompleted: 6, deadlinesMet: 5, streak: 2, score: 160, badges: ['first_task'] },
    { rank: 6, name: 'Carol Davis', tasksCompleted: 5, deadlinesMet: 5, streak: 1, score: 140, badges: ['first_task'] },
    { rank: 7, name: 'David Brown', tasksCompleted: 4, deadlinesMet: 4, streak: 1, score: 110, badges: ['first_task'] },
    { rank: 8, name: 'Eva Garcia', tasksCompleted: 3, deadlinesMet: 3, streak: 1, score: 80, badges: [] },
  ],
  month: [
    { rank: 1, name: 'Maria Santos', tasksCompleted: 38, deadlinesMet: 36, streak: 12, score: 980, badges: ['first_task', 'streak_7', 'deadline_destroyer'] },
    { rank: 2, name: 'Reiner Nuevas', tasksCompleted: 35, deadlinesMet: 33, streak: 10, score: 890, badges: ['first_task', 'streak_7', 'early_bird'] },
    { rank: 3, name: 'Alice Martinez', tasksCompleted: 32, deadlinesMet: 30, streak: 8, score: 720, badges: ['first_task'] },
    { rank: 4, name: 'John Doe', tasksCompleted: 28, deadlinesMet: 25, streak: 5, score: 650, badges: ['first_task'] },
    { rank: 5, name: 'Bob Wilson', tasksCompleted: 25, deadlinesMet: 24, streak: 4, score: 580, badges: ['first_task'] },
    { rank: 6, name: 'Carol Davis', tasksCompleted: 22, deadlinesMet: 20, streak: 3, score: 520, badges: ['first_task'] },
    { rank: 7, name: 'David Brown', tasksCompleted: 18, deadlinesMet: 16, streak: 2, score: 420, badges: ['first_task'] },
    { rank: 8, name: 'Eva Garcia', tasksCompleted: 15, deadlinesMet: 14, streak: 1, score: 380, badges: [] },
  ],
  all: [
    { rank: 1, name: 'Reiner Nuevas', tasksCompleted: 145, deadlinesMet: 138, streak: 45, score: 3250, badges: ['first_task', 'streak_7', 'deadline_destroyer', 'early_bird'] },
    { rank: 2, name: 'Maria Santos', tasksCompleted: 128, deadlinesMet: 120, streak: 38, score: 2980, badges: ['first_task', 'streak_7', 'deadline_destroyer'] },
    { rank: 3, name: 'John Doe', tasksCompleted: 115, deadlinesMet: 105, streak: 25, score: 2450, badges: ['first_task', 'streak_7', 'early_bird'] },
    { rank: 4, name: 'Alice Martinez', tasksCompleted: 98, deadlinesMet: 90, streak: 18, score: 2120, badges: ['first_task'] },
    { rank: 5, name: 'Bob Wilson', tasksCompleted: 85, deadlinesMet: 78, streak: 12, score: 1850, badges: ['first_task'] },
    { rank: 6, name: 'Carol Davis', tasksCompleted: 72, deadlinesMet: 68, streak: 8, score: 1580, badges: ['first_task'] },
    { rank: 7, name: 'David Brown', tasksCompleted: 58, deadlinesMet: 52, streak: 5, score: 1250, badges: ['first_task'] },
    { rank: 8, name: 'Eva Garcia', tasksCompleted: 45, deadlinesMet: 40, streak: 3, score: 980, badges: [] },
  ],
};

const badgeInfo: Record<string, { name: string; icon: string; color: string }> = {
  first_task: { name: 'First Step', icon: '🎯', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  streak_7: { name: 'Week Warrior', icon: '🔥', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  deadline_destroyer: { name: 'Deadline Destroyer', icon: '💀', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  early_bird: { name: 'Early Bird', icon: '🌅', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
};

export function LeaderboardContent() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  // Get the appropriate leaderboard data based on filter - FIXED
  const leaderboardData = useMemo(() => {
    return leaderboardDataByPeriod[timeFilter] || leaderboardDataByPeriod.all;
  }, [timeFilter]);

  // Get stats for current period
  const periodStats = useMemo(() => {
    if (leaderboardData.length === 0) return null;
    const topUser = leaderboardData[0];
    const totalTasks = leaderboardData.reduce((sum, user) => sum + user.tasksCompleted, 0);
    const avgScore = Math.round(leaderboardData.reduce((sum, user) => sum + user.score, 0) / leaderboardData.length);
    return { topUser, totalTasks, avgScore };
  }, [leaderboardData]);

  const topThree = leaderboardData.slice(0, 3);
  const restOfBoard = leaderboardData.slice(3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {timeFilter === 'week' && 'See how you rank this week'}
            {timeFilter === 'month' && 'See how you rank this month'}
            {timeFilter === 'all' && 'See how you rank among your peers'}
          </p>
        </div>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
          <TabsList className="h-11">
            <TabsTrigger value="week" className="text-xs sm:text-sm min-h-[44px] px-3 sm:px-4">This Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm min-h-[44px] px-3 sm:px-4">This Month</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm min-h-[44px] px-3 sm:px-4">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Period Stats */}
      {periodStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="glass-card">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Top Performer</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{periodStats.topUser.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Tasks Completed</p>
                  <p className="font-semibold text-sm sm:text-base">{periodStats.totalTasks} tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Average Score</p>
                  <p className="font-semibold text-sm sm:text-base">{periodStats.avgScore} points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* 2nd Place */}
        <motion.div
          key={`second-${timeFilter}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-2 sm:order-1"
        >
          {topThree[1] && (
            <Card className="glass-card text-center pt-4 sm:pt-6">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                    <AvatarImage src={generateDefaultAvatar(topThree[1].name)} alt={topThree[1].name} />
                    <AvatarFallback className="text-base sm:text-lg bg-gray-200 dark:bg-gray-700">
                      {getInitials(topThree[1].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{topThree[1].name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{topThree[1].score} points</p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {topThree[1].tasksCompleted} tasks
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Flame className="h-3 w-3" />
                    {topThree[1].streak} streak
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 1st Place */}
        <motion.div
          key={`first-${timeFilter}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 sm:order-2"
        >
          {topThree[0] && (
            <Card className="glass-card text-center pt-4 sm:pt-6 border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-yellow-500/50">
                    <AvatarImage src={generateDefaultAvatar(topThree[0].name)} alt={topThree[0].name} />
                    <AvatarFallback className="text-lg sm:text-xl bg-yellow-500 text-yellow-950">
                      {getInitials(topThree[0].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg">{topThree[0].name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{topThree[0].score} points</p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {topThree[0].tasksCompleted} tasks
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs bg-orange-500/10 text-orange-500">
                    <Flame className="h-3 w-3" />
                    {topThree[0].streak} streak
                  </Badge>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-500 mx-auto animate-pulse" />
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          key={`third-${timeFilter}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-3"
        >
          {topThree[2] && (
            <Card className="glass-card text-center pt-4 sm:pt-6">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                    <AvatarImage src={generateDefaultAvatar(topThree[2].name)} alt={topThree[2].name} />
                    <AvatarFallback className="text-base sm:text-lg bg-amber-600/20">
                      {getInitials(topThree[2].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{topThree[2].name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{topThree[2].score} points</p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {topThree[2].tasksCompleted} tasks
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Flame className="h-3 w-3" />
                    {topThree[2].streak} streak
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Full Leaderboard */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Full Rankings
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {timeFilter === 'week' && 'Your position among all students this week'}
            {timeFilter === 'month' && 'Your position among all students this month'}
            {timeFilter === 'all' && 'Your position among all students'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={`${user.name}-${timeFilter}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors min-h-[60px]',
                  user.rank === 1 && 'bg-yellow-500/5 border border-yellow-500/20',
                  user.rank !== 1 && 'hover:bg-muted/50'
                )}
              >
                {/* Rank */}
                <div className="w-8 sm:w-10 text-center flex-shrink-0">
                  {user.rank <= 3 ? (
                    <span className="text-xl sm:text-2xl">{['🥇', '🥈', '🥉'][user.rank - 1]}</span>
                  ) : (
                    <span className="text-base sm:text-lg font-semibold text-muted-foreground">{user.rank}</span>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={generateDefaultAvatar(user.name)} alt={user.name} />
                    <AvatarFallback className={cn(
                      'text-xs sm:text-sm',
                      user.rank === 1 && 'bg-yellow-500 text-yellow-950',
                      user.rank === 2 && 'bg-gray-300 text-gray-800',
                      user.rank === 3 && 'bg-amber-600 text-white',
                      user.rank > 3 && 'bg-primary text-primary-foreground'
                    )}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{user.tasksCompleted} tasks</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {user.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                  {user.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="text-lg" title={badgeInfo[badge]?.name}>
                      {badgeInfo[badge]?.icon}
                    </span>
                  ))}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-base sm:text-lg">{user.score}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Available Achievements
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Badges you can earn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(badgeInfo).map(([key, badge]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border min-h-[80px] sm:min-h-[88px]',
                  badge.color
                )}
              >
                <span className="text-2xl sm:text-3xl">{badge.icon}</span>
                <p className="text-xs sm:text-sm font-medium text-center">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
