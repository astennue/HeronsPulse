'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay, getDay, startOfWeek, endOfWeek, addDays, isSameWeek } from 'date-fns';
import { EventModal, EventFormData } from '@/components/modals/EventModal';

// Mock events interface
interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'exam' | 'meeting' | 'reminder' | 'other';
  date: Date;
  time?: string;
  endDate?: Date;
  location?: string;
  course: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description?: string;
  color: string;
}

// Initial mock events
const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'Project Proposal Review', type: 'deadline', date: new Date(2025, 0, 15), course: 'CS401', priority: 'high', color: '#EF4444' },
  { id: '2', title: 'Literature Review Due', type: 'deadline', date: new Date(2025, 0, 18), course: 'CS401', priority: 'urgent', color: '#EF4444' },
  { id: '3', title: 'Database Quiz', type: 'exam', date: new Date(2025, 0, 18), course: 'CS302', priority: 'medium', color: '#F59E0B' },
  { id: '4', title: 'System Architecture Design', type: 'deadline', date: new Date(2025, 0, 22), course: 'CS401', priority: 'high', color: '#EF4444' },
  { id: '5', title: 'Midterm Exam - Web Dev', type: 'exam', date: new Date(2025, 0, 25), course: 'IT301', priority: 'urgent', color: '#F59E0B' },
  { id: '6', title: 'Lab Report Submission', type: 'deadline', date: new Date(2025, 0, 25), course: 'CS405', priority: 'medium', color: '#EF4444' },
  { id: '7', title: 'Capstone Progress Report', type: 'deadline', date: new Date(2025, 0, 30), course: 'CS401', priority: 'high', color: '#EF4444' },
  // Add events for current month
  { id: '8', title: 'Team Meeting', type: 'meeting', date: new Date(), course: 'CS401', priority: 'medium', color: '#10B981', time: '14:00', location: 'Room 301' },
  { id: '9', title: 'Code Review Session', type: 'meeting', date: new Date(Date.now() + 2 * 86400000), course: 'IT301', priority: 'low', color: '#10B981', time: '10:00' },
  { id: '10', title: 'Assignment Due', type: 'deadline', date: new Date(Date.now() + 5 * 86400000), course: 'CS302', priority: 'high', color: '#EF4444' },
];

const typeIcons: Record<string, string> = {
  deadline: '🔴',
  exam: '📝',
  meeting: '👥',
  reminder: '🔔',
  other: '📌',
};

type ViewMode = 'month' | 'week' | 'day';

export function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Week calculations
  const weekStart = startOfWeek(selectedDate || currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate || currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const key = format(event.date, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDateEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const goToPreviousWeek = () => {
    const newDate = addDays(weekStart, -7);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addDays(weekStart, 7);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    if (selectedDate) {
      const newDate = addDays(selectedDate, -1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const goToNextDay = () => {
    if (selectedDate) {
      const newDate = addDays(selectedDate, 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const handleCreateEvent = (data: EventFormData) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: data.title,
      type: data.type,
      date: data.startDate,
      time: data.allDay ? undefined : data.startTime,
      endDate: data.endDate,
      location: data.location,
      course: data.courseCode,
      priority: data.type === 'deadline' ? 'high' : 'medium',
      description: data.description,
      color: data.color,
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  // Full day names for desktop, abbreviated for mobile
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Render event card
  const renderEventCard = (event: CalendarEvent, showDelete = true) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 rounded-lg border-l-4 relative group"
      style={{ 
        borderLeftColor: event.color,
        backgroundColor: event.color + '10'
      }}
    >
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
          onClick={() => handleDeleteEvent(event.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-start justify-between gap-2 pr-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg shrink-0">{typeIcons[event.type]}</span>
            <p className="font-medium text-sm sm:text-base truncate">{event.title}</p>
          </div>
          <Badge variant="outline" className="mt-1 text-xs">{event.course}</Badge>
        </div>
        {event.priority === 'urgent' && (
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge variant="secondary" className="text-xs capitalize">
          {event.type}
        </Badge>
        {event.time && (
          <span className="text-xs text-muted-foreground">
            {event.time}
          </span>
        )}
        {event.location && (
          <span className="text-xs text-muted-foreground truncate">
            • {event.location}
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Calendar</h1>
            <p className="text-sm sm:text-base text-muted-foreground">View your deadlines and schedule</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle - Hidden on very small screens */}
            <div className="hidden xs:flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-9 min-h-[44px] px-3"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Month</span>
              </Button>
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-9 min-h-[44px] px-3"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Week</span>
              </Button>
              <Button
                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="h-9 min-h-[44px] px-3"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Day</span>
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday} className="min-h-[44px]">
              Today
            </Button>
            <Button 
              onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
              className="min-h-[44px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Mobile View Mode Toggle - Shown only on very small screens */}
        <div className="flex xs:hidden items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
            className="flex-1 h-11 min-h-[44px]"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
            className="flex-1 h-11 min-h-[44px]"
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
            className="flex-1 h-11 min-h-[44px]"
          >
            <List className="h-4 w-4 mr-1" />
            Day
          </Button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousMonth}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextMonth}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers - responsive */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                {(window.innerWidth < 640 ? dayNamesShort : dayNames).map((day, i) => (
                  <div 
                    key={i} 
                    className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2 min-h-[36px] flex items-center justify-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid - responsive cell heights */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {/* Empty cells for days before month start */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square sm:aspect-[4/3] lg:aspect-[4/3] min-h-[44px] sm:min-h-[60px] lg:min-h-[80px] rounded-lg bg-muted/20" />
                ))}
                
                {/* Month days */}
                {days.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <motion.button
                      key={dateKey}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setShowMobileDetails(true);
                      }}
                      className={cn(
                        'aspect-square sm:aspect-[4/3] lg:aspect-[4/3] min-h-[44px] sm:min-h-[60px] lg:min-h-[80px] p-0.5 sm:p-1 rounded-lg border transition-colors text-left flex flex-col touch-manipulation',
                        isToday(day) && 'border-primary bg-primary/5',
                        isSelected && !isToday(day) && 'border-primary bg-primary/10',
                        !isToday(day) && !isSelected && 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm mb-0.5',
                        isToday(day) && 'bg-primary text-primary-foreground font-bold'
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5 overflow-hidden flex-1 hidden sm:block">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs px-1 py-0.5 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                      {/* Mobile: show dots for events */}
                      <div className="flex gap-0.5 mt-auto sm:hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">+</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card className="glass-card hidden lg:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-2">
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => renderEventCard(event))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p className="text-sm">No events scheduled</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 min-h-[44px]"
                      onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Event
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousWeek}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextWeek}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentWeek = isSameWeek(day, new Date(), { weekStartsOn: 0 });

                  return (
                    <motion.button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-2 sm:p-3 rounded-lg border transition-colors text-left min-h-[120px] sm:min-h-[160px] flex flex-col touch-manipulation',
                        isToday(day) && 'border-primary bg-primary/5',
                        isSelected && !isToday(day) && 'border-primary bg-primary/10',
                        !isToday(day) && !isSelected && 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50',
                        isCurrentWeek && !isToday(day) && 'bg-muted/30'
                      )}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs text-muted-foreground">
                          {format(day, 'EEE')}
                        </p>
                        <div className={cn(
                          'w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-sm sm:text-base font-medium',
                          isToday(day) && 'bg-primary text-primary-foreground'
                        )}>
                          {format(day, 'd')}
                        </div>
                      </div>
                      <div className="space-y-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          {selectedDate && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {format(selectedDate, 'EEEE, MMMM d')}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px] sm:max-h-[400px]">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => renderEventCard(event))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                      <CheckCircle2 className="h-6 w-6 mb-2" />
                      <p className="text-sm">No events scheduled</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousDay}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextDay}
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px] sm:max-h-[500px]">
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {selectedDateEvents.map((event) => renderEventCard(event))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p className="text-sm">No events scheduled for this day</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 min-h-[44px]"
                      onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Event
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick date picker for mobile */}
          <Card className="glass-card lg:hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jump to Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  return (
                    <Button
                      key={i}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDate(date)}
                      className="min-h-[44px] flex-1"
                    >
                      <div className="text-center">
                        <div className="text-xs">{format(date, 'EEE')}</div>
                        <div className="font-bold">{format(date, 'd')}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Date Details Modal/Sheet */}
      {showMobileDetails && viewMode === 'month' && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileDetails(false)}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowMobileDetails(false)}
                className="min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="max-h-[50vh] p-4">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => renderEventCard(event))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mb-2" />
                  <p className="text-sm">No events scheduled</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 min-h-[44px]"
                    onClick={() => { 
                      setEditingEvent(null); 
                      setIsEventModalOpen(true); 
                      setShowMobileDetails(false);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </div>
      )}

      {/* Upcoming Events Section */}
      <Card className="glass-card">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Upcoming This Week</CardTitle>
          <CardDescription className="text-sm">Your events for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile: Vertical stack */}
          <div className="grid grid-cols-2 sm:hidden gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                  className={cn(
                    'p-3 rounded-lg border text-left min-h-[80px] touch-manipulation',
                    i === 0 && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">{format(date, 'EEE')}</p>
                    <p className={cn(
                      'text-base font-bold',
                      i === 0 && 'text-primary'
                    )}>
                      {format(date, 'MMM d')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.length > 0 ? (
                      <>
                        {dayEvents.slice(0, 2).map(event => (
                          <div 
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 2}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">No events</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tablet and Desktop: Horizontal scroll */}
          <div className="hidden sm:flex gap-3 sm:gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                  className={cn(
                    'min-w-[120px] sm:min-w-[150px] p-3 rounded-lg border text-left touch-manipulation',
                    i === 0 && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">{format(date, 'EEE')}</p>
                    <p className={cn(
                      'text-lg font-bold',
                      i === 0 && 'text-primary'
                    )}>
                      {format(date, 'd')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.length > 0 ? (
                      <>
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 3} more
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">No events</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Modal */}
      <EventModal
        open={isEventModalOpen}
        onOpenChange={(open) => { setIsEventModalOpen(open); if (!open) setEditingEvent(null); }}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate || undefined}
        mode="create"
      />
    </div>
  );
}
