'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Trophy, TrendingUp, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetGoal?: (goal: GoalData) => void;
  currentALI?: number;
}

export interface GoalData {
  id: string;
  title: string;
  type: 'tasks' | 'ali_score' | 'deadlines' | 'streak' | 'custom';
  target: number;
  deadline: Date;
  category: 'daily' | 'weekly' | 'monthly' | 'semester';
  description?: string;
}

const goalTypes = [
  { value: 'tasks', label: 'Tasks Completed', icon: '✅', description: 'Number of tasks to complete' },
  { value: 'ali_score', label: 'ALI Score Target', icon: '📊', description: 'Target Academic Load Index' },
  { value: 'deadlines', label: 'Deadlines Met', icon: '⏰', description: 'Percentage of deadlines met' },
  { value: 'streak', label: 'Study Streak', icon: '🔥', description: 'Consecutive days of activity' },
  { value: 'custom', label: 'Custom Goal', icon: '🎯', description: 'Create your own goal' },
];

const categories = [
  { value: 'daily', label: 'Daily', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'weekly', label: 'Weekly', color: 'bg-green-500/10 text-green-500' },
  { value: 'monthly', label: 'Monthly', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'semester', label: 'Semester', color: 'bg-orange-500/10 text-orange-500' },
];

const existingGoals = [
  { id: '1', title: 'Complete 30 tasks this month', progress: 75, type: 'tasks' },
  { id: '2', title: 'Maintain ALI under 50', progress: 60, type: 'ali_score' },
  { id: '3', title: '7-day streak', progress: 100, type: 'streak' },
];

export function GoalModal({ open, onOpenChange, onSetGoal, currentALI = 62 }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalData['type']>('tasks');
  const [target, setTarget] = useState('10');
  const [deadline, setDeadline] = useState<Date>();
  const [category, setCategory] = useState<GoalData['category']>('weekly');
  const [description, setDescription] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalData: GoalData = {
      id: Date.now().toString(),
      title: title.trim(),
      type,
      target: parseInt(target) || 10,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category,
      description: description.trim() || undefined,
    };

    if (onSetGoal) {
      onSetGoal(goalData);
    }

    // Reset form
    setTitle('');
    setTarget('10');
    setDeadline(undefined);
    setDescription('');
    
    // Close the modal
    onOpenChange(false);
    
    console.log('Setting goal:', goalData);
  };

  const selectedType = goalTypes.find(t => t.value === type);
  const selectedCategory = categories.find(c => c.value === category);

  // Suggest ALI target based on current score
  const suggestedALITarget = currentALI > 50 ? Math.max(30, currentALI - 20) : currentALI;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Set Your Goals
          </DialogTitle>
          <DialogDescription>
            Define targets to track your academic progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Stats */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Progress</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-background">
                <p className="text-lg font-bold">{currentALI}</p>
                <p className="text-xs text-muted-foreground">ALI Score</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background">
                <p className="text-lg font-bold text-green-500">45</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background">
                <p className="text-lg font-bold text-orange-500">12</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Create New Goal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete 20 tasks this week..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Goal Type */}
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={type} onValueChange={(v: GoalData['type']) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target */}
              <div className="space-y-2">
                <Label>Target</Label>
                <Input
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={type === 'ali_score' ? suggestedALITarget.toString() : '10'}
                />
                {type === 'ali_score' && (
                  <p className="text-xs text-muted-foreground">Suggested: {suggestedALITarget} (lower is better)</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={category} onValueChange={(v: GoalData['category']) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, 'PP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={deadline}
                      onSelect={(date) => {
                        setDeadline(date);
                        setDatePickerOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Add notes about this goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </div>
          </form>

          {/* Existing Goals */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Active Goals
            </Label>
            <div className="space-y-2">
              {existingGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{goal.title}</p>
                    <Badge 
                      variant={goal.progress === 100 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {goal.progress}%
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="h-1.5" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
