'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Users, FolderKanban, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ProjectStatus } from '@/lib/types';

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (project: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
  mode?: 'create' | 'edit';
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  courseCode: string;
  color: string;
  icon: string;
  members: string[];
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
];

const colorOptions = [
  '#1A56DB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

const iconOptions = ['🎓', '🌐', '🗄️', '🤖', '📊', '💻', '📚', '🔬', '🎨', '📱', '🔧', '📝'];

const mockUsers = [
  { id: '1', name: 'Reiner N.', initials: 'RN' },
  { id: '2', name: 'John D.', initials: 'JD' },
  { id: '3', name: 'Maria S.', initials: 'MS' },
  { id: '4', name: 'Alice M.', initials: 'AM' },
];

const mockCourses = ['CS401', 'IT301', 'CS302', 'CS405', 'IT201', 'CS303'];

export function ProjectModal({ open, onOpenChange, onSubmit, initialData, mode = 'create' }: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active',
    startDate: initialData?.startDate,
    endDate: initialData?.endDate,
    courseCode: initialData?.courseCode || '',
    color: initialData?.color || '#1A56DB',
    icon: initialData?.icon || '📁',
    members: initialData?.members || [],
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

  const toggleMember = (userId: string) => {
    if (formData.members.includes(userId)) {
      setFormData({ ...formData, members: formData.members.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, members: [...formData.members, userId] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Start a new academic project. Fill in the details below.'
              : 'Update the project details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name & Icon Row */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            {/* Icon Selector */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-12 h-10 text-xl">
                    {formData.icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {iconOptions.map((icon) => (
                      <motion.button
                        key={icon}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={cn(
                          'w-8 h-8 rounded text-lg flex items-center justify-center transition-colors',
                          formData.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'
                        )}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a detailed description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Status & Course Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData({ ...formData, startDate: date });
                      setStartDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      setFormData({ ...formData, endDate: date });
                      setEndDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Project Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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

          {/* Team Members */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </Label>
            <div className="flex flex-wrap gap-2">
              {mockUsers.map((user) => (
                <motion.button
                  key={user.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMember(user.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-colors',
                    formData.members.includes(user.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: formData.color + '20' }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-medium">{formData.name || 'Project Name'}</p>
                <p className="text-sm text-muted-foreground">{formData.courseCode || 'No course'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {mode === 'create' ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
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
