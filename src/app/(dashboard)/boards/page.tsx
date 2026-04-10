'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  MessageSquare,
  Paperclip,
  User,
  Filter,
  Search,
  LayoutGrid,
  List,
  CalendarDays,
  GanttChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getSmartDateLabel } from '@/lib/utils/dateHelpers';
import type { TaskStatus, TaskPriority } from '@/lib/types';

// Mock data for demo
const mockTasks = [
  { id: '1', title: 'Project Proposal Draft', status: 'done' as TaskStatus, priority: 'high' as TaskPriority, dueDate: new Date(Date.now() - 86400000), course: 'CS401', assignees: ['RN'], subtasks: { completed: 3, total: 3 }, comments: 2, attachments: 1 },
  { id: '2', title: 'Literature Review', status: 'in_progress' as TaskStatus, priority: 'high' as TaskPriority, dueDate: new Date(Date.now() + 3 * 86400000), course: 'CS401', assignees: ['RN', 'JD'], subtasks: { completed: 2, total: 5 }, comments: 5, attachments: 3 },
  { id: '3', title: 'System Architecture Design', status: 'todo' as TaskStatus, priority: 'urgent' as TaskPriority, dueDate: new Date(Date.now() + 7 * 86400000), course: 'CS401', assignees: ['RN'], subtasks: { completed: 0, total: 4 }, comments: 0, attachments: 0 },
  { id: '4', title: 'Database Schema', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority, dueDate: new Date(Date.now() + 10 * 86400000), course: 'CS401', assignees: ['JD'], subtasks: { completed: 0, total: 2 }, comments: 1, attachments: 0 },
  { id: '5', title: 'UI Mockups', status: 'backlog' as TaskStatus, priority: 'low' as TaskPriority, dueDate: new Date(Date.now() + 14 * 86400000), course: 'CS401', assignees: ['RN'], subtasks: { completed: 0, total: 0 }, comments: 0, attachments: 0 },
  { id: '6', title: 'API Documentation', status: 'backlog' as TaskStatus, priority: 'medium' as TaskPriority, dueDate: new Date(Date.now() + 20 * 86400000), course: 'CS401', assignees: [], subtasks: { completed: 0, total: 0 }, comments: 0, attachments: 0 },
  { id: '7', title: 'User Authentication', status: 'in_review' as TaskStatus, priority: 'high' as TaskPriority, dueDate: new Date(Date.now() + 2 * 86400000), course: 'CS401', assignees: ['RN', 'JD'], subtasks: { completed: 4, total: 4 }, comments: 3, attachments: 2 },
];

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'in_review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

const priorityColors: Record<TaskPriority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500',
};

interface TaskCardProps {
  task: typeof mockTasks[0];
  index: number;
}

function TaskCard({ task, index }: TaskCardProps) {
  const subtaskProgress = task.subtasks.total > 0 
    ? (task.subtasks.completed / task.subtasks.total) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-3 rounded-lg border bg-card cursor-pointer transition-shadow hover:shadow-md',
        task.priority === 'urgent' && 'border-l-4 border-l-red-500',
        task.priority === 'high' && 'border-l-4 border-l-orange-500',
        task.priority === 'medium' && 'border-l-4 border-l-blue-500',
        task.priority === 'low' && 'border-l-4 border-l-gray-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags & Due Date */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="outline" className="text-xs">{task.course}</Badge>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{getSmartDateLabel(task.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Subtask Progress */}
      {task.subtasks.total > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Subtasks</span>
            <span>{task.subtasks.completed}/{task.subtasks.total}</span>
          </div>
          <Progress value={subtaskProgress} className="h-1" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, i) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {assignee}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.assignees.length === 0 && (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BoardsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  const getTasksByStatus = (status: TaskStatus) => {
    return mockTasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Boards</h1>
          <p className="text-muted-foreground">Manage your tasks with Kanban boards</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="gantt" className="gap-2">
              <GanttChart className="h-4 w-4" />
              <span className="hidden sm:inline">Gantt</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const tasks = getTasksByStatus(column.id);
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 w-72"
              >
                <Card className={cn(
                  'border-t-4',
                  column.id === 'backlog' && 'column-backlog',
                  column.id === 'todo' && 'column-todo',
                  column.id === 'in_progress' && 'column-in-progress',
                  column.id === 'in_review' && 'column-in-review',
                  column.id === 'done' && 'column-done',
                )} style={{ borderTopColor: column.color.replace('bg-', '') }}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', column.color)} />
                        <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <ScrollArea className="h-[calc(100vh-400px)] pr-2">
                      <AnimatePresence>
                        <div className="space-y-2">
                          {tasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} />
                          ))}
                        </div>
                      </AnimatePresence>
                      {tasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No tasks
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="divide-y">
              {mockTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer',
                    task.priority === 'urgent' && 'border-l-4 border-l-red-500',
                    task.priority === 'high' && 'border-l-4 border-l-orange-500',
                    task.priority === 'medium' && 'border-l-4 border-l-blue-500',
                    task.priority === 'low' && 'border-l-4 border-l-gray-500'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{task.course}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{task.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{getSmartDateLabel(task.dueDate)}</span>
                    </div>
                    <div className="flex -space-x-2">
                      {task.assignees.slice(0, 3).map((assignee, i) => (
                        <Avatar key={i} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {assignee}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar & Gantt Views - Placeholder */}
      {(viewMode === 'calendar' || viewMode === 'gantt') && (
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{viewMode === 'calendar' ? 'Calendar View' : 'Gantt Chart'}</p>
              <p className="text-sm">Coming soon in the next update</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
