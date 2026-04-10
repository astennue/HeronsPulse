'use client';

import { useState } from 'react';
import { Calendar, Clock, Tag, Plus, MapPin, FileText, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (event: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  selectedDate?: Date;
  mode?: 'create' | 'edit';
}

export interface EventFormData {
  title: string;
  description: string;
  type: 'deadline' | 'exam' | 'meeting' | 'reminder' | 'other';
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  location: string;
  courseCode: string;
  color: string;
  reminder: boolean;
  reminderTime: number; // minutes before
}

const typeOptions = [
  { value: 'deadline', label: 'Deadline', color: '#EF4444', icon: '🔴' },
  { value: 'exam', label: 'Exam', color: '#F59E0B', icon: '📝' },
  { value: 'meeting', label: 'Meeting', color: '#10B981', icon: '👥' },
  { value: 'reminder', label: 'Reminder', color: '#8B5CF6', icon: '🔔' },
  { value: 'other', label: 'Other', color: '#6B7280', icon: '📌' },
];

const colorOptions = [
  '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#1A56DB', '#EC4899', '#06B6D4', '#84CC16',
];

const reminderOptions = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const mockCourses = ['CS401', 'IT301', 'CS302', 'CS405'];

export function EventModal({ open, onOpenChange, onSubmit, initialData, selectedDate, mode = 'create' }: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'deadline',
    startDate: initialData?.startDate || selectedDate || new Date(),
    endDate: initialData?.endDate,
    allDay: initialData?.allDay ?? true,
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '10:00',
    location: initialData?.location || '',
    courseCode: initialData?.courseCode || '',
    color: initialData?.color || '#1A56DB',
    reminder: initialData?.reminder ?? true,
    reminderTime: initialData?.reminderTime || 30,
  });
  
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  const selectedType = typeOptions.find(t => t.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Add New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Schedule a new event or deadline.'
              : 'Update the event details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Type & Course */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: EventFormData['type']) => 
                  setFormData({ 
                    ...formData, 
                    type: value,
                    color: typeOptions.find(t => t.value === value)?.color || '#1A56DB'
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={formData.courseCode}
                onValueChange={(value) => setFormData({ ...formData, courseCode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(formData.startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, startDate: date });
                        setStartDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP') : 'Same as start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      setFormData({ ...formData, endDate: date || undefined });
                      setEndDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="allDay" className="cursor-pointer">All day event</Label>
            </div>
            
            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Room 301, Online via Zoom..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this event..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Event Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    formData.color === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="reminder" className="cursor-pointer flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Set reminder
              </Label>
            </div>
            
            {formData.reminder && (
              <Select
                value={formData.reminderTime.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminderTime: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="When to remind?" />
                </SelectTrigger>
                <SelectContent>
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-10 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span>{selectedType?.icon}</span>
                  <p className="font-medium">{formData.title || 'Event Title'}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(formData.startDate, 'MMM d, yyyy')}
                  {!formData.allDay && ` • ${formData.startTime} - ${formData.endTime}`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              {mode === 'create' ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
