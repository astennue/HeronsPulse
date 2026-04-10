// HeronPulse Academic OS - Date Helper Utilities

import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore, isToday, isTomorrow, isPast, startOfDay, endOfDay, addDays, subDays } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  return format(new Date(date), formatStr);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(dueDate: Date | string): number {
  return differenceInDays(new Date(dueDate), new Date());
}

/**
 * Check if deadline is approaching (within 48 hours)
 */
export function isDeadlineApproaching(dueDate: Date | string): boolean {
  const days = getDaysUntilDeadline(dueDate);
  return days >= 0 && days <= 2;
}

/**
 * Check if task is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  return isPast(new Date(dueDate));
}

/**
 * Get deadline status
 */
export function getDeadlineStatus(dueDate: Date | string): 'overdue' | 'urgent' | 'approaching' | 'normal' | 'none' {
  if (!dueDate) return 'none';
  
  const date = new Date(dueDate);
  const days = getDaysUntilDeadline(date);
  
  if (days < 0) return 'overdue';
  if (days === 0) return 'urgent';
  if (days <= 2) return 'approaching';
  return 'normal';
}

/**
 * Get deadline color class
 */
export function getDeadlineColorClass(dueDate: Date | string): string {
  const status = getDeadlineStatus(dueDate);
  
  switch (status) {
    case 'overdue':
      return 'text-red-500';
    case 'urgent':
      return 'text-red-500';
    case 'approaching':
      return 'text-yellow-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date | string): boolean {
  return isToday(new Date(date));
}

/**
 * Check if date is tomorrow
 */
export function isDateTomorrow(date: Date | string): boolean {
  return isTomorrow(new Date(date));
}

/**
 * Get smart date label
 */
export function getSmartDateLabel(date: Date | string): string {
  const d = new Date(date);
  
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return `Overdue (${format(d, 'MMM d')})`;
  
  return format(d, 'MMM d');
}

/**
 * Get date range string
 */
export function getDateRangeString(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (format(start, 'yyyy') === format(end, 'yyyy')) {
    if (format(start, 'MMMM') === format(end, 'MMMM')) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
  
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Get week dates
 */
export function getWeekDates(date: Date = new Date()): { start: Date; end: Date } {
  const start = startOfDay(subDays(date, date.getDay()));
  const end = endOfDay(addDays(start, 6));
  return { start, end };
}

/**
 * Get month dates
 */
export function getMonthDates(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format seconds to MM:SS for timer
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get semester progress (assuming semester ends May 31)
 */
export function getSemesterProgress(): number {
  const now = new Date();
  const year = now.getFullYear();
  
  // Assuming semester starts in August and ends in May
  let semesterStart = new Date(year - 1, 7, 1); // August 1 of previous year
  let semesterEnd = new Date(year, 4, 31); // May 31 of current year
  
  // If we're past May, use next academic year
  if (now.getMonth() > 4) {
    semesterStart = new Date(year, 7, 1);
    semesterEnd = new Date(year + 1, 4, 31);
  }
  
  const total = semesterEnd.getTime() - semesterStart.getTime();
  const elapsed = now.getTime() - semesterStart.getTime();
  
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}
