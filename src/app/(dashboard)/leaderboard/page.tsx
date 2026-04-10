'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Target, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Crown,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Reiner Nuevas', avatar: null, tasksCompleted: 45, deadlinesMet: 42, streak: 12, score: 1250, badges: ['first_task', 'streak_7', 'deadline_destroyer'] },
  { rank: 2, name: 'Maria Santos', avatar: null, tasksCompleted: 38, deadlinesMet: 36, streak: 8, score: 980, badges: ['first_task', 'streak_7'] },
  { rank: 3, name: 'John Doe', avatar: null, tasksCompleted: 35, deadlinesMet: 32, streak: 5, score: 850, badges: ['first_task', 'early_bird'] },
  { rank: 4, name: 'Alice Martinez', avatar: null, tasksCompleted: 32, deadlinesMet: 30, streak: 4, score: 720, badges: ['first_task'] },
  { rank: 5, name: 'Bob Wilson', avatar: null, tasksCompleted: 28, deadlinesMet: 25, streak: 3, score: 650, badges: ['first_task'] },
  { rank: 6, name: 'Carol Davis', avatar: null, tasksCompleted: 25, deadlinesMet: 24, streak: 2, score: 580, badges: ['first_task'] },
  { rank: 7, name: 'David Brown', avatar: null, tasksCompleted: 22, deadlinesMet: 20, streak: 1, score: 520, badges: ['first_task'] },
  { rank: 8, name: 'Eva Garcia', avatar: null, tasksCompleted: 20, deadlinesMet: 18, streak: 1, score: 480, badges: [] },
];

const badgeInfo: Record<string, { name: string; icon: string; color: string }> = {
  first_task: { name: 'First Step', icon: '🎯', color: 'bg-green-500/10 text-green-500' },
  streak_7: { name: 'Week Warrior', icon: '🔥', color: 'bg-orange-500/10 text-orange-500' },
  deadline_destroyer: { name: 'Deadline Destroyer', icon: '💀', color: 'bg-red-500/10 text-red-500' },
  early_bird: { name: 'Early Bird', icon: '🌅', color: 'bg-yellow-500/10 text-yellow-500' },
};

const rankIcons = [
  <Crown key="1" className="h-6 w-6 text-yellow-500" />,
  <Medal key="2" className="h-6 w-6 text-gray-400" />,
  <Medal key="3" className="h-6 w-6 text-amber-600" />,
];

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among your peers</p>
        </div>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-2 md:order-1"
        >
          <Card className="glass-card text-center pt-6">
            <CardContent className="space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-gray-200 dark:bg-gray-700">MS</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  {rankIcons[1]}
                </div>
              </div>
              <div>
                <p className="font-semibold">Maria Santos</p>
                <p className="text-sm text-muted-foreground">980 points</p>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  38 tasks
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3" />
                  8 streak
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 1st Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 md:order-2"
        >
          <Card className="glass-card text-center pt-6 border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent">
            <CardContent className="space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-20 w-20 ring-4 ring-yellow-500/50">
                  <AvatarFallback className="text-xl bg-yellow-500 text-yellow-950">RN</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  {rankIcons[0]}
                </div>
              </div>
              <div>
                <p className="font-bold text-lg">Reiner Nuevas</p>
                <p className="text-sm text-muted-foreground">1,250 points</p>
              </div>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  45 tasks
                </Badge>
                <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-500">
                  <Flame className="h-3 w-3" />
                  12 streak
                </Badge>
              </div>
              <Sparkles className="h-5 w-5 text-yellow-500 mx-auto animate-pulse" />
            </CardContent>
          </Card>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-3"
        >
          <Card className="glass-card text-center pt-6">
            <CardContent className="space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-amber-600/20">JD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  {rankIcons[2]}
                </div>
              </div>
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-muted-foreground">850 points</p>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  35 tasks
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3" />
                  5 streak
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Full Leaderboard */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Full Rankings
          </CardTitle>
          <CardDescription>Your position among all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-colors',
                  user.rank === 1 && 'bg-yellow-500/5 border border-yellow-500/20',
                  user.rank !== 1 && 'hover:bg-muted/50'
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {user.rank <= 3 ? (
                    <span className="text-2xl">{['🥇', '🥈', '🥉'][user.rank - 1]}</span>
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">{user.rank}</span>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      user.rank === 1 && 'bg-yellow-500 text-yellow-950',
                      user.rank === 2 && 'bg-gray-300 text-gray-800',
                      user.rank === 3 && 'bg-amber-600 text-white',
                      user.rank > 3 && 'bg-primary text-primary-foreground'
                    )}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{user.tasksCompleted} tasks</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {user.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden md:flex items-center gap-1">
                  {user.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="text-lg" title={badgeInfo[badge]?.name}>
                      {badgeInfo[badge]?.icon}
                    </span>
                  ))}
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="font-bold text-lg">{user.score}</p>
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
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Achievements
          </CardTitle>
          <CardDescription>Badges you've earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(badgeInfo).map(([key, badge]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border',
                  badge.color
                )}
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="text-sm font-medium text-center">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
