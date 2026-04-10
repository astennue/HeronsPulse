'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';

// Mock tasks for calendar
const tasksByDate: Record<string, Array<{ id: string; title: string; priority: string; status: string; course: string }>> = {
  '2025-01-15': [
    { id: '1', title: 'Project Proposal Review', priority: 'high', status: 'in_progress', course: 'CS401' },
  ],
  '2025-01-18': [
    { id: '2', title: 'Literature Review Due', priority: 'urgent', status: 'todo', course: 'CS401' },
    { id: '3', title: 'Database Quiz', priority: 'medium', status: 'todo', course: 'CS302' },
  ],
  '2025-01-22': [
    { id: '4', title: 'System Architecture Design', priority: 'high', status: 'todo', course: 'CS401' },
  ],
  '2025-01-25': [
    { id: '5', title: 'Midterm Exam - Web Dev', priority: 'urgent', status: 'todo', course: 'IT301' },
    { id: '6', title: 'Lab Report Submission', priority: 'medium', status: 'todo', course: 'CS405' },
  ],
  '2025-01-30': [
    { id: '7', title: 'Capstone Progress Report', priority: 'high', status: 'todo', course: 'CS401' },
  ],
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();
  
  // Get tasks for selected date
  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDateTasks = selectedDateKey ? (tasksByDate[selectedDateKey] || []) : [];

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your deadlines and schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 rounded-lg bg-muted/20" />
              ))}
              
              {/* Month days */}
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const tasks = tasksByDate[dateKey] || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasUrgent = tasks.some(t => t.priority === 'urgent');

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'h-24 p-1 rounded-lg border transition-colors text-left',
                      isToday(day) && 'border-primary bg-primary/5',
                      isSelected && 'border-primary bg-primary/10',
                      !isToday(day) && !isSelected && 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1',
                      isToday(day) && 'bg-primary text-primary-foreground font-bold'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'text-xs px-1 py-0.5 rounded truncate',
                            task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                            task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-blue-500/10 text-blue-500'
                          )}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasks.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{tasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-2">
              {selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 rounded-lg border-l-4',
                        task.priority === 'urgent' && 'border-l-red-500 bg-red-500/5',
                        task.priority === 'high' && 'border-l-orange-500 bg-orange-500/5',
                        task.priority === 'medium' && 'border-l-blue-500 bg-blue-500/5',
                        task.priority === 'low' && 'border-l-gray-500 bg-gray-500/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{task.course}</Badge>
                        </div>
                        {task.priority === 'urgent' && (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.priority}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mb-2" />
                  <p className="text-sm">No tasks scheduled</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
