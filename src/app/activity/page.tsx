'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  User,
  ClipboardList,
  Calendar,
  Trophy,
  Settings,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Clock,
  Filter,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { toast } from 'sonner';

interface ActivityUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

interface ActivityItem {
  id: string;
  userId: string | null;
  user: ActivityUser | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface ActivityGroup {
  date: string;
  label: string;
  activities: ActivityItem[];
}

const actionIcons: Record<string, any> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: CheckCircle2,
  joined: User,
  left: User,
  assigned: User,
  unassigned: User,
  commented: MessageSquare,
  dependency_added: ClipboardList,
  dependency_removed: ClipboardList,
  awarded: Trophy,
  started: Activity,
  finished: CheckCircle2,
  uncompleted: CheckCircle2,
};

const actionColors: Record<string, string> = {
  created: 'text-green-500 bg-green-500/10',
  updated: 'text-blue-500 bg-blue-500/10',
  deleted: 'text-red-500 bg-red-500/10',
  completed: 'text-green-500 bg-green-500/10',
  joined: 'text-primary bg-primary/10',
  left: 'text-orange-500 bg-orange-500/10',
  assigned: 'text-purple-500 bg-purple-500/10',
  unassigned: 'text-gray-500 bg-gray-500/10',
  commented: 'text-cyan-500 bg-cyan-500/10',
  dependency_added: 'text-indigo-500 bg-indigo-500/10',
  dependency_removed: 'text-red-500 bg-red-500/10',
  awarded: 'text-yellow-500 bg-yellow-500/10',
};

const entityTypeIcons: Record<string, any> = {
  task: ClipboardList,
  project: FileText,
  class: Calendar,
  user: User,
  badge: Trophy,
  subtask: CheckCircle2,
  event: Calendar,
};

export default function ActivityPage() {
  const { data: session } = useSession();
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const limit = 30;

  const fetchActivities = useCallback(async (reset = false) => {
    try {
      const offset = reset ? 0 : page * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (entityTypeFilter !== 'all') {
        params.set('entityType', entityTypeFilter);
      }

      const response = await fetch(`/api/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      
      if (reset) {
        setActivities(data.activities);
        setPage(0);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setHasMore(data.pagination?.hasMore ?? false);
      setTotal(data.pagination?.total ?? data.activities.length);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity feed');
    } finally {
      setIsLoading(false);
    }
  }, [entityTypeFilter, page]);

  useEffect(() => {
    fetchActivities(true);
  }, [entityTypeFilter]);

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchActivities();
  };

  const refresh = () => {
    setIsLoading(true);
    fetchActivities(true);
    toast.success('Activity feed refreshed');
  };

  // Group activities by date
  const groupedActivities: ActivityGroup[] = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt);
      let dateKey: string;
      
      if (isToday(date)) {
        dateKey = 'today';
      } else if (isYesterday(date)) {
        dateKey = 'yesterday';
      } else if (isThisWeek(date)) {
        dateKey = format(date, 'yyyy-MM-dd');
      } else {
        dateKey = format(date, 'yyyy-MM-dd');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return Object.entries(groups).map(([key, items]) => ({
      date: key,
      label: items[0] ? (isToday(new Date(items[0].createdAt)) ? 'Today' : 
                        isYesterday(new Date(items[0].createdAt)) ? 'Yesterday' :
                        format(new Date(items[0].createdAt), 'EEEE, MMMM d, yyyy')) : key,
      activities: items,
    }));
  }, [activities]);

  const getActivityIcon = (activity: ActivityItem) => {
    return actionIcons[activity.action] || entityTypeIcons[activity.entityType] || Activity;
  };

  const getActivityColor = (activity: ActivityItem) => {
    return actionColors[activity.action] || 'text-muted-foreground bg-muted';
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const { action, entityType, metadata } = activity;
    const entityName = metadata.name || metadata.title || entityType;
    
    switch (action) {
      case 'created':
        return `created ${entityType} "${entityName}"`;
      case 'updated':
        return `updated ${entityType} "${entityName}"`;
      case 'deleted':
        return `deleted ${entityType} "${entityName}"`;
      case 'completed':
        return `completed ${entityType} "${entityName}"`;
      case 'uncompleted':
        return `marked ${entityType} "${entityName}" as incomplete`;
      case 'joined':
        return `joined ${entityType} "${entityName}"`;
      case 'left':
        return `left ${entityType} "${entityName}"`;
      case 'assigned':
        return `was assigned to "${entityName}"`;
      case 'unassigned':
        return `was unassigned from "${entityName}"`;
      case 'commented':
        return `commented on "${entityName}"`;
      case 'dependency_added':
        return `added dependency to "${metadata.dependsOnTaskTitle || 'task'}"`;
      case 'dependency_removed':
        return `removed a dependency`;
      case 'awarded':
        return `earned badge "${metadata.badgeName || entityName}"`;
      default:
        return `${action} ${entityType}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground">
            Track all activities and changes across your projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[140px] min-h-[44px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="class">Classes</SelectItem>
              <SelectItem value="badge">Badges</SelectItem>
              <SelectItem value="subtask">Subtasks</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Activities</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {activities.filter(a => a.action === 'created').length}
            </p>
            <p className="text-xs text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {activities.filter(a => a.action === 'completed').length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {activities.filter(a => a.action === 'awarded').length}
            </p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No activities yet</p>
              <p className="text-sm">Activities will appear here as you use the system</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="divide-y">
                {groupedActivities.map((group) => (
                  <div key={group.date}>
                    {/* Date Header */}
                    <div className="sticky top-0 bg-card z-10 px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {group.label}
                      </p>
                    </div>
                    
                    {/* Activities */}
                    <div className="p-4 space-y-3">
                      <AnimatePresence>
                        {group.activities.map((activity, index) => {
                          const Icon = getActivityIcon(activity);
                          const colorClass = getActivityColor(activity);
                          
                          return (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              {/* User Avatar */}
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {activity.user?.displayName
                                    ?.split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2) || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">
                                    {activity.user?.displayName || 'System'}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {getActivityDescription(activity)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={cn('p-1 rounded', colorClass)}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {activity.entityType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Timestamp */}
                              <span className="text-xs text-muted-foreground shrink-0">
                                {format(new Date(activity.createdAt), 'h:mm a')}
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Load More
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
