'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
  TouchSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  MessageSquare,
  Paperclip,
  User,
  Filter,
  Search,
  LayoutGrid,
  List,
  CalendarDays,
  GanttChart,
  Users,
  GraduationCap,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  Edit3,
  Trash2,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getSmartDateLabel } from '@/lib/utils/dateHelpers';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/animations';
import { ConfettiBurst } from '@/components/celebrations/ConfettiBurst';
import type { TaskStatus, TaskPriority } from '@/lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay, getDay, startOfWeek, endOfWeek, addDays, differenceInDays, addWeeks, subWeeks, startOfWeek as startOfWeekDate, endOfWeek as endOfWeekDate } from 'date-fns';
import { useTasks, useProjects, updateTaskStatus, updateTask, deleteTask } from '@/hooks/api/useApi';
import { TaskStatus as PrismaTaskStatus, TaskPriority as PrismaTaskPriority } from '@prisma/client';

// Mock data for demo when API is not available
interface MockTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  course: string;
  assignees: string[];
  subtasks: { completed: number; total: number };
  comments: number;
  attachments: number;
  description?: string;
  ownerName?: string;
  ownerRole?: 'student' | 'faculty';
  startDate?: Date;
}

const allUserTasks: MockTask[] = [
  { id: '1', title: 'Project Proposal Draft', status: 'done', priority: 'high', dueDate: new Date(Date.now() - 86400000), course: 'CS401', assignees: ['RN'], subtasks: { completed: 3, total: 3 }, comments: 2, attachments: 1, ownerName: 'Reiner Nuevas', ownerRole: 'student', startDate: new Date(Date.now() - 7 * 86400000) },
  { id: '2', title: 'Literature Review', status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 3 * 86400000), course: 'CS401', assignees: ['RN', 'JD'], subtasks: { completed: 2, total: 5 }, comments: 5, attachments: 3, ownerName: 'Reiner Nuevas', ownerRole: 'student', startDate: new Date(Date.now() - 5 * 86400000) },
  { id: '3', title: 'System Architecture Design', status: 'todo', priority: 'urgent', dueDate: new Date(Date.now() + 7 * 86400000), course: 'CS401', assignees: ['RN'], subtasks: { completed: 0, total: 4 }, comments: 0, attachments: 0, ownerName: 'Reiner Nuevas', ownerRole: 'student', startDate: new Date(Date.now() + 1 * 86400000) },
  { id: '4', title: 'Database Schema', status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 10 * 86400000), course: 'CS401', assignees: ['JD'], subtasks: { completed: 0, total: 2 }, comments: 1, attachments: 0, ownerName: 'John Doe', ownerRole: 'student', startDate: new Date(Date.now() + 3 * 86400000) },
  { id: '5', title: 'UI Mockups', status: 'backlog', priority: 'low', dueDate: new Date(Date.now() + 14 * 86400000), course: 'IT301', assignees: ['RN'], subtasks: { completed: 0, total: 0 }, comments: 0, attachments: 0, ownerName: 'Bob Cruz', ownerRole: 'student', startDate: new Date(Date.now() + 10 * 86400000) },
  { id: '6', title: 'API Documentation', status: 'backlog', priority: 'medium', dueDate: new Date(Date.now() + 20 * 86400000), course: 'IT301', assignees: [], subtasks: { completed: 0, total: 0 }, comments: 0, attachments: 0, ownerName: 'Eva Torres', ownerRole: 'student', startDate: new Date(Date.now() + 15 * 86400000) },
  { id: '7', title: 'User Authentication', status: 'in_review', priority: 'high', dueDate: new Date(Date.now() + 2 * 86400000), course: 'CS401', assignees: ['RN', 'JD'], subtasks: { completed: 4, total: 4 }, comments: 3, attachments: 2, ownerName: 'Reiner Nuevas', ownerRole: 'student', startDate: new Date(Date.now() - 3 * 86400000) },
  { id: '8', title: 'Prepare Midterm Exam', status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 5 * 86400000), course: 'CS401', assignees: ['PF'], subtasks: { completed: 1, total: 3 }, comments: 0, attachments: 1, ownerName: 'Prof. Demo Faculty', ownerRole: 'faculty', startDate: new Date(Date.now() - 2 * 86400000) },
  { id: '9', title: 'Grade Lab Reports', status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 8 * 86400000), course: 'CS302', assignees: ['PF'], subtasks: { completed: 0, total: 1 }, comments: 0, attachments: 0, ownerName: 'Dr. Alice Garcia', ownerRole: 'faculty', startDate: new Date(Date.now() + 2 * 86400000) },
  { id: '10', title: 'Update Course Materials', status: 'done', priority: 'low', dueDate: new Date(Date.now() - 2 * 86400000), course: 'IT201', assignees: ['AG'], subtasks: { completed: 2, total: 2 }, comments: 0, attachments: 5, ownerName: 'Dr. Alice Garcia', ownerRole: 'faculty', startDate: new Date(Date.now() - 10 * 86400000) },
  { id: '11', title: 'Research Paper Draft', status: 'in_progress', priority: 'urgent', dueDate: new Date(Date.now() + 4 * 86400000), course: 'CS405', assignees: ['MS'], subtasks: { completed: 1, total: 4 }, comments: 2, attachments: 0, ownerName: 'Maria Santos', ownerRole: 'student', startDate: new Date(Date.now() - 2 * 86400000) },
  { id: '12', title: 'Presentation Slides', status: 'todo', priority: 'high', dueDate: new Date(Date.now() + 6 * 86400000), course: 'CS401', assignees: ['BC'], subtasks: { completed: 0, total: 2 }, comments: 0, attachments: 0, ownerName: 'Bob Cruz', ownerRole: 'student', startDate: new Date(Date.now() + 2 * 86400000) },
];

const studentTasks = allUserTasks.filter(t => t.ownerRole === 'student');

const columns: { id: TaskStatus; title: string; color: string; bgColor: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'text-slate-600', bgColor: 'bg-slate-500' },
  { id: 'todo', title: 'To Do', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  { id: 'in_review', title: 'In Review', color: 'text-purple-600', bgColor: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'text-green-600', bgColor: 'bg-green-500' },
];

// Draggable Task Card Component
interface TaskCardProps {
  task: MockTask;
  onEdit: (task: MockTask) => void;
  showOwner?: boolean;
  isDragging?: boolean;
}

function DraggableTaskCard({ task, onEdit, showOwner = false, isDragging }: TaskCardProps) {
  const subtaskProgress = task.subtasks.total > 0 
    ? (task.subtasks.completed / task.subtasks.total) * 100 
    : 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'p-3 sm:p-4 rounded-xl border bg-card cursor-grab active:cursor-grabbing transition-all group',
        'hover:shadow-lg hover:border-primary/30',
        isDragging && 'shadow-xl ring-2 ring-primary ring-opacity-50',
        task.priority === 'urgent' && 'border-l-4 border-l-red-500',
        task.priority === 'high' && 'border-l-4 border-l-orange-500',
        task.priority === 'medium' && 'border-l-4 border-l-blue-500',
        task.priority === 'low' && 'border-l-4 border-l-gray-400'
      )}
    >
      {/* Drag Handle & Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button {...listeners} className="touch-none p-2 -m-1 sm:p-1 sm:-ml-1 rounded hover:bg-muted/50 active:bg-muted/80 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center">
            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-60 sm:opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
          <h4 className="font-medium text-sm sm:text-base leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onEdit(task)}>
            {task.title}
          </h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
              <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit3 className="h-4 w-4 mr-2" /> Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Owner for Super Admin view */}
      {showOwner && task.ownerName && (
        <div className="flex items-center gap-2 mb-2 ml-6">
          <div className={cn(
            'p-1 rounded',
            task.ownerRole === 'faculty' ? 'bg-blue-500/10' : 'bg-green-500/10'
          )}>
            {task.ownerRole === 'faculty' 
              ? <GraduationCap className="h-3 w-3 text-blue-500" />
              : <User className="h-3 w-3 text-green-500" />
            }
          </div>
          <span className="text-xs text-muted-foreground truncate">{task.ownerName}</span>
        </div>
      )}

      {/* Tags & Due Date */}
      <div className="flex items-center gap-2 mb-2 flex-wrap ml-6">
        <Badge variant="outline" className="text-xs font-normal">{task.course}</Badge>
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            task.dueDate < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            <span>{getSmartDateLabel(task.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Subtask Progress */}
      {task.subtasks.total > 0 && (
        <div className="mb-2 ml-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Subtasks</span>
            <span>{task.subtasks.completed}/{task.subtasks.total}</span>
          </div>
          <Progress value={subtaskProgress} className="h-1.5" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-2">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee, i) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground text-[10px]">
                {assignee}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.assignees.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
              +{task.assignees.length - 3}
            </div>
          )}
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

// Task Edit Modal
interface TaskEditModalProps {
  task: MockTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: MockTask) => void;
  onDelete?: (taskId: string) => void;
}

function TaskEditModal({ task, open, onOpenChange, onSave, onDelete }: TaskEditModalProps) {
  // Initialize form data - use key-based reset pattern instead of useEffect
  const initialData = task ? { ...task } : {};
  const [formData, setFormData] = useState<Partial<MockTask>>(initialData);
  
  // Key to force re-render when task changes
  const formKey = task?.id ?? 'new';

  const handleSave = () => {
    if (task && formData) {
      onSave({ ...task, ...formData } as MockTask);
      onOpenChange(false);
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Task
          </DialogTitle>
          <DialogDescription>
            Update task details and change status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', col.bgColor)} />
                        {col.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as TaskPriority }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course">Course Code</Label>
            <Input
              id="course"
              value={formData.course || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
              className="min-h-[44px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(task.id)} className="mr-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Calendar View Component
function CalendarView({ tasks, onTaskClick, showOwner = false }: { tasks: MockTask[]; onTaskClick: (task: MockTask) => void; showOwner?: boolean }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const tasksByDate = useMemo(() => {
    const map: Record<string, MockTask[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = format(task.dueDate, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDateTasks = selectedDateKey ? (tasksByDate[selectedDateKey] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">←</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="min-h-[44px] hidden sm:inline-flex">Today</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="min-h-[44px] sm:hidden text-xs px-2">Now</Button>
              <Button variant="ghost" size="icon" onClick={goToNextMonth} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">→</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-lg bg-muted/20" />
            ))}
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateKey] || [];
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={dateKey}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'h-16 sm:h-24 p-0.5 sm:p-1 rounded-lg border transition-colors text-left min-h-[44px]',
                    isToday(day) && 'border-primary bg-primary/5',
                    isSelected && !isToday(day) && 'border-primary bg-primary/10',
                    !isToday(day) && !isSelected && 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm mb-0.5 sm:mb-1',
                    isToday(day) && 'bg-primary text-primary-foreground font-bold'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 overflow-hidden hidden sm:block">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                        className={cn(
                          'text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80',
                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                          task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-blue-500/10 text-blue-500'
                        )}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">+{dayTasks.length - 2}</div>
                    )}
                  </div>
                  {/* Mobile task indicator */}
                  <div className="sm:hidden">
                    {dayTasks.length > 0 && (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mx-auto',
                        dayTasks.some(t => t.priority === 'urgent') ? 'bg-red-500' :
                        dayTasks.some(t => t.priority === 'high') ? 'bg-orange-500' :
                        'bg-blue-500'
                      )} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] sm:h-[400px] pr-2">
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {selectedDateTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      'p-2 sm:p-3 rounded-lg border-l-4 cursor-pointer hover:bg-muted/50 min-h-[44px]',
                      task.priority === 'urgent' && 'border-l-red-500 bg-red-500/5',
                      task.priority === 'high' && 'border-l-orange-500 bg-orange-500/5',
                      task.priority === 'medium' && 'border-l-blue-500 bg-blue-500/5'
                    )}
                  >
                    <p className="font-medium text-xs sm:text-sm">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">{task.course}</Badge>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">{task.status.replace('_', ' ')}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                illustration="default"
                title="No tasks due"
                description="No tasks scheduled for this date"
                animated={false}
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Gantt Chart View Component
function GanttChartView({ tasks, onTaskClick, showOwner = false }: { tasks: MockTask[]; onTaskClick: (task: MockTask) => void; showOwner?: boolean }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeekDate(new Date(), { weekStartsOn: 0 }));
  
  const weeks = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => addWeeks(currentWeekStart, i));
  }, [currentWeekStart]);

  const days = useMemo(() => {
    const allDays: Date[] = [];
    weeks.forEach(week => {
      for (let i = 0; i < 7; i++) {
        allDays.push(addDays(week, i));
      }
    });
    return allDays;
  }, [weeks]);

  const tasksWithDates = useMemo(() => {
    return tasks.filter(t => t.startDate && t.dueDate).sort((a, b) => {
      const aStart = a.startDate?.getTime() || 0;
      const bStart = b.startDate?.getTime() || 0;
      return aStart - bStart;
    });
  }, [tasks]);

  const goToPreviousWeeks = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeeks = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeekDate(new Date(), { weekStartsOn: 0 }));

  const getTaskPosition = (task: MockTask) => {
    if (!task.startDate || !task.dueDate) return null;
    
    const startOffset = Math.max(0, differenceInDays(new Date(task.startDate), days[0]));
    const duration = differenceInDays(task.dueDate, task.startDate) + 1;
    const visibleStart = Math.max(0, startOffset);
    const visibleEnd = Math.min(days.length - 1, startOffset + duration - 1);
    const visibleDuration = visibleEnd - visibleStart + 1;
    
    return {
      left: `${(visibleStart / days.length) * 100}%`,
      width: `${(visibleDuration / days.length) * 100}%`,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <GanttChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Gantt Chart
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeeks} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="min-h-[44px] text-xs sm:text-sm">Today</Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeeks} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] sm:h-[600px]">
          <div className="min-w-[350px] sm:min-w-[1000px]">
            {/* Timeline Header */}
            <div className="sticky top-0 bg-card z-10 border-b">
              <div className="flex">
                <div className="w-40 sm:w-64 shrink-0 p-1.5 sm:p-2 border-r font-medium text-xs sm:text-sm">Task</div>
                <div className="flex-1 flex">
                  {weeks.map((week, i) => (
                    <div key={i} className="flex-1 text-center p-1.5 sm:p-2 border-r text-xs sm:text-sm font-medium">
                      <span className="hidden sm:inline">Week of </span>{format(week, 'MMM d')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex">
                <div className="w-40 sm:w-64 shrink-0 p-1 border-r"></div>
                <div className="flex-1 flex">
                  {days.map((day, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        'flex-1 text-center p-0.5 sm:p-1 text-[10px] sm:text-xs border-r',
                        isToday(day) && 'bg-primary/10 font-bold'
                      )}
                    >
                      <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                      <div className={isToday(day) ? 'text-primary' : ''}>{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Rows */}
            {tasksWithDates.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  illustration="default"
                  title="No tasks with date ranges"
                  description="Add start and due dates to tasks to see them here"
                  animated={false}
                />
              </div>
            ) : (
              <div className="divide-y">
                {tasksWithDates.map((task, index) => {
                  const position = getTaskPosition(task);
                  if (!position) return null;
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ backgroundColor: 'var(--muted)' }}
                      className="flex cursor-pointer"
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="w-40 sm:w-64 shrink-0 p-1.5 sm:p-2 border-r">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className={cn('w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full', getPriorityColor(task.priority))} />
                          <span className="text-xs sm:text-sm font-medium truncate flex-1">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{task.course}</Badge>
                          {showOwner && task.ownerName && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{task.ownerName}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 relative h-10 sm:h-12">
                        <div className="absolute inset-0 flex">
                          {days.map((day, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                'flex-1 border-r h-full',
                                isToday(day) && 'bg-primary/5'
                              )}
                            />
                          ))}
                        </div>
                        
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.02 + 0.1 }}
                          className={cn(
                            'absolute top-1.5 sm:top-2 h-7 sm:h-8 rounded-md flex items-center px-1.5 sm:px-2 text-white text-[10px] sm:text-xs font-medium shadow-sm',
                            getPriorityColor(task.priority),
                            task.status === 'done' && 'opacity-50'
                          )}
                          style={{
                            left: position.left,
                            width: position.width,
                            transformOrigin: 'left',
                          }}
                        >
                          <span className="truncate hidden sm:inline">{task.title}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
  );
}

// Kanban Column Component with drop support
function KanbanColumn({ 
  column, 
  tasks, 
  onEditTask, 
  onAddTask,
  showOwner,
  activeId,
}: { 
  column: { id: TaskStatus; title: string; color: string; bgColor: string };
  tasks: MockTask[];
  onEditTask: (task: MockTask) => void;
  onAddTask?: (status: TaskStatus) => void;
  showOwner?: boolean;
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      className="flex-1 min-w-[85vw] sm:min-w-[280px] lg:min-w-[200px] lg:max-w-[320px] flex flex-col snap-start"
    >
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between p-3 sm:p-4 rounded-t-xl border border-b-0',
        'bg-muted/30'
      )}>
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', column.bgColor)} />
          <h3 className={cn('font-semibold text-sm sm:text-base', column.color)}>
            {column.title}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 sm:h-7 sm:w-7 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => onAddTask?.(column.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Column Content - Droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'p-2 sm:p-3 rounded-b-xl border border-t-0 min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] flex-1',
          'bg-muted/10 transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/30 ring-inset'
        )}
      >
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <div className={cn(
                "flex items-center justify-center h-24 text-muted-foreground text-sm",
                isOver && "text-primary"
              )}>
                Drop tasks here
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {tasks.map((task) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    showOwner={showOwner}
                    isDragging={activeId === task.id}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}

// Main Kanban Board Component
function KanbanBoard({ 
  tasks, 
  onEditTask, 
  onAddTask,
  showOwner = false,
  onTaskMove 
}: { 
  tasks: MockTask[]; 
  onEditTask: (task: MockTask) => void;
  onAddTask?: (status: TaskStatus) => void;
  showOwner?: boolean;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn) {
      onTaskMove(taskId, targetColumn.id);
      return;
    }

    // Check if dropped on another task (get its column)
    const targetTask = tasks.find(t => t.id === overId);
    if (targetTask) {
      onTaskMove(taskId, targetTask.status);
    }
  };

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find(t => t.id === activeId);
  }, [activeId, tasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: horizontal scroll container with snap points */}
      {/* Desktop: columns fill available space */}
      <div className="p-4 sm:p-6 min-h-[60vh]">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scroll-smooth">
          {columns.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onEditTask={onEditTask}
                onAddTask={onAddTask}
                showOwner={showOwner}
                activeId={activeId}
              />
            );
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 shadow-xl">
            <DraggableTaskCard
              task={activeTask}
              onEdit={() => {}}
              showOwner={showOwner}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// List View Component
function ListView({ tasks, onEditTask, showOwner = false }: { tasks: MockTask[]; onEditTask: (task: MockTask) => void; showOwner?: boolean }) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  return (
    <div className="p-4 sm:p-6">
      <ScrollArea className="h-[60vh] sm:h-[70vh]">
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.005 }}
              onClick={() => onEditTask(task)}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                'min-h-[44px]',
                task.priority === 'urgent' && 'border-l-4 border-l-red-500 bg-red-500/5',
                task.priority === 'high' && 'border-l-4 border-l-orange-500 bg-orange-500/5',
                task.priority === 'medium' && 'border-l-4 border-l-blue-500 bg-blue-500/5',
                task.priority === 'low' && 'border-l-4 border-l-gray-400'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  <Badge variant="outline" className="text-xs shrink-0">{task.course}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{task.status.replace('_', ' ')}</span>
                  {task.dueDate && (
                    <span className={cn(task.dueDate < new Date() && task.status !== 'done' && 'text-red-500')}>
                      Due: {getSmartDateLabel(task.dueDate)}
                    </span>
                  )}
                  {showOwner && task.ownerName && (
                    <span>{task.ownerName}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.subtasks.total > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {task.subtasks.completed}/{task.subtasks.total} subtasks
                  </div>
                )}
                <Badge 
                  variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}
                  className="text-xs capitalize"
                >
                  {task.priority}
                </Badge>
              </div>
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <EmptyState
              illustration="tasks"
              title="No tasks found"
              description="Create a task to get started"
              animated={false}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function BoardsContent() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string || 'student';
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<MockTask[]>(() => {
    return userRole === 'super_admin' ? allUserTasks : studentTasks;
  });
  const [editingTask, setEditingTask] = useState<MockTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Super Admin filters
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  const isSuperAdmin = userRole === 'super_admin';
  const isFaculty = userRole === 'faculty';

  // Filter tasks based on search and Super Admin filters
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (isSuperAdmin && roleFilter !== 'all') {
      result = result.filter(t => t.ownerRole === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.course.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        (task.ownerName?.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [tasks, searchQuery, roleFilter, statusFilter, priorityFilter, isSuperAdmin]);

  const handleEditTask = (task: MockTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: MockTask) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    // Call API to update task
    try {
      const result = await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        courseCode: updatedTask.course,
        dueDate: updatedTask.dueDate?.toISOString(),
        startDate: updatedTask.startDate?.toISOString(),
      });
      
      if (result.success === false) {
        // Revert on error
        console.error('Failed to update task:', result.error);
      } else if (updatedTask.status === 'done' && editingTask?.status !== 'done') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskMove = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      // Optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      
      // Call API to update status
      try {
        const result = await updateTaskStatus(taskId, newStatus as PrismaTaskStatus);
        if (result.success === false) {
          console.error('Failed to update task status:', result.error);
          // Revert on error
          setTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: task.status } : t
          ));
        } else if (newStatus === 'done') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
        // Revert on error
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: task.status } : t
        ));
      }
    }
  }, [tasks]);

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsEditModalOpen(false);
    
    // Call API to delete task
    try {
      const result = await deleteTask(taskId);
      if (result.success === false) {
        console.error('Failed to delete task:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Handle add new task
  const handleAddTask = useCallback((status: TaskStatus = 'todo') => {
    const newTask: MockTask = {
      id: `new-${Date.now()}`,
      title: 'New Task',
      status,
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
      course: 'CS401',
      assignees: [],
      subtasks: { completed: 0, total: 0 },
      comments: 0,
      attachments: 0,
      description: '',
      startDate: new Date(),
    };
    setEditingTask(newTask);
    setIsEditModalOpen(true);
  }, []);

  // Handle save new task
  const handleSaveNewTask = async (task: MockTask) => {
    // Add to local state
    setTasks(prev => [...prev, task]);
    setIsEditModalOpen(false);
    
    // In production, call API to create task
    console.log('Creating new task:', task);
  };

  // Stats for Super Admin
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const urgent = filteredTasks.filter(t => t.priority === 'urgent').length;
    const overdue = filteredTasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length;
    const completed = filteredTasks.filter(t => t.status === 'done').length;
    return { total, urgent, overdue, completed };
  }, [filteredTasks]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ConfettiBurst trigger={showConfetti} />
      
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {isSuperAdmin ? 'All Tasks Overview' : 'Boards'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {isSuperAdmin 
                ? 'Monitor all tasks from students and faculty'
                : 'Drag and drop tasks to update status'}
            </p>
          </div>
          
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="min-h-[44px]" onClick={() => handleAddTask('todo')}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Super Admin Stats */}
      {isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6"
        >
          {[
            { label: 'Total Tasks', value: stats.total, color: '' },
            { label: 'Urgent', value: stats.urgent, color: 'text-red-500 border-red-500/30' },
            { label: 'Overdue', value: stats.overdue, color: 'text-orange-500 border-orange-500/30' },
            { label: 'Completed', value: stats.completed, color: 'text-green-500 border-green-500/30' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn('glass-card', stat.color && `border ${stat.color}`)}>
                <CardContent className="p-3 sm:pt-4 text-center">
                  <p className={cn('text-xl sm:text-2xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-6">
        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isSuperAdmin ? "Search all tasks..." : "Search tasks..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[44px] focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          {/* Super Admin Filters - scrollable on mobile */}
          {isSuperAdmin && (
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:gap-3 w-full sm:w-auto">
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-full sm:w-28 min-h-[44px] shrink-0">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-28 min-h-[44px] shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
                <SelectTrigger className="w-full sm:w-28 min-h-[44px] shrink-0">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-muted/50 p-1 rounded-lg border">
              {[
                { value: 'kanban', icon: LayoutGrid, label: 'Kanban' },
                { value: 'list', icon: List, label: 'List' },
                { value: 'calendar', icon: CalendarDays, label: 'Calendar' },
                { value: 'gantt', icon: GanttChart, label: 'Gantt' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="gap-1.5 min-h-[44px] px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-background/50 transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Active Filters Display */}
      {isSuperAdmin && (roleFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 text-xs sm:text-sm px-4 sm:px-6"
        >
          <span className="text-muted-foreground">Filters:</span>
          {roleFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 py-1">
              Role: {roleFilter}
              <button onClick={() => setRoleFilter('all')} className="ml-1 p-1 -mr-1 rounded hover:bg-muted-foreground/20 min-h-[28px] min-w-[28px] flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 py-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="ml-1 p-1 -mr-1 rounded hover:bg-muted-foreground/20 min-h-[28px] min-w-[28px] flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 py-1">
              Priority: {priorityFilter}
              <button onClick={() => setPriorityFilter('all')} className="ml-1 p-1 -mr-1 rounded hover:bg-muted-foreground/20 min-h-[28px] min-w-[28px] flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-8 sm:h-6 text-xs min-h-[36px] sm:min-h-0" onClick={() => {
            setRoleFilter('all');
            setStatusFilter('all');
            setPriorityFilter('all');
          }}>
            Clear all
          </Button>
        </motion.div>
      )}

      {/* View Content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <KanbanBoard
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onAddTask={handleAddTask}
                showOwner={isSuperAdmin}
                onTaskMove={handleTaskMove}
              />
            </motion.div>
          )}
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ListView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                showOwner={isSuperAdmin}
              />
            </motion.div>
          )}
          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CalendarView
                tasks={filteredTasks}
                onTaskClick={handleEditTask}
                showOwner={isSuperAdmin}
              />
            </motion.div>
          )}
          {viewMode === 'gantt' && (
            <motion.div
              key="gantt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GanttChartView
                tasks={filteredTasks}
                onTaskClick={handleEditTask}
                showOwner={isSuperAdmin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
