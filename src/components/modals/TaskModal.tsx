'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Tag, Users, Flag, FileText, Plus, User, GraduationCap } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TaskPriority, TaskStatus } from '@/lib/types';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (task: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  mode?: 'create' | 'edit' | 'view';
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  courseCode: string;
  estimatedHours: number;
  assignees: string[];
  tags: string[];
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

// All users for tagging/assigning
const allUsers = [
  { id: '1', name: 'Reiner Nuevas', email: 'reinernuevas@umak.edu.ph', initials: 'RN', role: 'student' },
  { id: '2', name: 'John Doe', email: 'johndoe@umak.edu.ph', initials: 'JD', role: 'student' },
  { id: '3', name: 'Maria Santos', email: 'mariasantos@umak.edu.ph', initials: 'MS', role: 'student' },
  { id: '4', name: 'Alice Mercado', email: 'alicemercado@umak.edu.ph', initials: 'AM', role: 'student' },
  { id: '5', name: 'Bob Cruz', email: 'bobcruz@umak.edu.ph', initials: 'BC', role: 'student' },
  { id: '6', name: 'Eva Torres', email: 'evatorres@umak.edu.ph', initials: 'ET', role: 'student' },
  { id: 'f1', name: 'Prof. Demo Faculty', email: 'faculty.demo@umak.edu.ph', initials: 'PF', role: 'faculty' },
  { id: 'f2', name: 'Dr. Alice Garcia', email: 'alicegarcia@umak.edu.ph', initials: 'AG', role: 'faculty' },
];

const mockCourses = ['CS401', 'IT301', 'CS302', 'CS405', 'IT201'];

export function TaskModal({ open, onOpenChange, onSubmit, initialData, mode = 'create' }: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate,
    courseCode: initialData?.courseCode || '',
    estimatedHours: initialData?.estimatedHours || 0,
    assignees: initialData?.assignees || [],
    tags: initialData?.tags || [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const isViewMode = mode === 'view';

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!assigneeSearch.trim()) return [];
    const query = assigneeSearch.toLowerCase();
    return allUsers.filter(user => 
      (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) &&
      !formData.assignees.includes(user.id)
    ).slice(0, 5);
  }, [assigneeSearch, formData.assignees]);

  const assignedUsers = useMemo(() => {
    return allUsers.filter(user => formData.assignees.includes(user.id));
  }, [formData.assignees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const addAssignee = (userId: string) => {
    if (!formData.assignees.includes(userId)) {
      setFormData({ ...formData, assignees: [...formData.assignees, userId] });
    }
    setAssigneeSearch('');
    setShowAssigneeSuggestions(false);
    setSelectedSuggestionIndex(0);
  };

  const removeAssignee = (userId: string) => {
    setFormData({ ...formData, assignees: formData.assignees.filter(id => id !== userId) });
  };

  const handleAssigneeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredUsers[selectedSuggestionIndex]) {
      e.preventDefault();
      addAssignee(filteredUsers[selectedSuggestionIndex].id);
    } else if (e.key === 'Backspace' && !assigneeSearch && formData.assignees.length > 0) {
      removeAssignee(formData.assignees[formData.assignees.length - 1]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {mode === 'create' ? 'Create New Task' : mode === 'view' ? 'Task Details' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new task to your board. Fill in the details below.'
              : mode === 'view'
              ? 'View task details below.'
              : 'Update the task details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isViewMode}
            />
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
              disabled={isViewMode}
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
                disabled={isViewMode}
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
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date & Course Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isViewMode}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      setFormData({ ...formData, dueDate: date });
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={formData.courseCode}
                onValueChange={(value) => setFormData({ ...formData, courseCode: value })}
                disabled={isViewMode}
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

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={formData.estimatedHours || ''}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
          </div>

          {/* Assignees with Autocomplete */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignees
            </Label>
            
            {/* Selected Assignees */}
            {assignedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {assignedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px]">{user.initials}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeAssignee(user.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {!isViewMode && (
              <div className="relative">
                <div className="relative">
                  <Input
                    placeholder="Type name or email to add assignee..."
                    value={assigneeSearch}
                    onChange={(e) => { setAssigneeSearch(e.target.value); setShowAssigneeSuggestions(true); }}
                    onFocus={() => setShowAssigneeSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAssigneeSuggestions(false), 200)}
                    onKeyDown={handleAssigneeKeyDown}
                  />
                </div>
                
                {/* Suggestions Dropdown */}
                {showAssigneeSuggestions && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden">
                    {filteredUsers.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addAssignee(user.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 text-left hover:bg-muted transition-colors',
                          index === selectedSuggestionIndex && 'bg-muted'
                        )}
                      >
                        <div className={cn(
                          'p-1 rounded',
                          user.role === 'faculty' ? 'bg-blue-500/10' : 'bg-green-500/10'
                        )}>
                          {user.role === 'faculty' 
                            ? <GraduationCap className="h-4 w-4 text-blue-500" />
                            : <User className="h-4 w-4 text-green-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {!isViewMode && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.title.trim()}>
                {mode === 'create' ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
